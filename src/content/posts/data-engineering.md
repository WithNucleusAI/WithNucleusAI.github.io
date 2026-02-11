---
title: How NucleusAI Curated a 1B Image Dataset for Generative Vision Models
date: '2026-02-03'
excerpt: >-
  Building an image model is only partly a modeling problem. The other part is a
  data engineering problem disguised as a plumbing problem. This article covers
  how we curated a ~1B image dataset.
animation: data-stream
---
Building an image model is only *partly* a modeling problem. The other part is a **data engineering problem disguised as a plumbing problem**, which is a polite way of saying: *"if your dataset is messy, your model becomes an expensive mirror for that mess."*

NucleusAI built an end-to-end pipeline to curate an image dataset that scales to **~1B images** with quality controls that treat data like a first-class product, not a folder of “*stuff*.”

This article covers **The Dataset**: collection, validation, cleaning, scoring, captioning, and packaging.



---

## The Core Principle: Scale is easy, *signal* is hard

“*More data*” is a trap phrase. You can always collect more. What matters is:

- **Validity:** can you decode it, trust it, and locate it again?
- **Alignment:** does the caption describe the image accurately?
- **Quality:** is it useful for the model you’re training, not just “a JPEG”?
- **Control:** can you *shape* the distribution (curriculum, tail sets, domain mixes)?

Everything below is us building that control plane.

---

## Phase 1 - Metadata Backbone: A Billion-Row Truth Table

We never relied on a centralized database to track our metadata. From day one, the architecture was designed to be **schema-controlled**, **cloud-native**, and **columnar**. Every record existed in partitioned **Parquet files**, with **50,000 rows per file**. This format gave us faster sequential reads, predictable sizes, and excellent compatibility with the rest of our pipeline (sampling, training, and analytics).

Each Parquet file was:

- Aligned to a deterministic shard index
- Compression and Encryption enabled (when staged to cloud)

### Schema (training-facing)

Key choices within the training schema shape we converged:

- **`id`** served as the stable primary key across the training corpus.
- **`source_id`** provided lossless traceability back to the upstream record.
- **`captions[]`** are ordered from **lowest → highest** quality, and if an “*internet caption*” existed, it stayed at the top so we never lose provenance.
- **`caption_sources[]`** is a one-to-one mapping of the `caption_sources[i]` to the `caption[i]`.
- **`partition_key`** is a uniform integer used for **deterministic sharding and mixing**.

### Why Parquet

* **Columnar format:** Columnar storage avoided deserializing entire records. All our downstream experimentation and training jobs often only needed specific fields.
* **Splittable for compute:** We laid out the Parquet files so that row groups became our scheduling unit, then we sharded the work so each worker processed a disjoint set of row groups with no read amplification. This kept ingestion tight under parallelism. Workers only read what they were responsible for, so throughput stayed predictable.
* **Storage-aware:** We leaned on column pruning + compression so object-store reads pulled fewer bytes and decompressed only the columns we trained on. That reduced load time and cost while keeping performance stable as the dataset scaled.

### How we wrote and operated on it

We wrote metadata using **PyArrow** writers in streaming mode, with validation hooks to ensure schema consistency across files. All processing (ETL workers, captioning workers, samplers) used **Pandas + PyArrow** to interact with the metadata.

```python
import pyarrow as pa
import pyarrow.parquet as pq

schema = pa.schema([
	("id", pa.string()),
	("source_id", pa.string()),
	("captions", pa.list_(pa.string())),        # captions[] preserves order
	("caption_sources", pa.list_(pa.string()))  # caption_sources[] map 1:1 to the above list
])

with pq.ParquetWriter("metadata.parquet", schema=schema) as writer:
	for batch in stream_batches():
        table = pa.Table.from_pylist(batch, schema=schema)
        assert table.schema == schema
        writer.write_table(table, row_group_size=25_000)
```

This choice of moving away from classic databases was fundamental to maintaining throughput at scale. Instead of overloading Postgres or BigQuery with billions of rows of rapidly changing state, we opted for a **declarative, immutable, columnar log** of the dataset.

This gave us **fast filtering and joins**, **repeatable slicing** and **lightweight shuffling** and sampling (since all files had the same row count and fields)

To this day, our entire dataset pipeline treats Metadata Parquets as the *source of truth*.

### Kafka as the Orchestration Spine

Kafka sat between “metadata exists” and “pixels exist.” That boundary mattered as the pipeline became distributed, retryable, and observable.

Producers streamed metadata records into Kafka topics; Consumers handled `download` &rarr; `validate` &rarr; `persist`. We used Go clients (`Sarama` and `kafka-go`) depending on the worker’s needs (simple fan-out vs. richer group semantics and control)

At a high-level, we kept the working logic simple.

```go
// Download Consumer
for {
	m := fetchMessage(ctx)
	id := string(m.Key)
	if alreadyProcessed(id) {
		commit(m)
		continue
	}
	
	var err error
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		err = downloadValidatePersist(id, m.Value)
		if err == nil {
			markProcessed(id)
			commit(m)
			break
		}

		if attempt < maxAttempts {
			time.Sleep(baseBackoff * time.Duration(1<<uint(attempt-1)))
		}
	}

	if err != nil {
		publishDLQ(id, m, err)
		commit(m) // commit after terminal handling to avoid hot-looping
	}
}
```

A full end-to-end orchestration diagram is shown in the [appendix](#appendix).

---
## Phase 2 - Download Engine: Speed Ingestion at NIC Limits

We sustained **~1,200 images/sec** across **8 H100 nodes**.

Our goal was making downloads boring with stable throughput under throttling, tail latency, and internet-grade flakiness. The long pole problem moved from “*waiting on bytes*” to “*improving data quality*”.

### Reality at scale (why averages lie)

At a billion-scale mark, the *taxes* dominated:

- HTTP throttling and 429 storms.

- DNS flakiness (resolver saturation, pathological caching, transient SERVFAIL).

- Dead links, redirects, and content drift.

- WAF/bot checks and inconsistent origin behavior.

- Regional latency variance and tail amplification (p99 starts steering the throughput).

- Retries (backoff + jitter) and circuit breaking.

- Disk flush, checksum/verification, and queueing overhead.

### Our Optimizations

We didn’t chase peak QPS. We optimized for sustained throughput with guardrails:

- **Fairness**: One domain can’t starve the fleet.

- **Stability**: Hard timeout budgets, bounded retries, fast failure on hopeless tails.

- **Efficiency**: Aggressive connection reuse to avoid handshake and DNS churn.

- **Integrity**: Verify writes and metadata so ingestion doesn’t “silently succeed.”

### Why Go (and why not Python)

Python could do high-concurrency I/O, and we used it for orchestration and a correctness-first reference implementation.

For the hot path, we chose Go because it provided low-overhead concurrency, predictable memory under sustained load, and a transport layer that was easy to tune and reason about when p99 behavior matters. Go’s `Transport` exposed knobs like `MaxConnsPerHost` and `IdleConnTimeout` explicitly, and the implementation was transparent in the standard library sources.

| Knob / Policy | What breaks without it | What we did |
|---|---|---|
| Global concurrency cap | Fleet-wide retry storms; Self-inflicted queue collapse | Hard cap across the cluster `maxConcurrentDownloads = 5000`; Backpressure instead of “*more workers*” |
| Per-domain concurrency cap | Single origin dominates; Noisy neighbor failure | Per-domain shaping + fair scheduling |
| Connection reuse (keep-alive) | CPU burn on handshakes; Ephemeral port churn; TIME_WAIT pileups | Reuse aggressively; Avoid creating new connections unless forced. `MaxIdleConnsPerHost = 1000`, `MaxIdleConns = 5000`, `KeepAlive = 30s` |
| Idle connection budget | Handshake churn under bursty workloads | Keep enough idle capacity to absorb bursts without reconnecting. `IdleConnTimeout = 90s` |
| Timeout budgets (dial/TLS/headers/body) | Tail amplification; Hung sockets pin workers forever | Explicit stage timeouts; Strict request deadline. `net.Dialer.Timeout = 10s`, `http.Client.Timeout = 30s` |
| Redirect policy | Loops; Cross-origin surprises; Wasted bandwidth | Cap redirects; Record final URL; Treat suspicious chains as failures |
| Retry budget + jitter | Thundering herd; Synchronized retries | Bounded retries; Exponential backoff with jitter; Retry caps per error class |
| 429 handling | “Retry storms” that make throttling worse | Honor Retry-After when present; Slow the domain token bucket |
| Error taxonomy | Same reaction for 429 vs 5xx vs DNS vs timeout | Different action per class: Backoff, Circuit-open, or drop |
| Write-path isolation | Disk stalls backpressure network; Throughput cliff | Separate queues for fetch vs verify vs write; Batch writes where possible. `MAX_FILES_PER_DIR = 200000` |
| Verification (checksum/size/type) | Silent corruption; Poisoned dataset | Verify at ingest; Quarantine anomalies with reason codes |
  
We split the pipeline by the resource it stressed (Network, CPU, Disk), then enforced budgets at the edges to prevent cascading failures.

![Mermaid Diagram](/images/blog/data-engineering/mermaid-0d28f7b9.png)

  
## Phase 3 - Cleaning & Validation: Turning Data Into Dataset

If your metadata is wrong or your images are corrupted, you train the model to learn wrong things _confidently_. We enforced strict contracts at every stage: clear input/output specs per tier, logged reject reasons, and the ability to re-queue only the failed stage. This prevented the costly "*reprocess everything*" pitfalls.
 

### Why pipeline, not script

A monolithic validation script could fail catastrophically if one filter broke partway through billions of images. We could potentially lose all progress. We built a pipeline to run cheap filters first (on CPU), reject the obvious garbage, and spend expensive GPU compute only on images that survived triage.

Early rejection was brutal, yet necessary.

### The 10 validations

#### Tier 1: Decode & sanity (CPU light)

1) **Decode validity**: Could we parse and decode the image cleanly (JPEG/PNG/WebP)?

2) **Dimensions sanity**: Are width and height non-zero and within reasonable bounds for training? `[256,256] <= (W,H) <=  [8096,8096]`.

3) **Aspect ratio bounds**: Are pathological panoramas and near-line images rejected? (`100:1` ratio banners, ultra-tall graphics).

4) **Payload sanity**: Did the file size matches the dimensions? (detect extreme compression. E.g. `1024×768` image in `10 KB` signals over-compression). We also compared content-type header against magic bytes to catch mislabeled files or CDN error placeholders.

**Rejection rate at tier 1: ~2%** (corrupt files, bad headers, obvious non-photo content).

#### Tier 2:  Metadata & duplicates (CPU heavy)

5) **Perceptual de-duplication (pHash, Hamming distance < 5)**: We computed a 64-bit perceptual hash per image and identified near-duplicates. Here, one image from each cluster survived. We removed identical or near-identical variants from remixes, reposts, and mirror sites. 

6) **EXIF orientation normalization**: We read EXIF rotation tags and corrected rotated/flipped images at the metadata level so subsequent validators (and training) would see canonical orientation. We did not re-encode, but just recorded the correction.

7) **Color histogram sanity**: We flagged and removed images that were nearly monochrome (solid black, solid white, or extreme overexposure) since these added noise to training.

**Rejection rate at tier 2: ~11% cumulative** (8% duplicates, 3% blank/histogram anomalies).

#### Tier 3: GPU-accelerated quality

8) **Safety classifier**: We ran a CNN-based classifier (tuned for precision) to flag sensitive content and thresholded conservatively to avoid false positives.

9) **Blur detection (Laplacian variance + FFT)**: We measured high-frequency content using GPU-accelerated image transforms as images with near-zero high-frequency components were out-of-focus or artificially smoothed. This also caught heavily sub-sampled downscaled images.

10) **Semantic alignment via embeddings**: We ran CLIP-style embeddings to catch "*caption says X but image is Y*" misalignments. We used this as a soft filter for dataset curation, not hard removal.

**Rejection rate at tier 3: ~2% cumulative** (1% safety, ~1% blur).

### Architecture: early rejection + early feedback

We orchestrated this pipeline using **Dask** (dynamic task scheduler) and **NVIDIA DALI** (GPU image pipelines). Dask let us re-queue individual tier failures without replay. DALI's GPU-accelerated decode and transforms pushed per-node throughput from single-threaded **~1k images/sec** to batched **~4k images/sec**, making GPU bottlenecks the actual lever instead of I/O.

### Metadata cleaning is not optional

Mismatches in metadata were silent killers. We enforced:
- No missing core fields (`dimensions`, `source_id`, `media_path`, `SHA`)
- That dimension metadata matched the decoded image (EXIF rotation-corrected).
- URL normalization and redirect resolution so re-downloads are deterministic.
- Source attribution guarantees so failed batches can be traced and removed.

By the end, we had 2B images that were all valid, correctly oriented, deduplicated, aligned with metadata, and within the quality bounds.

---

## Phase 4 - Aesthetic Scoring: Dataset Curation

Not all images taught the model equally. For instance, a sharp, well-lit photograph with strong composition and good color balance provided clear training signal while a blurry snapshot or an over-compressed graphic added noise. We scored every filtered image to control *what* the model learned and *when* by turning aesthetic quality into a training knob.

We began with **~2B downloaded images** (after Phase 3). Aesthetic scoring filtered retained **~700M** by removing images that scored below `5.0`. These were stratified into five tiers without hard cutoffs. Tiers gave us a curriculum lever. Early episodes sampled broadly (learned from diverse images, even marginal ones); later training emphasized high-aesthetic subsets (sharpen composition and visual detail).

### The Aesthetic Predictor: SigLIP

We built a SigLIP-based image encoder + a lightweight head to predict a single scalar `aesthetic_score`,  trained on human-rated datasets (AVA-style) and internal labels. SigLIP treated each image-text pair independently via binary classification, rather than requiring batch-wide contrastive comparisons. This independence made SigLIP better suited to fine-grained similarity tasks and aesthetic assessment. 

Operationally, we ran the scorer as a batched GPU inference job on 8×H100, batch size 128 and achieved a throughput of **~600 images/sec**. The key design choice was making this *offline and in-place*: score once, persist forever and never rescore unless the scorer changed.

| Tier | Score range  | Count |  Share (%)  | Composition | 
| -- | --             | --    | --          | -- |
| A1 | 5.0–5.5        | 215M  | 31%				| Marginal quality (acceptable low pass) |
| A2 | 5.5–6.0        | 191M  | 27%				| Broad coverage (diverse, mixed clarity) |
| A3 | 6.0–6.5        | 140M  | 20%				| Solid quality (good composition, clarity) |
| A4 | 6.5–6.8        | 100M  | 14%				| High aesthetic (strong visual appeal) |
| A5 | 6.8+           | 50M   |  7%				| Premium (sharp, balanced, refined) |

![Aesthetic Score Distribution](/images/blog/data-engineering/Aesthetic Score Distribution.png)

---

## Phase 5 - Persist + Episodic Bucketing

The dataset wasn't merely “*stored*.” It was **packaged for training dynamics**.

We persisted the curated corpus with *two orthogonal axes*: 
- **5 aesthetic buckets** (quality axis: A1-A5). 
- **8 episodic buckets (+2 high quality buckets)** (schedule axis: B1-B10, what mixture the trainer sees over time)

The structure was compute-aware by design:  “*just keep the top slice*” became suboptimal as we trained longer, because a small high-quality pool loses utility under repetition and we eventually needed broader coverage to keep the learning moving.

### Two Axes, One Dataset

We treated A1-A5 as static  _quality label_  (aesthetic + caption quality), and B1-B8 as dynamic  _curriculum label_  that controlled what the optimizer sees at different phases of training. Each training bucket was a mixture over multiple sources with different proportions per bucket, so we could change schedules without rewriting or copying the underlying corpus.

We used a _distance-to-centers + temperature-softmax_ assignment which was conceptually the same idea as softmax gating used to route tokens to experts in Mixture-of-Experts (MoE) models. We assigned buckets **probabilistically** so each bucket has a controlled overlap. We turned a weighted combination of quality tier $q \in \{1,2,3,4,5\}$ and its size-bucket rank $s$ (from `get_size_bucket()`) into a single curriculum score $z$. 

$$z = \alpha \cdot \text{norm}(q) + \beta \cdot \text{norm}(s)$$ 

where $\alpha + \beta = 1$ (we used $\alpha = 0.6, \beta = 0.4$), and $\text{norm}(\cdot)$ maps values to $[0,1]$.

For each episodic bucket $k \in \{1,\dots,8\}$, we computed how "*aligned*" the image's score is with that bucket's center $\mu_k$ (spaced uniformly from $-1.75$ to $+1.75$): 

$$\ell_k = -\frac{(z-\mu_k)^2}{2\sigma^2}$$ 

where we set $\sigma^2 \approx 1.0$ (tunable). Images close to $\mu_k$ received high logits; those far away received low logits.

Finally, we converted logits into a probability distribution over the 8 buckets using a temperature-scaled softmax: 

$$p(B=k \mid z)=\frac{\exp(\ell_k/T)}{\sum_{j=1}^{8}\exp(\ell_j/T)}$$ 

where $T$ is the temperature parameter. Higher $T$ increases overlap (early training, broad coverage), lower $T$ concentrates probability mass (late training, high quality). We sampled $B \sim \text{Categorical}(p)$ to assign the image to bucket $B \in \{1,\dots,8\}$.

A simple pseudo-code to achieve this is as follows-
```python
def assign_bucket(a_tier, h, w, sigma=1.0, T=0.7, alpha=0.6, beta=0.4):
    q = (a_tier - 1) / 4.0                       # A1..A5 -> [0,1]
    s = SIZE_BUCKET_ORDER[get_size_bucket(h, w)] # the size buckets -> ordinal
    s = s / SIZE_BUCKET_LEN                      # [0,1]
    z = alpha*q + beta*s

    mu = np.linspace(-1.75, 1.75, 8)             # centers for B1..B8
    logits = -((z - mu)**2) / (2 * sigma**2)
    p = softmax(logits / T)
    return 1 + categorical_sample(p)             # returns 1..8
``` 

### Operational guarantees we ensured
Episodic bucketing gave us a curriculum mechanism  _without copying data_, and it unlocked two production-grade properties:
- **Stable regression isolation**: During a run, we could say *"the model got worse when we introduced B6 with more A3-like samples"*, because bucket semantics were consistent and interpretable.
- **Reproducibility**: The same image lands in the same bucket across reruns by using deterministic membership even if upstream curation changes.

We also soft-capped each episodic bucket to **~90M** and enforced capacity at write-time so training never accidentally over-sampled a “*too-easy to fill*” subset (typically low-res, low-quality).

![Softmax Bucketing](/images/blog/data-engineering/Softmax Based Bucketing.png)

---

## Phase 6 - Caption Curation at Billion Scale

The naive approach to caption quality is discarding bad ones. At this scale, discarding bad captions would waste diversity and throw away supervision. Instead, we treated captioning as a **routing and synthesis problem** and not a binary keep/discard decision.

### The Alignment Gate

We used CLIP's image-text similarity scoring as our routing signal because CLIP's training objective directly minimized the distance between correct image-caption pairs. Rather than a single threshold, we established a confidence-based routing table:​

| Score Range | Signal | Action |
| -- | -- | -- |
| Above 0.65 	| Original captions are directionally correct | Preserve 		| 
| 0.30-0.65 	| Captions are plausible but underspecified 	| Refine	 		| 
| Below 0.30 	| Captions are detached or missing 						| Synthesize 	| 

The threshold was empirically grounded in calibration study where we validated score distributions against manual labels on a 100K-image validation slice.

###  The Refinement + Synthesis Pipeline: VLM Ensemble with Provenance

We ran each image cohort through a model ensemble tuned to different strengths. 

| Model | Strengths | Typical Routing Criteria |
| -- | -- | -- |
| Qwen2.5-VL	| Bulk, “good-enough” captions for generic photos and web images where speed and price/throughput mattered | Default for large, untagged images and generic web imagery 		| 
| InternVL2.5 	| Used for images where hallucination risk is costly  	| Scientific plots, Math-heavy diagrams	 		| 
| Gemini 2.5 Flash 	| “Heavyweight but fast” pass for complex scenes, multi-image contexts, and long-doc images 						| Long PDFs (page tiles), Multi-image sets, and “hard” images 	| 
| Claude	| High-precision captions where error budget is low | Handpicked subsets, Brand assets, Legal/medical-like content, Safety-sensitive 		| 
| LLaVA 	| Instruction-shaped caption generation 	| Routed when we needed tightly controlled styles	 		| 
| Gemma-3 	| Open-source, multilingual captioner 						| Non-English markers, Translations for web + synthetic captions 	| 
| InternVL3	| High-quality captioning when we wanted open-weights plus better reasoning | Used as OSS backbone images needing richer semantics 		| 
| Qwen3 	| Non-visual rewrite and fusion stage, merging VLM output with metadata 						| Generating multi-length variants, enforcing structure and style constraints 	| 
| GPT‑4.1 	| High Quality re-captioning + rewrite step, often conditioned on existing caption + metadata 	| Used during language polish + enrichment step once a factual base caption was available	 		| 

Our ground-up approach for caption refinement and re-caption pipeline:

1.  **Initial factual pass**: We generated a seed caption using ensemble of above models based on the strengths required for the image type.
    
2.  **Metadata enrichment**: We injected context from image provenance such as domain, geo-location, names, year/era info etc. to "bootstrap" world knowledge. A historical archive image becomes richer: *"a person in yellow gear"* became *"a firefighter surveying a forest fire, ca. 1985"*. 
    
3.  **Multi-variant generation**: We produced very-short (1 sentence), short (2 sentence), medium (3-5 sentences), and long (detailed paragraph) versions. 

### Provenance and Metadata Tracking

We didn't erase the provenance of captions. Instead, we categorized them:
-   **Web Captions**  (20% of corpus): Passed alignment threshold unchanged.
-   **Web + Augmented Captions**  (40%): Original caption preserved; augmentation details logged.
-   **Synthetic Captions**  (40%): Fully generated; source models and scores recorded.
    
This granularity mapped directly to our schema:  `captions[]`,  `caption_sources[]`,  `caption_lengths[]`. It also enabled future weighting strategies as some downstream experiments preferred "*closer to human web text*", while others benefited from richer synthetic descriptions.


### The Engineering Reality: Limits and Trade-Offs

At our scale, two practical constraints dominated:

- **Compute**: Computing cosine similarity between 700M images and their captions was `O(M)` in naive form. We arrived at a stable throughput via distributed CLIP scoring across 32 GPUs using a batch-wise reduce approach. The pipeline phases included image decoding, batching GPU inference, I/O sharding which kept workers saturated for weeks under contention.

- **Synthetic caption quality ceiling**: High-performing VLMs like GPT-4.1 generated captions with quality approaching human annotations (~4.0/5 mean ratings in LAION-COCO evaluation), but weaker models introduced variance. We standardized on stronger models at the cost of throughput.​

The payoff was substantial. Before Phase 6, ~80% of captions in our image dataset were misaligned or uninformative. After:
-   Every image had a meaningful caption paired to it.
-   Average caption length increased from **~8 words** to **~50 words** (depending on category).
-   CLIP alignment scores for the full corpus shifted right as the long tail of near-zero alignments disappeared.


![Mermaid Diagram](/images/blog/data-engineering/mermaid-ad93047f.png)

---

## Phase 7 - Augmentation: Multiplying HQ Data Without Degradation

Even at **~700M high-quality images**, models plateaued during late-stage training where compositional detail and rare-but-critical concepts mattered more than breadth. Synthetic augmentation offered a way to surface new variations without collecting new images. But the trap was easy: *aggressive augmentations could erode semantic fidelity and poison the entire pool*.

We augmented only the top 30% aesthetic slice. The premise was simple: *low-quality images don't improve with modification.* *But for premium images, controlled variation is powerful*.

### The CLIP Similarity Constraint
*But how much variation is "safe"?* We employed  **CLIP image-embedding similarity** as a guardrail. CLIP embeddings capture semantic content, so two images with cosine similarity `>=0.90` were treated as semantics-preserving. We computed:

$$\text{sim}(\text{augmented}, \text{original}) = \frac{\mathbf{e}_{\text{aug}} \cdot \mathbf{e}_{\text{orig}}}{\left|\left| \hspace{2pt} \mathbf{e}_{\text{aug}} \hspace{2pt} \right|\right| \cdot \left|\left| \hspace{2pt} \mathbf{e}_{\text{orig}}  \hspace{2pt} \right|\right|}$$

If an augmentation dropped similarity below `0.90`, we discarded it. Empirically, this threshold balanced diversity gains against distribution fidelity for us.

### Our Augmentation Portfolio
We applied a controlled suite of transformations:
-   **Rotation**: +-30° (discrete steps) to prevent orientation fixation.
-   **Flips**: horizontal to preserve semantic and spatial understanding.
-   **Crops & Zoom**: Random crops within constrained bounds to simulate frame variation.
-   **JPEG Recompression**  (Q > 70): real-world compression noise to mirror distribution of web images.
-   **Color Jitter**: ±5% brightness, ±10% contrast to simulate lighting variance without drastic shift.
-   **Grayscale**: Enable monochrome robustness for ~10% of augmented images.
-   **Mild Noise/Grain** (Gaussian, σ ≤ 2): Sensor noise tolerance.
-   **Downscale/Upsample Artifacts**  (controlled, 1–2 resampling passes): Compression/resolution variations.

**What we avoided:** Perspective warping, severe crops, extreme noise, and "mosaic" (multi-image tiles). These shattered CLIP embeddings and created unnatural distributions.

### Orchestration & Tail Set Gambit

- We generated augmentations online during training using  **NVIDIA DALI**  pipelines on GPUs, to avoid disk bottlenecks. A lightweight Python validator checked CLIP similarity per batch, and ensured rejected augmentations never reached training loops. This reduced rework and kept augmentation "*soft*" (not mandatory in every epoch).

**Result**: ~30% of top-tier images got ~1 extra variant on average (p98 up to 3), lifting our effective dataset from **~700M** to **~900M** "unique training views."

- At ~900M images, we added a  **curated "tail" of premium images**  (`aesthetic_score >= 7.0`, `clip_score >= 0.95`, and long-form descriptions). This tail was  _not_  augmented. 
The intuition: late-epoch training cared less about coverage and more about detail and composition. Pristine, semantically rich examples would prevent model collapse and force the model to refine.

**Result**: We re-introduced ~15% of premium images with detailed captions into the final training bucket, pushing our entire dataset from **~900M** to **~1B** images.

---

## Phase 8 - Upload & Storage Layout: Engineering at Scale

Pushing billion images into cloud storage wasn't a "*copy operation*." At this volume, every architectural decision compounded: *prefix sharding, concurrency models, checksum strategies, and error recovery* all collapsed into throughput. We sustained **~1,500 images/sec** on a 4-VM pool.

### The Core Challenge: Prefix Hot-Spotting

Google Cloud Storage (GCS) auto-scaled based on object key distribution. Without deliberate sharding, sequential uploads (especially with monotonically increasing IDs/timestamps) would create hot spots in the key index. GCS detected and rebalances these, but rebalancing took minutes.

**Our strategy**: Partition the dataset into 1,000 logical shards before upload, encoding the shard ID directly into the object prefix. Each image got a path like:

```text
gs://<bucket>/images/bucket=<episodic>/aesthetic=<tier>/pk=<0-999>/id=<hash>.jpg
```

By distributing writes evenly across 1,000 prefixes upfront, we avoided a painful ramp-up. GCS's auto-scaling detection became irrelevant when load was already uniform. 

### Optimizations at Scale

- Although individual images were small (<1MB), we grouped them into ~500MB tarballs before upload. Files greater than 150MB triggered GCS's parallel composite upload mechanism, which split the file into up to 32 chunks, uploaded them in parallel, and composed them server-side. For a 500MB tarball, we achieved **~2x throughput** improvement over single-threaded upload.
- With billion objects, listing was slow and expensive for validation. Instead, we maintained  **manifest files**, a simple record of uploaded batches with checksums. Validating completeness meant checking the manifest.

Four VMs, each running an uploader service consumed from a shared parquet metadata stream. Each VM saturated at roughly **375 images/sec**, constrained by network bandwidth.

---

## What We Learned

1.  ***Captions were the training signal***. Improving text moved quality far more than comparable effort on image filtering.
    
2.  ***Single thresholds threw away value***. Episodic bucketing let us run a curriculum where broader coverage was learned early and high-signals paired later without losing diversity.
    
3.  ***Every stage needed a contract***. Schema + Invariants + Metrics + Failure budgets, or the pipeline turned into folklore.
    
4.  ***Determinism wasn’t optional***. Versioned manifests + Content Hashes made any slice reproducible, which made model regressions explainable.

At billion-scale, the dataset became a model component: it encoded behavior, bias, and failure modes as directly as architecture and optimizer choices. 

---

## Appendix

For readers who want the complete end-to-end view, the diagram below shows how metadata records moved from Parquet &rarr; Kafka topics &rarr; stage-specific worker pools &rarr; until assets landed in final object storage.

![Orchestration](/images/blog/data-engineering/Orchestration.png)

## References

- Engineering OSS Packages/Libraries: [Apache Parquet Format](https://github.com/apache/parquet-format), [kafka-sarama](https://github.com/IBM/sarama), [Perpetual Hashing](https://github.com/idealo/imagededup), [Google PCU](https://cloud.google.com/storage/docs/parallel-composite-uploads), [Dask](https://distributed.dask.org/en/stable/)
- Models that helped us: [InternVL](https://arxiv.org/abs/2312.14238), [QwenVL3]((https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct)), [Google Gemma](https://github.com/google-deepmind/gemma), [Gemini2.5-Flash](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-5-flash), [LLaVA](https://github.com/osttkm/llava)
- NVIDIA: [DALI](https://github.com/NVIDIA/dali), [NeMo](https://docs.nvidia.com/nemo-framework/user-guide/latest/overview.html)
- Noteworthy Research: [CLIP](https://arxiv.org/abs/2103.00020), [SigLIP](https://huggingface.co/docs/transformers/en/model_doc/siglip)

---
_Created by  [NucleusAI](https://github.com/WithNucleusAI). Excited to work with us? Drop an email at contact@withnucleus.ai_

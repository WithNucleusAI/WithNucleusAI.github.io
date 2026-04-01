// Shared audio reactive state — connects to the bg-music audio element
// and provides smoothed amplitude data for visual components to sync with.

let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array<ArrayBuffer> | null = null;
let audioCtx: AudioContext | null = null;
let connected = false;
let smoothedAmplitude = 0;
let smoothedBass = 0;
let smoothedTreble = 0;
let musicTime = 0;
const MUSIC_LOOP_DURATION = 53.41;

function connectToAudio() {
    if (connected) return;
    const audio = document.getElementById("bg-music") as HTMLAudioElement | null;
    if (!audio) return;

    try {
        audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;

        const source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        dataArray = new Uint8Array(analyser.frequencyBinCount);
        connected = true;
    } catch (e) {
        if (process.env.NODE_ENV === "development") {
            console.warn("Audio reactive: failed to connect", e);
        }
        connected = false;
    }
}

function update() {
    if (!analyser || !dataArray) return;

    analyser.getByteFrequencyData(dataArray);
    const len = dataArray.length;

    let sum = 0;
    for (let i = 0; i < len; i++) sum += dataArray[i];
    const rawAmplitude = sum / (len * 255);

    let bassSum = 0;
    const bassEnd = Math.floor(len * 0.25);
    for (let i = 0; i < bassEnd; i++) bassSum += dataArray[i];
    const rawBass = bassSum / (bassEnd * 255);

    let trebleSum = 0;
    const trebleStart = Math.floor(len * 0.75);
    for (let i = trebleStart; i < len; i++) trebleSum += dataArray[i];
    const rawTreble = trebleSum / ((len - trebleStart) * 255);

    smoothedAmplitude += (rawAmplitude - smoothedAmplitude) * 0.12;
    smoothedBass += (rawBass - smoothedBass) * 0.08;
    smoothedTreble += (rawTreble - smoothedTreble) * 0.15;

    const audio = document.getElementById("bg-music") as HTMLAudioElement | null;
    if (audio) musicTime = audio.currentTime;
}

/**
 * Call from a user gesture (DISCOVER click) to ensure AudioContext is running.
 */
export function initAudioReactive(): void {
    connectToAudio();
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
    }
}

/**
 * Called every frame by visual components. Auto-connects if not yet connected.
 */
let resumeAttempted = false;

export function getAudioState() {
    if (!connected) connectToAudio();
    // Only attempt resume once — not every frame
    if (!resumeAttempted && audioCtx && audioCtx.state === "suspended") {
        resumeAttempted = true;
        audioCtx.resume().catch(() => {});
    }
    update();

    return {
        amplitude: smoothedAmplitude,
        bass: smoothedBass,
        treble: smoothedTreble,
        musicTime,
        loopProgress: musicTime / MUSIC_LOOP_DURATION,
        isPlaying: connected && smoothedAmplitude > 0.01,
    };
}

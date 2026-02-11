
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';
import matter from 'gray-matter';

// Allow processing a different directory via command line args
// Usage: node scripts/process-blogs.mjs [path-to-blogs-repo]
const ARGS_BLOGS_DIR = process.argv[2];
const TEMP_BLOGS_DIR = ARGS_BLOGS_DIR ? path.resolve(ARGS_BLOGS_DIR) : path.resolve('temp_blogs');
const POSTS_DIR = path.resolve('src/content/posts');
const PUBLIC_IMAGES_DIR = path.resolve('public/images/blog');

console.log(`Using blogs directory: ${TEMP_BLOGS_DIR}`);

// Ensure directories exist
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_IMAGES_DIR)) fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });

// Clean up destination directories to ensure exact sync
console.log('Cleaning up destination directories...');
// Remove existing markdown posts
if (fs.existsSync(POSTS_DIR)) {
    const existingPosts = fs.readdirSync(POSTS_DIR);
    for (const file of existingPosts) {
        if (file.endsWith('.md')) {
            fs.unlinkSync(path.join(POSTS_DIR, file));
        }
    }
}
// Remove existing blog images
if (fs.existsSync(PUBLIC_IMAGES_DIR)) {
    fs.rmSync(PUBLIC_IMAGES_DIR, { recursive: true, force: true });
    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function getGitDate(filePath) {
    try {
        // Get the author date of the last commit that touched the file
        const dateStr = execSync(`git log -1 --format=%ai -- "${filePath}"`, { 
            cwd: path.dirname(filePath),
            encoding: 'utf8' 
        }).trim();
        if (dateStr) {
            return dateStr.split(' ')[0]; // Return YYYY-MM-DD
        }
    } catch (e) {
        console.warn(`Could not get git date for ${filePath}, using current date.`);
    }
    return new Date().toISOString().split('T')[0];
}

async function processBlogs() {
    if (!fs.existsSync(TEMP_BLOGS_DIR)) {
        console.error(`Error: ${TEMP_BLOGS_DIR} does not exist.`);
        process.exit(1);
    }

    const blogDirs = fs.readdirSync(TEMP_BLOGS_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);

    for (const blogDirName of blogDirs) {
        try {
            const blogPath = path.join(TEMP_BLOGS_DIR, blogDirName);
            
            // Find the markdown file
            const files = fs.readdirSync(blogPath);
            const mdFile = files.find(f => f.toLowerCase().endsWith('.md'));
    
            if (!mdFile) {
                console.warn(`Skipping ${blogDirName}: No markdown file found.`);
                continue;
            }
    
            const mdPath = path.join(blogPath, mdFile);
            const assetsDir = path.join(blogPath, 'assets');
            
            // Generate slug
            const slug = slugify(blogDirName);
            console.log(`Processing ${blogDirName} -> ${slug} (file: ${mdFile})...`);
    
            const blogImagesDir = path.join(PUBLIC_IMAGES_DIR, slug);
            if (!fs.existsSync(blogImagesDir)) fs.mkdirSync(blogImagesDir, { recursive: true });
    
            // 1. Copy Assets & Build Asset Map
            const assetMap = new Map(); // filename -> publicPath
            if (fs.existsSync(assetsDir)) {
                const assets = fs.readdirSync(assetsDir);
                for (const asset of assets) {
                    if (asset.startsWith('.')) continue;
                    const src = path.join(assetsDir, asset);
                    const dest = path.join(blogImagesDir, asset);
                    
                    if (fs.lstatSync(src).isDirectory()) continue;
                    
                    fs.copyFileSync(src, dest);
                    
                    // Store mapping: filename -> /images/blog/slug/filename
                    assetMap.set(asset, `/images/blog/${slug}/${asset}`);
                }
            }
    
            // 2. Read Markdown
            let fileContent = fs.readFileSync(mdPath, 'utf8');
            
            // Try to parse frontmatter
            let parsed;
            try {
                parsed = matter(fileContent);
            } catch (e) {
                // If parsing fails, treat whole file as content
                console.warn(`Warning: Failed to parse frontmatter for ${slug}, treating as raw markdown.`);
                parsed = { data: {}, content: fileContent };
            }
    
            let { data, content } = parsed;
            
            // --- Metadata Extraction (Priority: Frontmatter > Auto-Extract) ---
            let title = data.title;
            let date = data.date;
            let excerpt = data.excerpt;
    
            // Title Strategy: 
            // 1. Use frontmatter if available.
            // 2. If not, find first H1.
            // ALWAYS remove the first H1 from content if it matches the title (or if we extracted it).
            const titleMatch = content.match(/^#\s+(.+)$/m);
            if (titleMatch) {
                const h1Title = titleMatch[1].trim();
                
                if (!title) {
                    // Case: No frontmatter title, use H1
                    title = h1Title;
                    content = content.replace(titleMatch[0], ''); // Remove extracted H1
                } else {
                    // Case: Frontmatter title exists. 
                    // Check if H1 mimics it (ignoring strict equality, just loose overlap to avoid duplication)
                    // or just simply remove the first H1 if it looks like a title.
                    // User said "take title as first #", implying the H1 IS the title.
                    // If we have both, we trust frontmatter, but we definitely don't want the visual H1 anymore.
                    content = content.replace(titleMatch[0], '');
                }
            }
            
            if (!title) title = 'Untitled';
    
            // Date Strategy:
            if (!date) {
                date = getGitDate(mdPath);
            }
    
            // Remove Table of Contents
            const tocMarker = "## Table of Contents";
            const tocIndex = content.indexOf(tocMarker);
            
            if (tocIndex !== -1) {
                const searchSlice = content.slice(tocIndex + tocMarker.length);
                // Find next strict section start
                const nextSection = searchSlice.match(/\n\s*(##|---)/);
                if (nextSection) {
                     const endIndex = tocIndex + tocMarker.length + nextSection.index;
                     content = content.slice(0, tocIndex) + content.slice(endIndex);
                }
            }
    
            // Excerpt Strategy:
            if (!excerpt) {
                const introMatch = content.match(/##\s+Introduction/i);
                if (introMatch) {
                    const afterIntro = content.substring(introMatch.index + introMatch[0].length);
                    const paragraphs = afterIntro.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
                    if (paragraphs.length > 0) excerpt = paragraphs[0];
                }
                
                if (!excerpt) {
                     const paragraphs = content.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0 && !p.startsWith('#'));
                     if (paragraphs.length > 0) excerpt = paragraphs[0];
                }
                
                if (excerpt) {
                    excerpt = excerpt.replace(/\s+/g, ' ').substring(0, 300).trim();
                    if (excerpt.length >= 300) excerpt += '...';
                }
            }
    
            // 3. Process Mermaid Diagrams
            const mermaidRegex = /```mermaid([\s\S]*?)```/g;
            const matches = [...content.matchAll(mermaidRegex)];
            
            for (const m of matches) {
                const fullMatch = m[0];
                const mermaidCode = m[1];
                
                const hash = crypto.createHash('md5').update(mermaidCode).digest('hex').substring(0, 8);
                const imageName = `mermaid-${hash}.png`;
                const imagePath = path.join(blogImagesDir, imageName);
                const publicPath = `/images/blog/${slug}/${imageName}`;
                
                if (!fs.existsSync(imagePath)) {
                    console.log(`  Generating Mermaid image: ${imageName}`);
                    const mmdPath = path.join(blogImagesDir, `temp-${hash}.mmd`);
                    fs.writeFileSync(mmdPath, mermaidCode);
                    try {
                        execSync(`npx mmdc -i "${mmdPath}" -o "${imagePath}" -b white -s 3`, { stdio: 'inherit' });
                        fs.unlinkSync(mmdPath);
                    } catch (e) {
                        console.error(`  Failed to generate mermaid for ${slug}`, e);
                        continue; 
                    }
                }
                content = content.split(fullMatch).join(`![Mermaid Diagram](${publicPath})`);
            }
            
            // 4. Update Asset Links (Flexible Filename Matching)
            content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
                const fileName = path.basename(src);
                // Decode URL encoded filenames just in case
                const decodedFileName = decodeURIComponent(fileName);
    
                if (assetMap.has(decodedFileName)) {
                    // If the file exists in our assets map, use the correct public path
                    return `![${alt}](${assetMap.get(decodedFileName)})`;
                } else if (assetMap.has(fileName)) {
                     return `![${alt}](${assetMap.get(fileName)})`;
                }
                
                // Fallback: If src contains 'assets/', try to just use the filename
                if (src.includes('assets/')) {
                     return `![${alt}](/images/blog/${slug}/${fileName})`;
                }
                
                return match;
            });
    
            // 5. Construct Final Content with Frontmatter
            // Ensure content doesn't start with '---' (horizontal rule) which gray-matter mistakes for frontmatter
            content = content.trim();
            if (content.startsWith('---')) {
                content = content.replace(/^---\s*/, '');
                content = content.trim();
            }

            // Preserve ALL existing frontmatter data + update title/date/excerpt
            const newFrontmatter = {
                ...data, // Spread original frontmatter (includes animation, etc.)
                title: title,
                date: date,
                excerpt: excerpt
            };
            
            // Use matter.stringify (if available) or construct manually to control order/quoting
            // To be safe and minimal dependency relies on existing construct, but let's just dump JSON logic to YAML
            // Actually line 6 imports 'gray-matter', so let's use it properly!
            // matter.stringify(content, data)
            
            const finalContent = matter.stringify(content.trim(), newFrontmatter);
    
            // 6. Write File
            const destMdPath = path.join(POSTS_DIR, `${slug}.md`);
            fs.writeFileSync(destMdPath, finalContent);
            console.log(`Finished ${slug}`);

        } catch (err) {
            console.error(`Error processing blog ${blogDirName}:`, err);
        }
    }
}

processBlogs().catch(console.error);

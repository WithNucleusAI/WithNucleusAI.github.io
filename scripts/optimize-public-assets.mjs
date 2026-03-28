import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const publicDir = path.join(root, 'public')

const SOURCE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg'])
const CONCURRENCY_LIMIT = 10 

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      return entry.isDirectory() ? walk(fullPath) : fullPath
    }),
  )
  return files.flat(Infinity)
}

async function convertAndDelete(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (!SOURCE_EXTENSIONS.has(ext)) return { success: false, originalSize: 0, newSize: 0 }

  const webpPath = filePath.replace(/\.[^.]+$/, '.webp')
  const stats = await fs.stat(filePath)
  const originalSize = stats.size

  try {
    // Convert to WebP
    // effort 6 = slowest/best compression
    // quality 90 = extremely high quality, nearly indistinguishable
    await sharp(filePath, { failOn: 'none' })
      .webp({ quality: 90, effort: 6 })
      .toFile(webpPath)

    const newStats = await fs.stat(webpPath)
    
    // Delete the original file
    await fs.unlink(filePath)
    
    return { success: true, originalSize, newSize: newStats.size }
  } catch (err) {
    console.error(`Failed to process ${filePath}:`, err.message)
    return { success: false, originalSize: 0, newSize: 0 }
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

async function main() {
  console.log(`🚀 Starting In-Place Conversion: ${publicDir}...`)
  
  const allFiles = await walk(publicDir)
  const imageFiles = allFiles.filter(f => SOURCE_EXTENSIONS.has(path.extname(f).toLowerCase()))

  let convertedCount = 0
  let totalSaved = 0

  for (let i = 0; i < imageFiles.length; i += CONCURRENCY_LIMIT) {
    const chunk = imageFiles.slice(i, i + CONCURRENCY_LIMIT)

    const results = await Promise.all(chunk.map(convertAndDelete))
    
    results.forEach(res => {
      if (res.success) {
        convertedCount++
        totalSaved += (res.originalSize - res.newSize)
      }
    })
    
    process.stdout.write(`Progress: ${Math.min(i + CONCURRENCY_LIMIT, imageFiles.length)}/${imageFiles.length}\r`)
  }

  console.log('\n' + '-'.repeat(30))
  console.log(`✅ Files Converted & Deleted: ${convertedCount}`)
  console.log(`📉 Space Recovered:           ${formatBytes(Math.max(0, totalSaved))}`)
}

main().catch(console.error)
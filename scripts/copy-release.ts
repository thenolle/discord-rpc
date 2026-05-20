import fs from 'node:fs'
import path from 'node:path'

const [source, target] = process.argv.slice(2)

if (!source || !target) {
  console.error('Usage: bun run scripts/copy-release.ts <source> <target>')
  process.exit(1)
}

fs.mkdirSync(path.dirname(target), { recursive: true })
fs.copyFileSync(source, target)
console.log(`Copied ${source} -> ${target}`)
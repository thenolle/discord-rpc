import fs from 'node:fs'

fs.rmSync('build', { recursive: true, force: true })
console.log('Cleaned build directory')
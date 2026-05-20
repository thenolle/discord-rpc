import fs from 'node:fs'

const IMAGE_SUBSYSTEM_WINDOWS_GUI = 2
const PE_HEADER_OFFSET_LOCATION = 0x3c
const SUBSYSTEM_OFFSET = 0x5c

const filePath = process.argv[2]

if (!filePath) {
  console.error('Usage: bun run scripts/patch-windows-gui.ts <path-to-exe>')
  process.exit(1)
}

const fd = fs.openSync(filePath, 'r+')

try {
  const peOffsetBuffer = Buffer.alloc(4)
  fs.readSync(fd, peOffsetBuffer, 0, 4, PE_HEADER_OFFSET_LOCATION)
  const peHeaderOffset = peOffsetBuffer.readUInt32LE(0)
  const subsystemOffset = peHeaderOffset + SUBSYSTEM_OFFSET
  const subsystemBuffer = Buffer.alloc(2)
  subsystemBuffer.writeUInt16LE(IMAGE_SUBSYSTEM_WINDOWS_GUI, 0)
  fs.writeSync(fd, subsystemBuffer, 0, 2, subsystemOffset)
  console.log(`Patched Windows subsystem to GUI: ${filePath}`)
} finally {
  fs.closeSync(fd)
}
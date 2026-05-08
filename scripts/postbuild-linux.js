'use strict'

const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const distDir = path.join(root, 'dist')
const binaryPath = path.join(distDir, 'drpc-linux')
const iconPath = path.join(root, 'assets', 'icon.png')
const desktopPath = path.join(distDir, 'discord-rpc.desktop')

if (!fs.existsSync(binaryPath)) {
  console.error('Linux build not found:', binaryPath)
  process.exit(1)
}

if (!fs.existsSync(iconPath)) {
  console.error('Linux icon not found:', iconPath)
  process.exit(1)
}

fs.chmodSync(binaryPath, 0o755)

const desktopFile = `[Desktop Entry]
Version=1.0
Type=Application
Name=Discord RPC
Comment=Ultra-light Discord Rich Presence
Exec=${binaryPath}
Icon=${iconPath}
Terminal=false
Categories=Utility;
StartupNotify=true
`

fs.writeFileSync(desktopPath, desktopFile, 'utf8')
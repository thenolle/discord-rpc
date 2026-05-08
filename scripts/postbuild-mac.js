'use strict'

const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const distDir = path.join(root, 'dist')
const binaryPath = path.join(distDir, 'drpc-mac')
const appDir = path.join(distDir, 'Discord RPC.app')
const contentsDir = path.join(appDir, 'Contents')
const macOSDir = path.join(contentsDir, 'MacOS')
const resourcesDir = path.join(contentsDir, 'Resources')
const iconPath = path.join(root, 'assets', 'icon.icns')
const appBinaryPath = path.join(macOSDir, 'Discord RPC')
const plistPath = path.join(contentsDir, 'Info.plist')

if (!fs.existsSync(binaryPath)) {
  console.error('macOS build not found:', binaryPath)
  process.exit(1)
}

if (!fs.existsSync(iconPath)) {
  console.error('macOS icon not found:', iconPath)
  process.exit(1)
}

fs.rmSync(appDir, { recursive: true, force: true })
fs.mkdirSync(macOSDir, { recursive: true })
fs.mkdirSync(resourcesDir, { recursive: true })

fs.copyFileSync(binaryPath, appBinaryPath)
fs.chmodSync(appBinaryPath, 0o755)
fs.copyFileSync(iconPath, path.join(resourcesDir, 'icon.icns'))

const plist = `<?xml version='1.0' encoding='UTF-8'?>
<!DOCTYPE plist PUBLIC '-//Apple//DTD PLIST 1.0//EN' 'http://www.apple.com/DTDs/PropertyList-1.0.dtd'>
<plist version='1.0'>
  <dict>
    <key>CFBundleName</key>
    <string>Discord RPC</string>
    <key>CFBundleDisplayName</key>
    <string>Discord RPC</string>
    <key>CFBundleExecutable</key>
    <string>Discord RPC</string>
    <key>CFBundleIdentifier</key>
    <string>com.nolly.discord-rpc</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleIconFile</key>
    <string>icon.icns</string>
  </dict>
</plist>
`

fs.writeFileSync(plistPath, plist, 'utf8')
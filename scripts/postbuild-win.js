'use strict'

const fs = require('fs')
const path = require('path')

const rceditModule = require('rcedit')
const rcedit = typeof rceditModule === 'function' ? rceditModule : typeof rceditModule?.default === 'function' ? rceditModule.default : typeof rceditModule?.rcedit === 'function' ? rceditModule.rcedit : null

const exePath = path.join(__dirname, '..', 'dist', 'drpc.exe')
const iconPath = path.join(__dirname, '..', 'assets', 'icon.ico')

const main = async () => {
  if (!rcedit) throw new Error(`Invalid rcedit export shape: ${Object.keys(rceditModule || {}).join(', ') || 'empty module'}`)
  if (!fs.existsSync(exePath)) throw new Error(`Windows build not found: ${exePath}`)
  if (!fs.existsSync(iconPath)) throw new Error(`Windows icon not found: ${iconPath}`)
  await rcedit(exePath, { icon: iconPath })
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
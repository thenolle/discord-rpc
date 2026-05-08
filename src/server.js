#!/usr/bin/env node

'use strict'

const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
const net = require('net')
const { WebSocketServer } = require('ws')
const { exec } = require('child_process')
const systrayModule = require('systray2')

const SysTray = systrayModule.SysTray || systrayModule.default || systrayModule
const OP = { HANDSHAKE: 0, FRAME: 1, CLOSE: 2, PING: 3, PONG: 4 }

const getIpcPath = (index = 0) => {
  if (process.platform === 'win32') return `\\\\?\\pipe\\discord-ipc-${index}`
  const base = process.env.XDG_RUNTIME_DIR || process.env.TMPDIR || process.env.TMP || process.env.TEMP || '/tmp'
  return path.join(base, `discord-ipc-${index}`)
}

const encodeFrame = (op, data) => {
  const json = Buffer.from(JSON.stringify(data), 'utf8')
  const header = Buffer.alloc(8)
  header.writeInt32LE(op, 0)
  header.writeInt32LE(json.length, 4)
  return Buffer.concat([header, json])
}

const createNonce = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

class DiscordIpcClient {
  constructor() {
    this.socket = null
    this.connected = false
    this.clientId = ''
    this.buffer = Buffer.alloc(0)
    this.pending = new Map()
    this.activityPid = process.pid
    this.user = null
  }
  async connect(clientId) {
    this.clientId = String(clientId)
    await this.disconnect()
    let lastError = null
    for (let i = 0; i < 10; i += 1) {
      try {
        await this.#connectToPipe(getIpcPath(i))
        await this.#handshake()
        this.connected = true
        return
      } catch (error) { lastError = error }
    }
    throw lastError || new Error('Could not connect to Discord IPC')
  }
  #connectToPipe(pipePath) {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection(pipePath)
      const onError = (error) => {
        socket.removeAllListeners()
        try { socket.destroy() } catch (_) { }
        reject(error)
      }
      socket.once('error', onError)
      socket.once('connect', () => {
        socket.removeListener('error', onError)
        this.socket = socket
        this.buffer = Buffer.alloc(0)
        socket.on('data', (chunk) => this.#onData(chunk))
        socket.on('error', (error) => console.error('[ipc] socket error:', error?.message || error))
        socket.on('close', () => {
          this.connected = false
          this.socket = null
        })
        resolve()
      })
    })
  }
  #handshake() {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('IPC socket not ready'))
      const timeout = setTimeout(() => { reject(new Error('IPC handshake timeout')) }, 5000)
      const cleanup = () => {
        clearTimeout(timeout)
        this.pending.delete('handshake')
      }
      this.pending.set('handshake', {
        resolve: (payload) => {
          cleanup()
          this.user = payload?.data?.user || null
          resolve(payload)
        },
        reject: (error) => {
          cleanup()
          reject(error)
        }
      })
      this.socket.write(encodeFrame(OP.HANDSHAKE, { v: 1, client_id: this.clientId }))
    })
  }
  #onData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk])
    while (this.buffer.length >= 8) {
      const op = this.buffer.readInt32LE(0)
      const len = this.buffer.readInt32LE(4)
      if (this.buffer.length < 8 + len) return
      const body = this.buffer.subarray(8, 8 + len)
      this.buffer = this.buffer.subarray(8 + len)
      let payload = null
      try {
        payload = JSON.parse(body.toString('utf8'))
      } catch (error) {
        console.error('[ipc] invalid payload:', error?.message || error)
        continue
      }
      if (op === OP.PING) {
        this.socket?.write(encodeFrame(OP.PONG, payload))
        continue
      }
      if (payload?.evt === 'READY' && this.pending.has('handshake')) {
        this.pending.get('handshake').resolve(payload)
        continue
      }
      const nonce = payload?.nonce
      if (nonce && this.pending.has(nonce)) {
        const entry = this.pending.get(nonce)
        this.pending.delete(nonce)
        if (payload?.evt === 'ERROR' || payload?.data?.message) {
          const errMessage = payload?.data?.message || payload?.message || 'Discord IPC error'
          entry.reject(new Error(errMessage))
        } else entry.resolve(payload)
      }
    }
  }
  send(command, args = {}) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        reject(new Error('Discord IPC is not connected'))
        return
      }
      const nonce = createNonce()
      this.pending.set(nonce, { resolve, reject })
      this.socket.write(encodeFrame(OP.FRAME, { cmd: command, args, nonce }))
    })
  }
  async setActivity(activity) {
    return this.send('SET_ACTIVITY', { pid: this.activityPid, activity })
  }
  async clearActivity() {
    return this.send('SET_ACTIVITY', { pid: this.activityPid, activity: null })
  }
  async disconnect() {
    for (const [, pending] of this.pending) pending.reject(new Error('Discord IPC connection reset'))
    this.pending.clear()
    if (this.socket) {
      try { this.socket.end() } catch (_) { }
      try { this.socket.destroy() } catch (_) { }
    }
    this.socket = null
    this.connected = false
    this.user = null
  }
}

const ROOT = process.pkg ? path.dirname(process.execPath) : path.join(__dirname, '..')
const PUBLIC_DIR = path.join(__dirname, '..', 'public')
const CONFIG_PATH = path.join(ROOT, 'config.json')

const DEFAULT_CONFIG = {
  clientId: '',
  details: '',
  state: '',
  largeImageKey: '',
  largeImageText: '',
  smallImageKey: '',
  smallImageText: '',
  startTimestamp: '',
  endTimestamp: '',
  partySize: '',
  partyMax: '',
  buttons: [
    { label: '', url: '' },
    { label: '', url: '' }
  ]
}

const openBrowser = (url) => {
  const safeUrl = String(url).replace(/"/g, '\\"')
  if (process.platform === 'win32') {
    exec(`start "" "${safeUrl}"`, { windowsHide: true })
    return
  }
  if (process.platform === 'darwin') {
    exec(`open "${safeUrl}"`)
    return
  }
  exec(`xdg-open "${safeUrl}"`)
}

const loadConfig = () => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf8')
      return Object.assign({}, DEFAULT_CONFIG, JSON.parse(raw))
    }
  } catch (error) {
    console.error('[config] Read error:', error.message)
  }
  return Object.assign({}, DEFAULT_CONFIG)
}

const saveConfig = (config) => {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8')
  } catch (error) {
    console.error('[config] Write error:', error.message)
  }
}

const findFreePort = (start = 4518) => new Promise((resolve, reject) => {
  const probe = (port) => {
    const server = net.createServer()
    server.unref()
    server.on('error', () => probe(port + 1))
    server.listen(port, '127.0.0.1', () => {
      const { port: found } = server.address()
      server.close((error) => {
        if (error) return reject(error)
        resolve(found)
      })
    })
  }
  probe(start)
})

const IMGUR_CLIENT_ID = 'Client-ID 546c25a59c58ad7'

const uploadToImgur = (base64) => new Promise((resolve, reject) => {
  const body = JSON.stringify({ image: base64, type: 'base64' })
  const request = https.request({ hostname: 'api.imgur.com', path: '/3/image', method: 'POST', headers: { 'Authorization': IMGUR_CLIENT_ID, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, (response) => {
    let data = ''
    response.on('data', (chunk) => { data += chunk })
    response.on('end', () => {
      try {
        const parsed = JSON.parse(data)
        if (parsed.success && parsed.data?.link) resolve(parsed.data.link)
        else reject(new Error(parsed.data?.error || 'Imgur upload failed'))
      } catch { reject(new Error('Invalid Imgur response')) }
    })
  })
  request.on('error', reject)
  request.write(body)
  request.end()
})

let rpcClient = new DiscordIpcClient()
let rpcConnected = false

const broadcast = (wss, payload) => {
  const message = JSON.stringify(payload)
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(message)
  }
}

const destroyRpc = async () => {
  if (!rpcClient) return
  await rpcClient.disconnect()
  rpcConnected = false
}

const connectRpc = async (clientId, wss) => {
  try {
    await destroyRpc()
    rpcClient = new DiscordIpcClient()
    await rpcClient.connect(clientId)
    rpcConnected = true
    const rpcUser = rpcClient.user
    const user = rpcUser ? `${rpcUser.username}${rpcUser.discriminator && rpcUser.discriminator !== '0' ? '#' + rpcUser.discriminator : ''}` : 'Connected'
    broadcast(wss, { type: 'status', connected: true, user })
  } catch (error) {
    rpcConnected = false
    console.error('[rpc] IPC connect failed:', error?.message || error)
    broadcast(wss, { type: 'error', message: error?.message || 'Failed to connect to Discord' })
  }
}

const buildActivity = (data) => {
  const activity = {}
  if (data.type !== undefined) {
    const type = Number(data.type)
    if (!Number.isNaN(type)) activity.type = type
  }
  if (data.streamUrl && Number(data.type) === 1) activity.url = String(data.streamUrl)
  if (data.details) activity.details = String(data.details)
  if (data.state) activity.state = String(data.state)
  const assets = {}
  if (data.largeImageKey) assets.large_image = String(data.largeImageKey).trim()
  if (data.largeImageText) assets.large_text = String(data.largeImageText)
  if (data.smallImageKey) assets.small_image = String(data.smallImageKey).trim()
  if (data.smallImageText) assets.small_text = String(data.smallImageText)
  if (Object.keys(assets).length) activity.assets = assets
  if (data.startTimestamp) {
    if (data.startTimestamp === 'now') {
      activity.timestamps = activity.timestamps || {}
      activity.timestamps.start = Math.floor(Date.now() / 1000)
    } else {
      const parsed = Number(data.startTimestamp)
      if (!Number.isNaN(parsed) && parsed > 0) {
        activity.timestamps = activity.timestamps || {}
        activity.timestamps.start = Math.floor(parsed / 1000)
      }
    }
  }
  if (data.endTimestamp) {
    const parsed = Number(data.endTimestamp)
    if (!Number.isNaN(parsed) && parsed > 0) {
      activity.timestamps = activity.timestamps || {}
      activity.timestamps.end = Math.floor(parsed / 1000)
    }
  }
  if (data.partySize && data.partyMax) {
    const size = Number(data.partySize)
    const max = Number(data.partyMax)
    if (size > 0 && max > 0 && size <= max) activity.party = { size: [size, max] }
  }
  if (Array.isArray(data.buttons)) {
    const buttons = data.buttons.filter((button) => button.label && button.url).slice(0, 2).map((button) => ({
      label: String(button.label),
      url: String(button.url)
    }))
    if (buttons.length) activity.buttons = buttons
  }
  return activity
}

const setActivity = async (data, wss) => {
  if (!rpcClient || !rpcConnected) {
    const message = 'Not connected to Discord. Make sure you pressed Connect and Discord is open.'
    console.error('[rpc]', message)
    broadcast(wss, { type: 'error', message })
    return
  }
  try {
    const activity = buildActivity(data)
    await rpcClient.setActivity(activity)
    broadcast(wss, { type: 'success', message: 'Presence updated' })
  } catch (error) {
    const message = error?.message || error?.toString() || 'Unknown error'
    console.error('[rpc] SET_ACTIVITY threw:', message)
    console.error('[rpc] stack:', error?.stack || '(no stack)')
    broadcast(wss, { type: 'error', message: `Failed to set presence: ${message}` })
  }
}

const clearActivity = async (wss) => {
  if (!rpcClient || !rpcConnected) {
    const message = 'Not connected to Discord. Make sure you pressed Connect and Discord is open.'
    console.error('[rpc]', message)
    broadcast(wss, { type: 'error', message })
    return
  }
  try {
    await rpcClient.clearActivity()
    broadcast(wss, { type: 'success', message: 'Presence cleared' })
  } catch (error) {
    const message = error?.message || error?.toString() || 'Unknown error'
    console.error('[rpc] clearActivity() threw:', message)
    console.error('[rpc] stack:', error?.stack || '(no stack)')
    broadcast(wss, { type: 'error', message: `Failed to clear presence: ${message}` })
  }
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' }

const serveStatic = (request, response) => {
  const urlPath = request.url === '/' ? '/index.html' : request.url.split('?')[0]
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  const filePath = path.join(PUBLIC_DIR, safePath)
  fs.readFile(filePath, (error, data) => {
    if (error) {
      console.error('[static] Not found:', filePath, error.code)
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Not found')
      return
    }
    const extension = path.extname(filePath).toLowerCase()
    response.writeHead(200, { 'Content-Type': MIME[extension] || 'application/octet-stream' })
    response.end(data)
  })
}

const parseBody = (request) => new Promise((resolve, reject) => {
  const chunks = []
  request.on('data', (chunk) => chunks.push(chunk))
  request.on('end', () => {
    try { resolve(JSON.parse(Buffer.concat(chunks).toString())) }
    catch { reject(new Error('Invalid JSON body')) }
  })
  request.on('error', reject)
})

const openConfigFile = () => {
  if (!fs.existsSync(CONFIG_PATH)) saveConfig(loadConfig())
  const safePath = String(CONFIG_PATH).replace(/"/g, '\\"')
  if (process.platform === 'win32') {
    exec(`start "" "${safePath}"`, { windowsHide: true })
    return
  }
  if (process.platform === 'darwin') {
    exec(`open "${safePath}"`)
    return
  }
  exec(`xdg-open "${safePath}"`)
}

const quitApp = async ({ server, systray }) => {
  try { await destroyRpc() } catch (_) { }
  try { systray?.kill() } catch (_) { }
  try {
    server?.close(() => process.exit(0))
    setTimeout(() => process.exit(0), 300)
  } catch (_) { process.exit(0) }
}

const main = async () => {
  const port = await findFreePort()
  const server = http.createServer(async (request, response) => {
    const method = request.method.toUpperCase()
    const urlPath = request.url.split('?')[0]
    if (method === 'GET' && urlPath === '/api/proxy') {
      const params = new URLSearchParams(request.url.split('?')[1] || '')
      const target = params.get('url')
      if (!target || (!target.startsWith('https://i.imgur.com/') && !target.startsWith('https://imgur.com/'))) {
        response.writeHead(400, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: 'Invalid or missing url param' }))
        return
      }
      const proxyRequest = https.get(target, (proxyResponse) => {
        response.writeHead(proxyResponse.statusCode, { 'Content-Type': proxyResponse.headers['content-type'] || 'image/png', 'Cache-Control': 'public, max-age=86400', 'Access-Control-Allow-Origin': '*' })
        proxyResponse.pipe(response)
      })
      proxyRequest.on('error', (error) => {
        response.writeHead(502, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: error.message }))
      })
      return
    }
    if (method === 'POST' && urlPath === '/api/upload') {
      try {
        const { base64 } = await parseBody(request)
        if (!base64) {
          response.writeHead(400, { 'Content-Type': 'application/json' })
          response.end(JSON.stringify({ error: 'Missing base64 field' }))
          return
        }
        const clean = base64.replace(/^data:[^;]+;base64,/, '')
        const url = await uploadToImgur(clean)
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ url }))
      } catch (error) {
        response.writeHead(500, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: error.message }))
      }
      return
    }
    if (method === 'GET' && urlPath === '/api/config') {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify(loadConfig()))
      return
    }
    if (method === 'POST' && urlPath === '/api/config') {
      try {
        const body = await parseBody(request)
        saveConfig(Object.assign({}, DEFAULT_CONFIG, body))
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ ok: true }))
      } catch (error) {
        response.writeHead(500, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: error.message }))
      }
      return
    }
    serveStatic(request, response)
  })
  const wss = new WebSocketServer({ server })
  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'status', connected: rpcConnected, user: rpcConnected && rpcClient?.user ? rpcClient.user.username : '' }))
    socket.on('message', async (raw) => {
      let message
      try { message = JSON.parse(raw.toString()) } catch {
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }))
        return
      }
      switch (message.type) {
        case 'connect':
          if (!message.clientId) {
            socket.send(JSON.stringify({ type: 'error', message: 'Client ID is required' }))
            return
          }
          await connectRpc(message.clientId, wss)
          break
        case 'disconnect':
          await destroyRpc()
          broadcast(wss, { type: 'status', connected: false })
          break
        case 'setActivity':
          if (message.data?.type === 1 && message.data?.streamUrl && !/^https?:\/\//i.test(message.data.streamUrl)) {
            socket.send(JSON.stringify({ type: 'error', message: 'Streaming activity requires a valid http(s) stream URL' }))
            return
          }
          await setActivity(message.data || {}, wss)
          break
        case 'clearActivity':
          await clearActivity(wss)
          break
        default: socket.send(JSON.stringify({ type: 'error', message: `Unknown type: ${message.type}` }))
      }
    })
  })
  server.listen(port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${port}`
    const systray = new SysTray({
      menu: {
        icon: process.platform === 'win32' ? './public/tray.ico' : './public/tray.png',
        isTemplateIcon: process.platform === 'darwin',
        title: 'Discord RPC',
        tooltip: 'Discord RPC is running',
        items: [
          {
            title: 'Open Web UI',
            tooltip: 'Open the web interface in your browser',
            checked: false,
            enabled: true
          },
          {
            title: 'Open Config',
            tooltip: 'Open config.json in the default editor',
            checked: false,
            enabled: true
          },
          {
            title: 'Quit',
            tooltip: 'Quit Discord RPC',
            checked: false,
            enabled: true
          }
        ]
      },
      debug: false,
      copyDir: true
    })
    systray.onClick((action) => {
      if (action.seq_id === 0) openBrowser(url)
      if (action.seq_id === 1) openConfigFile()
      if (action.seq_id === 2) quitApp({ server, systray })
    })
    openBrowser(url)
  })
}

main().catch((error) => {
  console.error('Fatal:', error)
  process.exit(1)
})
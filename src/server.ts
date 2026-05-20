import http, { type IncomingMessage, type ServerResponse } from 'node:http'
import https from 'node:https'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import net from 'node:net'
import { exec } from 'node:child_process'
import { dlopen, FFIType, suffix, ptr } from 'bun:ffi'
import { WebSocketServer, type WebSocket } from 'ws'
import { TrayIconBuilder, Menu, MenuItemBuilder, PredefinedMenuItem, Icon, initialize, update, pollMenuEvents, TrayIcon } from 'tray-icon-node'
import { UI_HTML, UI_CSS, UI_JS } from './ui'
import { trayICO, trayPNG } from './images';

const OP = { HANDSHAKE: 0, FRAME: 1, CLOSE: 2, PING: 3, PONG: 4 } as const

type Config = {
  clientId: string
  details: string
  state: string
  largeImageKey: string
  largeImageText: string
  smallImageKey: string
  smallImageText: string
  startTimestamp: string
  endTimestamp: string
  partySize: string
  partyMax: string
  buttons: Array<{ label: string, url: string }>
  type?: number
  streamUrl?: string
}

const DEFAULT_CONFIG: Config = {
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
  ],
  type: 0,
  streamUrl: ''
}

const getConfigPath = () => {
  const home = os.homedir()
  if (process.platform === 'win32') return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'discord-rpc.json')
  if (process.platform === 'darwin') return path.join(home, 'Library', 'Application Support', 'discord-rpc.json')
  return path.join(process.env.XDG_CONFIG_HOME || path.join(home, '.config'), 'discord-rpc.json')
}

const assertValidIcoBuffer = (buffer: Buffer) => {
  if (buffer.length < 6) throw new Error('ICO too small')
  if (buffer[0] !== 0x00 || buffer[1] !== 0x00 || buffer[2] !== 0x01 || buffer[3] !== 0x00) throw new Error('Invalid ICO header')
}

const decodeBase64Asset = (value: string) => {
  const clean = value.replace(/^data:[^;]+;base64,/, '').trim()
  return Buffer.from(clean, 'base64')
}

const ensureRuntimeIconFile = (base64: string, extension: '.ico' | '.png') => {
  const runtimeDir = path.join(os.tmpdir(), 'discord-rpc')
  const outputPath = path.join(runtimeDir, `tray${extension}`)
  fs.mkdirSync(runtimeDir, { recursive: true })
  const buffer = decodeBase64Asset(base64)
  if (!buffer.length) throw new Error(`Decoded tray${extension} is empty`)
  if (extension === '.ico') assertValidIcoBuffer(buffer)
  fs.writeFileSync(outputPath, buffer)
  return outputPath
}

const CONFIG_PATH = getConfigPath()

const ensureConfigDir = () => {
  const dir = path.dirname(CONFIG_PATH)
  fs.mkdirSync(dir, { recursive: true })
}

const loadConfig = (): Config => {
  try {
    ensureConfigDir()
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf8')
      const parsed = { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
      return parsed
    }
  } catch (error: any) {
    console.error('[config] Read error:', error?.message || error)
  }
  return { ...DEFAULT_CONFIG }
}

const saveConfig = (config: Config) => {
  try {
    ensureConfigDir()
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ ...DEFAULT_CONFIG, ...config }, null, 2), 'utf8')
  } catch (error: any) {
    console.error('[config] Write error:', error?.message || error)
  }
}

const openBrowser = (url: string) => {
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

const getIpcPath = (index = 0) => {
  if (process.platform === 'win32') return `\\\\?\\pipe\\discord-ipc-${index}`
  const base = process.env.XDG_RUNTIME_DIR || process.env.TMPDIR || process.env.TMP || process.env.TEMP || '/tmp'
  return path.join(base, `discord-ipc-${index}`)
}

const encodeFrame = (op: number, data: unknown) => {
  const json = Buffer.from(JSON.stringify(data), 'utf8')
  const header = Buffer.alloc(8)
  header.writeInt32LE(op, 0)
  header.writeInt32LE(json.length, 4)
  return Buffer.concat([header, json])
}

const createNonce = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

class DiscordIpcClient {
  socket: net.Socket | null = null
  connected = false
  clientId = ''
  buffer = Buffer.alloc(0)
  pending = new Map<string, { resolve: (value: any) => void, reject: (error: Error) => void }>()
  activityPid = process.pid
  user: any = null

  async connect(clientId: string) {
    this.clientId = String(clientId)
    await this.disconnect()
    let lastError: unknown = null
    for (let i = 0; i < 10; i += 1) {
      try {
        const ipcPath = getIpcPath(i)
        await this.connectToPipe(ipcPath)
        await this.handshake()
        this.connected = true
        return
      } catch (error) {
        lastError = error
      }
    }
    throw lastError || new Error('Could not connect to Discord IPC')
  }

  connectToPipe(pipePath: string) {
    return new Promise<void>((resolve, reject) => {
      const socket = net.createConnection(pipePath)
      const onError = (error: Error) => {
        socket.removeAllListeners()
        try { socket.destroy() } catch { }
        reject(error)
      }
      socket.once('error', onError)
      socket.once('connect', () => {
        socket.removeListener('error', onError)
        this.socket = socket
        this.buffer = Buffer.alloc(0)
        socket.on('data', chunk => this.onData(chunk as Buffer))
        socket.on('error', error => console.error('[ipc] socket error:', (error as any)?.message || error))
        socket.on('close', () => {
          this.connected = false
          this.socket = null
        })
        resolve()
      })
    })
  }

  handshake() {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('IPC socket not ready'))
      const timeout = setTimeout(() => reject(new Error('IPC handshake timeout')), 5000)
      const cleanup = () => {
        clearTimeout(timeout)
        this.pending.delete('handshake')
      }
      this.pending.set('handshake', {
        resolve: payload => {
          cleanup()
          this.user = payload?.data?.user || null
          resolve(payload)
        },
        reject: error => {
          cleanup()
          reject(error)
        }
      })
      this.socket.write(encodeFrame(OP.HANDSHAKE, { v: 1, client_id: this.clientId }))
    })
  }

  onData(chunk: Buffer) {
    this.buffer = Buffer.concat([this.buffer, chunk])
    while (this.buffer.length >= 8) {
      const op = this.buffer.readInt32LE(0)
      const len = this.buffer.readInt32LE(4)
      if (this.buffer.length < 8 + len) return
      const body = this.buffer.subarray(8, 8 + len)
      this.buffer = this.buffer.subarray(8 + len)
      let payload: any = null
      try {
        payload = JSON.parse(body.toString('utf8'))
      } catch (error: any) {
        console.error('[ipc] invalid payload:', error?.message || error)
        continue
      }
      if (op === OP.PING) {
        this.socket?.write(encodeFrame(OP.PONG, payload))
        continue
      }
      if (payload?.evt === 'READY' && this.pending.has('handshake')) {
        this.pending.get('handshake')?.resolve(payload)
        continue
      }
      const nonce = payload?.nonce
      if (nonce && this.pending.has(nonce)) {
        const entry = this.pending.get(nonce)!
        this.pending.delete(nonce)
        if (payload?.evt === 'ERROR' || payload?.data?.message) {
          const errMessage = payload?.data?.message || payload?.message || 'Discord IPC error'
          entry.reject(new Error(errMessage))
        } else entry.resolve(payload)
      }
    }
  }

  send(command: string, args: Record<string, unknown> = {}) {
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

  async setActivity(activity: Record<string, unknown>) {
    return this.send('SET_ACTIVITY', { pid: this.activityPid, activity })
  }

  async clearActivity() {
    return this.send('SET_ACTIVITY', { pid: this.activityPid, activity: null })
  }

  async disconnect() {
    for (const [, pending] of this.pending) pending.reject(new Error('Discord IPC connection reset'))
    this.pending.clear()
    if (this.socket) {
      try { this.socket.end() } catch { }
      try { this.socket.destroy() } catch { }
    }
    this.socket = null
    this.connected = false
    this.user = null
  }
}

let rpcClient = new DiscordIpcClient()
let rpcConnected = false

const broadcast = (wss: WebSocketServer, payload: unknown) => {
  const message = JSON.stringify(payload)
  for (const client of wss.clients) {
    if ((client as WebSocket).readyState === 1) client.send(message)
  }
}

const destroyRpc = async () => {
  if (!rpcClient) return
  await rpcClient.disconnect()
  rpcConnected = false
}

const connectRpc = async (clientId: string, wss: WebSocketServer) => {
  try {
    await destroyRpc()
    rpcClient = new DiscordIpcClient()
    await rpcClient.connect(clientId)
    rpcConnected = true
    const rpcUser = rpcClient.user
    const user = rpcUser ? `${rpcUser.username}${rpcUser.discriminator && rpcUser.discriminator !== '0' ? `#${rpcUser.discriminator}` : ''}` : 'Connected'
    broadcast(wss, { type: 'status', connected: true, user })
  } catch (error: any) {
    rpcConnected = false
    console.error('[rpc] IPC connect failed:', error?.message || error)
    broadcast(wss, { type: 'error', message: error?.message || 'Failed to connect to Discord' })
  }
}

const buildActivity = (data: Record<string, any>) => {
  const activity: Record<string, any> = {}
  if (data.type !== undefined) {
    const type = Number(data.type)
    if (!Number.isNaN(type)) activity.type = type
  }
  if (data.streamUrl && Number(data.type) === 1) activity.url = String(data.streamUrl)
  if (data.details) activity.details = String(data.details)
  if (data.state) activity.state = String(data.state)
  const assets: Record<string, string> = {}
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
    const buttons = data.buttons
      .filter(button => button.label && button.url)
      .slice(0, 2)
      .map(button => ({ label: String(button.label), url: String(button.url) }))
    if (buttons.length) activity.buttons = buttons
  }
  return activity
}

const setActivity = async (data: Record<string, any>, wss: WebSocketServer) => {
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
  } catch (error: any) {
    const message = error?.message || error?.toString() || 'Unknown error'
    console.error('[rpc] SET_ACTIVITY threw:', message)
    console.error('[rpc] stack:', error?.stack || '(no stack)')
    broadcast(wss, { type: 'error', message: `Failed to set presence: ${message}` })
  }
}

const clearActivity = async (wss: WebSocketServer) => {
  if (!rpcClient || !rpcConnected) {
    const message = 'Not connected to Discord. Make sure you pressed Connect and Discord is open.'
    console.error('[rpc]', message)
    broadcast(wss, { type: 'error', message })
    return
  }
  try {
    await rpcClient.clearActivity()
    broadcast(wss, { type: 'success', message: 'Presence cleared' })
  } catch (error: any) {
    const message = error?.message || error?.toString() || 'Unknown error'
    console.error('[rpc] clearActivity() threw:', message)
    console.error('[rpc] stack:', error?.stack || '(no stack)')
    broadcast(wss, { type: 'error', message: `Failed to clear presence: ${message}` })
  }
}

const parseBody = (request: IncomingMessage) => new Promise<any>((resolve, reject) => {
  const chunks: Buffer[] = []
  request.on('data', chunk => chunks.push(chunk))
  request.on('end', () => {
    try {
      const raw = Buffer.concat(chunks).toString()
      resolve(JSON.parse(raw))
    } catch {
      reject(new Error('Invalid JSON body'))
    }
  })
  request.on('error', reject)
})

const serveUi = (request: IncomingMessage, response: ServerResponse) => {
  const urlPath = ((request.url || '/').split('?')[0] || '/') as string
  if (urlPath === '/' || urlPath === '/index.html') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
    response.end(UI_HTML)
    return
  }
  if (urlPath === '/style.css') {
    response.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'no-store' })
    response.end(UI_CSS)
    return
  }
  if (urlPath === '/script.js') {
    response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' })
    response.end(UI_JS)
    return
  }
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(`Not found: ${urlPath}`)
}

const findFreePort = (start = 4518): Promise<number> => new Promise((resolve, reject) => {
  const probe = (port: number) => {
    const server = net.createServer()
    server.unref()
    server.on('error', () => probe(port + 1))
    server.listen(port, '127.0.0.1', () => {
      const address = server.address()
      const found = typeof address === 'object' && address ? address.port : port
      server.close(error => {
        if (error) return reject(error)
        resolve(found)
      })
    })
  }
  probe(start)
})

const IMGUR_CLIENT_ID = 'Client-ID 546c25a59c58ad7'

const uploadToImgur = (base64: string) => new Promise<string>((resolve, reject) => {
  const body = JSON.stringify({ image: base64, type: 'base64' })
  const request = https.request({
    hostname: 'api.imgur.com',
    path: '/3/image',
    method: 'POST',
    headers: {
      Authorization: IMGUR_CLIENT_ID,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, response => {
    let data = ''
    response.on('data', chunk => { data += chunk })
    response.on('end', () => {
      try {
        const parsed = JSON.parse(data)
        if (parsed.success && parsed.data?.link) resolve(parsed.data.link)
        else reject(new Error(parsed.data?.error || 'Imgur upload failed'))
      } catch {
        reject(new Error('Invalid Imgur response'))
      }
    })
  })
  request.on('error', reject)
  request.write(body)
  request.end()
})

const quitApp = async ({ server, systray }: { server?: http.Server, systray?: TrayIcon }) => {
  try { await destroyRpc() } catch (_) { }
  try { systray?.setVisible?.(false) } catch (_) { }
  try {
    server?.close(() => process.exit(0))
    setTimeout(() => process.exit(0), 300)
  } catch (_) {
    process.exit(0)
  }
}

const main = async () => {
  const port = await findFreePort()
  const server = http.createServer(async (request, response) => {
    const method = (request.method || 'GET').toUpperCase()
    const urlPath = (request.url || '/').split('?')[0]
    if (method === 'GET' && urlPath === '/api/proxy') {
      const params = new URLSearchParams((request.url || '').split('?')[1] || '')
      const target = params.get('url')
      if (!target || (!target.startsWith('https://i.imgur.com/') && !target.startsWith('https://imgur.com/'))) {
        response.writeHead(400, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: 'Invalid or missing url param' }))
        return
      }
      const proxyRequest = https.get(target, proxyResponse => {
        response.writeHead(proxyResponse.statusCode || 200, {
          'Content-Type': proxyResponse.headers['content-type'] || 'image/png',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*'
        })
        proxyResponse.pipe(response)
      })
      proxyRequest.on('error', error => {
        response.writeHead(502, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: (error as Error).message }))
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
        const clean = String(base64).replace(/^data:[^;]+;base64,/, '')
        const url = await uploadToImgur(clean)
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ url }))
      } catch (error: any) {
        response.writeHead(500, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: error.message }))
      }
      return
    }
    if (method === 'GET' && urlPath === '/api/config') {
      const config = loadConfig()
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify(config))
      return
    }
    if (method === 'POST' && urlPath === '/api/config') {
      try {
        const body = await parseBody(request)
        saveConfig({ ...DEFAULT_CONFIG, ...body })
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ ok: true }))
      } catch (error: any) {
        response.writeHead(500, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: error.message }))
      }
      return
    }
    serveUi(request, response)
  })
  const wss = new WebSocketServer({ server })
  wss.on('connection', socket => {
    socket.send(JSON.stringify({ type: 'status', connected: rpcConnected, user: rpcConnected && rpcClient?.user ? rpcClient.user.username : '' }))
    socket.on('message', async raw => {
      let message: any
      try {
        message = JSON.parse(raw.toString())
      } catch {
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
  server.listen(port, '127.0.0.1', async () => {
    const url = `http://127.0.0.1:${port}`
    const trayIconPath = process.platform === 'win32' ? ensureRuntimeIconFile(trayICO, '.ico') : ensureRuntimeIconFile(trayPNG, '.png')
    initialize()
    const menu = new Menu()
    menu.appendMenuItem(new MenuItemBuilder().withText('About Nolly').withEnabled(true).withId('about').build())
    menu.appendPredefinedMenuItem(PredefinedMenuItem.separator())
    menu.appendMenuItem(new MenuItemBuilder().withText('Open Web UI').withEnabled(true).withId('open-ui').build())
    menu.appendMenuItem(new MenuItemBuilder().withText('Open Config').withEnabled(true).withId('open-config').build())
    menu.appendPredefinedMenuItem(PredefinedMenuItem.separator())
    menu.appendMenuItem(new MenuItemBuilder().withText('Quit').withEnabled(true).withId('quit').build())
    const tray = new TrayIconBuilder().withIcon(Icon.fromPath(trayIconPath)).withTooltip('Control your Rich Presence without opening Discord!').withTitle(process.platform === 'darwin' ? 'Discord RPC' : '').withMenu(menu).build()
    const trayLoop = setInterval(() => {
      update()
      const menuEvent = pollMenuEvents()
      if (!menuEvent) return
      if (menuEvent.id === 'about') openBrowser('https://thenolle.com')
      if (menuEvent.id === 'open-ui') openBrowser(url)
      if (menuEvent.id === 'open-config') openConfigFile()
      if (menuEvent.id === 'quit') {
        clearInterval(trayLoop)
        quitApp({ server, systray: tray })
      }
    }, 16)
  })
}

const hideConsoleWindow = () => {
  if (process.platform !== 'win32') return
  try {
    const kernel32 = dlopen(`kernel32.${suffix}`, { GetConsoleWindow: { args: [], returns: FFIType.ptr } })
    const user32 = dlopen(`user32.${suffix}`, { ShowWindow: { args: [FFIType.ptr, FFIType.i32], returns: FFIType.bool } })
    const hwnd = kernel32.symbols.GetConsoleWindow()
    if (!hwnd) return
    const SW_HIDE = 0
    user32.symbols.ShowWindow(hwnd, SW_HIDE)
  } catch (error) {
    console.error('[windows] failed to hide console:', error)
  }
}
hideConsoleWindow()

main().catch(error => {
  console.error('Fatal:', error)
  process.exit(1)
})
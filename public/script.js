'use strict'

const ws = new WebSocket(`ws://${location.host}`)

const $ = (id) => document.getElementById(id)

const elements = {
  clientId: $('clientId'),
  details: $('details'),
  state: $('state'),
  largeImageKey: $('largeImageKey'),
  largeImageText: $('largeImageText'),
  smallImageKey: $('smallImageKey'),
  smallImageText: $('smallImageText'),
  startTimestamp: $('startTimestamp'),
  endTimestamp: $('endTimestamp'),
  partySize: $('partySize'),
  partyMax: $('partyMax'),
  button1Label: $('button1Label'),
  button1Url: $('button1Url'),
  button2Label: $('button2Label'),
  button2Url: $('button2Url'),
  connectBtn: $('connectBtn'),
  disconnectBtn: $('disconnectBtn'),
  applyBtn: $('applyBtn'),
  clearBtn: $('clearBtn'),
  saveConfigBtn: $('saveConfigBtn'),
  setNowBtn: $('setNowBtn'),
  clearTsBtn: $('clearTsBtn'),
  largeDropZone: $('largeDropZone'),
  largeFileInput: $('largeFileInput'),
  largeUploadBtn: $('largeUploadBtn'),
  largePreviewImg: $('largePreviewImg'),
  smallDropZone: $('smallDropZone'),
  smallFileInput: $('smallFileInput'),
  smallUploadBtn: $('smallUploadBtn'),
  smallPreviewImg: $('smallPreviewImg'),
  statusBox: $('statusBox'),
  statusText: $('statusText'),
  toast: $('toast'),
  mockDetails: $('mockDetails'),
  mockState: $('mockState'),
  mockTime: $('mockTime'),
  mockArtImg: $('mockArtImg'),
  mockArtGlyph: $('mockArtGlyph'),
  mockSmallImg: $('mockSmallImg'),
  mockSmallGlyph: $('mockSmallGlyph'),
  mockButtons: $('mockButtons'),
  activityType: $('activityType'),
  streamUrl: $('streamUrl'),
  mockLabel: $('mockLabel'),
  mockParty: $('mockParty'),
}

let toastTimer = null

const showToast = (message, kind = '', duration = 4000) => {
  elements.toast.textContent = message
  elements.toast.className = kind ? `toast ${kind}` : 'toast'
  if (toastTimer) clearTimeout(toastTimer)
  if (duration > 0) {
    toastTimer = setTimeout(() => {
      elements.toast.textContent = 'Ready.'
      elements.toast.className = 'toast'
    }, duration)
  }
}

const setStatus = (connected, user = '') => {
  elements.statusBox.classList.toggle('connected', connected)
  elements.statusText.textContent = connected ? `Connected${user ? ` as ${user}` : ''}` : 'Disconnected'
}

let clockInterval = null
let clockStart = null

const stopClock = () => {
  clearInterval(clockInterval)
  clockInterval = null
  elements.mockTime.textContent = ''
}

const updateClock = () => {
  if (!clockStart) return
  const elapsed = Math.floor((Date.now() - clockStart) / 1000)
  const hours = Math.floor(elapsed / 3600)
  const minutes = Math.floor((elapsed % 3600) / 60)
  const seconds = elapsed % 60
  elements.mockTime.textContent = hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} elapsed` : `${minutes}:${String(seconds).padStart(2, '0')} elapsed`
}

const startClock = (startMs) => {
  if (clockStart === startMs && clockInterval) return
  clockStart = startMs
  stopClock()
  clockInterval = setInterval(updateClock, 1000)
  updateClock()
}

const TYPE_LABELS = {
  0: 'PLAYING A GAME',
  1: 'LIVE ON TWITCH',
  2: 'LISTENING TO',
  3: 'WATCHING',
  5: 'COMPETING IN',
}

const refreshPreview = () => {
  const typeVal = Number(elements.activityType.value)
  elements.mockLabel.textContent = TYPE_LABELS[typeVal] ?? 'PLAYING A GAME'
  elements.mockDetails.textContent = elements.details.value.trim() || '-'
  elements.mockState.textContent = elements.state.value.trim() || '-'
  const size = elements.partySize.value.trim()
  const max = elements.partyMax.value.trim()
  if (size && max) elements.mockParty.textContent = `(${size} of ${max})`
  else elements.mockParty.textContent = ''
  const largeKey = elements.largeImageKey.value.trim()
  if (largeKey.startsWith('http://') || largeKey.startsWith('https://')) {
    elements.mockArtImg.src = toProxied(largeKey)
    elements.mockArtImg.classList.add('visible')
    elements.mockArtGlyph.style.visibility = 'hidden'
  } else {
    elements.mockArtImg.classList.remove('visible')
    elements.mockArtGlyph.style.visibility = 'visible'
    elements.mockArtGlyph.textContent = (largeKey || elements.details.value.trim() || '?').slice(0, 1).toUpperCase()
  }
  const smallKey = elements.smallImageKey.value.trim()
  if (smallKey.startsWith('http://') || smallKey.startsWith('https://')) {
    elements.mockSmallImg.src = toProxied(smallKey)
    elements.mockSmallImg.classList.add('visible')
    elements.mockSmallGlyph.textContent = ''
  } else {
    elements.mockSmallImg.classList.remove('visible')
    elements.mockSmallGlyph.textContent = smallKey ? smallKey.slice(0, 1).toUpperCase() : ''
  }
  const startVal = elements.startTimestamp.value.trim()
  if (startVal === 'now') {
    if (!clockInterval) startClock(Date.now())
  } else if (startVal) {
    const parsed = Number(startVal)
    if (!Number.isNaN(parsed) && parsed > 0) startClock(parsed)
    else stopClock()
  } else stopClock()
  elements.mockButtons.innerHTML = ''
  const buttons = [{ label: elements.button1Label.value.trim(), url: elements.button1Url.value.trim() }, { label: elements.button2Label.value.trim(), url: elements.button2Url.value.trim() }].filter((button) => button.label)
  buttons.slice(0, 2).forEach((button) => {
    const div = document.createElement('div')
    div.className = 'mock-btn'
    div.textContent = button.label
    elements.mockButtons.appendChild(div)
  })
}

const collectPayload = () => ({
  type: Number(elements.activityType.value),
  streamUrl: elements.streamUrl.value.trim(),
  details: elements.details.value.trim(),
  state: elements.state.value.trim(),
  largeImageKey: elements.largeImageKey.value.trim(),
  largeImageText: elements.largeImageText.value.trim(),
  smallImageKey: elements.smallImageKey.value.trim(),
  smallImageText: elements.smallImageText.value.trim(),
  startTimestamp: elements.startTimestamp.value.trim(),
  endTimestamp: elements.endTimestamp.value.trim(),
  partySize: elements.partySize.value.trim(),
  partyMax: elements.partyMax.value.trim(),
  buttons: [{ label: elements.button1Label.value.trim(), url: elements.button1Url.value.trim() }, { label: elements.button2Label.value.trim(), url: elements.button2Url.value.trim() }],
})

const loadConfig = async () => {
  try {
    const response = await fetch('/api/config')
    if (!response.ok) return
    const config = await response.json()
    const simple = ['clientId', 'activityType', 'streamUrl', 'details', 'state', 'largeImageKey', 'largeImageText', 'smallImageKey', 'smallImageText', 'startTimestamp', 'endTimestamp', 'partySize', 'partyMax']
    simple.forEach((id) => { if (config[id] !== undefined) $(id).value = config[id] })
    if (Array.isArray(config.buttons)) {
      if (config.buttons[0]) {
        elements.button1Label.value = config.buttons[0].label || ''
        elements.button1Url.value = config.buttons[0].url || ''
      }
      if (config.buttons[1]) {
        elements.button2Label.value = config.buttons[1].label || ''
        elements.button2Url.value = config.buttons[1].url || ''
      }
    }
    refreshPreview()
  } catch (error) { console.warn('[config] load failed:', error.message) }
}
const saveConfig = async () => {
  const payload = { clientId: elements.clientId.value.trim(), ...collectPayload() }
  try {
    const response = await fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (response.ok) showToast('Config saved to config.json', 'success')
    else showToast('Failed to save config', 'error')
  } catch { showToast('Failed to save config', 'error') }
}

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const toProxied = (url) => {
  if (!url) return url
  if (url.startsWith('https://i.imgur.com/') || url.startsWith('https://imgur.com/')) return `/api/proxy?url=${encodeURIComponent(url)}`
  return url
}

const uploadImage = async (file, slot) => {
  const dropZone = slot === 'large' ? elements.largeDropZone : elements.smallDropZone
  const previewImg = slot === 'large' ? elements.largePreviewImg : elements.smallPreviewImg
  const keyInput = slot === 'large' ? elements.largeImageKey : elements.smallImageKey
  showToast(`Uploading ${slot} image to Imgur…`, 'uploading', 0)
  try {
    const dataUri = await readFileAsBase64(file)
    previewImg.src = dataUri
    dropZone.classList.add('has-image')
    const response = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64: dataUri }) })
    const json = await response.json()
    if (!response.ok || json.error) throw new Error(json.error || 'Upload failed')
    keyInput.value = json.url
    previewImg.src = toProxied(json.url)
    refreshPreview()
    showToast(`Uploaded - URL pasted into ${slot} image key`, 'success')
  } catch (error) {
    showToast(`Upload error: ${error.message}`, 'error')
  }
}

const setupImageSlot = (slot) => {
  const dropZone = slot === 'large' ? elements.largeDropZone : elements.smallDropZone
  const fileInput = slot === 'large' ? elements.largeFileInput : elements.smallFileInput
  const uploadBtn = slot === 'large' ? elements.largeUploadBtn : elements.smallUploadBtn
  dropZone.addEventListener('click', () => fileInput.click())
  dropZone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      fileInput.click()
    }
  })
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) uploadImage(fileInput.files[0], slot)
    fileInput.value = ''
  })
  uploadBtn.addEventListener('click', (event) => {
    event.stopPropagation()
    fileInput.click()
  })
  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault()
    dropZone.classList.add('drag-over')
  })
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'))
  dropZone.addEventListener('drop', (event) => {
    event.preventDefault()
    dropZone.classList.remove('drag-over')
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) uploadImage(file, slot)
    else showToast('Only image files are accepted', 'error')
  })
}

const wsSend = (payload) => {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload))
  else showToast('Not connected to local server - try reloading', 'error')
}

ws.addEventListener('open', () => showToast('GUI connected. Ready.', 'success'))

ws.addEventListener('close', () => {
  setStatus(false)
  showToast('Connection to server lost. Reload the page.', 'error', 0)
})

ws.addEventListener('message', (event) => {
  let message
  try { message = JSON.parse(event.data) } catch { return }
  if (message.type === 'status') {
    setStatus(Boolean(message.connected), message.user || '')
    return
  }
  if (message.type === 'success') {
    showToast(message.message, 'success')
    return
  }
  if (message.type === 'error') showToast(message.message, 'error')
})

elements.connectBtn.addEventListener('click', () => {
  const clientId = elements.clientId.value.trim()
  if (!clientId) {
    showToast('Enter a Discord Application Client ID first', 'error')
    return
  }
  wsSend({ type: 'connect', clientId })
  showToast('Connecting to Discord…', 'uploading', 0)
})

elements.disconnectBtn.addEventListener('click', () => {
  wsSend({ type: 'disconnect' })
  showToast('Disconnected.', '')
})

elements.applyBtn.addEventListener('click', () => wsSend({ type: 'setActivity', data: collectPayload() }))

elements.clearBtn.addEventListener('click', () => wsSend({ type: 'clearActivity' }))

elements.saveConfigBtn.addEventListener('click', saveConfig)

elements.setNowBtn.addEventListener('click', () => {
  elements.startTimestamp.value = 'now'
  clockStart = null
  stopClock()
  refreshPreview()
})

elements.clearTsBtn.addEventListener('click', () => {
  elements.startTimestamp.value = ''
  elements.endTimestamp.value = ''
  stopClock()
})

const previewInputIds = ['activityType', 'streamUrl', 'details', 'state', 'largeImageKey', 'largeImageText', 'smallImageKey', 'smallImageText', 'startTimestamp', 'endTimestamp', 'partySize', 'partyMax', 'button1Label', 'button1Url', 'button2Label', 'button2Url']

previewInputIds.forEach((id) => $(id).addEventListener('input', refreshPreview))

setupImageSlot('large')
setupImageSlot('small')
loadConfig()
refreshPreview()
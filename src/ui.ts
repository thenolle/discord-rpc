import { trayPNG } from './images'

export const UI_HTML = `<!DOCTYPE html>
<html lang='en'>

<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Discord RPC</title>
  <link rel='shortcut icon'href='${trayPNG}' type='image/png'>
  <link rel='stylesheet' href='style.css' />
  <script src='script.js' defer></script>
</head>

<body>
  <main class='app'>
    <header class='topbar'>
      <div class='brand'>
        <svg class='brand-icon' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
          <rect width='28' height='28' rx='8' fill='#5865F2' />
          <path d='M19.54 8.31a15.18 15.18 0 0 0-3.74-1.16.06.06 0 0 0-.06.03c-.16.28-.34.65-.47.94a14 14 0 0 0-4.2 0 9.48 9.48 0 0 0-.47-.94.06.06 0 0 0-.06-.03 15.14 15.14 0 0 0-3.74 1.16.05.05 0 0 0-.03.02C4.72 12.1 4.1 15.77 4.4 19.4a.06.06 0 0 0 .02.04 15.26 15.26 0 0 0 4.59 2.32.06.06 0 0 0 .07-.02c.35-.48.67-.99.94-1.52a.06.06 0 0 0-.03-.08 10.04 10.04 0 0 1-1.44-.69.06.06 0 0 1-.01-.1l.29-.22a.06.06 0 0 1 .06-.01c3.02 1.38 6.29 1.38 9.27 0a.06.06 0 0 1 .06.01l.29.22a.06.06 0 0 1-.01.1 9.45 9.45 0 0 1-1.44.68.06.06 0 0 0-.03.09c.28.53.6 1.03.94 1.52a.06.06 0 0 0 .07.02 15.22 15.22 0 0 0 4.6-2.32.06.06 0 0 0 .02-.04c.35-4.15-.59-7.79-2.47-11.07a.05.05 0 0 0-.03-.02zM10.68 17.2c-.9 0-1.65-.83-1.65-1.85s.73-1.85 1.65-1.85c.93 0 1.67.84 1.65 1.85 0 1.02-.73 1.85-1.65 1.85zm6.1 0c-.91 0-1.65-.83-1.65-1.85s.73-1.85 1.65-1.85c.93 0 1.67.84 1.65 1.85 0 1.02-.72 1.85-1.65 1.85z' fill='white' />
        </svg>
        <div class='brand-copy'>
          <h1>Discord RPC</h1>
          <p>Custom Rich Presence - runs in your browser</p>
        </div>
      </div>
      <div class='status' id='statusBox'>
        <span class='status-dot'></span>
        <span id='statusText'>Disconnected</span>
      </div>
    </header>
    <div class='layout'>
      <section class='panel editor-panel'>
        <div class='panel-header'><span class='panel-title'>Presence editor</span></div>
        <div class='panel-body'>
          <fieldset class='section'>
            <legend class='section-title'>Connection</legend>
            <div class='field full'>
              <label for='clientId'>Discord Application Client ID</label>
              <input id='clientId' placeholder='123456789012345678' autocomplete='off' spellcheck='false' />
            </div>
            <div class='actions row'>
              <button class='btn btn-blurple' id='connectBtn'>Connect</button>
              <button class='btn btn-secondary' id='disconnectBtn'>Disconnect</button>
            </div>
            <p class='hint'>Create an app at <strong>discord.com/developers</strong> and copy the Application ID.</p>
          </fieldset>
          <fieldset class='section'>
            <legend class='section-title'>Main fields</legend>
            <div class='field-grid'>
              <div class='field'>
                <label for='activityType'>Activity type</label>
                <select id='activityType'>
                  <option value='0'>🎮 Playing</option>
                  <option value='1'>🎙️ Streaming</option>
                  <option value='2'>🎧 Listening to</option>
                  <option value='3'>📺 Watching</option>
                  <option value='5'>🏆 Competing in</option>
                </select>
              </div>
              <div class='field'>
                <label for='streamUrl'>Stream URL <span style='font-weight:400;text-transform:none;letter-spacing:0'>(streaming only)</span></label>
                <input id='streamUrl' placeholder='https://twitch.tv/yourname' spellcheck='false' />
              </div>
              <div class='field'>
                <label for='details'>Details</label>
                <input id='details' placeholder='Building something cool' />
              </div>
              <div class='field'>
                <label for='state'>State</label>
                <input id='state' placeholder='In editor' />
              </div>
            </div>
          </fieldset>
          <fieldset class='section'>
            <legend class='section-title'>Images</legend>
            <p class='hint' style='margin-bottom:12px'>Upload an image (goes to Imgur anonymously) or type an asset key / direct URL.</p>
            <div class='image-row'>
              <div class='image-upload-card'>
                <div class='upload-zone' id='largeDropZone' tabindex='0' role='button' aria-label='Large image - click or drop to upload'>
                  <svg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'><path d='M12 3v12'/><path d='m17 8-5-5-5 5'/><path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/></svg>
                  <span>Large image</span>
                  <span class='upload-sub'>Drop or click</span>
                  <img class='upload-preview' id='largePreviewImg' alt='' />
                </div>
                <input type='file' id='largeFileInput' accept='image/*' class='sr-only' aria-label='Large image file input' />
                <button class='btn btn-ghost upload-btn' id='largeUploadBtn'>Upload to Imgur</button>
              </div>
              <div class='image-fields'>
                <div class='field'>
                  <label for='largeImageKey'>Large image key / URL</label>
                  <input id='largeImageKey' placeholder='my_art or https://i.imgur.com/...' spellcheck='false' />
                </div>
                <div class='field'>
                  <label for='largeImageText'>Large image hover text</label>
                  <input id='largeImageText' placeholder='Hover tooltip' />
                </div>
              </div>
            </div>
            <div class='image-row' style='margin-top:16px'>
              <div class='image-upload-card'>
                <div class='upload-zone' id='smallDropZone' tabindex='0' role='button' aria-label='Small image - click or drop to upload'>
                  <svg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'><path d='M12 3v12'/><path d='m17 8-5-5-5 5'/><path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/></svg>
                  <span>Small image</span>
                  <span class='upload-sub'>Drop or click</span>
                  <img class='upload-preview' id='smallPreviewImg' alt='' />
                </div>
                <input type='file' id='smallFileInput' accept='image/*' class='sr-only' aria-label='Small image file input' />
                <button class='btn btn-ghost upload-btn' id='smallUploadBtn'>Upload to Imgur</button>
              </div>
              <div class='image-fields'>
                <div class='field'>
                  <label for='smallImageKey'>Small image key / URL</label>
                  <input id='smallImageKey' placeholder='my_icon or https://i.imgur.com/...' spellcheck='false' />
                </div>
                <div class='field'>
                  <label for='smallImageText'>Small image hover text</label>
                  <input id='smallImageText' placeholder='Hover tooltip' />
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset class='section'>
            <legend class='section-title'>Timestamps</legend>
            <div class='field-grid'>
              <div class='field'>
                <label for='startTimestamp'>Start timestamp</label>
                <input id='startTimestamp' placeholder='now  or  unix ms' spellcheck='false' />
              </div>
              <div class='field'>
                <label for='endTimestamp'>End timestamp</label>
                <input id='endTimestamp' placeholder='unix ms' spellcheck='false' />
              </div>
            </div>
            <div class='actions row' style='margin-top:8px'>
              <button class='btn btn-ghost btn-sm' id='setNowBtn'>Set start = now</button>
              <button class='btn btn-ghost btn-sm' id='clearTsBtn'>Clear timestamps</button>
            </div>
          </fieldset>
          <fieldset class='section'>
            <legend class='section-title'>Party</legend>
            <div class='field-grid'>
              <div class='field'>
                <label for='partySize'>Current size</label>
                <input id='partySize' type='number' min='1' placeholder='1' />
              </div>
              <div class='field'>
                <label for='partyMax'>Max size</label>
                <input id='partyMax' type='number' min='1' placeholder='5' />
              </div>
            </div>
            <p class='hint' style='margin-top:6px'>Both fields required for party to show. Current must be ≤ max.</p>
          </fieldset>
          <fieldset class='section'>
            <legend class='section-title'>Buttons <span class='section-badge'>max 2</span></legend>
            <div class='field-grid'>
              <div class='field'>
                <label for='button1Label'>Button 1 label</label>
                <input id='button1Label' placeholder='GitHub' />
              </div>
              <div class='field'>
                <label for='button1Url'>Button 1 URL</label>
                <input id='button1Url' placeholder='https://github.com/you/repo' spellcheck='false' />
              </div>
              <div class='field'>
                <label for='button2Label'>Button 2 label</label>
                <input id='button2Label' placeholder='Website' />
              </div>
              <div class='field'>
                <label for='button2Url'>Button 2 URL</label>
                <input id='button2Url' placeholder='https://your-site.com' spellcheck='false' />
              </div>
            </div>
          </fieldset>
          <fieldset class='section'>
            <legend class='section-title'>Actions</legend>
            <div class='actions row'>
              <button class='btn btn-blurple' id='applyBtn'>Apply presence</button>
              <button class='btn btn-danger' id='clearBtn'>Clear presence</button>
              <button class='btn btn-secondary' id='saveConfigBtn'>Save config</button>
            </div>
            <div class='toast-wrap'><div class='toast' id='toast'>Ready.</div></div>
          </fieldset>
        </div>
      </section>
      <aside class='panel preview-panel'>
        <div class='panel-header'><span class='panel-title'>Live preview</span></div>
        <div class='panel-body'>
          <div class='discord-mock'>
            <div class='mock-label' id='mockLabel'>PLAYING A GAME</div>
            <div class='mock-body'>
              <div class='mock-art-wrap'>
                <div class='mock-art' id='mockArt'>
                  <span id='mockArtGlyph'>?</span>
                  <img id='mockArtImg' alt='' />
                </div>
                <div class='mock-small-art' id='mockSmallArt'>
                  <img id='mockSmallImg' alt='' />
                  <span id='mockSmallGlyph'></span>
                </div>
              </div>
              <div class='mock-lines'>
                <div class='mock-name'>Your Application</div>
                <div class='mock-details' id='mockDetails'>—</div>
                <div class='mock-state' id='mockState'>—</div>
                <div class='mock-party' id='mockParty'></div>
                <div class='mock-time' id='mockTime'></div>
              </div>
            </div>
            <div class='mock-buttons' id='mockButtons'></div>
          </div>
          <div class='info-block'>
            <div class='info-title'>Notes</div>
            <ul class='info-list'>
              <li>Type <code>now</code> in start timestamp to begin an elapsed timer</li>
              <li>Image fields support Discord asset keys or direct external image URLs</li>
              <li>Max 2 buttons - URLs must start with <code>https://</code></li>
              <li>Config saved to <code>config.json</code> next to the executable</li>
              <li>Discord must be running for RPC to connect</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  </main>
</body>

</html>`

export const UI_CSS = String.raw`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html,
body {
  min-height: 100%;
}

:root {
  --dc-bg: #313338;
  --dc-surface: #2b2d31;
  --dc-surface-2: #232428;
  --dc-surface-3: #1e1f22;
  --dc-surface-4: #111214;
  --dc-border: rgba(255, 255, 255, 0.06);
  --dc-divider: rgba(255, 255, 255, 0.04);
  --dc-text: #dbdee1;
  --dc-text-muted: #949ba4;
  --dc-text-faint: #4e5058;
  --dc-text-white: #ffffff;
  --dc-header-1: #f2f3f5;
  --dc-header-2: #b5bac1;
  --dc-blurple: #5865f2;
  --dc-blurple-hover: #4752c4;
  --dc-blurple-light: #7289da;
  --dc-green: #23a55a;
  --dc-green-text: #2dc770;
  --dc-red: #f23f43;
  --dc-red-hover: #a12d2f;
  --dc-yellow: #f0b232;
  --dc-int-normal: #b5bac1;
  --dc-int-hover: #dbdee1;
  --dc-int-active: #f2f3f5;
  --dc-int-muted: #4e5058;
  --dc-input-bg: #1e1f22;
  --dc-input-border: rgba(0, 0, 0, 0.3);
  --font-ui: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --font-mono: 'Consolas', 'Andale Mono WT', 'Lucida Console', 'DejaVu Sans Mono', monospace;
  --t-xs: 0.75rem;
  --t-sm: 0.875rem;
  --t-base: 1rem;
  --t-lg: 1.125rem;
  --t-xl: 1.25rem;
  --s1: 4px;
  --s2: 8px;
  --s3: 12px;
  --s4: 16px;
  --s5: 20px;
  --s6: 24px;
  --s8: 32px;
  --s10: 40px;
  --r-xs: 3px;
  --r-sm: 4px;
  --r-md: 8px;
  --r-lg: 12px;
  --r-xl: 16px;
  --r-full: 9999px;
  --ease: 170ms ease;
}

body {
  background: var(--dc-bg);
  color: var(--dc-text);
  font-family: var(--font-ui);
  font-size: var(--t-base);
  line-height: 1.5;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.app {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: var(--s6);
  padding: var(--s6);
  max-width: 1180px;
  margin: 0 auto;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: var(--s6);
  align-items: start;
}

.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s4);
  padding: var(--s4) var(--s6);
  background: var(--dc-surface);
  border-radius: var(--r-lg);
  border: 1px solid var(--dc-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--s3);
}

.brand-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.brand-copy h1 {
  font-size: var(--t-xl);
  font-weight: 700;
  color: var(--dc-header-1);
  line-height: 1.2;
}

.brand-copy p {
  font-size: var(--t-sm);
  color: var(--dc-text-muted);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  padding: var(--s2) var(--s3);
  background: var(--dc-surface-2);
  border: 1px solid var(--dc-border);
  border-radius: var(--r-full);
  font-size: var(--t-sm);
  color: var(--dc-text-muted);
  user-select: none;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dc-red);
  flex-shrink: 0;
  transition: background var(--ease);
}

.status.connected .status-dot {
  background: var(--dc-green);
}

.status.connected {
  color: var(--dc-green-text);
}

.panel {
  background: var(--dc-surface);
  border-radius: var(--r-lg);
  border: 1px solid var(--dc-border);
  overflow: hidden;
}

.panel-header {
  padding: var(--s3) var(--s6);
  background: var(--dc-surface-2);
  border-bottom: 1px solid var(--dc-divider);
}

.panel-title {
  font-size: var(--t-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--dc-header-2);
}

.panel-body {
  padding: var(--s6);
  display: grid;
  gap: var(--s5);
}

fieldset.section {
  border: 1px solid var(--dc-border);
  border-radius: var(--r-md);
  padding: var(--s4) var(--s5);
  display: grid;
  gap: var(--s3);
}

.section-title {
  font-size: var(--t-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--dc-header-2);
}

.section-badge {
  font-size: 10px;
  font-weight: 600;
  background: var(--dc-surface-2);
  color: var(--dc-text-muted);
  padding: 1px 6px;
  border-radius: var(--r-full);
  text-transform: none;
  letter-spacing: 0;
  vertical-align: middle;
  margin-left: var(--s1);
}

.field {
  display: grid;
  gap: 6px;
}

.field.full {
  grid-column: 1 / -1;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--s3);
}

label {
  font-size: var(--t-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--dc-header-2);
}

input[type='text'],
input[type='number'],
input:not([type]) {
  width: 100%;
  height: 40px;
  padding: 0 10px;
  background: var(--dc-input-bg);
  border: 1px solid var(--dc-input-border);
  border-radius: var(--r-sm);
  color: var(--dc-text);
  font: inherit;
  font-size: var(--t-base);
  outline: none;
  transition: border-color var(--ease), box-shadow var(--ease);
}

input:focus {
  border-color: var(--dc-blurple);
  box-shadow: 0 0 0 0.2rem rgba(88, 101, 242, 0.3);
}

input::placeholder {
  color: var(--dc-text-faint);
}

input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
}

.hint {
  font-size: var(--t-sm);
  color: var(--dc-text-muted);
  line-height: 1.4;
}

.hint strong {
  color: var(--dc-text);
}

.actions.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s2);
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s2);
  height: 38px;
  padding: 2px 16px;
  border: none;
  border-radius: var(--r-xs);
  font: inherit;
  font-size: var(--t-sm);
  font-weight: 500;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: background-color var(--ease), opacity var(--ease);
  position: relative;
  overflow: hidden;
}

.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.5);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn:active:not(:disabled) {
  opacity: 0.85;
}

.btn-blurple {
  background: var(--dc-blurple);
  color: #fff;
}

.btn-blurple:hover:not(:disabled) {
  background: var(--dc-blurple-hover);
}

.btn-blurple:focus-visible {
  box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.5);
}

.btn-secondary {
  background: #4e5058;
  color: #fff;
}

.btn-secondary:hover:not(:disabled) {
  background: #5d6069;
}

.btn-secondary:focus-visible {
  box-shadow: 0 0 0 3px rgba(78, 80, 88, 0.5);
}

.btn-danger {
  background: var(--dc-red);
  color: #fff;
}

.btn-danger:hover:not(:disabled) {
  background: var(--dc-red-hover);
}

.btn-danger:focus-visible {
  box-shadow: 0 0 0 3px rgba(242, 63, 67, 0.5);
}

.btn-ghost {
  background: transparent;
  color: var(--dc-blurple-light);
  border: 1px solid transparent;
}

.btn-ghost:hover:not(:disabled) {
  text-decoration: underline;
  background: rgba(88, 101, 242, 0.08);
}

.btn-sm {
  height: 32px;
  padding: 2px 12px;
  font-size: var(--t-xs);
}

.upload-btn {
  width: 100%;
  margin-top: var(--s2);
  font-size: var(--t-xs);
}

.image-row {
  display: grid;
  grid-template-columns: 124px 1fr;
  gap: var(--s4);
  align-items: start;
}

.image-upload-card {
  display: flex;
  flex-direction: column;
}

.upload-zone {
  width: 124px;
  height: 124px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--dc-input-bg);
  border: 2px dashed var(--dc-text-faint);
  border-radius: var(--r-md);
  color: var(--dc-text-muted);
  font-size: var(--t-xs);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color var(--ease), background var(--ease);
  text-align: center;
  padding: var(--s2);
}

.upload-zone:hover,
.upload-zone:focus {
  border-color: var(--dc-blurple);
  background: rgba(88, 101, 242, 0.06);
  outline: none;
}

.upload-zone.drag-over {
  border-color: var(--dc-blurple);
  background: rgba(88, 101, 242, 0.14);
}

.upload-zone.has-image {
  border-style: solid;
  border-color: var(--dc-blurple);
}

.upload-zone svg {
  width: 22px;
  height: 22px;
  opacity: 0.5;
  flex-shrink: 0;
}

.upload-sub {
  font-size: 10px;
  color: var(--dc-text-faint);
}

.upload-preview {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: none;
  border-radius: calc(var(--r-md) - 2px);
}

.upload-zone.has-image svg,
.upload-zone.has-image>span {
  opacity: 0;
}

.upload-zone.has-image .upload-preview {
  display: block;
}

.image-fields {
  display: grid;
  gap: var(--s3);
}

.toast-wrap {
  margin-top: 4px;
}

.toast {
  padding: 10px 14px;
  border-radius: var(--r-sm);
  font-size: var(--t-sm);
  background: var(--dc-surface-2);
  color: var(--dc-text-muted);
  border-left: 3px solid transparent;
  min-height: 42px;
  display: flex;
  align-items: center;
  line-height: 1.4;
  transition: background var(--ease), color var(--ease), border-color var(--ease);
}

.toast.success {
  background: rgba(35, 165, 90, 0.1);
  color: var(--dc-green-text);
  border-left-color: var(--dc-green);
}

.toast.error {
  background: rgba(242, 63, 67, 0.1);
  color: #ff7070;
  border-left-color: var(--dc-red);
}

.toast.uploading {
  background: rgba(88, 101, 242, 0.1);
  color: var(--dc-blurple-light);
  border-left-color: var(--dc-blurple);
}

.discord-mock {
  background: var(--dc-surface-2);
  border-radius: var(--r-md);
  padding: var(--s4);
  display: grid;
  gap: var(--s3);
  border: 1px solid var(--dc-border);
}

.mock-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--dc-header-2);
}

.mock-body {
  display: flex;
  gap: var(--s3);
  align-items: flex-start;
}

.mock-art-wrap {
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
}

.mock-art {
  width: 72px;
  height: 72px;
  border-radius: var(--r-md);
  background: var(--dc-surface-4);
  display: grid;
  place-items: center;
  overflow: hidden;
  position: relative;
}

.mock-art span {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--dc-text-faint);
}

.mock-art img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: none;
}

.mock-art img.visible {
  display: block;
}

.mock-small-art {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--dc-surface-3);
  border: 2px solid var(--dc-surface-2);
  display: grid;
  place-items: center;
  overflow: hidden;
}

.mock-small-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: none;
}

.mock-small-art img.visible {
  display: block;
}

.mock-small-art span {
  font-size: 9px;
  color: var(--dc-text-faint);
}

.mock-lines {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.mock-name {
  font-size: var(--t-sm);
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
}

.mock-details,
.mock-state {
  font-size: var(--t-sm);
  color: var(--dc-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mock-time {
  font-size: var(--t-sm);
  color: var(--dc-text-muted);
  font-variant-numeric: tabular-nums;
}

.mock-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.mock-btn {
  display: block;
  width: 100%;
  height: 22px;
  padding: 0 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: var(--r-xs);
  color: var(--dc-int-normal);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 22px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-block {
  background: var(--dc-surface-2);
  border-radius: var(--r-md);
  padding: var(--s4);
  border: 1px solid var(--dc-border);
}

.info-title {
  font-size: var(--t-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--dc-header-2);
  margin-bottom: var(--s3);
}

.info-list {
  list-style: disc;
  padding-left: 1.1rem;
  display: grid;
  gap: 6px;
}

.info-list li {
  font-size: var(--t-sm);
  color: var(--dc-text-muted);
  line-height: 1.4;
}

.info-list code {
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--dc-surface-4);
  padding: 1px 5px;
  border-radius: var(--r-xs);
  color: var(--dc-blurple-light);
}

select {
  width: 100%;
  height: 40px;
  padding: 0 10px;
  background: var(--dc-input-bg);
  border: 1px solid var(--dc-input-border);
  border-radius: var(--r-sm);
  color: var(--dc-text);
  font: inherit;
  font-size: var(--t-base);
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23949ba4' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color var(--ease), box-shadow var(--ease);
}

select:focus {
  border-color: var(--dc-blurple);
  box-shadow: 0 0 0 0.2rem rgba(88, 101, 242, 0.3);
}

select option {
  background: var(--dc-surface-3);
  color: var(--dc-text);
}

.mock-party {
  font-size: var(--t-sm);
  color: var(--dc-text-muted);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 920px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    order: -1;
  }
}

@media (max-width: 560px) {
  .app {
    padding: var(--s3);
    gap: var(--s3);
  }

  .topbar {
    padding: var(--s3) var(--s4);
  }

  .panel-body {
    padding: var(--s4);
  }

  .panel-header {
    padding: var(--s2) var(--s4);
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .image-row {
    grid-template-columns: 1fr;
  }

  .upload-zone {
    width: 100%;
    height: 72px;
    flex-direction: row;
    padding: var(--s2) var(--s3);
  }
}`

export const UI_JS = `'use strict'

const ws = new WebSocket(\`ws://\${location.host}\`)

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
  mockParty: $('mockParty')
}

let toastTimer = null

const showToast = (message, kind = '', duration = 4000) => {
  elements.toast.textContent = message
  elements.toast.className = kind ? \`toast \${kind}\` : 'toast'
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
  elements.statusText.textContent = connected ? \`Connected\${user ? \` as \${user}\` : ''}\` : 'Disconnected'
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
  elements.mockTime.textContent = hours > 0 ? \`\${hours}:\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')} elapsed\` : \`\${minutes}:\${String(seconds).padStart(2, '0')} elapsed\`
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
  if (size && max) elements.mockParty.textContent = \`(\${size} of \${max})\`
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
  if (url.startsWith('https://i.imgur.com/') || url.startsWith('https://imgur.com/')) return \`/api/proxy?url=\${encodeURIComponent(url)}\`
  return url
}

const uploadImage = async (file, slot) => {
  const dropZone = slot === 'large' ? elements.largeDropZone : elements.smallDropZone
  const previewImg = slot === 'large' ? elements.largePreviewImg : elements.smallPreviewImg
  const keyInput = slot === 'large' ? elements.largeImageKey : elements.smallImageKey
  showToast(\`Uploading \${slot} image to Imgur…\`, 'uploading', 0)
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
    showToast(\`Uploaded - URL pasted into \${slot} image key\`, 'success')
  } catch (error) {
    showToast(\`Upload error: \${error.message}\`, 'error')
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
refreshPreview()`
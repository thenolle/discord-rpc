# Discord RPC

A lightweight Discord Rich Presence controller built with **Bun**. It runs as a small local background app, exposes a polished browser-based control panel, and integrates with the system tray without requiring Electron or a terminal window in normal Windows builds.

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square)
![Bun](https://img.shields.io/badge/bun-%3E%3D1.3.14-green?style=flat-square)
![Typescript](https://img.shields.io/badge/language-TypeScript-blue?style=flat-square)
![Made With Love](https://img.shields.io/badge/made%20with-%E2%9D%A4%EF%B8%8F-pink?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-orange?style=flat-square)
![GitHub](https://img.shields.io/github/stars/thenolle/discord-rpc?style=social)

---

## Overview

Discord RPC is a small desktop-side utility for controlling Discord Rich Presence from a local web interface. It communicates with Discord over local IPC, stores your config on the host machine, and keeps the UI fast and minimal by serving plain HTML, CSS, and JavaScript from a Bun runtime.

Unlike Electron-based alternatives, this project is designed to stay lean:
- Bun runtime and Bun-compiled binaries
- Local-only HTTP/WebSocket UI
- System tray integration
- No Chromium bundle
- No always-open terminal requirement for Windows background builds

---

## Features

| Feature | Details |
|---|---|
| Activity types | Supports Playing, Streaming, Listening, Watching, and Competing activities |
| Rich Presence fields | Set details, state, timestamps, party size, buttons, and image metadata |
| Image support | Use Discord asset keys, direct image URLs, or anonymous Imgur uploads |
| Live preview | See a Discord-style preview before applying changes |
| Local browser UI | Clean in-browser control panel served from the local app |
| Tray integration | Runs in the background with tray controls for opening the UI, opening config, and quitting |
| Persistent config | Saves settings to the OS config directory so they survive restarts |
| Portable builds | Bun-compiled binaries for Windows, macOS, and Linux |
| Lightweight stack | No Electron, no frontend framework, no Node packaging toolchain |

---

## How it works

The app starts a local HTTP server and WebSocket server on `127.0.0.1`, opens the UI in your default browser, and talks to Discord using its local IPC socket. Configuration is stored in the standard user config location for the operating system rather than beside the executable.

### Config locations

| Platform | Config path |
|---|---|
| Windows | `%APPDATA%/discord-rpc.json` |
| macOS | `~/Library/Application Support/discord-rpc.json` |
| Linux | `$XDG_CONFIG_HOME/discord-rpc.json` or `~/.config/discord-rpc.json` |

---

## Quick start

### 1. Download a release

Download the correct build for your platform from the [Releases](https://github.com/thenolle/discord-rpc/releases) page.

### 2. Launch the app

Run the binary for your platform.

```bash
drpc.exe
```

On Windows background builds, the app is intended to start without showing a terminal window. The app should appear in the system tray and automatically open the local web UI in your default browser.

### 3. Connect your Discord app

1. Open the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create an application or use an existing one
3. Copy the **Application ID**
4. Paste it into the UI
5. Click **Connect**

### 4. Apply a presence

Fill in the desired fields and click **Apply presence**. Discord should update immediately once the IPC connection is active.

---

## Usage

### Activity types

| Type | Description |
|---|---|
| Playing | Standard activity |
| Streaming | Requires a valid `http://` or `https://` stream URL |
| Listening | Useful for music or audio status |
| Watching | Useful for streams, videos, or media |
| Competing | Useful for tournaments or ranked sessions |

### Images

The UI supports three image input styles:

- Discord asset keys from your application assets
- Direct remote image URLs
- Anonymous uploads to Imgur through the built-in uploader

### Timestamps

- Use `now` as the start timestamp to begin an elapsed timer immediately
- Use Unix milliseconds for custom start or end values
- Clear both timestamp fields to remove the timer

### Party data

Party display is only sent when both values are valid:
- `partySize`
- `partyMax`

`partySize` must be less than or equal to `partyMax`.

### Buttons

Discord supports up to two Rich Presence buttons. Each button requires:
- a label
- a valid URL

---

## Architecture

### Runtime stack

| Layer | Implementation |
|---|---|
| Runtime | Bun |
| Language | TypeScript |
| UI | Vanilla HTML, CSS, and JavaScript |
| Transport to UI | Local HTTP + WebSocket |
| Transport to Discord | Local Discord IPC pipe/socket |
| Tray | `systray2` |
| Image uploads | Imgur API |
| Packaging | `bun build --compile` |

### Project goals

This project is optimized around:
- small runtime footprint
- simple deployment
- no Electron or other heavy bundlers
- no framework-heavy frontend
- direct Bun-native builds

---

## Development

### Requirements

- Bun `1.3.14` or newer

### Install

```bash
bun install
```

### Run in development

```bash
bun run start
```

This launches the local server directly from `src/server.ts`.

---

## Build

### Available scripts

```bash
bun run build:win
bun run build:win:arm
bun run build:mac
bun run build:mac:x64
bun run build:linux
bun run build:all
```

### Build targets

| Script | Target |
|---|---|
| `build:win` | Windows x64 |
| `build:win:arm` | Windows ARM64 |
| `build:mac` | macOS ARM64 |
| `build:mac:x64` | macOS x64 |
| `build:linux` | Linux x64 |
| `build:all` | All targets above |

### Output

Compiled binaries are written to `dist/`.

Example:

```text
dist/
├── drpc.exe
├── drpc-win-arm.exe
├── drpc-mac-arm
├── drpc-mac-x64
└── drpc-linux
```

---

## Troubleshooting

### App does not connect to Discord

- Make sure Discord is running
- Make sure the Application ID is valid
- Make sure no local security tool is blocking IPC access
- Reconnect from the UI after Discord starts

### Presence does not update

- Confirm the UI status shows as connected
- Click **Apply presence** after editing values
- Check that streaming mode includes a valid stream URL when using activity type `1`

### Config does not load

The app loads config from the OS-specific config path, not from the executable directory. Verify that the JSON file exists and is valid at the expected path.

### Tray icon is missing

A missing tray icon usually means the runtime icon asset could not be decoded or written correctly. Verify that:
- the embedded icon data is valid
- base64 decoding strips any `data:*;base64,` prefix before writing
- Windows receives a valid `.ico` file for tray usage

### Images do not appear

- Discord asset keys must exist in your Discord application settings
- Remote image URLs must be reachable
- Imgur uploads depend on the external upload request succeeding

---

## Configuration example

```json
{
  "clientId": "1234567890123456789",
  "details": "Coding in TypeScript",
  "state": "For Discord RPC",
  "largeImageKey": "https://i.imgur.com/F6mPgq3.png",
  "largeImageText": "Typescript is love, TypeScript is life",
  "smallImageKey": "https://i.imgur.com/yn4HnRU.png",
  "smallImageText": "Bun is blazing fast",
  "startTimestamp": "now",
  "endTimestamp": "",
  "partySize": "",
  "partyMax": "",
  "buttons": [
    {
      "label": "",
      "url": ""
    },
    {
      "label": "",
      "url": ""
    }
  ],
  "type": 0,
  "streamUrl": ""
}
```

---

## Why Bun

This project originally targeted a more traditional Node-based packaging flow, but now uses a Bun-native runtime and Bun-native build pipeline. That keeps the toolchain simpler, removes the old executable packager dependency, and aligns development and production around a single runtime.

---

## Contributing

Issues and pull requests are welcome. When reporting bugs, include:
- platform and architecture
- Bun version
- whether the issue happens in development or compiled builds
- console output or browser console errors
- relevant config values if safe to share

---

## License

MIT. See [LICENSE](LICENSE) for details.

---

## Credits

- [Discord](https://discord.com/) Rich Presence / [Discord](https://discord.com/) IPC ecosystem
- [Bun](https://bun.sh/)
- [systray2](https://www.npmjs.com/package/systray2)
- [ws](https://www.npmjs.com/package/ws)

---

Built by [Nolly](https://thenolle.com) with ❤️

> Protect the Dolls 🏳️‍⚧️
# Discord RPC (drpc)

Ultra-lightweight Discord Rich Presence controller for Node.js - customizable presence with a modern in-browser GUI. Zero dependency. Runs locally, serves a modern web UI, and ships as a portable `.exe`.

![Platform](https://img.shields.io/badge/platform-Windows-blue?style=flat-square)
![Node](https://img.shields.io/badge/node-%3E%3D18-green?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-orange?style=flat-square)
![GitHub](https://img.shields.io/github/stars/thenolle/discord-rpc?style=social)

---

## ✨ Features

| Feature                  | Description                                                                   |
|--------------------------|-------------------------------------------------------------------------------|
| 🎮 **Any Activity Type** | Playing, Streaming, Listening to, Watching, Competing in                      |
| 🎨 **Rich Media**        | Large + small images via upload to Imgur or custom asset keys                 |
| ⏱️ **Timestamps**        | Start timer with `now` or custom Unix ms, optional end timestamp              |
| 👥 **Party System**      | Current size + max size for multiplayer presence                              |
| 🔘 **Buttons**           | Up to 2 action buttons with labels and URLs                                   |
| 🌐 **In-Browser GUI**    | Modern Discord-themed UI, no Electron, ultra-lightweight                      |
| 🚀 **Portable**          | Single `.exe`, zero install, config saved next to executable                  |
| 🔄 **Live Preview**      | See your presence exactly as Discord will display it                          |
| 💾 **Config Persistence**| Save & load settings automatically                                            |
| 🛠️ **Custom Assets**     | Use your own images via Imgur upload or custom asset keys                     |
| 🔒 **Privacy**           | All processing is local, no data sent to external servers                     |
| 🧩 **Extensible**        | Modular codebase, easy to extend with new features or (future) activity types |
| 🆓 **Free & Open Source** | MIT License, contributions welcome on GitHub                                 |

---

## 🚀 Quick Start

### 1. Download

Grab the latest release from the [Releases](https://github.com/thenolle/discord-rpc/releases) page.

### 2. Run

```bash
drpc.exe
```

The app automatically opens your default browser to the GUI at `http://127.0.0.1:<port>`.

### 3. Connect to Discord

1. Create a Discord Application at [discord.com/developers/home](https://discord.com/developers/home)
2. Copy the **Application ID** (Client ID)
3. Paste it into the GUI and click **Connect**

### 4. Customize & Apply

Fill in your presence details and click **Apply presence**. Your Discord status updates instantly.

---

## 📖 Usage Guide

### Activity Types

| Type               | Emoji | Description                    |
|--------------------|-------|--------------------------------|
| Playing            | 🎮    | Standard game/activity         |
| Streaming          | 🎙️    | Twitch/YouTube stream          |
| Listening to       | 🎧    | Music / Spotify                |
| Watching           | 📺    | Video / Stream                 |
| Competing in       | 🏆    | Tournament / competition       |

**Streaming**: Add your Twitch/YouTube URL to enable the stream button.

### Images

- **Upload**: Click or drag an image to upload (goes to Imgur anonymously)
- **Custom Asset**: Type a Discord custom asset key or full `https://` URL
- **Glyph fallback**: Text glyph when no image is provided

### Timestamps

- Type `now` in **Start timestamp** to begin an elapsed timer
- Enter Unix milliseconds for custom timestamps
- Click **Set start = now** for quick timer
- **Clear timestamps** resets both fields

### Party

Both **Current size** and **Max size** are required for party to display. Current must be ≤ max.

### Buttons

- Maximum 2 buttons
- Both **label** and **URL** required (URL must start with `https://`)
- Buttons appear below your presence in Discord

---

## 🛠️ Technical Details

| Component       | Details                                      |
|-----------------|----------------------------------------------|
| Runtime         | Node.js (bundled)                            |
| GUI             | Vanilla HTML/CSS/JS, served locally          |
| RPC Transport   | Discord IPC (requires Discord/arrpc running) |
| Image Hosting   | Imgur (anonymous uploads)                    |
| Config File     | `config.json` next to executable             |
| Architecture    | Single executable, portable                  |
| Platform        | Windows x64                                  |

### Folder Structure

```text
discord-rpc/
├── drpc.exe
└── config.json
```

---

## 🔧 Development

### Prerequisites

- Node.js ≥ 18
- pnpm (recommended) or npm

### Install Dependencies

```bash
pnpm install # or npm install
```

### Run in Development

```bash
pnpm start # or npm start
```

### Build Executable

```bash
pnpm build:win # or npm run build:win
# or
pnpm build:mac # or npm run build:mac
# or
pnpm build:linux # or npm run build:linux
# or
pnpm run build:all # builds all platforms
```

Output: `dist/drpc.exe`/`dist/drpc-mac`/`dist/drpc-linux`

---

## 🐛 Troubleshooting

### "Not connected to Discord"

- Ensure Discord is running
- Client ID must be valid (Discord Application ID, not token)
- RPC connects via IPC - Discord must be open

### Images not showing in preview

- Use full `https://` URLs or upload via the GUI
- The proxy endpoint handles Imgur CORS correctly

### Presence not updating

- Click **Apply presence** after editing fields
- Check console for errors
- Ensure RPC shows **Connected** status

### Config not saving

- `config.json` is saved next to the executable
- Ensure the folder is writable (not in `Program Files`)

---

## 🤝 Support & Community

- **Discord**: [Join the server](https://discord.com/invite/JYDzHfgmrP)
- **Issues**: [GitHub Issues](https://github.com/thenolle/discord-rpc/issues)
- **Sponsor**: [GitHub Sponsors](https://github.com/sponsors/thenolle)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

You are free to use, modify, and distribute this software for any purpose, but it comes with no warranty.

---

## 🙏 Acknowledgments

- [discord-rpc](https://github.com/discord/discord-rpc) by Discord
- [pkg](https://github.com/vercel/pkg) by Vercel
- Icon design inspired by Discord's design system

---

Made with 💜 by [Nolly](https://thenolle.com)
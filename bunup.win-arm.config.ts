import { defineConfig } from 'bunup'

export default defineConfig({
  entry: 'src/server.ts',
  outDir: 'build',
  compile: {
    target: 'bun-windows-arm64',
    outfile: './drpc-win-arm.exe',
    windows: {
      hideConsole: true,
      icon: './assets/tray.ico'
    }
  }
})
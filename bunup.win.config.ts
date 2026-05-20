import { defineConfig } from 'bunup'

export default defineConfig({
  entry: 'src/server.ts',
  outDir: 'build',
  compile: {
    target: 'bun-windows-x64',
    outfile: './drpc.exe',
    windows: {
      hideConsole: true,
      icon: './assets/tray.ico'
    }
  }
})
import { defineConfig } from 'bunup'

export default defineConfig({
  entry: 'src/server.ts',
  outDir: 'build',
  compile: {
    target: 'bun-darwin-arm64',
    outfile: './drpc-mac'
  }
})
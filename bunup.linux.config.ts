import { defineConfig } from 'bunup'

export default defineConfig({
  entry: 'src/server.ts',
  outDir: 'build',
  compile: {
    target: 'bun-linux-x64',
    outfile: './drpc-linux'
  }
})
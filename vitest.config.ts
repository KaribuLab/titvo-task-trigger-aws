import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node'
  },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, 'src') },
      { find: '@infrastructure', replacement: resolve(__dirname, 'src/infrastructure') },
      { find: '@titvo/auth', replacement: resolve(__dirname, 'auth') },
      { find: '@titvo/trigger', replacement: resolve(__dirname, 'trigger') },
      { find: '@titvo/shared', replacement: resolve(__dirname, 'shared') },
      { find: '@titvo/aws', replacement: resolve(__dirname, 'lib/aws') },
      { find: '@trigger', replacement: resolve(__dirname, 'trigger/src') },
      { find: '@auth', replacement: resolve(__dirname, 'auth/src') },
      { find: '@shared', replacement: resolve(__dirname, 'shared/src') },
      { find: '@aws', replacement: resolve(__dirname, 'lib/aws/src') }
    ]
  }
}) 
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [react()],

  base: '/ambient-mixer/',

  define: {
    __APP_VERSION__: JSON.stringify(
      packageJson.version
    ),
  },

  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
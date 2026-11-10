import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages serves the app from /<repo>/; locally it stays at /.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  // Busts the browser cache of the component sandbox script (public/runner/react-frame.js) per build.
  define: { __FRAME_VERSION__: JSON.stringify(Date.now().toString(36)) },
  server: {
    port: Number(process.env.WEB_PORT ?? 5900),
    strictPort: true,
    proxy: { '/api': `http://localhost:${process.env.API_PORT ?? 5901}` },
  },
})

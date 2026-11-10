/**
 * Builds the component sandbox (src/runner/react-frame.ts) into one classic IIFE script with React inside:
 * public/runner/react-frame.js. The page fetches it from its own origin and hands the code to the
 * sandboxed iframe (see src/runner/run-frame.ts). Runs before `dev` and `build`; the output is not committed.
 */
import { join } from 'node:path'
import { build } from 'vite'

const root = join(import.meta.dirname, '..')
await build({
  root,
  configFile: false,
  logLevel: 'warn',
  publicDir: false,
  // Production React: smaller and closer to what users run; tests do not use act().
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    lib: { entry: join(root, 'src/runner/react-frame.ts'), formats: ['iife'], name: 'FrontendGymFrame', fileName: () => 'react-frame.js' },
    outDir: join(root, 'public/runner'),
    emptyOutDir: true,
    minify: true,
    reportCompressedSize: false,
  },
})
console.log('built public/runner/react-frame.js')

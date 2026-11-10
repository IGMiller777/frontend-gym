/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "off" disables AI features and the file progress storage (static GitHub Pages build). */
  readonly VITE_AI?: string
}

/** Build id appended to the component sandbox script URL. */
declare const __FRAME_VERSION__: string

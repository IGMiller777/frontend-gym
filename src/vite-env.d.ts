/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "off" disables AI features and the file progress storage (static GitHub Pages build). */
  readonly VITE_AI?: string
}

/**
 * Page globals for ```js dom and ```jsx dom lesson examples, loaded with `node --import` so they exist
 * before the example's own imports are evaluated (static imports are hoisted above any prelude code,
 * and react-dom detects browser features such as the `input` event when it is first loaded).
 */
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'https://app.example.com/' })
// DOM names Node lacks come from jsdom; Node's own Event classes are replaced so events dispatch on DOM nodes.
const override = ['Event', 'EventTarget', 'CustomEvent', 'AbortController', 'AbortSignal', 'DOMException', 'FormData']
for (const k of Object.getOwnPropertyNames(dom.window)) {
  const isDom = /^[A-Z]/.test(k) || ['document', 'customElements', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(k)
  if (isDom && (!(k in globalThis) || override.includes(k))) globalThis[k] = dom.window[k]
}
globalThis.window = dom.window
// Node has its own (flag-gated) Web Storage accessors: replace them with the page's storage.
for (const k of ['localStorage', 'sessionStorage']) Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true })
// React's test-environment flag: `act()` flushes renders and effects without warnings.
globalThis.IS_REACT_ACT_ENVIRONMENT = true

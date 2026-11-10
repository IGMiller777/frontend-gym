/**
 * Every piece of content cites at least one official source. Only these domains count as
 * "official" or "spec": vendor docs, MDN, web.dev, W3C/WHATWG/TC39 and similar primary sources.
 */
export const officialDomains = [
  'developer.mozilla.org',
  'web.dev',
  'developer.chrome.com',
  'html.spec.whatwg.org',
  'fetch.spec.whatwg.org',
  'dom.spec.whatwg.org',
  'www.w3.org',
  'www.rfc-editor.org',
  'tc39.es',
  'www.typescriptlang.org',
  'react.dev',
  'angular.dev',
  'vuejs.org',
  'router.vuejs.org',
  'pinia.vuejs.org',
  'rxjs.dev',
  'ngrx.io',
  'nextjs.org',
  'nuxt.com',
  'redux.js.org',
  'redux-toolkit.js.org',
  'tanstack.com',
  'zustand.docs.pmnd.rs',
  'mobx.js.org',
  'graphql.org',
  'vite.dev',
  'nx.dev',
  'module-federation.io',
  'vitest.dev',
  'testing-library.com',
  'playwright.dev',
  'tailwindcss.com',
  'nodejs.org',
  'cheatsheetseries.owasp.org',
  'owasp.org',
] as const

export type SourceKind = 'official' | 'spec' | 'article'

export interface Source {
  title: string
  url: string
  kind: SourceKind
}

/** When the material was last checked against its sources, and for which version. */
export interface Verified {
  /** YYYY-MM */
  date: string
  version?: string
}

export function isOfficial(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return (officialDomains as readonly string[]).includes(host)
  } catch {
    return false
  }
}

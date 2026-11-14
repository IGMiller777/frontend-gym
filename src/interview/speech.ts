import type { Locale } from '../i18n/types'

/** The part of the Web Speech API recognition interface the interview uses (not in TypeScript's DOM lib). */
export interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
}

const speechLang: Record<Locale, string> = { ru: 'ru-RU', en: 'en-US' }

/** Speech recognition exists in Chromium browsers (prefixed) and Safari; Chrome sends the audio to Google servers. */
export const RecognitionCtor: (new () => Recognition) | undefined =
  typeof window === 'undefined'
    ? undefined
    : ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as
        | (new () => Recognition)
        | undefined

export function createRecognition(locale: Locale): Recognition | null {
  if (!RecognitionCtor) return null
  const r = new RecognitionCtor()
  r.lang = speechLang[locale]
  r.continuous = true
  r.interimResults = true
  return r
}

export function speak(text: string, locale: Locale) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = speechLang[locale]
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(locale))
  if (voice) u.voice = voice
  window.speechSynthesis.speak(u)
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
}

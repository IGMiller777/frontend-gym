import type { Dict } from './index'

export const en: Dict = {
  app: {
    name: 'Frontend Gym',
    tagline: 'A trainer for frontend interview preparation',
  },
  nav: {
    home: 'Tracks',
    skip: 'Skip to content',
    language: 'Language',
    theme: 'Theme',
    themes: { system: 'System', light: 'Light', dark: 'Dark' },
  },
  home: {
    heroTitle: 'Get your frontend interview-ready',
    heroText:
      'Lessons grounded in official docs, coding tasks tested right in the browser, "what does this code print", performance incident drills and AI mock interviews. In English and Russian.',
    start: 'Pick a track',
    modesTitle: 'Practice modes',
    tracksTitle: 'Tracks',
    soon: 'soon',
    modes: {
      coding: { title: 'Coding tasks', text: 'Implement debounce, Promise.all or a component. Tests run right in the browser.' },
      predict: { title: 'What does it print?', text: 'Event loop, closures, this, effect order. With a step-by-step visualizer.' },
      incidents: { title: 'Incidents', text: 'Core Web Vitals dropped, memory leaks, the bundle ballooned. Find the cause and fix it.' },
      interview: { title: 'Mock interview', text: 'Theory, live coding and RADIO system design with an AI interviewer.' },
    },
  },
  track: {
    back: 'All tracks',
    keyIdeas: 'Key ideas',
    readMore: 'Read more',
    comingTitle: 'Next in this track',
    comingText: 'In-depth lessons, code-checked tasks and quizzes on each of these topics arrive in the next stages.',
    notFound: 'Track not found.',
  },
  groups: {
    platform: 'Platform',
    language: 'Language',
    frameworks: 'Frameworks',
    app: 'Application',
    quality: 'Quality',
    scale: 'Scale',
  },
  stats: {
    xp: 'XP',
    streak: (n: number) => `${n}-day streak`,
  },
  errors: {
    apiDown: (status: number) => `The AI server is not responding (HTTP ${status}). Is pnpm dev:api running?`,
    aiDisabled: 'AI features are disabled in this build.',
    generation: 'Generation error',
  },
  notFound: { title: 'Page not found', back: 'Home' },
}

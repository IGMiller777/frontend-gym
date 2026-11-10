## What this lesson covers

How React renders on the server: which APIs are current and which were removed, how `renderToString` differs from streaming and prerendering, what hydration is and where mismatch errors come from. The second half covers Server Components and server functions: the model, `'use client'` boundaries and security. At the end, what to pick for a new project.

## Why render on the server

With pure client-side rendering (CSR) the browser gets an empty `<div id="root">`, downloads and runs JavaScript, and only then does the user see content. Server-side rendering (SSR) sends ready HTML: content shows up sooner, and search engines and link previews can see it. The cost: a server for every request (or a build step ahead of time), and the page is not interactive until JavaScript loads and hydration finishes. Static site generation (SSG) does the same at build time.

## React DOM server APIs

| API | What it does |
|---|---|
| `renderToPipeableStream` | Streaming render in Node.js: sends the shell at once and fills in Suspense boundaries as they become ready |
| `renderToReadableStream` | The same on Web Streams (Deno, Bun, edge; in Node too since React 19.2) |
| `prerender`, `prerenderToNodeStream` (`react-dom/static`) | Wait for all data and return complete HTML: for static generation |
| `resume`, `resumeAndPrerender` (React 19.2) | Partial prerendering: the static shell is prepared ahead of time, the dynamic parts are rendered on request |
| `renderToString` | A string right away, with no streaming and no waiting for data: a suspended boundary becomes its fallback |
| `renderToStaticMarkup` | HTML without hydration (emails, static fragments) |

`renderToNodeStream` and `renderToStaticNodeStream` were removed in React 19. There has been no `data-reactroot` attribute or checksum in the HTML since React 16.

```jsx run
import { Suspense, use } from 'react'
import { renderToString } from 'react-dom/server'
import { prerender } from 'react-dom/static'

const stats = new Promise((resolve) => setTimeout(() => resolve(42), 20))

function Stats() {
  const value = use(stats)
  return <p>Orders: {value}</p>
}

function Page() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Stats />
      </Suspense>
    </main>
  )
}

// Drop React's markers so the result is easy to read.
const clean = (html) => html.replace(/<!--.*?-->|<template[\s\S]*?<\/template>/g, '')
console.log('renderToString:', clean(renderToString(<Page />)))
const { prelude } = await prerender(<Page />)
console.log('prerender:', clean(await new Response(prelude).text()))
```

```output
renderToString: <main><h1>Dashboard</h1><p>Loading…</p></main>
prerender: <main><h1>Dashboard</h1><p>Orders: 42</p></main>
```

`renderToString` did not wait for the data and returned the fallback (the data will load on the client), while `prerender` waited for the promise. A streaming `renderToPipeableStream` would first send the shell with the fallback and then, in the same response, append `<p>Orders: 42</p>` and a small script that puts it in place. The user sees the page sooner, and a slow part does not hold back the rest.

## Hydration

`hydrateRoot(container, <App />)` does not create the DOM again: React renders the same tree on the client, matches it against the existing HTML and attaches the handlers. That is why **the first client render must produce the same HTML as the server**. If the text does not match, React re-renders the nearest Suspense boundary (or the whole root) on the client and reports it through `onRecoverableError`:

```jsx dom
import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'

function Clock({ now }) {
  return <time>{now}</time>
}

const container = document.createElement('div')
container.innerHTML = renderToString(<Clock now="10:00:00" />)
await act(() =>
  hydrateRoot(container, <Clock now="10:00:01" />, {
    onRecoverableError: (error) => console.log('recoverable:', error.message.split('.')[0]),
  }),
)
console.log(container.innerHTML)
```

```output
recoverable: Hydration failed because the server rendered text didn't match the client
<time>10:00:01</time>
```

Typical causes: `Date.now()`, `Math.random()`, `typeof window !== 'undefined'` in render, locale and time zone, invalid HTML nesting (`<div>` inside `<p>`), browser extensions that edit the DOM. The fixes:

- **ids** for `htmlFor`, `aria-describedby` and the like come from `useId`: it gives the same values on the server and the client, while `Math.random()` does not;
- a single diverging value (a time) is marked with `suppressHydrationWarning` on the element, which works one level deep only;
- a component that needs the browser (`localStorage`, the user's time zone) can call `use(browser())` from `react-dom` since React 19.3: on the server it suspends and the HTML gets the nearest Suspense fallback, on the client it renders as usual. Previously this took `useEffect(() => setMounted(true), [])` and a second render pass.

```jsx dom
import { act, useId } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'

function Field({ label }) {
  const id = useId()
  return (
    <p>
      <label htmlFor={id}>{label}</label> <input id={id} />
    </p>
  )
}
function Form() {
  return <><Field label="Name" /><Field label="Email" /></>
}

const container = document.createElement('div')
container.innerHTML = renderToString(<Form />)
const serverIds = [...container.querySelectorAll('input')].map((i) => i.id)
await act(() => hydrateRoot(container, <Form />, { onRecoverableError: (e) => console.log('mismatch:', e.message) }))
const clientIds = [...container.querySelectorAll('input')].map((i) => i.id)
console.log(new Set(serverIds).size, 'unique ids,', JSON.stringify(serverIds) === JSON.stringify(clientIds) ? 'same after hydration' : 'changed')
```

```output
2 unique ids, same after hydration
```

**Selective hydration** (React 18+): each Suspense boundary hydrates independently. While the code for one part loads, the others are already interactive, and if the user clicks an area that is not hydrated yet, React hydrates it first.

## Server Components

A **Server Component** runs only on the server (on request or at build time) and sends the client the render result, not the code. It is not the same as SSR: SSR turns client components into HTML too, while Server Components never reach the client bundle at all.

- A Server Component can be `async` and read data directly: `const post = await db.posts.find(id)`. Only Server Components can be async.
- It has no state, effects or event handlers.
- There is no directive for Server Components: in RSC apps this is the default.
- `'use client'` at the top of a file marks a **boundary**: this module and everything it imports goes to the client. A Server Component can render a client one and pass it props, but only serializable ones: primitives, plain objects and arrays, `Date`, `Map`, `Set`, promises, JSX, server functions. Regular functions and classes cannot be passed.
- A client component cannot import a server one, but it can receive one as `children`.
- A promise can be created in a Server Component and passed to a client one, which reads it with `use`.

```jsx
// app/posts/[id]/page.jsx: a Server Component (no directive)
import { LikeButton } from './LikeButton'

export default async function PostPage({ params }) {
  const { id } = await params
  const post = await db.posts.find(id)
  return (
    <article>
      <h1>{post.title}</h1>
      <LikeButton postId={post.id} initialLikes={post.likes} />
    </article>
  )
}
```

```jsx
// LikeButton.jsx
'use client'
import { useOptimistic } from 'react'
import { like } from './actions'

export function LikeButton({ postId, initialLikes }) {
  const [likes, addLike] = useOptimistic(initialLikes, (n) => n + 1)
  return (
    <form action={async () => { addLike(); await like(postId) }}>
      <button>♥ {likes}</button>
    </form>
  )
}
```

## Server functions

`'use server'` marks an async function (or all exports of a file) that the client can call: on a call the browser sends a request, the server runs the function and returns the result. Since September 2024 they are called Server Functions (Server Actions are server functions passed to a form's `action` or called from an Action).

```js
// actions.js
'use server'

export async function like(postId) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not signed in')
  if (typeof postId !== 'string') throw new Error('Bad input')
  await db.likes.add({ postId, userId: user.id })
}
```

Security:

- A server function is a **public endpoint**. Its arguments are fully controlled by the client: check their type and format, and check the current user's permissions inside the function. Showing the button only to admins protects nothing.
- Return only the fields you need, not the whole database record.
- Keep React and your framework up to date: in December 2025 a vulnerability with unauthenticated remote code execution was found in how requests to server functions are decoded (CVE-2025-55182, CVSS 10.0; fixed in 19.0.1, 19.1.2 and 19.2.1), followed by two more (denial of service and source code exposure). Apps with RSC support were affected even without server functions of their own.

## What to pick

- Create React App was deprecated in February 2025. For new projects React recommends a **framework**: Next.js (App Router, RSC), React Router in framework mode, Expo for mobile. For an SPA without a server or a gradual migration, **Vite** with a router works (React Router in data mode, TanStack Router).
- Need SEO and a fast first view: SSR or SSG. An internal dashboard behind a login: CSR is often enough.
- Server Components need bundler and server support, so they are used through a framework.

## Key points

- Current APIs: streaming `renderToPipeableStream` and `renderToReadableStream`, `prerender` for static output, `resume` for partial prerendering; `renderToString` does not wait for data.
- Hydration needs an identical first render; `useId` for ids, `suppressHydrationWarning` for a single value, `use(browser())` for browser-only components.
- Selective hydration: Suspense boundaries come alive independently, with priority for the area being interacted with.
- Server Components run only on the server, can be `async`, and pass only serializable props to client components.
- Server functions are public endpoints: validate input and permissions inside, and apply security updates.

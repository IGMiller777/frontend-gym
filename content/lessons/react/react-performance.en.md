## What this lesson covers

Why a component re-renders, what `memo`, `useMemo` and `useCallback` actually do, where context breaks, what React Compiler 1.0 takes over, and which tools exist for heavy updates: transitions, `useDeferredValue`, `<Activity>`, virtualization and code splitting.

## When a component renders

A component renders when:

1. its state changed;
2. **its parent rendered** (by default all children render along with it, even with the same props);
3. the value of a context it reads changed.

"It re-rendered because its props changed" is inaccurate: without `memo` props are not compared at all.

```jsx dom
import { act, memo, useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'

function Plain({ label }) {
  console.log('render Plain')
  return label
}
const Memoized = memo(function Memoized({ label, onPick }) {
  console.log('render Memoized')
  return label
})

let bump
function Parent() {
  const [count, setCount] = useState(0)
  bump = () => setCount((c) => c + 1)
  const stablePick = useCallback(() => {}, [])
  return (
    <>
      <Plain label="same" />
      <Memoized label="same" onPick={stablePick} />
      <Memoized label="inline" onPick={() => {}} />
    </>
  )
}

const root = createRoot(document.createElement('div'))
await act(() => root.render(<Parent />))
console.log('--- parent state changes')
await act(() => bump())
```

```output
render Plain
render Memoized
render Memoized
--- parent state changes
render Plain
render Memoized
```

`Plain` rendered with the same props. The first `Memoized` skipped its render: `memo` compared props shallowly (`Object.is` for each), and `useCallback` kept the same function. The second `Memoized` got a new arrow function, and `memo` did not help.

## memo, useMemo, useCallback

- `memo(Component)` skips a render if all props equal the previous ones. It pays off when a component often renders with the same props and its render is noticeably expensive.
- `useMemo(fn, deps)` caches the **result** of a calculation between renders. Use it for expensive calculations (the docs suggest 1 ms or more as a guide; measure) and for a stable reference to an object that goes into a `memo` component or an effect's dependencies.
- `useCallback(fn, deps)` does the same for a function: `useMemo(() => fn, deps)`.
- Memoization is useless if even one prop is new every time, and harmful when everything is wrapped: comparing and storing also cost time, and the code is harder to read.
- Often it is better to **restructure** than to memoize: move state down into the component that needs it, or pass the heavy part as `children` (an element created by a parent higher up is not re-created when the wrapper renders).

Profile before optimizing: the Profiler tab in React DevTools shows the time of each render, and with the "Record why each component rendered while profiling" setting, the reason too. In Chrome, React 19.2 adds Performance Tracks: renders and priorities appear right in the Performance panel.

## The context trap

Every component that reads a context renders when the provider gets a new value, and `memo` does not save it. The value is compared by reference, so an object created during render "changes" on every render of the provider. Splitting into several contexts does not help by itself:

```jsx dom
import { act, createContext, memo, use, useState } from 'react'
import { createRoot } from 'react-dom/client'

const ThemeContext = createContext(null)
const UserContext = createContext(null)

const Header = memo(function Header() {
  const { theme } = use(ThemeContext)
  console.log('render Header', theme)
  return null
})

let setUser
function App() {
  const [theme, setTheme] = useState('light')
  const [user, _setUser] = useState('Ann')
  setUser = _setUser
  // Two contexts, but each value is a new object on every render of App.
  return (
    <ThemeContext value={{ theme, setTheme }}>
      <UserContext value={{ user, setUser }}>
        <Header />
      </UserContext>
    </ThemeContext>
  )
}

const root = createRoot(document.createElement('div'))
await act(() => root.render(<App />))
console.log('--- only the user changes')
await act(() => setUser('Bob'))
```

```output
render Header light
--- only the user changes
render Header light
```

Only the user changed, but `App` rendered and created a new `{ theme, setTheme }` object, so `Header` rendered too. The fixes: `useMemo` for the value (`useMemo(() => ({ theme, setTheme }), [theme])`), a separate provider component that renders only from its own state, or putting plain values into context and keeping frequent updates in an external store (Zustand, Redux, Jotai) with a subscription to a slice. Note: since React 19 a provider is written as `<ThemeContext value>`, and `Context.Provider` is on its way out; you can read context with `use(Context)`, which may also be called in conditions.

## React Compiler

React Compiler 1.0 (October 2025) is a build plugin that adds memoization for you: it caches values, JSX and functions inside components and hooks, including after an early `return`, which you cannot do by hand. Compiled code takes its cache from `react/compiler-runtime`, and components carry a "Memo ✨" badge in DevTools.

- It works with React 19, and also with 17 and 18 (through the `react-compiler-runtime` package).
- It is a Babel plugin; in Vite use `reactCompilerPreset` from `@vitejs/plugin-react`; Next.js and Expo have ready-made settings.
- It relies on **the rules of React**: pure render, immutable props and state, hooks at the top level. A component it cannot prove safe is simply skipped. Violations are reported by the linter rules in `eslint-plugin-react-hooks` (the `recommended-latest` preset).
- To turn it off for one component: the `"use no memo"` directive at the start of the function.
- With the compiler, manual `useMemo` and `useCallback` are rarely needed: only when exact reference stability matters for an effect or an external library.

## Heavy updates: transitions

`startTransition` and `useTransition` mark a state update as non-urgent: its render can be interrupted by user input, and the old UI stays on screen until the new one is ready. The callback itself runs **immediately and synchronously**; only the render is interruptible:

```jsx dom
import { act, startTransition, useState } from 'react'
import { createRoot } from 'react-dom/client'

let setQuery
function Search() {
  const [query, _setQuery] = useState('')
  setQuery = _setQuery
  console.log('render', JSON.stringify(query))
  return null
}

const root = createRoot(document.createElement('div'))
await act(() => root.render(<Search />))
await act(() => {
  startTransition(() => {
    console.log('transition callback runs right away')
    setQuery('react')
  })
  console.log('after startTransition')
})
```

```output
render ""
transition callback runs right away
after startTransition
render "react"
```

That is why `startTransition(() => setResults(heavyFilter(items, q)))` speeds nothing up: the filtering has already run synchronously. The heavy calculation must happen **during the render** of the component that receives the non-urgent value:

- `useTransition()` gives `[isPending, startTransition]` when you trigger the update yourself (switching a tab, a filter);
- `useDeferredValue(value)` defers a value that has already arrived: the input updates at once, while the list renders from the deferred value and may lag behind; the second argument sets the initial value for the first render.

Urgent updates (typing into a field) are not wrapped in a transition: a controlled input must respond at once.

## Activity and ViewTransition

`<Activity mode="hidden">` (React 19.2) hides a subtree while keeping its state and DOM, and unmounts its effects. Hidden content is pre-rendered at low priority, so switching is instant:

```jsx dom
import { act, Activity, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

function Tab({ name }) {
  const [draft] = useState(`draft of ${name}`)
  useEffect(() => {
    console.log('effect on', name)
    return () => console.log('effect off', name)
  }, [name])
  return <p>{draft}</p>
}

function App({ tab }) {
  return (
    <>
      <Activity mode={tab === 'a' ? 'visible' : 'hidden'}><Tab name="a" /></Activity>
      <Activity mode={tab === 'b' ? 'visible' : 'hidden'}><Tab name="b" /></Activity>
    </>
  )
}

const container = document.createElement('div')
const root = createRoot(container)
await act(() => root.render(<App tab="a" />))
console.log('--- switch to b')
await act(() => root.render(<App tab="b" />))
console.log([...container.querySelectorAll('p')].map((p) => `${p.textContent}${p.style.display === 'none' ? ' (hidden)' : ''}`).join(', '))
```

```output
effect on a
--- switch to b
effect off a
effect on b
draft of a (hidden), draft of b
```

The hidden tab "a" stayed in the DOM with `display: none` and its state, and its effect was removed. Previously you had to choose between `{show && <Tab />}` (state is lost) and hiding with CSS (effects keep running).

`<ViewTransition>` (stable since React 19.3) animates its children appearing, disappearing and changing through the browser's View Transitions API. The animation runs for updates inside a transition (`startTransition`, `useDeferredValue`, Suspense), not for every `setState`.

## External stores

If a component reads a mutable source outside React (your own store, `navigator.onLine`, the window size), use `useSyncExternalStore(subscribe, getSnapshot)`. In a concurrent render, reading such a source directly can cause **tearing**: different parts of the UI show different versions of the data. The hook guarantees consistency. React Redux and Zustand are built on it.

## Big lists and the bundle

- **Virtualization**: only the visible rows plus a small buffer are in the DOM, the rest is replaced by spacing. Libraries: TanStack Virtual (`useVirtualizer`), react-window 2 (`List` with `rowComponent`), react-virtuoso for rows of variable height. Caveats: find-in-page and anchors do not see hidden rows, and tables need `aria-rowcount` and `aria-rowindex` for accessibility.
- **Code splitting**: `const Settings = lazy(() => import('./Settings'))` with `<Suspense fallback={<Skeleton />}>` around it. The module must export the component as default. Routers can split by route themselves (`lazy` in React Router, file-based routes in frameworks) and start loading code and data in parallel.

## Key points

- A component renders because of its state, its parent's render or a context; only `memo` compares props.
- `memo` works only with stable props; moving state or passing `children` is often better.
- A new object in a provider's `value` renders every reader; splitting contexts without stable values does not help.
- React Compiler 1.0 memoizes automatically when the rules of React are followed; `"use no memo"` turns it off.
- The `startTransition` callback runs at once; only the render is interruptible. Do heavy work during render from a deferred value.
- `<Activity>` hides while keeping state, `useSyncExternalStore` prevents tearing, long lists are virtualized.

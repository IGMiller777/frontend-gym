## What this lesson covers

Signals became the core of Angular reactivity: component inputs, queries, forms, the router and zoneless mode are built on them. This lesson covers how `signal` and `computed` work, when `effect` and its cleanup actually run, `untracked`, `linkedSignal`, the async `resource`, and the bridge to RxJS. The "what does it print" puzzles that interviewers like are verified by running on Angular 22.2: some answers in the notes are out of date.

## signal and computed

`signal(initial)` holds a value; reading is a call, `count()`, writing is `set` or `update`. `computed(fn)` derives a value from other signals, and it has three important properties:

- **lazy**: the function does not run until the value is read;
- **memoized**: reading again without changes uses the cache;
- **dynamic dependencies**: only the signals read during the last run are tracked.

```ts run
import { computed, signal } from '@angular/core'

const flag = signal(true)
const a = signal(1)
const b = signal(100)
const result = computed(() => {
  console.log('computing')
  return flag() ? a() : b()
})

console.log('created, nothing computed yet')
console.log(result(), result())
b.set(200) // b was not read: not a dependency
console.log(result())
flag.set(false)
console.log(result())
a.set(999) // a is no longer read
console.log(result())
```

```output
created, nothing computed yet
computing
1 1
1
computing
200
200
```

Changing `b` while it was not read recomputed nothing; after `flag` flipped, the dependency switched to `b`, and `a` stopped mattering.

## Equality

A signal compares the new value with the old one with `Object.is` (you can pass your own `equal` function). If the value is "the same", dependents are not recomputed. `computed` follows the same rule for its result: if it did not change, nothing further down the chain is recomputed.

```ts run
import { computed, signal } from '@angular/core'

const user = signal({ name: 'Ann', age: 30 })
const name = computed(() => user().name)
let runs = 0
const greeting = computed(() => {
  runs++
  return `Hello, ${name()}`
})

greeting()
user.set({ name: 'Ann', age: 31 }) // new object, same name
greeting()
user.update((u) => u) // same reference: no change at all
greeting()
console.log('greeting computed', runs, 'time(s)')

const point = signal({ x: 1, y: 2 }, { equal: (p, q) => p.x === q.x && p.y === q.y })
const seen: string[] = []
const label = computed(() => (seen.push('label'), `${point().x},${point().y}`))
label()
point.set({ x: 1, y: 2 })
label()
console.log(seen.length)
```

```output
greeting computed 1 time(s)
1
```

`name` was recomputed after the new object but returned the same string, so `greeting` was not recomputed. Hence the rule: objects in signals are changed with a new reference (`update(u => ({ ...u, age: 31 }))`), while mutating `u.age = 31; update(u => u)` shows no change. There is no `mutate` method anymore; it was removed before signals became stable (v17).

## effect: when it runs

`effect(fn)` runs a side effect when the signals it read change. It needs an injection context (a constructor, a class field, or `{ injector }`) and is destroyed with its owner. The key interview point: an effect **does not run synchronously**, neither on creation nor on `set`. Angular schedules it and runs it later, and several changes in a row produce one run.

```ts dom
import { effect, signal } from '@angular/core'
import { createApplication } from '@angular/platform-browser'

const app = await createApplication()
const count = signal(0)
effect(
  (onCleanup) => {
    const seen = count()
    console.log('run with', seen)
    onCleanup(() => console.log('cleanup of run', seen, '| count() is now', count()))
  },
  { injector: app.injector },
)
console.log('after effect()')
count.set(1)
count.set(2)
await app.whenStable()
count.set(3)
await app.whenStable()
```

```output
after effect()
run with 2
cleanup of run 2 | count() is now 3
run with 3
```

- Root effects (created in root services or with the root injector) run at the start of the application check, before all components; component effects run before their component is checked. So an effect sees state before the DOM update; for DOM work there is `afterRenderEffect`.
- Cleanup runs **before** the next run and on destroy. A signal read inside cleanup returns the current value, not the value from the previous run: take the value you need from the closure.

## untracked and writing in effects

`untracked(fn)` reads signals without creating a dependency. Since v19 writing to signals inside an effect is **allowed** (the `allowSignalWrites` option does nothing), but this easily turns into a loop; derived values are better done with `computed` or `linkedSignal`.

```ts dom
import { effect, signal, untracked } from '@angular/core'
import { createApplication } from '@angular/platform-browser'

const app = await createApplication()
const user = signal('Ann')
const clicks = signal(0)
const log = signal<string[]>([])
effect(
  () => {
    const entry = `${user()} after ${untracked(clicks)} clicks`
    log.update((l) => [...l, entry]) // writing to a signal inside an effect is allowed since v19
  },
  { injector: app.injector },
)
await app.whenStable()
clicks.set(5)
await app.whenStable()
user.set('Bob')
await app.whenStable()
console.log(log())
```

```output
[ 'Ann after 0 clicks', 'Bob after 5 clicks' ]
```

Changing `clicks` did not re-run the effect, but on the next run it saw the current value. If a `computed` reads itself directly or indirectly, Angular throws `Detected cycle in computations.`

## linkedSignal

`linkedSignal` is a writable signal that resets when its source changes. A typical case: the selected list item, which the user changes, but which must be recomputed when the list changes.

```ts run
import { linkedSignal, signal } from '@angular/core'

const options = signal(['S', 'M', 'L'])
const selected = linkedSignal(() => options()[0])

console.log(selected())
selected.set('L') // the user picks a size
console.log(selected())
options.set(['M', 'L', 'XL']) // a new product: the selection resets
console.log(selected())

const kept = linkedSignal<string[], string>({
  source: options,
  computation: (next, previous) => (previous && next.includes(previous.value) ? previous.value : next[0]),
})
kept.set('L')
options.set(['L', 'XL'])
console.log(kept())
```

```output
S
L
M
L
```

The full form with `source` and `computation` receives the previous value and can keep the selection if it exists in the new list. Without `linkedSignal` this was written as an effect that writes to a signal, with an extra check and a risk of loops.

## resource: async data

`resource({ params, loader })` turns async loading into a set of signals: `value()`, `status()`, `isLoading()`, `error()`, `hasValue()`. When the result of `params` changes, the loader runs again and the previous request is aborted through `abortSignal`. If `params` returns `undefined`, the loader is not called. For HTTP there is `httpResource(() => url)`, for streams `rxResource`.

```ts dom
import { resource, signal } from '@angular/core'
import { createApplication } from '@angular/platform-browser'

const app = await createApplication()
const userId = signal<number | undefined>(undefined)
const user = resource({
  params: () => userId(), // undefined: the loader does not run
  loader: async ({ params }) => {
    await new Promise((r) => setTimeout(r, 20))
    if (params === 3) throw new Error('not found')
    return { id: params, name: `User ${params}` }
  },
  injector: app.injector,
})
const show = (label: string) => console.log(label, user.status(), JSON.stringify(user.value()), user.isLoading())

show('no id:')
userId.set(1)
show('id 1, right after set:')
await app.whenStable() // also waits for the loader: a pending task
show('id 1, loaded:')
userId.set(2)
show('id 2, right after set:')
await app.whenStable()
show('id 2, loaded:')
user.reload()
show('reload:')
await app.whenStable()
userId.set(3)
await app.whenStable()
console.log('error:', user.status(), user.error()?.message)
```

```output
no id: idle undefined false
id 1, right after set: loading undefined true
id 1, loaded: resolved {"id":1,"name":"User 1"} false
id 2, right after set: loading undefined true
id 2, loaded: resolved {"id":2,"name":"User 2"} false
reload: reloading {"id":2,"name":"User 2"} true
error: error not found
```

With new params the value resets (`loading`); with `reload()` the old value stays on screen (`reloading`). Older versions called the params `request`; the rename happened in v20. Loading counts as a pending task, so `whenStable()` and server rendering wait for it.

## The bridge to RxJS

From `@angular/core/rxjs-interop`:

- `toSignal(obs$, { initialValue })` subscribes at once and unsubscribes with its owner; without `initialValue` the value is `undefined` until the stream emits (a `BehaviorSubject` has a value right away);
- `toObservable(signal)` emits the signal's values through an effect, that is asynchronously and without intermediate values;
- `takeUntilDestroyed()`, `outputFromObservable`, `rxResource`.

```ts dom
import { toSignal } from '@angular/core/rxjs-interop'
import { createApplication } from '@angular/platform-browser'
import { BehaviorSubject, timer, map } from 'rxjs'

const app = await createApplication()
const count$ = new BehaviorSubject(0)
const count = toSignal(count$, { injector: app.injector }) // BehaviorSubject emits synchronously
count$.next(5)
console.log('behavior:', count())

const later = toSignal(timer(20).pipe(map(() => 99)), { initialValue: -1, injector: app.injector })
console.log('timer before:', later())
await new Promise((r) => setTimeout(r, 40))
console.log('timer after:', later())
```

```output
behavior: 5
timer before: -1
timer after: 99
```

Signals suit state that always has a value; RxJS remains for events over time: cancellation, debounce, combining streams.

## Key points

- `computed` is lazy, memoized and has dynamic dependencies; equality is `Object.is` or your own function.
- Objects in signals are changed with a new reference; `mutate` was removed.
- `effect` does not run immediately, changes are batched; cleanup runs before the next run, and a signal inside it returns the current value.
- Since v19 writing to signals inside an effect is allowed, but derived state is better done with `computed` and `linkedSignal`.
- `resource` has the statuses `idle`, `loading`, `resolved`, `reloading`, `error`; the params are called `params` since v20.
- `toSignal` and `toObservable` connect signals with RxJS.

## Why it matters

The publish-subscribe pattern connects parts of an app that know nothing about each other: an event bus between micro-frontends, theme change notifications, sockets. DOM events (`addEventListener`) and the Node.js `events` module work this way. In this task interviewers look at the data structure, the handling of `this`, and what happens when subscriptions change during an emit.

## What to build

The `EventEmitter` class:

- `on(event, listener)` subscribes and returns an unsubscribe function;
- `off(event, listener)` removes one subscription of that function;
- `once(event, listener)` subscribes for a single call; such a subscription can also be removed with `off` and the original function;
- `emit(event, ...args)` calls listeners in subscription order with the arguments and returns `true` if there were listeners, `false` otherwise;
- if a listener removes another listener during `emit`, the current round still reaches everyone who was subscribed when it started;
- a function subscribed twice is called twice (as in Node.js).

## Example

```ts
const bus = new EventEmitter()
const stop = bus.on('theme', (name) => applyTheme(name))
bus.emit('theme', 'dark') // true
stop()
```

<!-- solution -->

## The idea

A `Map` from event name to an array of listeners. An array, not a `Set`: order matters and a function may be subscribed twice. The field is private (`#listeners`), so outside code cannot corrupt the state.

- `on` appends to the array and returns an arrow function that calls `off`.
- `off` removes one occurrence. When the array becomes empty, the event is removed from the `Map` so empty entries do not pile up.
- `once` subscribes a wrapper that first unsubscribes and then calls the original function. The wrapper keeps a reference to the original (`wrapper.original`), which is how `off` finds it.
- `emit` iterates over a copy `[...list]`. Without the copy, a `splice` during the loop shifts the indexes and the next listener is skipped.

## Pitfalls

- **Iterating without a copy.** The most common bug: unsubscribing inside a handler breaks the current round.
- **`once` and `off`.** Without a link to the original function, `off(event, original)` cannot find the wrapper.
- **Leaks.** A subscription holds the handler and everything it closes over. A component that subscribed and did not unsubscribe on removal stays in memory.

## Follow-up questions

- What to do when one listener throws: stop the round or continue. In Node.js the exception aborts `emit`.
- How to type events: `EventEmitter<{ theme: [string]; logout: [] }>`.
- How the browser `EventTarget` differs: `Event` objects, propagation phases and an `AbortSignal` in the `signal` option for unsubscribing.

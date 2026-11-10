## Why it matters

An optimistic UI shows the result of an action right away, without waiting for the server, and rolls it back on error. React 19 has `useOptimistic` for this, and the task checks whether the candidate understands Actions: async transitions, a temporary value and rollback without a manual "put it back".

## What to build

`<LikeButton liked count save />`:

- a "Like" button with `aria-pressed`, next to it the text "N likes";
- on click the new state (pressed or not, the counter ±1) shows at once, then `save(liked)` is called;
- if `save` succeeds, the state stays; if it rejects, the button and the counter go back to the previous values and "Could not save" appears;
- the next successful click removes the message.

<!-- solution -->

## Solution idea

The real (confirmed) state lives in `useState`, and what is shown is `optimistic` from `useOptimistic(state)`. A click starts an Action with `startTransition(async () => ...)`: inside, first `setOptimistic(next)`, so the UI shows the new value at once, then `await save(...)`.

- On success, `setState(next)`: when the Action ends, `optimistic` equals the real state again, and it is already the new one.
- On error, the real state is left alone: the Action ended, the temporary value disappeared by itself, and there is nothing to roll back by hand. All that is left is to show the message.

Updates after `await` are wrapped in `startTransition` again: in the current React version the transition context is lost after `await`.

## Pitfalls

- **Update after the response.** `await save(); setState(next)` is honest but not optimistic: the user waits for the server.
- **Update at once without rollback.** `setState(next); save()` is optimistic, but on error the UI lies.
- **`setOptimistic` outside an Action.** Outside a transition React warns, and the value is not temporary.
- **An Action that never finishes.** While an async Action is in flight, React batches new transitions with it, so a hanging request delays other updates too. `save` needs a timeout.

## Follow-up questions

- How this differs from `useActionState` with a form: that one queues calls and passes the previous state as an argument.
- How to block clicks while saving (`useTransition` and `isPending`), and whether you should.
- How TanStack Query does it: `onMutate` with a manual cache snapshot and rollback in `onError`.

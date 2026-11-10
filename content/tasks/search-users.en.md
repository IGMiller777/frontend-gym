## Why it matters

A search that requests on every input change is the main test for response races. Responses arrive out of order, and unless the stale one is discarded, results for an old query end up on screen. Plus loading and error states and cancelling requests that are no longer needed.

## What to build

`<SearchUsers search={search} />`, where `search(query, signal)` returns a promise with a list of names:

- an input labelled "Search";
- call `search(query, signal)` for every non-empty value; for an empty value (or only spaces) do not call it and show nothing;
- while a request is in flight, show "Loading…"; results as a list of `<li>`; on error "Something went wrong";
- never show the response to a stale request, and abort the stale request through `signal`.

<!-- solution -->

## Solution idea

The request lives in an effect with `[query, search]` dependencies: the input changes `query`, and the effect starts a search. Each run gets its own `AbortController`; its `signal` goes to `search`, and the effect's cleanup calls `abort()`. When the user types the next letter, React first runs the previous effect's cleanup: the old request is aborted and marked stale. The response handlers check `controller.signal.aborted` and do nothing if the request is no longer needed.

There is one piece of state, tagged by status: `idle`, `loading`, `error`, or `done` with results. That rules out impossible combinations like "loading and failed at the same time".

## Pitfalls

- **No check after `await`.** Even with `abort()`, a `search` implementation may not support cancellation and still return a response; the `aborted` check (or an `ignore` flag) protects from the race either way.
- **An abort treated as a failure.** An aborted `fetch` rejects with `AbortError`; showing "Something went wrong" for every rejection makes the message flicker during fast typing.
- **An `async` function passed straight to `useEffect`.** The effect must return a cleanup function, not a promise.
- **A request for every letter.** A real UI adds a delay here (`useDebouncedValue`) and a cache.

## Follow-up questions

- What this looks like with TanStack Query: `useQuery({ queryKey: ['users', query], queryFn: ({ signal }) => ..., enabled: !!query })`, with caching, deduplication and cancellation built in.
- How to keep old results visible while new ones load (`placeholderData` or `useDeferredValue`).
- How to sync the query with the URL (`?q=`) so a search can be opened by a link.

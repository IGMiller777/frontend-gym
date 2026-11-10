## Why it matters

Uploading 200 files or sending 500 API requests with one `Promise.all` is a bad idea: the browser limits connections per host, the server may answer 429, and the UI stalls. You need a pool: at most N tasks run at once, and as soon as one finishes the next one starts. This is a frequent task in middle and senior interviews.

## What to build

`mapLimit(items, limit, mapper)`:

- calls `mapper(item, index)` for every item with at most `limit` calls running at once;
- a freed slot is taken by the next item right away, without waiting for a whole batch;
- resolves with an array of results in the order of `items`;
- on the first failure rejects with it and starts no new items;
- a synchronous throw inside `mapper` is handled like a rejected promise;
- `limit` is a positive integer.

## Example

```ts
const pages = await mapLimit(urls, 4, (url) => fetch(url).then((r) => r.text()))
```

<!-- solution -->

## The idea

Picture `limit` "workers". Each takes the next unprocessed index (`next++`), waits for its result and immediately takes the next one. At the start launch `min(limit, items.length)` workers. When every item is done, resolve the outer promise.

Why not batches: a `for` over chunks with `await Promise.all(chunk)` waits for the slowest item of each batch. With durations `[100, 10, 10, 10]` and a limit of 2, batches finish after 110 ms and the pool after 100 ms, because the second slot never sits idle.

The `mapper` call is wrapped in `try` and its result in `Promise.resolve`: a synchronous `throw` and a plain value are both handled as promises.

## Pitfalls

- **Order.** Store results by index, not with `push`.
- **Stopping on failure.** The `failed` flag prevents new starts. Items already running finish anyway: promises cannot be cancelled without `AbortController`.
- **Empty list.** Without a separate check the promise never resolves.

## Follow-up questions

- How to pass an `AbortSignal` to `mapper` and cancel running requests on the first failure.
- How to add retries with exponential backoff for 429 and 503 errors.
- How to do the same with an async iterator to process an endless stream.

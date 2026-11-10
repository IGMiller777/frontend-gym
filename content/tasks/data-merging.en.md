## Why it matters

Group records by a key and fold them into one: orders per user, events per session, report rows per date. This is everyday data work on the front end, and interviews check the choice of data structures (`Map`, `Set`) and immutability.

## What to do

`mergeOrders(orders)` merges the orders of the same `userId` into one record:

- `total` is summed;
- `tags` are merged without repeats and sorted alphabetically;
- users come in the order of their first appearance in the input;
- the input is not changed.

## Example

```ts
mergeOrders([
  { userId: 2, total: 10, tags: ['b'] },
  { userId: 1, total: 5, tags: [] },
  { userId: 2, total: 1, tags: ['a', 'b'] },
])
// [{ userId: 2, total: 11, tags: ['a', 'b'] }, { userId: 1, total: 5, tags: [] }]
```

<!-- solution -->

## Solution idea

A `Map` from `userId` to an accumulator: a `Map` keeps insertion order, so the order of first appearance comes for free. Collect tags in a `Set`, and at the end turn it into a sorted array and build new objects.

## Pitfalls

- **Mutating the input.** Accumulating into the first found object (`existing.total += …`) changes the source array.
- **Order through an object.** A plain object sorts integer-like keys ascending, so the order of first appearance is lost; a `Map` keeps it.
- **Duplicates within one record.** Tags must be deduplicated for a user with a single order too.

## What they ask next

- How to do the same with `Map.groupBy` and which reads better.
- How to merge only consecutive records (sessions) rather than all of them.
- How to do it for a million records: streaming, without holding the whole input.

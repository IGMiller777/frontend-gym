## Why it matters

An LRU (least recently used) cache keeps a limited number of entries and, when full, evicts the one that has not been accessed for the longest time. Request caches, image caches, computation caches and the browser's page cache work this way. The task checks the choice of data structure: both operations must run in O(1).

## What to do

A class `LRUCache(capacity)`:

- `get(key)` returns the value or `undefined` and makes the entry the most recent;
- `set(key, value)` adds or updates an entry (an update also makes it the most recent); above `capacity` the least recent entry is removed;
- `size` returns the number of entries;
- keys of any type, objects included; any values, `null` included;
- `get` and `set` in O(1).

## Example

```ts
const cache = new LRUCache<string, number>(2)
cache.set('a', 1)
cache.set('b', 2)
cache.get('a')    // 1, a is now the most recent
cache.set('c', 3) // evicts b
cache.get('b')    // undefined
```

<!-- solution -->

## Solution idea

A `Map` iterates keys in insertion order. If every access deletes the entry and inserts it again, it ends up at the end, and the least recent one stays first. On overflow, delete `map.keys().next().value`. All `Map` operations are O(1) on average.

## Pitfalls

- **Updating an existing key.** `set` on an existing key without `delete` leaves the entry in its old place, and it gets evicted first.
- **Checking with `get`.** `if (map.get(key))` is wrong for `0`, `''` and `null` values; use `has`.
- **An array for the order.** `indexOf` and `splice` on an array of keys make each operation O(n).
- **Without an insertion-ordered `Map`** (in other languages, say) LRU is built from a hash table and a doubly linked list: the table finds the node, the list moves it to the head in O(1).

## What they ask next

- Add a time to live (TTL) for entries and a `delete` method.
- How to build an LFU cache and why it suits "hot" data better.
- How to implement LRU with a doubly linked list and why it uses dummy head and tail nodes.

## Why it matters

"Ann, Bob and 2 others liked this": such strings appear in any interface with lists of people. The task checks care with edge cases (0, 1, 2 items, a limit, the singular) and keeping the input intact.

## What to do

`formatList(items, options)` returns an English string:

- one item: `Ann`; two: `Ann and Bob`; more: `Ann, Bob and Eve`;
- empty and whitespace-only strings are skipped; an empty list gives `''`;
- `unique: true` removes repeats, `sorted: true` sorts alphabetically;
- `limit: n` shows the first `n` names and adds `and K other` or `and K others`; a limit not below the list length (or `0`) hides nothing;
- the input array is not changed.

## Example

```ts
formatList(['Ann', 'Bob', 'Eve', 'Max'], { limit: 2 }) // 'Ann, Bob and 2 others'
formatList(['Bob', 'Ann', 'Bob'], { unique: true, sorted: true }) // 'Ann and Bob'
```

<!-- solution -->

## Solution idea

First prepare the list: filter out empty strings, remove repeats with a `Set` if asked and sort a copy (`toSorted` with `localeCompare`). Then handle the cases: 0, 1, a limit below the length, and the general case with "and" before the last item.

## Pitfalls

- **`sort()` mutates the input.** Use `toSorted` or a copy.
- **Order of steps.** Uniqueness comes before the limit, otherwise repeats eat the visible slots.
- **"1 other" vs "2 others".** The singular is easy to forget.
- **In a real interface** the string is built with `Intl.ListFormat` and the count with `Intl.PluralRules`: other languages have other conjunctions, commas and plural forms.

## What they ask next

- How to localize the result with `Intl.ListFormat` and `Intl.PluralRules`.
- How to add an Oxford comma as an option.
- How to return parts instead of a string to render links to profiles.

## Why it matters

Component classes often depend on state: an `active` button, an `invalid` field, a `selected` card. Building that string with `+` and ternaries is clumsy and easily leaves stray spaces. That is why almost every project has a `classNames` helper (the `classnames` and `clsx` packages). Interviewers ask for it to check how you handle value types, recursion and edge cases.

## What to build

`classNames(...args)` takes any number of arguments and returns the classes separated by single spaces:

- a string or a number is added as is;
- an object adds its keys whose values are truthy;
- an array is processed by the same rules, nested to any depth;
- falsy values (`false`, `null`, `undefined`, `0`, `""`) and `true` are skipped;
- the result has no leading, trailing or double spaces.

## Example

```ts
classNames('btn', { active: isActive, disabled: false }, ['size-lg', null])
// isActive = true → 'btn active size-lg'
```

<!-- solution -->

## The idea

Walk the arguments, collect classes in an array and `join(' ')` at the end. Spaces then appear only between non-empty parts.

- First drop falsy values: `if (!arg) continue`. That removes `0`, the empty string, `null` and `undefined` at once.
- Turn strings and numbers into strings.
- Handle an array with a recursive `classNames(...arg)` call and add the result only when it is not empty. Otherwise an empty nested array would leave a double space.
- For an object take `Object.keys` and keep the keys with truthy values.

## Pitfalls

- `typeof arg === 'object'` is true for arrays and for `null`. Check arrays before objects, and drop `null` on the first line.
- `true` passes the falsy check but matches no branch, so it is silently skipped. The `classnames` package behaves the same way.
- Concatenating inside the loop (`result += ' ' + cls`) forces you to trim a leading space separately.

## Follow-up questions

- How `clsx` differs from `classnames`: a compatible replacement with the same API and a smaller size.
- How to type the arguments: a recursive `ClassValue` type, as in the task.
- Why Tailwind projects add `tailwind-merge` on top of `clsx`: it removes conflicting classes such as `p-2 p-4`.

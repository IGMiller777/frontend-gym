## Why it matters

Walking the DOM tree underlies selectors, virtualization, accessibility checks and testing tools. The task checks how you walk a tree (depth-first, in document order) and whether you know `children` and `classList`.

## What to do

`getElementsByClassName(root, classNames)` returns an array of the descendants of `root` that have **all** classes from the `classNames` string:

- classes in the string are separated by spaces; order and extra spaces do not matter;
- `root` itself is not included;
- document order: a parent before its children, siblings left to right;
- a class is compared whole, so `button` does not match `button-primary`;
- without `getElementsByClassName`, `querySelector` and `querySelectorAll`.

## Example

```ts
// <div id="root"><p class="item a"></p><span class="item"></span></div>
getElementsByClassName(root, 'a item') // [p]
```

<!-- solution -->

## Solution idea

Split the string into classes, then walk the tree depth-first over `element.children` (elements only, no text nodes). For each descendant check `classList.contains` for every class and add it to the result before descending into its children: that gives document order.

## Pitfalls

- **`childNodes` instead of `children`.** `childNodes` includes text nodes and comments, which have no `classList`.
- **Searching for a substring in `className`.** `className.includes('button')` finds `button-primary`; `classList` compares whole classes.
- **The root in the result.** The built-in method searches descendants only.
- **A live collection.** The built-in method returns a live `HTMLCollection` that changes with the DOM; an array is a snapshot.

## What they ask next

- Walk without recursion using `TreeWalker` or an explicit stack.
- Write `getElementsByTagName` and a simplified `querySelectorAll` for selectors like `div.item`.
- How a live `HTMLCollection` differs from the static `NodeList` of `querySelectorAll`.

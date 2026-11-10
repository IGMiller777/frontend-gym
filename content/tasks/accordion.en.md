## Why it matters

An accordion shows where the candidate keeps state: if every section has its own `useState`, "only one open" cannot be done without syncing them. It also shows whether they know the WAI-ARIA Authoring Practices markup: a heading with a button, `aria-expanded`, a link between the button and its panel.

## What to build

`<Accordion items={[{ title, content }]} />`:

- each section's header is a button with the `title` text inside an `<h3>`;
- all sections start closed, and a closed panel is hidden (`hidden`);
- a click opens a section and closes the previously open one; a second click closes it;
- the button has `aria-expanded` and `aria-controls` with the panel's id;
- the panel has `role="region"` and is labelled by its button through `aria-labelledby`.

`Demo` is already written: it is used by the preview and the tests.

<!-- solution -->

## Solution idea

One piece of state in the parent: the index of the open section, or `null`. A section is open if its index matches. A click does `setOpen(expanded ? null : i)`: it opens the new one (the old one closes by itself, since there is only one index) or closes the current one.

The ids for `aria-controls` and `aria-labelledby` are built from `useId()`: they are unique even with several accordions on the page, and they match between server rendering and hydration.

A closed panel stays in the DOM with the `hidden` attribute: it is invisible, it is out of the accessibility tree, and `aria-controls` always points to an existing element.

## Pitfalls

- **State in every section.** Sections do not know about each other, and closing a neighbour takes hacks.
- **`<div onClick>` instead of a button.** No keyboard focus, no Enter and Space, no role; you would have to add `tabIndex`, `role` and key handling.
- **Indexes as ids.** `id="panel-0"` breaks with two accordions on the page.

## Follow-up questions

- An "allow several open" mode: state becomes a `Set` of indexes (updated by copy).
- The native alternative: `<details name="faq">` with a shared `name` gives an exclusive accordion without JavaScript (Baseline since 2024).
- Controlled and uncontrolled versions: accept `open` and `onOpenChange` from outside.

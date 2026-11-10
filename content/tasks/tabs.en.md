## Why it matters

Tabs are a classic accessibility check in interviews: switching on click is easy, but the WAI-ARIA pattern needs roles, links between a tab and its panel, a "roving" `tabIndex` and arrow keys. Plus working with focus through refs.

## What to build

`<Tabs tabs={[{ label, content }]} />`:

- a tab container with `role="tablist"`; each tab is a button with `role="tab"` and `aria-selected`;
- a panel with `role="tabpanel"`, labelled by the selected tab (`aria-labelledby`), shows its content;
- **roving tabindex**: the selected tab has `tabIndex={0}`, the others `-1`, so Tab enters the tab list only once;
- a click selects a tab;
- Right and Left arrows select the neighbouring tab, wrapping around, and move focus to it; Home and End select the first and the last.

<!-- solution -->

## Solution idea

State is one index of the selected tab. To move focus you need the buttons' DOM nodes: an array in `useRef`, filled by ref callbacks (`ref={(node) => { refs.current[i] = node }}`). `select(i)` changes the state and calls `focus()` on the right button: focus is a user action, so it belongs in the handler, not in an effect.

One `onKeyDown` on the `tablist` handles the keys: the event bubbles up from the button. The `{ ArrowRight, ArrowLeft, Home, End }` table gives the next index, other keys pass through. `preventDefault()` keeps the arrows, Home and End from scrolling the page.

The ids for the links come from `useId()`. The panel can get `tabIndex={0}`: if it has no focusable elements, Tab from the tabs moves into the content.

## Pitfalls

- **Every tab in the Tab order.** Without roving tabindex a keyboard user has to go through all tabs before reaching the panel.
- **Arrows without focus.** The selection changes while focus stays on the old tab, and the next arrow counts from there.
- **Manual activation.** The APG pattern also has a variant where arrows only move focus and Enter or Space selects; automatic activation, as here, suits panels that show instantly.

## Follow-up questions

- How to keep the state of inactive panels: render all panels and hide them with the `hidden` attribute or `<Activity mode="hidden">`.
- Vertical tabs: `aria-orientation="vertical"` and Up and Down arrows.
- Tabs as routes: the selected tab in the URL (`?tab=specs`), so it can be opened by a link.

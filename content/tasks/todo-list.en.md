## Why it matters

A to-do list is the most common React live-coding task. It checks the basics: a controlled input, a form, immutable array updates and list keys. Interviewers also watch whether the candidate tells an index key from a real id.

## What to build

`<TodoList initial={['Milk']} />`:

- an input labelled "New task" and an "Add" button inside a form; submitting the form (with the button or Enter) adds a task and clears the input, without reloading the page;
- an empty value or a string of spaces is not added;
- each task is an `<li>` with a checkbox labelled with its text and a button with `aria-label="Delete <text>"`;
- under the list, an "N left" line: how many tasks are not checked;
- tasks with the same text are allowed and live independently.

## Tests

The tests render the component and act like a user: they find elements by role and label (`screen.getByRole('checkbox', { name: 'Milk' })`, `screen.getByLabelText('New task')`), type and click (`user.type`, `user.click`). On the right you can open a preview and try the component by hand.

<!-- solution -->

## Solution idea

State is an array of `{ id, title, done }` objects. The id comes from a counter, not from the index or the text: indexes shift on deletion, and texts can repeat. The initial list is turned into objects once, with a lazy initializer `useState(() => ...)`.

Adding is attached to the form's `onSubmit`, so both the button and Enter in the input work. `e.preventDefault()` cancels the page reload. Every change creates a new array: `[...list, item]`, `map` to toggle, `filter` to delete. The "left" counter is not stored in state but computed during render.

The checkbox is wrapped in a `<label>` together with the text, so it has an accessible name and a click on the text toggles it too. The delete button's visible text is "×", so `aria-label` gives it a name.

## Pitfalls

- **Index or text as the key.** With an index, after deleting the first task the checkmark "slides" to its neighbour; with the text, two "Milk" tasks get the same key.
- **Mutation.** `todo.done = !todo.done; setTodos(todos)` does not trigger a render: the array reference is the same.
- **A button without `type`.** Inside a form `<button>` defaults to `type="submit"`: delete buttons must be `type="button"`, otherwise each one submits the form.
- **Derived data in state.** A separate `useState` for the counter easily gets out of sync with the list.

## Follow-up questions

- How to keep the list across reloads (`localStorage`, read in the lazy initializer rather than an effect).
- How to add "all, active, done" filters (one more piece of state and a derived list).
- When to switch to `useReducer`: `added`, `toggled`, `deleted` actions in one pure reducer.

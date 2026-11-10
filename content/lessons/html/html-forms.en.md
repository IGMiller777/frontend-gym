## What this lesson covers

Forms are where a site receives user data, and where accessibility breaks most often. We cover field labels, `<input>` types, built-in validation and its API, form submission and `FormData`. The examples run in jsdom, which implements constraint validation by the spec.

## A label for every field

Every field needs a `<label>`: it gives the field an accessible name for screen readers and enlarges the click area (clicking the label focuses the field or toggles the checkbox). A `placeholder` is not a label: it disappears while typing and is usually too faint.

```html
<label for="email">Email</label>
<input id="email" name="email" type="email" autocomplete="email" required />

<label><input type="checkbox" name="terms" required /> I accept the terms</label>
```

Group related fields (radio buttons, an address) in a `<fieldset>` with a `<legend>`. The `autocomplete` attribute (`email`, `name`, `tel`, `street-address`, `one-time-code`, `new-password`) helps the browser and password managers fill the form.

## Field types

`type` changes the phone keyboard, the built-in check and the control:

| Type | What it gives |
|---|---|
| `email`, `url` | a format check, a keyboard with `@` or `/` |
| `number` | a number check, `min`, `max`, `step`; not for card numbers or postal codes |
| `tel` | a digit keyboard; **no format check at all** |
| `date`, `time`, `datetime-local` | a built-in date picker |
| `search` | a clear button, the `searchbox` role |
| `password` | hidden input; `autocomplete="new-password"` for sign-up |

Card numbers and SMS codes use `type="text"` with `inputmode="numeric"`: a digit keyboard without spinner arrows and without losing leading zeros.

## Built-in validation

The `required`, `minlength`, `maxlength`, `min`, `max`, `step` and `pattern` attributes and the `type` itself define constraints. The browser checks them on submit, shows a message and focuses the first invalid field. Every field's state is available through the **Constraint Validation API**: `validity` with its flags, `checkValidity()`, `reportValidity()`, `validationMessage`.

```js dom
document.body.innerHTML = `<form>
  <input id="email" type="email" required>
  <input id="phone" type="tel" pattern="[0-9]{10}">
  <input id="age" type="number" min="18" max="120" value="12">
</form>`
const email = document.querySelector("#email")
const phone = document.querySelector("#phone")
const age = document.querySelector("#age")
console.log("empty email:", email.validity.valueMissing)
email.value = "ada@"
console.log("ada@:", email.validity.typeMismatch)
phone.value = "12-34"
console.log("phone:", phone.validity.patternMismatch, "| age:", age.validity.rangeUnderflow)
console.log("form valid:", document.querySelector("form").checkValidity())
```

```output
empty email: true
ada@: true
phone: true | age: true
form valid: false
```

Custom rules are added with `setCustomValidity(message)`: a non-empty message makes the field invalid, an empty string clears the error. For example, "this login is taken" after a server check.

```js dom
document.body.innerHTML = `<input id="login" value="admin" required>`
const login = document.querySelector("#login")
login.setCustomValidity("This login is taken")
console.log(login.validity.customError, login.validity.valid, login.validationMessage)
login.setCustomValidity("")
console.log(login.validity.valid)
```

```output
true false This login is taken
true
```

Built-in messages differ between browsers and are not always accessible to screen readers, so products often show their own: `novalidate` on the form, checks through the API, and an error text next to the field linked with `aria-describedby`, with `aria-invalid="true"` on the field. The `:user-invalid` pseudo-class highlights an error only after the user has interacted with the field, not right on load like `:invalid`.

**Browser validation does not replace server validation**: it is bypassed by turning off JavaScript, editing the DOM, or sending a request directly.

## Submission and FormData

Without JavaScript, a form is sent to `action` with the `method`:

- `GET` puts the fields in the query string: good for search and filters, and the address can be saved and shared;
- `POST` puts the fields in the body: for changing data; files need `enctype="multipart/form-data"`.

Only fields **with a `name` attribute**, not `disabled`, and (for checkboxes and radios) checked are included.

```js dom
document.body.innerHTML = `<form>
  <input name="q" value="shoes">
  <input value="no name, not sent">
  <input name="sale" type="checkbox">
  <input name="size" type="checkbox" value="42" checked>
  <input name="token" value="x" disabled>
</form>`
const data = new FormData(document.querySelector("form"))
console.log([...data].map(([k, v]) => `${k}=${v}`).join("&"))
console.log(new URLSearchParams(data).toString())
```

```output
q=shoes&size=42
q=shoes&size=42
```

With JavaScript, handle the form's `submit` event (not the button's `click`: Enter in a field submits the form too), call `preventDefault()` and send `new FormData(form)` with `fetch`. `FormData` sets the `Content-Type` with a boundary for files itself, so do not set the header by hand.

## Key points

- Every field has a `<label>`; a `placeholder` is not a label; `autocomplete` enables autofill.
- `type` gives the keyboard and the check; `tel` has no check, cards and codes use `inputmode="numeric"`.
- Constraint Validation API: `validity`, `checkValidity()`, `setCustomValidity()`; `:user-invalid` after interaction.
- Form data includes fields with a `name`, not `disabled`, and checked checkboxes.
- Handle `submit`, not a click; nothing replaces server-side validation.

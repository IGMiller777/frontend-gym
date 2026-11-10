## О чём урок

Формы это место, где сайт получает данные пользователя, и место, где чаще всего ломается доступность. Здесь подписи полей, типы `<input>`, встроенная валидация и её API, отправка формы и `FormData`. Примеры выполняются в jsdom, который реализует проверку ограничений по спецификации.

## Подпись у каждого поля

Каждому полю нужен `<label>`: он даёт полю доступное имя, которое прочитает скринридер, и увеличивает область клика (клик по подписи ставит фокус в поле или переключает чекбокс). `placeholder` подписью не является: он исчезает при вводе и обычно слишком бледный.

```html
<label for="email">Email</label>
<input id="email" name="email" type="email" autocomplete="email" required />

<label><input type="checkbox" name="terms" required /> I accept the terms</label>
```

Группу связанных полей (радиокнопки, адрес) объединяют в `<fieldset>` с `<legend>`. Атрибут `autocomplete` (`email`, `name`, `tel`, `street-address`, `one-time-code`, `new-password`) помогает браузеру и менеджерам паролей заполнять форму.

## Типы полей

`type` меняет клавиатуру на телефоне, встроенную проверку и элемент управления:

| Тип | Что даёт |
|---|---|
| `email`, `url` | проверка формата, клавиатура с `@` или `/` |
| `number` | проверка числа, `min`, `max`, `step`; не подходит для номеров карт и индексов |
| `tel` | цифровая клавиатура; **никакой проверки формата нет** |
| `date`, `time`, `datetime-local` | встроенный выбор даты |
| `search` | крестик очистки, роль `searchbox` |
| `password` | скрытый ввод; `autocomplete="new-password"` для регистрации |

Для номера карты и кода из СМС используют `type="text"` с `inputmode="numeric"`: цифровая клавиатура без стрелок и без потери ведущих нулей.

## Встроенная проверка

Атрибуты `required`, `minlength`, `maxlength`, `min`, `max`, `step`, `pattern` и сам `type` задают ограничения. Браузер проверяет их при отправке, показывает сообщение и ставит фокус на первое неверное поле. Состояние каждого поля доступно через **Constraint Validation API**: `validity` с флагами, `checkValidity()`, `reportValidity()`, `validationMessage`.

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

Свои правила добавляют через `setCustomValidity(message)`: непустое сообщение делает поле неверным, пустая строка снимает ошибку. Например, «имя занято» после проверки на сервере.

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

Встроенные сообщения различаются в браузерах и не всегда доступны скринридерам, поэтому в продуктах часто показывают свои: `novalidate` на форме, проверка через API и текст ошибки рядом с полем, связанный через `aria-describedby`, с `aria-invalid="true"` на поле. Псевдокласс `:user-invalid` подсвечивает ошибку только после того, как пользователь взаимодействовал с полем, а не сразу при загрузке, как `:invalid`.

**Проверка в браузере не заменяет серверную**: её обходят отключением JavaScript, правкой DOM или прямым запросом.

## Отправка и FormData

Без JavaScript форма отправляется по `action` методом из `method`:

- `GET` кладёт поля в строку запроса: подходит для поиска и фильтров, адрес можно сохранить и отправить;
- `POST` кладёт поля в тело: для изменения данных; файлы требуют `enctype="multipart/form-data"`.

В данные попадают только поля **с атрибутом `name`**, не отключённые (`disabled`) и, для чекбоксов и радио, отмеченные.

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

С JavaScript перехватывают событие `submit` формы (а не `click` кнопки: Enter в поле тоже отправляет форму), вызывают `preventDefault()` и отправляют `new FormData(form)` через `fetch`. `FormData` сам выставит `Content-Type` с границей для файлов, поэтому заголовок вручную не задают.

## Главное

- У каждого поля `<label>`; `placeholder` не подпись; `autocomplete` для автозаполнения.
- `type` даёт клавиатуру и проверку; у `tel` проверки нет, для карт и кодов `inputmode="numeric"`.
- Constraint Validation API: `validity`, `checkValidity()`, `setCustomValidity()`; `:user-invalid` после взаимодействия.
- В данные формы попадают поля с `name`, без `disabled`, отмеченные чекбоксы.
- Перехватывают `submit`, а не клик; проверку на сервере ничто не заменяет.

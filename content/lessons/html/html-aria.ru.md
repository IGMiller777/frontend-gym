## О чём урок

ARIA (WAI-ARIA, актуальная версия 1.2) это атрибуты, которые сообщают вспомогательным технологиям роль, состояние и связи элемента, когда HTML этого сам не умеет: вкладки, комбобоксы, деревья, всплывающие меню. ARIA ничего не меняет в поведении: не делает элемент фокусируемым и не добавляет обработку клавиш. Поэтому неправильная ARIA хуже, чем никакой.

## Первое правило ARIA

Если есть нативный элемент с нужной семантикой и поведением, используйте его. `<button>` вместо `<div role="button" tabindex="0">` с обработчиками Enter и пробела, `<input type="checkbox">` вместо `role="checkbox"`, `<dialog>` вместо самодельного окна. ARIA нужна для того, чего в HTML нет.

## Роли, состояния и свойства

- **Роль** (`role`) говорит, что это: `tab`, `tablist`, `tabpanel`, `menu`, `combobox`, `switch`, `alert`, `dialog`.
- **Состояния** меняются по ходу работы: `aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed`, `aria-disabled`, `aria-hidden`.
- **Свойства** чаще постоянны и описывают связи: `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-haspopup`, `aria-required`.

Состояние обязано совпадать с реальностью: если меню открыто, `aria-expanded="true"`. Синхронизацию делает ваш JavaScript.

```js dom
import { computeAccessibleName, computeAccessibleDescription, getRole } from "dom-accessibility-api"
document.body.innerHTML = `
  <button id="toggle" aria-expanded="false" aria-controls="menu">Account</button>
  <ul id="menu" hidden><li><a href="/profile">Profile</a></li></ul>
  <label for="pass">Password</label>
  <input id="pass" type="password" aria-describedby="pass-hint" aria-invalid="true">
  <p id="pass-hint">At least 12 characters</p>`
const toggle = document.querySelector("#toggle")
const menu = document.querySelector("#menu")
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true"
  toggle.setAttribute("aria-expanded", String(!open))
  menu.hidden = open
})
toggle.click()
console.log(getRole(toggle), computeAccessibleName(toggle), "expanded:", toggle.getAttribute("aria-expanded"), "menu hidden:", menu.hidden)
const pass = document.querySelector("#pass")
console.log(computeAccessibleName(pass), "|", computeAccessibleDescription(pass))
```

```output
button Account expanded: true menu hidden: false
Password | At least 12 characters
```

## Готовые паттерны

Для сложных виджетов не придумывают свою клавиатурную схему: её описывает **ARIA Authoring Practices Guide** (APG) от W3C. Например, вкладки:

- контейнер `role="tablist"`, кнопки `role="tab"` с `aria-selected` и `aria-controls`, панели `role="tabpanel"` с `aria-labelledby`;
- Tab попадает только на активную вкладку, стрелки влево и вправо переключают вкладки (так называемый roving tabindex: у активной `tabindex="0"`, у остальных `-1`);
- Home и End переходят к первой и последней.

В приложениях на фреймворках эти паттерны обычно берут из готовых библиотек доступных компонентов (Radix, React Aria, Angular CDK, Headless UI), а не пишут с нуля.

## Живые области

Изменения на странице, которые происходят без перемещения фокуса (сохранено, ошибка загрузки, найдено 5 результатов), скринридер сам не заметит. Для этого служат живые области:

- `role="status"` (то же, что `aria-live="polite"`): прочитать, когда пользователь освободится;
- `role="alert"` (`aria-live="assertive"`): прервать и прочитать сразу, только для срочного.

Контейнер живой области должен **уже быть** в DOM до изменения текста: если вставить его вместе с сообщением, многие скринридеры ничего не скажут.

```html
<div role="status" class="visually-hidden" id="announcer"></div>
<script>
  function announce(text) {
    document.getElementById("announcer").textContent = text
  }
</script>
```

## aria-hidden и его ловушки

`aria-hidden="true"` убирает элемент и всё его содержимое из дерева доступности, но **не** из порядка Tab и не со страницы. Если внутри есть фокусируемые элементы, клавиатура попадёт на кнопку, о которой скринридер ничего не скажет. Это ошибка доступности. Чтобы скрыть часть страницы целиком (фон под модальным окном), используют атрибут `inert`: он убирает элементы и из дерева доступности, и из фокуса, и из кликов.

| Нужно | Чем |
|---|---|
| Скрыть от всех | `hidden` или `display: none` |
| Скрыть только визуально | класс `visually-hidden` |
| Скрыть только от скринридера (декоративная иконка) | `aria-hidden="true"` на нефокусируемом элементе |
| Отключить целый блок (фон модалки) | `inert` |

## Главное

- Сначала нативный HTML; ARIA только для того, чего в HTML нет.
- ARIA не добавляет поведения: фокус и клавиши пишет ваш код, состояния синхронизирует он же.
- Сложные виджеты делают по паттернам APG или берут из библиотек доступных компонентов.
- Живые области `status` и `alert` должны существовать до появления сообщения.
- `aria-hidden` не убирает элемент из фокуса; для фона модалки нужен `inert`.

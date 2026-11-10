## О чём урок

За последние годы в CSS появилось то, ради чего раньше брали препроцессоры и JavaScript: вложенность, переменные с типами, выбор родителя, запросы к контейнеру, смешивание цветов и тёмная тема одной строкой. Всё это уже работает во всех основных браузерах. Здесь основное, что стоит знать на собеседовании и использовать в новом коде.

## Пользовательские свойства

CSS-переменные (`--brand: #7c3aed`) наследуются вниз по дереву, их можно переопределять в любом селекторе, медиазапросе и из JavaScript (`el.style.setProperty("--brand", "red")`), а `var(--brand, fallback)` берёт запасное значение. В отличие от переменных Sass, они живут во время выполнения: смена значения сразу перекрашивает всё, что их использует.

`@property` регистрирует переменную с типом, начальным значением и наследованием. Типизированную переменную браузер умеет **анимировать**, а неверное значение отбрасывает:

```css
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
.spinner {
  background: conic-gradient(from var(--angle), #7c3aed, #db2777, #7c3aed);
  animation: spin 2s linear infinite;
}
@keyframes spin {
  to { --angle: 360deg; }
}
```

## Цвет и темы

- `color-mix(in oklab, var(--brand) 20%, transparent)` смешивает цвета прямо в CSS: оттенки, полупрозрачные варианты, ховеры без отдельных переменных.
- `oklch()` задаёт цвет в перцептивно равномерном пространстве: одинаковая светлота действительно выглядит одинаково яркой, и палитры с ровным контрастом строить проще.
- Свойство `color-scheme: light dark` сообщает браузеру, какие схемы поддерживает страница: он сам окрасит полосы прокрутки, поля форм и фон по умолчанию.
- Функция `light-dark(#111, #eee)` возвращает первое значение для светлой схемы и второе для тёмной.

```css
:root {
  color-scheme: light dark;
  --bg: light-dark(#ffffff, #0d0a22);
  --ink: light-dark(#17153a, #f4f2ff);
}
```

Медиа-функция `prefers-color-scheme` сообщает настройку системы; `color-scheme` и `light-dark()` строятся поверх неё, а для ручного переключателя темы схему задают атрибутом на `<html>`.

## Вложенность

Нативная вложенность работает как в Sass: `&` ссылается на родителя, вложенные `@media` и `@container` допустимы.

```css
.card {
  padding: 1rem;
  & .title { font-weight: 600; }
  &:hover { box-shadow: var(--shadow); }
  @media (width >= 48rem) {
    padding: 2rem;
  }
}
```

Отличие от Sass: склейка строк вида `&__title` не работает, `&` это селектор, а не текст.

## :has()

`:has()` выбирает элемент по тому, что у него внутри или после него: тот самый «селектор родителя».

```css
/* a card with an image gets two columns */
.card:has(> img) { grid-template-columns: 8rem 1fr; }

/* a field row with an invalid input */
.field:has(input:user-invalid) { --border: var(--danger); }

/* no scrolling behind an open modal */
body:has(dialog[open]) { overflow: hidden; }
```

## Запросы к контейнеру

Медиазапрос спрашивает ширину окна, а компоненту важна ширина места, куда его поставили. Container queries спрашивают размер ближайшего предка-контейнера:

```css
.card-list { container-type: inline-size; }

@container (inline-size > 30rem) {
  .card { flex-direction: row; }
}
```

- `container-type: inline-size` делает элемент контейнером по ширине (по умолчанию `normal`: не контейнер для размеров), `size` по обоим измерениям;
- `container-name` позволяет обращаться к конкретному контейнеру: `@container sidebar (…)`;
- единицы `cqi` и `cqb` это 1% размера контейнера;
- **style queries** `@container style(--variant: compact)` спрашивают значение CSS-переменной контейнера.

## Медиазапросы сегодня

- Синтаксис диапазонов: `@media (48rem <= width < 64rem)` вместо `min-width` и `max-width`.
- Mobile-first: базовые стили для узкого экрана, `min-width` или `width >=` добавляют сложность для широких.
- Предпочтения пользователя: `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`, `forced-colors` (режим высокой контрастности Windows).
- Возможности ввода: `(hover: hover)` и `(pointer: coarse)` вместо проверки ширины, чтобы понять, есть ли мышь.

## Главное

- CSS-переменные живут во время выполнения; `@property` добавляет тип и анимацию.
- `color-mix()`, `oklch()`, `color-scheme` и `light-dark()` закрывают оттенки и тёмную тему без JS.
- Нативная вложенность с `&`; склейки строк, как в Sass, нет.
- `:has()` выбирает по содержимому; container queries адаптируют компонент к его месту, style queries смотрят на переменные.
- Медиазапросы с диапазонами, mobile-first и проверкой `hover` и `pointer`.

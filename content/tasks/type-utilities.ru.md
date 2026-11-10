## Зачем это нужно

`typeof` в JavaScript врёт в двух местах: `typeof null === "object"` и `typeof [] === "object"`. Утилиты проверки типов есть в каждой библиотеке (lodash, валидаторы, сериализаторы), а `isPlainObject` нужен везде, где обычный объект обходят рекурсивно, а экземпляры классов и даты оставляют как есть.

## Что сделать

- `isArray(value)`: массив, включая массивы из других окон и iframe.
- `isFunction(value)`: любая функция, включая классы, асинхронные функции и генераторы.
- `isObject(value)`: объект или функция, но не `null`.
- `isPlainObject(value)`: объект, созданный литералом `{}`, `new Object()` или `Object.create(null)`; массивы, даты и экземпляры классов не подходят.

## Пример

```ts
isObject(null)              // false
isObject(() => {})          // true
isPlainObject({ a: 1 })     // true
isPlainObject(new Date())   // false
isPlainObject(Object.create(null)) // true
```

<!-- solution -->

## Идея решения

`Array.isArray` и `typeof value === 'function'` покрывают первые две проверки. Для `isObject` исключаем `null` и проверяем `typeof` на `object` или `function`. Для `isPlainObject` смотрим прототип: обычный объект имеет прототип `Object.prototype` или `null`.

## Подводные камни

- **`instanceof Array` ломается между окнами.** У массива из iframe свой `Array`, поэтому `arr instanceof Array` даёт `false`; `Array.isArray` работает.
- **`Object.prototype.toString.call(x) === "[object Object]"`** считает обычным объектом и экземпляры классов, а `Symbol.toStringTag` может подделать результат.
- **Объекты-обёртки.** `new String('x')` это объект, но не обычный.

## Что спросят дальше

- Как отличить `NaN` от остальных чисел и почему `isNaN` и `Number.isNaN` разные.
- Как TypeScript делает из таких функций сужение типа (`value is unknown[]`).
- Как проверить, что значение похоже на промис (thenable).

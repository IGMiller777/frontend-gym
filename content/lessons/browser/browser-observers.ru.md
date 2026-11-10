## О чём урок

Раньше, чтобы узнать, что элемент появился на экране, изменил размер или в DOM что-то добавили, слушали `scroll` и `resize` или опрашивали страницу таймером. Сейчас для этого есть четыре наблюдателя: `MutationObserver`, `IntersectionObserver`, `ResizeObserver` и `PerformanceObserver`. Они асинхронны, собирают изменения пачками и не заставляют пересчитывать layout на каждый пиксель прокрутки.

## Общая схема

У всех четырёх одинаковая форма: колбэк получает массив записей, `observe` начинает наблюдение, `disconnect` прекращает всё сразу. У `IntersectionObserver` и `ResizeObserver` есть ещё `unobserve(el)` для одного элемента, а у `MutationObserver`, `IntersectionObserver` и `PerformanceObserver` метод `takeRecords()` забирает накопленные записи без колбэка.

## MutationObserver

Следит за изменениями DOM: добавлением и удалением узлов (`childList`), атрибутами (`attributes`), текстом (`characterData`), во всём поддереве (`subtree`). Колбэк вызывается **микрозадачей**: после текущего синхронного кода, одним вызовом на все изменения сразу.

```js dom
document.body.innerHTML = `<ul id="list"></ul>`
const list = document.querySelector("#list")
const observer = new MutationObserver((records) => {
  const added = records.flatMap((r) => [...r.addedNodes]).length
  console.log("callback: records", records.length, "added", added)
})
observer.observe(list, { childList: true, attributes: true })
list.append(document.createElement("li"))
list.append(document.createElement("li"))
list.setAttribute("data-state", "ready")
console.log("sync code done")
```

```output
sync code done
callback: records 3 added 2
```

Применения: реакция на разметку, которую вставляет чужой скрипт, редакторы, тестовые утилиты. Стили и свойства (`el.value`) он не видит, только DOM и атрибуты.

## IntersectionObserver

Сообщает, когда элемент входит в область видимости корня (по умолчанию окна) или выходит из неё. Опции задаются в конструкторе: `root`, `rootMargin` (расширить область, чтобы начать загрузку заранее), `threshold` (доля видимости от 0 до 1, можно массивом).

```js
const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      loadMore()
      io.unobserve(entry.target)
    }
  },
  { rootMargin: "200px", threshold: 0 },
)
io.observe(document.querySelector("#sentinel"))
```

Типичные задачи: бесконечная лента (наблюдать за «маяком» в конце списка), аналитика показов, запуск анимации при появлении. Для ленивой загрузки картинок и `iframe` JavaScript не нужен: достаточно атрибута `loading="lazy"`.

## ResizeObserver

Сообщает об изменении размеров конкретного элемента, а не окна: подходит для графиков, текстовых полей и компонентов, которые подстраиваются под контейнер. Какой бокс измерять, задают **во втором аргументе `observe`**: `observe(el, { box: "border-box" })`. В записи есть `contentBoxSize` и `borderBoxSize` (массивы, по элементу на фрагмент) и `contentRect`, оставленный для совместимости.

```js
const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { inlineSize } = entry.contentBoxSize[0]
    chart.resize(inlineSize)
  }
})
ro.observe(container, { box: "content-box" })
```

Колбэк выполняется после layout и перед paint. Если внутри колбэка менять размер наблюдаемого элемента, браузер обработает новые изменения в том же кадре лишь ограниченно и сообщит в консоль «ResizeObserver loop completed with undelivered notifications». Для подстройки вёрстки под контейнер чаще хватает CSS container queries без JavaScript.

## PerformanceObserver

Получает записи из шкалы производительности: `largest-contentful-paint`, `layout-shift`, `event`, `longtask`, `resource`, свои `mark` и `measure`. Флаг `buffered: true` (отдать записи, появившиеся до подписки) работает только с опцией `type`, по одному типу на вызов. С `entryTypes` он игнорируется.

```js
new PerformanceObserver((list) => {
  const last = list.getEntries().at(-1)
  sendMetric("LCP", last.startTime)
}).observe({ type: "largest-contentful-paint", buffered: true })
```

На практике метрики Core Web Vitals собирают библиотекой `web-vitals`, которая учитывает множество тонкостей.

## Главное

- `MutationObserver`: изменения DOM и атрибутов, колбэк микрозадачей, одним вызовом на пачку.
- `IntersectionObserver`: видимость элемента; опции в конструкторе; для картинок хватает `loading="lazy"`.
- `ResizeObserver`: размеры элемента, бокс задаётся в `observe(el, { box })`; изменение размера в колбэке ведёт к ошибке цикла.
- `PerformanceObserver`: метрики; `buffered` работает только с `type`.
- `disconnect` останавливает всё; не забывайте отключать наблюдатели при удалении компонента.

## О чём урок

Как выполнить код позже, в нужный момент кадра или в фоне, не мешая пользователю: таймеры, `requestAnimationFrame`, `requestIdleCallback`, разбиение долгих задач и Web Workers. Это мост между [циклом событий](/learn/async-event-loop) и производительностью интерфейса.

## Таймеры

`setTimeout(fn, ms)` обещает «не раньше, чем через `ms`», а не «ровно через». Колбэк встанет в очередь задач после истечения времени и подождёт, пока освободится стек и разберутся микрозадачи.

- Начиная с пятого уровня вложенности (таймер, поставленный из таймера, и так далее) браузеры поднимают задержку минимум до 4 мс.
- Во вкладках в фоне таймеры замедляются до запуска не чаще раза в секунду, а Chrome при долгом простое ещё сильнее. Таймер не годится для точного отсчёта времени: считайте прошедшее время по `performance.now()` или `Date.now()`.
- `setTimeout` и `setInterval` возвращают идентификатор; остановка через `clearTimeout` и `clearInterval`.

`setInterval` ставит вызовы по расписанию, не дожидаясь окончания предыдущего. Если работа может занять больше интервала (например, опрос сервера), используйте цепочку `setTimeout`: следующий запуск планируется после окончания текущего.

```js run
let runs = 0
function poll() {
  runs++
  if (runs < 3) setTimeout(poll, 5)
  else console.log("polled", runs, "times, never overlapping")
}
poll()
```

```output
polled 3 times, never overlapping
```

## requestAnimationFrame

`requestAnimationFrame(cb)` вызывает `cb` перед отрисовкой следующего кадра и передаёт время кадра. Частота подстраивается под экран (60, 120 Гц и т. д.), а в фоновой вкладке вызовы останавливаются. Это правильный инструмент для анимаций на JavaScript: анимация через `setTimeout(..., 16)` рассинхронизируется с экраном и даёт рывки.

```js
function animate(el, from, to, duration) {
  const start = performance.now()
  requestAnimationFrame(function frame(now) {
    const t = Math.min((now - start) / duration, 1)
    el.style.transform = `translateX(${from + (to - from) * t}px)`
    if (t < 1) requestAnimationFrame(frame)
  })
}
```

Для простых переходов лучше CSS-анимации и transitions на `transform` и `opacity`: браузер может выполнить их без главного потока.

## requestIdleCallback

`requestIdleCallback(cb, { timeout })` вызывает `cb`, когда у браузера есть свободное время между кадрами. В колбэк приходит `deadline`: `deadline.timeRemaining()` говорит, сколько миллисекунд осталось. Подходит для низкоприоритетной работы: аналитика, предзагрузка, прогрев кэша. В Safari этого API пока нет, поэтому нужна проверка и запасной вариант через `setTimeout`.

## Долгие задачи

Задача дольше 50 мс считается долгой: пока она идёт, клики и ввод ждут, и страница кажется зависшей. Решение это разбить работу на части и между частями отдавать управление браузеру, чтобы он успел обработать ввод и нарисовать кадр.

```js
async function processAll(items) {
  for (const [i, item] of items.entries()) {
    process(item)
    if (i % 50 === 0) await yieldToMain()
  }
}
const yieldToMain = () =>
  globalThis.scheduler?.yield ? scheduler.yield() : new Promise((r) => setTimeout(r, 0))
```

`scheduler.yield()` есть в Chrome (с версии 129) и Firefox (с 142); в Safari его пока нет, отсюда запасной вариант. Отдать управление через `await Promise.resolve()` не получится: это микрозадача, и браузер не успеет ничего сделать между частями.

## Web Workers

Если работа тяжёлая сама по себе (разбор большого файла, обработка изображения, шифрование), её переносят в **Web Worker**: отдельный поток со своим циклом событий. У воркера нет доступа к DOM, `window` и `document`, зато есть `fetch`, таймеры, промисы, IndexedDB и WebSocket.

```js
// main.js
const worker = new Worker(new URL("./parse.worker.js", import.meta.url), { type: "module" })
worker.postMessage(file)
worker.onmessage = (e) => render(e.data)

// parse.worker.js
self.onmessage = async (e) => {
  const text = await e.data.text()
  self.postMessage(parse(text))
}
```

Данные между потоками копируются алгоритмом structured clone, это стоит времени на больших объектах. `ArrayBuffer` и некоторые другие объекты можно не копировать, а **передать** (transfer): `worker.postMessage(buffer, [buffer])`. После передачи исходный буфер становится пустым.

```js run
const buffer = new ArrayBuffer(1024)
const { port1, port2 } = new MessageChannel()
port2.onmessage = (e) => {
  console.log("received bytes:", e.data.byteLength)
  port1.close()
  port2.close()
}
port1.postMessage(buffer, [buffer])
console.log("sender keeps:", buffer.byteLength)
```

```output
sender keeps: 0
received bytes: 1024
```

**Service Worker** это другой вид воркера: он живёт отдельно от страниц, перехватывает их сетевые запросы (`fetch`-событие), работает с Cache API и получает push-уведомления. Его используют для офлайн-режима и PWA, а не для тяжёлых вычислений.

## Главное

- `setTimeout` это «не раньше чем»: задержки поднимаются при вложенности и в фоновых вкладках.
- Опрос сервера пишут цепочкой `setTimeout`, а не `setInterval`.
- Анимации на JavaScript через `requestAnimationFrame`, фоновая мелочь через `requestIdleCallback` (с запасным вариантом).
- Долгие задачи дробят и отдают управление через `scheduler.yield()` или `setTimeout`, не через микрозадачи.
- Тяжёлые вычисления выносят в Web Worker; большие буферы передают, а не копируют.

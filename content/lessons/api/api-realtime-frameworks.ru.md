## О чём урок

Как подключить поток событий к React, Angular и Vue так, чтобы не открывать сокет на каждый компонент, не терять подписки при переподключении и не перерисовывать всё приложение на каждое сообщение: общий сервис с подписками по темам и подсчётом подписчиков, `useSyncExternalStore` в React, события в кэше TanStack Query, `webSocket` из RxJS с `multiplex`, `retry` и `repeat` и `toSignal` в Angular, composable и VueUse в Vue. Примеры выполняются в jsdom и Node.js на React 19, Angular 22, RxJS 7.8, TanStack Query 5 и MSW 3 вместо сервера.

## Общая схема

```mermaid
flowchart TD
  WS["Сервис соединения: один сокет,<br/>переподключение, heartbeat"] --> T["Подписки по темам:<br/>BTC, ETH, orders:7"]
  T --> ST["Хранилище или кэш:<br/>store, TanStack Query, сигнал"]
  ST --> C1["Компонент: цена BTC"]
  ST --> C2["Компонент: график BTC"]
  ST --> C3["Компонент: цена ETH"]
  C1 -.->|"подписался, отписался"| T
```

- **Одно соединение на приложение.** Сокет в каждом компоненте значит десятки соединений, повторные подписки и рассинхронизацию. Соединение живёт в модуле или сервисе.
- **Подписки по темам с подсчётом**: первая подписка на тему отправляет серверу `subscribe`, последняя отписка отправляет `unsubscribe`; когда подписчиков не осталось, соединение можно закрыть.
- **После переподключения** все активные темы подписываются заново, и состояние догоняется (урок `api-websocket`).
- **Данные идут в хранилище**, а компоненты читают из него точечно: сообщение о BTC не должно перерисовывать компонент ETH.

## React: useSyncExternalStore

```tsx dom
import { act, useCallback, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import { setupServer } from 'msw/node'
import { ws } from 'msw/ws'

// A fake price server: logs what the client asks for.
const feed = ws.link('wss://prices.example.com')
let connections = 0
const serverLog: string[] = []
const server = setupServer(
  feed.addEventListener('connection', ({ client }) => {
    connections++
    client.addEventListener('message', (e) => serverLog.push(`server got ${e.data}`))
    client.addEventListener('close', () => serverLog.push('server: client disconnected'))
  }),
)
server.listen({ onUnhandledFrame: 'error' })

// prices.ts: one socket for the whole app, opened by the first subscriber, closed after the last.
const prices = new Map<string, number>()
const listeners = new Map<string, Set<() => void>>()
let socket: WebSocket | null = null

const send = (msg: object) => socket?.readyState === WebSocket.OPEN && socket.send(JSON.stringify(msg))

function subscribe(topic: string, onChange: () => void) {
  if (!listeners.has(topic)) {
    listeners.set(topic, new Set())
    send({ type: 'subscribe', topic })
  }
  listeners.get(topic)!.add(onChange)
  if (!socket) {
    socket = new WebSocket('wss://prices.example.com')
    socket.onopen = () => listeners.forEach((_, t) => send({ type: 'subscribe', topic: t })) // (re)subscribe everything
    socket.onmessage = (e) => {
      const { topic: t, price } = JSON.parse(e.data)
      prices.set(t, price)
      listeners.get(t)?.forEach((notify) => notify())
    }
  }
  return () => {
    const set = listeners.get(topic)!
    set.delete(onChange)
    if (set.size === 0) {
      listeners.delete(topic)
      send({ type: 'unsubscribe', topic })
    }
    if (listeners.size === 0) {
      socket?.close(1000)
      socket = null
    }
  }
}

function usePrice(topic: string) {
  const sub = useCallback((onChange: () => void) => subscribe(topic, onChange), [topic])
  return useSyncExternalStore(sub, () => prices.get(topic))
}

const renders: Record<string, number> = {}
function Ticker({ topic, id }: { topic: string; id: string }) {
  const price = usePrice(topic)
  renders[id] = (renders[id] ?? 0) + 1
  return <li>{topic}: {price ?? '…'}</li>
}

const el = document.createElement('ul')
const root = createRoot(el)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const until = async (check: () => boolean) => { for (let i = 0; i < 500 && !check(); i++) await sleep(10) } // wait for a condition, at most 5 s
await act(() =>
  root.render(
    <>
      <Ticker topic="BTC" id="header" />
      <Ticker topic="BTC" id="chart" />
      <Ticker topic="ETH" id="sidebar" />
    </>,
  ),
)
await act(() => until(() => serverLog.length === 2)) // both topics subscribed
feed.broadcast(JSON.stringify({ topic: 'BTC', price: 101_500 }))
await act(() => until(() => el.textContent!.includes('101500')))
console.log([...el.querySelectorAll('li')].map((li) => li.textContent).join(', '), '| connections:', connections, '| renders:', JSON.stringify(renders))

await act(() => root.unmount())
await until(() => serverLog.length === 5)
console.log(serverLog.join('\n'))
server.close()
```

```output
BTC: 101500, BTC: 101500, ETH: … | connections: 1 | renders: {"header":2,"chart":2,"sidebar":1}
server got {"type":"subscribe","topic":"BTC"}
server got {"type":"subscribe","topic":"ETH"}
server got {"type":"unsubscribe","topic":"BTC"}
server got {"type":"unsubscribe","topic":"ETH"}
server: client disconnected
```

- Три компонента, **одно** соединение и по одной подписке на тему: второй `Ticker` для BTC присоединился к уже открытой теме.
- `useSyncExternalStore(subscribe, getSnapshot)` это официальный способ читать внешний источник: React вызывает `subscribe` при монтировании и функцию отписки при размонтировании, а `getSnapshot` читает текущее значение. Значение одинаково для всех компонентов в одном рендере (нет «разрыва», tearing, при конкурентном рендеринге).
- Сообщение о BTC перерисовало только два компонента BTC: `sidebar` с ETH отрисован один раз.
- `subscribe` обёрнут в `useCallback` по теме: новая функция на каждый рендер заставила бы React переподписываться.
- После размонтирования последнего компонента ушли `unsubscribe` и закрытие соединения.

Тот же сервис можно держать в Zustand (урок `state-zustand-jotai`), но с защитой от повторного подключения. В варианте из заметок `connect()` при каждом вызове создаёт новый сокет, а старый остаётся открытым:

```ts
connect: () => {
  if (ws && ws.readyState <= WebSocket.OPEN) return // CONNECTING (0) or OPEN (1): already connected
  ws = new WebSocket(url)
  // ...
},
```

## События в кэше запросов

Если данные экрана уже загружены через TanStack Query (или RTK Query, Apollo), сокет не заводит второе хранилище, а **обновляет кэш**:

```ts run
import { QueryClient, QueryObserver } from '@tanstack/query-core'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw/http'
import { ws } from 'msw/ws'

let order = { id: 7, status: 'paid', items: 3 }
let fetches = 0
const events = ws.link('wss://api.example.com/events')
const server = setupServer(
  http.get('https://api.example.com/orders/7', () => (fetches++, HttpResponse.json(order))),
  events.addEventListener('connection', () => {}),
)
server.listen({ onUnhandledFrame: 'error' })

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, gcTime: Infinity } } })
const observer = new QueryObserver(queryClient, {
  queryKey: ['orders', 7],
  queryFn: () => fetch('https://api.example.com/orders/7').then((r) => r.json()),
})
let shown: unknown
observer.subscribe(({ data }) => {
  if (data && data !== shown) console.log('UI shows:', JSON.stringify((shown = data)), `(fetches: ${fetches})`)
})

// One socket for the app; events go into the query cache, components keep using useQuery.
const socket = new WebSocket('wss://api.example.com/events')
socket.onmessage = (e) => {
  const event = JSON.parse(e.data)
  if (event.type === 'order.status') {
    // the event carries the change: patch the cache, no request
    queryClient.setQueryData(['orders', event.id], (old: typeof order | undefined) => old && { ...old, status: event.status })
  } else if (event.type === 'order.changed') {
    // the event is only a signal: refetch what is on screen
    queryClient.invalidateQueries({ queryKey: ['orders', event.id] })
  }
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const until = async (check: () => boolean) => { for (let i = 0; i < 500 && !check(); i++) await sleep(10) } // wait for a condition, at most 5 s
await until(() => socket.readyState === WebSocket.OPEN && fetches === 1)

events.broadcast(JSON.stringify({ type: 'order.status', id: 7, status: 'shipped' }))
await until(() => (shown as typeof order).status === 'shipped')
order = { ...order, status: 'shipped', items: 4 } // changed on the server by someone else
events.broadcast(JSON.stringify({ type: 'order.changed', id: 7 }))
await until(() => (shown as typeof order).items === 4)
socket.close()
server.close()
```

```output
UI shows: {"id":7,"status":"paid","items":3} (fetches: 1)
UI shows: {"id":7,"status":"shipped","items":3} (fetches: 1)
UI shows: {"id":7,"status":"shipped","items":4} (fetches: 2)
```

```mermaid
flowchart TD
  E{"Событие от сервера"} -->|"несёт изменение:<br/>status: shipped"| SET["setQueryData:<br/>поправить кэш без запроса"]
  E -->|"только сигнал:<br/>order 7 changed"| INV["invalidateQueries:<br/>перезапросить, если на экране"]
  SET --> UI["useQuery в компонентах<br/>получает новые данные"]
  INV --> UI
```

- **Событие с данными** кладут в кэш через `setQueryData`: интерфейс обновился без запроса (`fetches: 1`).
- **Событие-сигнал** («заказ 7 изменился») вызывает `invalidateQueries`: данные перезапрашиваются, только если запрос сейчас на экране, иначе при следующем показе. Сигналы проще и надёжнее: сервер не обязан присылать полные объекты, а клиент получает данные в той же форме, что и обычный ответ.
- Компоненты по-прежнему используют `useQuery`, и неважно, откуда пришло обновление.
- При переподключении сокета разумно инвалидировать активные запросы: за время обрыва события могли потеряться.

## Angular: RxJS webSocket и сигналы

```ts run
import { Injectable, Injector } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { webSocket } from 'rxjs/webSocket'
import { map, repeat, retry, timer } from 'rxjs'
import { setupServer } from 'msw/node'
import { ws } from 'msw/ws'

const feed = ws.link('wss://prices.example.com')
let connections = 0
const subscribes: string[] = []
const server = setupServer(
  feed.addEventListener('connection', ({ client }) => {
    connections++
    client.addEventListener('message', (e) => {
      console.log('server got', String(e.data))
      subscribes.push(JSON.parse(String(e.data)).type)
    })
    if (connections === 1) setTimeout(() => client.close(1012, 'restart'), 30) // the server restarts
  }),
)
server.listen({ onUnhandledFrame: 'error' })

type Msg = { type: 'subscribe' | 'unsubscribe'; topic: string } | { topic: string; price: number }

@Injectable({ providedIn: 'root' })
class PriceService {
  // One WebSocketSubject: every subscriber shares one connection while at least one is subscribed.
  private readonly socket$ = webSocket<Msg>('wss://prices.example.com')

  private topic(topic: string) {
    return this.socket$
      .multiplex(
        () => ({ type: 'subscribe', topic }), // sent when the first subscriber arrives
        () => ({ type: 'unsubscribe', topic }), // sent when the last one leaves
        (msg) => msg.topic === topic && 'price' in msg,
      )
      .pipe(
        map((msg) => (msg as { price: number }).price),
        retry({ delay: (_error, attempt) => timer(Math.min(30_000, 10 * 2 ** attempt)) }), // a drop is an error
        repeat({ delay: () => timer(10) }), // a clean close by the server completes the stream: start again
      )
  }

  // toSignal subscribes now and unsubscribes when the injector is destroyed.
  readonly btc = toSignal(this.topic('BTC'))
}

const injector = Injector.create({ providers: [PriceService] })
const prices = injector.get(PriceService)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const until = async (check: () => boolean) => { for (let i = 0; i < 500 && !check(); i++) await sleep(10) } // wait for a condition, at most 5 s

await until(() => connections === 2 && subscribes.length === 2) // the first connection dies, a second one subscribes again
feed.broadcast(JSON.stringify({ topic: 'BTC', price: 101_500 }))
feed.broadcast(JSON.stringify({ topic: 'ETH', price: 3_900 })) // filtered out
await until(() => prices.btc() !== undefined)
console.log('btc signal:', prices.btc(), '| connections:', connections)
injector.destroy() // unsubscribe: multiplex sends "unsubscribe", the socket closes
await until(() => subscribes.includes('unsubscribe'))
server.close()
```

```output
server got {"type":"subscribe","topic":"BTC"}
server got {"type":"subscribe","topic":"BTC"}
btc signal: 101500 | connections: 2
server got {"type":"unsubscribe","topic":"BTC"}
```

- `webSocket()` из `rxjs/webSocket` возвращает `WebSocketSubject`: соединение открывается с первым подписчиком и делится между всеми, `next()` отправляет сообщение.
- `multiplex(subMsg, unsubMsg, filter)` создаёт поток одной темы поверх общего соединения: при подписке отправляет `subscribe`, при отписке `unsubscribe`, пропускает только свои сообщения (ETH отфильтровано).
- **`retry` и `repeat`.** Обрыв (`1006`) приходит в поток как ошибка, её обрабатывает `retry({ delay })`. А закрытие сервером по всем правилам (здесь `1012` при перезапуске) **завершает** поток, и `retry` не срабатывает: для него нужен `repeat({ delay })`. Без `repeat` сервис молча перестал бы получать цены после первой выкладки сервера.
- `toSignal` подписывается в контексте внедрения и отписывается при уничтожении инжектора (компонента или сервиса), отписка отправила `unsubscribe`. В шаблоне сигнал читают как `btc()`, и с zoneless Angular представление обновляется по изменению сигнала.
- Для собственных подписок в компоненте используют `takeUntilDestroyed()`; для HTTP-данных, которые обновляются по событию, сигнал из сокета может перезапускать `httpResource` или `rxResource`.

## Vue: composable и VueUse

Тот же сервис соединения оборачивают в composable, а подписку привязывают к области эффектов компонента:

```ts
// usePrice.ts
import { onScopeDispose, shallowRef } from 'vue'
import { subscribe, getPrice } from './prices' // the same shared socket module as in the React example

export function usePrice(topic: string) {
  const price = shallowRef(getPrice(topic))
  const unsubscribe = subscribe(topic, () => (price.value = getPrice(topic)))
  onScopeDispose(unsubscribe) // the component unmounts or the effect scope stops
  return price
}
```

Для простых случаев (одно соединение на компонент или страницу) есть `useWebSocket` из VueUse 15 с переподключением и heartbeat:

```ts
import { useIntervalFn, useWebSocket } from '@vueuse/core'

const { status, data, send, close } = useWebSocket('wss://chat.example.com', {
  autoReconnect: { retries: 5, delay: 1000, onFailed: () => console.warn('chat is offline') },
  heartbeat: { message: 'ping', responseMessage: 'pong', pongTimeout: 5000, scheduler: (cb) => useIntervalFn(cb, 25_000) },
  autoClose: true, // closes when the component's scope stops
})
```

Общее для всего приложения соединение удобно держать в store Pinia: действие `connect` с защитой от повторного вызова, состояние по темам, а компоненты читают нужные поля через `storeToRefs`.

## Главное

- Одно соединение на приложение в модуле или сервисе; подписки по темам с подсчётом подписчиков; повторная подписка всех тем после переподключения.
- React: `useSyncExternalStore` с `subscribe` в `useCallback`; перерисовываются только подписчики изменившейся темы.
- При подключении в store защищайтесь от повторного `connect` (`readyState <= OPEN`).
- С TanStack Query события идут в кэш: данные через `setQueryData`, сигналы через `invalidateQueries`; компоненты остаются на `useQuery`.
- Angular: `webSocket` из RxJS, `multiplex` для тем, `retry` для обрыва и `repeat` для закрытия сервером, `toSignal` отписывается вместе с инжектором.
- Vue: composable с `onScopeDispose`, `useWebSocket` из VueUse с `autoReconnect` и `heartbeat`, общее соединение в Pinia.

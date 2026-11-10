## О чём урок

Эффекты синхронизируют компонент с внешним миром: подписками, таймерами, сетью, сторонними виджетами. Здесь порядок их запуска и очистки, гонки запросов, когда эффект не нужен вовсе, `useEffectEvent` из React 19.2, разница с `useLayoutEffect` и refs по правилам React 19: `ref` как проп, очистка у ref-колбэков, Fragment refs.

## Когда запускается эффект

`useEffect(setup, deps)` выполняется **после фиксации**, обычно уже после того, как браузер нарисовал кадр. Если зависимости изменились, React сначала вызывает очистку от прошлого запуска, потом новый setup; при размонтировании вызывается последняя очистка. Сравнение зависимостей по `Object.is`. Без массива эффект идёт после каждого рендера, с `[]` только после монтирования.

```jsx dom
import { act, useEffect, useLayoutEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

function Child({ id }) {
  useEffect(() => {
    console.log('child effect', id)
    return () => console.log('child cleanup', id)
  }, [id])
  return null
}

function Parent({ id }) {
  useLayoutEffect(() => console.log('parent layout effect', id), [id])
  useEffect(() => {
    console.log('parent effect', id)
    return () => console.log('parent cleanup', id)
  }, [id])
  return <Child id={id} />
}

const root = createRoot(document.createElement('div'))
await act(() => root.render(<Parent id={1} />))
console.log('--- id changes')
await act(() => root.render(<Parent id={2} />))
console.log('--- unmount')
await act(() => root.unmount())
```

```output
parent layout effect 1
child effect 1
parent effect 1
--- id changes
parent layout effect 2
child cleanup 1
parent cleanup 1
child effect 2
parent effect 2
--- unmount
parent cleanup 2
child cleanup 2
```

Что видно:

- layout-эффекты всего дерева идут раньше обычных;
- эффекты детей запускаются раньше эффектов родителя (дерево обходится снизу вверх), поэтому родитель в своём эффекте может рассчитывать, что дети уже подписались;
- при обновлении сначала **все** очистки, потом **все** новые setup;
- при размонтировании очистки идут сверху вниз.

`async`-функцию прямо в `useEffect` не передают: она возвращает промис, а React ждёт функцию очистки. Асинхронный код объявляют внутри эффекта и вызывают.

## Гонка запросов

Запрос в эффекте может вернуться позже следующего. Без защиты на экран попадёт ответ на старый запрос:

```jsx dom
import { act, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

const delays = { 1: 50, 2: 10 }
const fetchUser = (id) => new Promise((resolve) => setTimeout(() => resolve(`user ${id}`), delays[id]))

function Profile({ id, safe }) {
  const [user, setUser] = useState(null)
  useEffect(() => {
    let ignore = false
    fetchUser(id).then((result) => {
      if (!safe || !ignore) setUser(result)
    })
    return () => {
      ignore = true
    }
  }, [id, safe])
  return <p>{user}</p>
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
for (const safe of [false, true]) {
  const container = document.createElement('div')
  const root = createRoot(container)
  await act(() => root.render(<Profile id={1} safe={safe} />))
  await act(() => root.render(<Profile id={2} safe={safe} />))
  await act(() => wait(100))
  console.log(safe ? 'with cleanup:' : 'no cleanup:', container.textContent, '(asked for user 2)')
}
```

```output
no cleanup: user 1 (asked for user 2)
with cleanup: user 2 (asked for user 2)
```

Флаг `ignore` в очистке отбрасывает устаревший ответ. Вместо флага можно отменить сам запрос: `const controller = new AbortController()`, `fetch(url, { signal: controller.signal })`, в очистке `controller.abort()`. На практике запросы чаще отдают библиотеке (TanStack Query, SWR) или загрузчикам фреймворка: там уже есть кэш, дедупликация и отмена, а гонку не нужно помнить в каждом компоненте.

## Когда эффект не нужен

Эффект нужен, только если есть внешняя система. Типичные лишние эффекты:

- **Производные данные.** `useEffect(() => setTotal(sum(items)), [items])` заменяется на `const total = sum(items)`.
- **Реакция на действие пользователя.** Отправку формы, аналитику клика и уведомление делают в обработчике события: там известно, что именно произошло.
- **Сброс состояния при смене пропа.** Делают через `key` на компоненте.
- **Цепочки эффектов**, где один `setState` вызывает следующий эффект: логику собирают в обработчике или редьюсере.
- **Уведомить родителя об изменении**: вызвать `onChange` в том же обработчике, где меняется состояние.

## Устаревшие замыкания и useEffectEvent

Эффект видит значения своего рендера. Если `count` используется в `setInterval` внутри эффекта с `[]`, интервал навсегда видит `count = 0`. Решения: функция-обновление (`setCount(c => c + 1)`), честные зависимости или, если значение нужно только прочитать, `useEffectEvent` (стабилен с React 19.2):

```jsx dom
import { act, useEffect, useEffectEvent, useState } from 'react'
import { createRoot } from 'react-dom/client'

function Chat({ roomId, theme }) {
  const onConnected = useEffectEvent(() => console.log(`connected to ${roomId}, theme ${theme}`))
  useEffect(() => {
    console.log('connect', roomId)
    onConnected()
    return () => console.log('disconnect', roomId)
  }, [roomId])
  return null
}

const root = createRoot(document.createElement('div'))
await act(() => root.render(<Chat roomId="general" theme="light" />))
await act(() => root.render(<Chat roomId="general" theme="dark" />))
await act(() => root.render(<Chat roomId="music" theme="dark" />))
```

```output
connect general
connected to general, theme light
disconnect general
connect music
connected to music, theme dark
```

Смена темы не переподключила чат, а при смене комнаты событие увидело актуальную тему. Функцию из `useEffectEvent` вызывают только из эффектов, в зависимости её не пишут, линтер (`eslint-plugin-react-hooks` последней версии) это знает. Глушить линтер через `eslint-disable` для `exhaustive-deps` нельзя: так и появляются устаревшие замыкания.

## useLayoutEffect

`useLayoutEffect` выполняется синхронно после изменения DOM, **до** отрисовки кадра. Измерить элемент можно и в обычном эффекте, DOM там уже обновлён, но если по результату нужно сдвинуть подсказку или поменять размер, обычный эффект покажет один кадр в неверном положении, а layout-эффект нет. Цена: он блокирует отрисовку, поэтому по умолчанию берут `useEffect`. На сервере эффекты не выполняются (предупреждение про `useLayoutEffect` при SSR в React 19 убрали).

## Refs

`useRef(initial)` возвращает объект `{ current }`, который живёт между рендерами, и его изменение **не** вызывает рендер. Для DOM-узлов, id таймеров, экземпляров сторонних библиотек. Читать и писать `ref.current` во время рендера нельзя (кроме ленивой инициализации): рендер должен быть чистым, а значение ref не участвует в нём. То, что показывается на экране, храните в состоянии.

С React 19 `ref` это обычный проп функционального компонента, `forwardRef` не нужен:

```jsx dom
import { act, useRef } from 'react'
import { createRoot } from 'react-dom/client'

function TextInput({ ref, label }) {
  return <label>{label} <input ref={ref} /></label>
}

function Form() {
  const inputRef = useRef(null)
  return (
    <>
      <TextInput ref={inputRef} label="Name" />
      <button onClick={() => inputRef.current.focus()}>Edit</button>
    </>
  )
}

const container = document.createElement('div')
document.body.append(container)
await act(() => createRoot(container).render(<Form />))
container.querySelector('button').click()
console.log(document.activeElement.tagName)
```

```output
INPUT
```

Чтобы отдать наружу не весь DOM-узел, а пару методов (`focus`, `scrollToItem`), используют `useImperativeHandle(ref, () => ({ ... }), deps)` с тем же пропом `ref`.

Ref-колбэк может вернуть функцию очистки (React 19): React вызовет её при отсоединении узла вместо прежнего вызова с `null`.

```jsx dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'

function Item({ name }) {
  return (
    <li
      ref={(node) => {
        console.log('attach', name, node.tagName)
        return () => console.log('detach', name)
      }}
    >
      {name}
    </li>
  )
}

const root = createRoot(document.createElement('div'))
await act(() => root.render(<ul><Item name="a" /></ul>))
await act(() => root.render(<ul></ul>))
```

```output
attach a LI
detach a
```

Типы React 19 требуют аргумент у `useRef`:

```tsx check
import { useRef } from 'react'

const inputRef = useRef<HTMLInputElement>(null)
const timerRef = useRef<number | undefined>(undefined)
// @ts-expect-error: since React 19 types useRef needs an initial value
const legacyRef = useRef<number>()

export { inputRef, timerRef, legacyRef }
```

**Fragment refs** (React 19.3): `<Fragment ref={ref}>` даёт `FragmentInstance` с методами для всей группы детей без обёртки: `addEventListener`, `focus`, `observeUsing(observer)` для `IntersectionObserver` и `ResizeObserver`, `getClientRects`, `scrollIntoView`. Это способ повесить поведение на чужие компоненты, которые не принимают `ref`.

## Главное

- Эффекты идут после фиксации: сначала у детей, потом у родителя; при смене зависимостей сначала все очистки, потом все setup.
- Ответ на устаревший запрос отбрасывают флагом в очистке или `AbortController`; чаще запросы отдают библиотеке данных.
- Производные данные, реакции на действия и сброс состояния эффектов не требуют.
- `useEffectEvent` читает свежие значения в эффекте, не перезапуская его; линтер не глушат.
- `useLayoutEffect` для правок до отрисовки; по умолчанию `useEffect`.
- `ref` это проп с React 19, у ref-колбэков есть очистка, `useRef` требует аргумент в типах.

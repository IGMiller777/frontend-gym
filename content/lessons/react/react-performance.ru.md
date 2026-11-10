## О чём урок

Почему компонент перерендеривается, что на самом деле делают `memo`, `useMemo` и `useCallback`, где ломается контекст, что берёт на себя React Compiler 1.0 и какие инструменты есть для тяжёлых обновлений: переходы, `useDeferredValue`, `<Activity>`, виртуализация и разделение кода.

## Когда компонент рендерится

Компонент рендерится, если:

1. изменилось его состояние;
2. **отрендерился его родитель** (по умолчанию все дети рендерятся вместе с ним, даже с теми же пропсами);
3. изменилось значение контекста, который он читает.

«Перерендерился, потому что изменились пропсы» неточно: без `memo` пропсы вообще не сравниваются.

```jsx dom
import { act, memo, useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'

function Plain({ label }) {
  console.log('render Plain')
  return label
}
const Memoized = memo(function Memoized({ label, onPick }) {
  console.log('render Memoized')
  return label
})

let bump
function Parent() {
  const [count, setCount] = useState(0)
  bump = () => setCount((c) => c + 1)
  const stablePick = useCallback(() => {}, [])
  return (
    <>
      <Plain label="same" />
      <Memoized label="same" onPick={stablePick} />
      <Memoized label="inline" onPick={() => {}} />
    </>
  )
}

const root = createRoot(document.createElement('div'))
await act(() => root.render(<Parent />))
console.log('--- parent state changes')
await act(() => bump())
```

```output
render Plain
render Memoized
render Memoized
--- parent state changes
render Plain
render Memoized
```

`Plain` отрендерился с теми же пропсами. Первый `Memoized` пропустил рендер: `memo` сравнил пропсы поверхностно (`Object.is` по каждому), и `useCallback` сохранил ту же функцию. Второй `Memoized` получил новую стрелочную функцию, и `memo` не помог.

## memo, useMemo, useCallback

- `memo(Component)` пропускает рендер, если все пропсы равны прежним. Имеет смысл, когда компонент рендерится часто с теми же пропсами и его рендер заметно дорогой.
- `useMemo(fn, deps)` кэширует **результат** вычисления между рендерами. Для дорогих расчётов (документация ориентирует на 1 мс и больше, измеряйте) и для стабильной ссылки на объект, который идёт в `memo`-компонент или в зависимости эффекта.
- `useCallback(fn, deps)` то же для функции: `useMemo(() => fn, deps)`.
- Мемоизация бесполезна, если хоть один проп каждый раз новый, и вредна, если оборачивать всё подряд: сравнение и хранение тоже стоят времени, а код читать тяжелее.
- Часто лучше не мемоизировать, а **перестроить**: перенести состояние ниже, в компонент, которому оно нужно, или передать тяжёлую часть как `children` (элемент, созданный родителем выше, не пересоздаётся при рендере обёртки).

Профилируйте перед оптимизацией: вкладка Profiler в React DevTools показывает время каждого рендера, а с настройкой «Record why each component rendered while profiling» и причину. В Chrome с React 19.2 есть Performance Tracks: рендеры и приоритеты видны прямо в панели Performance.

## Ловушка контекста

Все компоненты, читающие контекст, рендерятся при новом значении провайдера, и `memo` их не спасает. Значение сравнивается по ссылке, поэтому объект, созданный в рендере, «меняется» при каждом рендере провайдера. Разделение на несколько контекстов само по себе не помогает:

```jsx dom
import { act, createContext, memo, use, useState } from 'react'
import { createRoot } from 'react-dom/client'

const ThemeContext = createContext(null)
const UserContext = createContext(null)

const Header = memo(function Header() {
  const { theme } = use(ThemeContext)
  console.log('render Header', theme)
  return null
})

let setUser
function App() {
  const [theme, setTheme] = useState('light')
  const [user, _setUser] = useState('Ann')
  setUser = _setUser
  // Two contexts, but each value is a new object on every render of App.
  return (
    <ThemeContext value={{ theme, setTheme }}>
      <UserContext value={{ user, setUser }}>
        <Header />
      </UserContext>
    </ThemeContext>
  )
}

const root = createRoot(document.createElement('div'))
await act(() => root.render(<App />))
console.log('--- only the user changes')
await act(() => setUser('Bob'))
```

```output
render Header light
--- only the user changes
render Header light
```

Изменился только пользователь, но `App` отрендерился и создал новый объект `{ theme, setTheme }`, поэтому `Header` тоже. Исправления: `useMemo` для значения (`useMemo(() => ({ theme, setTheme }), [theme])`), отдельный компонент-провайдер, который рендерится только от своего состояния, или класть в контекст сами значения, а частые обновления держать во внешнем хранилище (Zustand, Redux, Jotai) с подпиской на срез. Обратите внимание: с React 19 провайдер пишут как `<ThemeContext value>`, а `Context.Provider` уходит в прошлое; читать можно через `use(Context)`, его разрешено вызывать и в условиях.

## React Compiler

React Compiler 1.0 (октябрь 2025) это плагин сборки, который сам расставляет мемоизацию: кэширует значения, JSX и функции внутри компонентов и хуков, в том числе после раннего `return`, чего вручную не сделать. Скомпилированный код берёт кэш из `react/compiler-runtime`, компоненты в DevTools помечены значком «Memo ✨».

- Работает с React 19, а также с 17 и 18 (через пакет `react-compiler-runtime`).
- Подключается как Babel-плагин; в Vite через `reactCompilerPreset` из `@vitejs/plugin-react`, в Next.js и Expo есть готовые настройки.
- Опирается на **правила React**: чистый рендер, неизменяемые пропсы и состояние, хуки на верхнем уровне. Компонент, который он не может доказать безопасным, он просто пропускает. Нарушения показывают правила линтера в `eslint-plugin-react-hooks` (пресет `recommended-latest`).
- Отключить для одного компонента: директива `"use no memo"` в начале функции.
- Ручные `useMemo` и `useCallback` с компилятором нужны редко: когда точная стабильность ссылки важна для эффекта или внешней библиотеки.

## Тяжёлые обновления: переходы

`startTransition` и `useTransition` помечают обновление состояния как несрочное: его рендер можно прервать вводом пользователя, а старый интерфейс остаётся на экране, пока новый не готов. Сама функция-аргумент выполняется **сразу и синхронно**, прерывается только рендер:

```jsx dom
import { act, startTransition, useState } from 'react'
import { createRoot } from 'react-dom/client'

let setQuery
function Search() {
  const [query, _setQuery] = useState('')
  setQuery = _setQuery
  console.log('render', JSON.stringify(query))
  return null
}

const root = createRoot(document.createElement('div'))
await act(() => root.render(<Search />))
await act(() => {
  startTransition(() => {
    console.log('transition callback runs right away')
    setQuery('react')
  })
  console.log('after startTransition')
})
```

```output
render ""
transition callback runs right away
after startTransition
render "react"
```

Поэтому `startTransition(() => setResults(heavyFilter(items, q)))` ничего не ускоряет: фильтрация уже прошла синхронно. Тяжёлый расчёт должен происходить **в рендере** компонента, который получает несрочное значение:

- `useTransition()` даёт `[isPending, startTransition]`, когда вы сами вызываете обновление (переключение вкладки, фильтр);
- `useDeferredValue(value)` откладывает уже пришедшее значение: поле ввода обновляется сразу, а список рендерится по отложенному значению и может отставать; второй аргумент задаёт начальное значение для первого рендера.

Срочные обновления (ввод в поле) в переход не оборачивают: управляемое поле должно отвечать сразу.

## Activity и ViewTransition

`<Activity mode="hidden">` (React 19.2) прячет поддерево, сохраняя его состояние и DOM, и снимает эффекты. Скрытое содержимое рендерится с низким приоритетом заранее, поэтому переключение мгновенное:

```jsx dom
import { act, Activity, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

function Tab({ name }) {
  const [draft] = useState(`draft of ${name}`)
  useEffect(() => {
    console.log('effect on', name)
    return () => console.log('effect off', name)
  }, [name])
  return <p>{draft}</p>
}

function App({ tab }) {
  return (
    <>
      <Activity mode={tab === 'a' ? 'visible' : 'hidden'}><Tab name="a" /></Activity>
      <Activity mode={tab === 'b' ? 'visible' : 'hidden'}><Tab name="b" /></Activity>
    </>
  )
}

const container = document.createElement('div')
const root = createRoot(container)
await act(() => root.render(<App tab="a" />))
console.log('--- switch to b')
await act(() => root.render(<App tab="b" />))
console.log([...container.querySelectorAll('p')].map((p) => `${p.textContent}${p.style.display === 'none' ? ' (hidden)' : ''}`).join(', '))
```

```output
effect on a
--- switch to b
effect off a
effect on b
draft of a (hidden), draft of b
```

Скрытая вкладка «a» осталась в DOM с `display: none` и своим состоянием, её эффект снят. Раньше выбирали между `{show && <Tab />}` (теряем состояние) и CSS-скрытием (эффекты продолжают работать).

`<ViewTransition>` (стабилен с React 19.3) анимирует появление, исчезновение и изменение своих детей через View Transitions API браузера. Анимация срабатывает для обновлений внутри перехода (`startTransition`, `useDeferredValue`, Suspense), а не для каждого `setState`.

## Внешние хранилища

Если компонент читает изменяемый источник вне React (свой стор, `navigator.onLine`, размер окна), используйте `useSyncExternalStore(subscribe, getSnapshot)`. При конкурентном рендере прямое чтение такого источника может дать **разрыв**: разные части интерфейса покажут разные версии данных. Хук гарантирует согласованность. На нём построены React Redux и Zustand.

## Большие списки и бандл

- **Виртуализация**: в DOM только видимые строки и небольшой запас, остальное заменено отступами. Библиотеки: TanStack Virtual (`useVirtualizer`), react-window 2 (`List` с `rowComponent`), react-virtuoso для строк переменной высоты. Нюансы: поиск по странице и якоря не видят скрытые строки, для доступности нужны `aria-rowcount` и `aria-rowindex` у таблиц.
- **Разделение кода**: `const Settings = lazy(() => import('./Settings'))` и `<Suspense fallback={<Skeleton />}>` вокруг. Модуль должен экспортировать компонент по умолчанию. Роутеры умеют делить по маршрутам сами (`lazy` в React Router, файловые маршруты во фреймворках) и начинать загрузку кода и данных параллельно.

## Главное

- Компонент рендерится из-за своего состояния, рендера родителя или контекста; пропсы сравнивает только `memo`.
- `memo` работает лишь при стабильных пропсах; часто лучше перенести состояние или передать `children`.
- Новый объект в `value` провайдера рендерит всех читателей; разделение контекстов без стабильных значений не помогает.
- React Compiler 1.0 мемоизирует автоматически при соблюдении правил React; `"use no memo"` отключает.
- Функция в `startTransition` выполняется сразу; прерывается только рендер. Тяжёлое считают в рендере по отложенному значению.
- `<Activity>` прячет с сохранением состояния, `useSyncExternalStore` защищает от разрывов, длинные списки виртуализируют.

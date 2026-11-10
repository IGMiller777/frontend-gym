## О чём урок

Как React превращает компоненты в DOM: что такое элемент, из каких шагов состоит обновление, по каким правилам React решает, сохранить состояние компонента или создать его заново, и зачем нужны ключи. В конце StrictMode: что именно он вызывает дважды. Все примеры выполняются на React 19.3 в jsdom, вывод под ними настоящий.

## Элемент это объект

JSX не создаёт DOM. Компилятор превращает `<a href="/docs">Docs</a>` в вызов `jsx('a', { href: '/docs', children: 'Docs' })` из `react/jsx-runtime` (автоматический runtime, обязателен с React 19), и результат это обычный неизменяемый объект-описание:

```jsx dom
const element = <a href="/docs" className="link">Docs</a>
console.log(typeof element, element.type)
console.log(JSON.stringify(element.props))
```

```output
object a
{"href":"/docs","className":"link","children":"Docs"}
```

`type` у элемента бывает строкой (тег DOM) или функцией (компонент). Дети лежат в `props.children`. С React 19 `ref` тоже обычный проп: `element.ref` устарел, а `forwardRef` больше не нужен (подробнее в уроке про эффекты и refs). Импортировать `React` в каждый файл ради JSX перестали ещё с React 17: старый runtime вызывал `React.createElement`, и имя должно было быть в области видимости.

## Три шага обновления

1. **Запуск (trigger).** Первый `root.render()` или изменение состояния (`setState`, `dispatch`, новое значение контекста).
2. **Рендер.** React вызывает компоненты и получает новое дерево элементов. Это чистые вычисления: никаких запросов, подписок и правок DOM. Рендер можно повторить или отбросить, если пришло более срочное обновление (для переходов и `useDeferredValue`).
3. **Фиксация (commit).** React сравнивает новое дерево с предыдущим и вносит в DOM только разницу, затем присваивает `ref`, запускает `useLayoutEffect`, браузер рисует кадр, и после этого выполняются `useEffect`. Фиксация синхронна и не прерывается.

Ре-рендер компонента не значит, что DOM меняется: если результат совпал, React ничего не трогает. «Виртуальный DOM быстрее настоящего» неточная формулировка: выигрыш в том, что код описывает результат, а минимальный набор правок React находит сам.

## Reconciliation: тип и позиция

Состояние принадлежит не функции компонента, а **месту в дереве**. Сравнивая деревья, React идёт по позициям:

- на том же месте тот же `type` и тот же `key`: компонент обновляется, состояние сохраняется;
- другой `type`: старое поддерево размонтируется целиком (с состоянием и DOM), новое монтируется;
- другой `key` на том же месте: так же, как другой тип.

```jsx dom
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'

function Counter({ label }) {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount((c) => c + 1)}>{label}: {count}</button>
}

function App({ fancy, useKeys }) {
  if (useKeys) return fancy ? <Counter key="a" label="A" /> : <Counter key="b" label="B" />
  return fancy ? <Counter label="A" /> : <Counter label="B" />
}

const container = document.createElement('div')
document.body.append(container)
const root = createRoot(container)
for (const useKeys of [false, true]) {
  await act(() => root.render(<App fancy useKeys={useKeys} />))
  await act(() => container.querySelector('button').click())
  await act(() => root.render(<App fancy={false} useKeys={useKeys} />))
  console.log(useKeys ? 'with keys:' : 'same position:', container.textContent)
}
```

```output
same position: B: 1
with keys: B: 0
```

Без ключей оба `Counter` стоят на одной позиции с одним типом, и счётчик «A» передал своё состояние «B». С разными `key` React видит два разных компонента и создаёт «B» с нуля. Отсюда приём: `<Profile key={userId} />` сбрасывает всё состояние формы при смене пользователя без единого эффекта.

Обратная сторона: **не объявляйте компоненты внутри компонентов.** Функция, созданная при рендере, каждый раз новая, это другой `type`, и React будет размонтировать её поддерево на каждом рендере родителя.

## Ключи в списках

В списке позиция это индекс, а `key` говорит React, какой элемент какой. Ключ по индексу ломается, как только элементы вставляют, удаляют или сортируют:

```jsx dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'

function List({ items, keyBy }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyBy === 'index' ? index : item}>
          {item} <input defaultValue={item.toLowerCase()} />
        </li>
      ))}
    </ul>
  )
}

const container = document.createElement('div')
const root = createRoot(container)
for (const keyBy of ['index', 'id']) {
  await act(() => root.render(<List key={keyBy} items={['Milk', 'Bread']} keyBy={keyBy} />))
  await act(() => root.render(<List key={keyBy} items={['Eggs', 'Milk', 'Bread']} keyBy={keyBy} />))
  const rows = [...container.querySelectorAll('li')].map((li) => `${li.firstChild.textContent.trim()}=${li.querySelector('input').value}`)
  console.log(keyBy, rows.join(' '))
}
```

```output
index Eggs=milk Milk=bread Bread=bread
id Eggs=eggs Milk=milk Bread=bread
```

С ключом-индексом новая строка «Eggs» получила ключ `0` и унаследовала поле ввода от «Milk»: текст обновился, а состояние DOM и компонентов осталось на старых позициях. Правила:

- ключ стабилен между рендерами и уникален среди соседей (глобально уникальным быть не обязан);
- берите id из данных; не используйте `Math.random()` или `crypto.randomUUID()` при рендере, это новый ключ каждый раз и полное пересоздание;
- индекс допустим, только если список никогда не меняет порядок и у строк нет состояния;
- `key` не попадает в пропсы компонента, если id нужен внутри, передайте его отдельно.

## Fiber коротко

Внутри React хранит дерево **Fiber**-узлов: по одному на компонент и DOM-элемент, со ссылками на родителя, первого ребёнка и соседа, с состоянием хуков и пометками о нужных правках. Есть текущее дерево и дерево в работе; после фиксации они меняются ролями. Работа делится на единицы, поэтому конкурентный рендер может уступать поток браузеру примерно каждые 5 мс. Обновления различаются приоритетом (lanes): ввод срочный, переход нет. Названия полей и тегов это внутренности, они меняются между версиями; на собеседовании важна идея, а не номера тегов.

## StrictMode

`<StrictMode>` в разработке специально повторяет работу, чтобы проявить нечистый код:

```jsx dom
import { act, StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'

function App() {
  console.log('render')
  const [count] = useState(() => {
    console.log('state initializer')
    return 0
  })
  const doubled = useMemo(() => {
    console.log('memo calculation')
    return count * 2
  }, [count])
  useEffect(() => {
    console.log('effect setup')
    return () => console.log('effect cleanup')
  }, [])
  return <p>{doubled}</p>
}

const root = createRoot(document.createElement('div'))
await act(() => root.render(<StrictMode><App /></StrictMode>))
```

```output
render
state initializer
state initializer
memo calculation
memo calculation
render
effect setup
effect cleanup
effect setup
```

- Тело компонента, инициализаторы `useState` и функции `useMemo` вызываются дважды, второй результат отбрасывается. В React 19 при повторном рендере компонента `useMemo` и `useCallback` берут результат первого, поэтому третьего вызова нет.
- Эффекты: setup → cleanup → setup. Очистка выполняется **один** раз: React имитирует размонтирование и повторное монтирование. Если после этого что-то сломалось (две подписки, двойной запрос без отмены), значит, не хватает очистки.
- Ref-колбэки тоже вызываются дважды при монтировании.
- В продакшене ничего этого нет.

## Главное

- JSX создаёт объекты-элементы `{ type, props, key }`; DOM появляется только при фиксации.
- Обновление: запуск → рендер (чистый, может быть прерван) → фиксация (DOM, refs, layout-эффекты, затем эффекты).
- Состояние живёт на позиции в дереве: тот же тип и `key` сохраняют его, другой сбрасывают.
- Ключи стабильные и из данных; индекс ломает состояние при вставке и сортировке.
- StrictMode дважды вызывает рендер и инициализаторы, а эффекты прогоняет как setup → cleanup → setup.

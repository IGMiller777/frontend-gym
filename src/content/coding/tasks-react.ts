import type { Source } from '../sources'
import type { CodingTask } from './types'

const docs = (title: string, path: string): Source => ({ title: `react.dev: ${title}`, url: `https://react.dev/${path}`, kind: 'official' })
const apg = (title: string, path: string): Source => ({ title: `WAI-ARIA APG: ${title}`, url: `https://www.w3.org/WAI/ARIA/apg/patterns/${path}`, kind: 'spec' })
const verified = { date: '2026-11', version: 'React 19.3' }

export const reactTasks: CodingTask[] = [
  {
    id: 'todo-list',
    track: 'react',
    runtime: 'react',
    preview: 'TodoList',
    difficulty: 'easy',
    minutes: 20,
    title: { ru: '<TodoList />', en: '<TodoList />' },
    summary: {
      ru: 'Список дел: управляемое поле, добавление формой, отметка и удаление, счётчик оставшихся, правильные ключи.',
      en: 'A to-do list: a controlled input, adding through a form, toggling and deleting, a remaining counter, correct keys.',
    },
    starter: `import { useState } from 'react'

// Поле с подписью «New task», кнопка «Add», список задач с флажками
// и кнопками «Delete <текст>», строка «N left».
// An input labelled "New task", an "Add" button, a list of tasks with checkboxes
// and "Delete <text>" buttons, and an "N left" line.
export function TodoList({ initial = [] }: { initial?: string[] }) {
  const [text, setText] = useState('')
  return (
    <form>
      <label>
        New task <input value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <button>Add</button>
      <ul>
        {initial.map((title, i) => (
          <li key={i}>{title}</li>
        ))}
      </ul>
    </form>
  )
}
`,
    solution: `import { useState, type FormEvent } from 'react'

interface Todo {
  id: number
  title: string
  done: boolean
}

let nextId = 1

export function TodoList({ initial = [] }: { initial?: string[] }) {
  const [todos, setTodos] = useState<Todo[]>(() => initial.map((title) => ({ id: nextId++, title, done: false })))
  const [text, setText] = useState('')

  function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const title = text.trim()
    if (!title) return
    setTodos((list) => [...list, { id: nextId++, title, done: false }])
    setText('')
  }

  const toggle = (id: number) => setTodos((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const remove = (id: number) => setTodos((list) => list.filter((t) => t.id !== id))
  const left = todos.filter((t) => !t.done).length

  return (
    <form onSubmit={add}>
      <label>
        New task <input value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <button>Add</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input type="checkbox" checked={todo.done} onChange={() => toggle(todo.id)} /> {todo.title}
            </label>
            <button type="button" aria-label={'Delete ' + todo.title} onClick={() => remove(todo.id)}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <p>{left} left</p>
    </form>
  )
}
`,
    tests: [
      {
        name: { ru: 'кнопка Add добавляет задачу и очищает поле', en: 'the Add button adds a task and clears the input' },
        code: `render(<TodoList />)
const input = screen.getByLabelText('New task')
await user.type(input, 'Buy milk')
await user.click(screen.getByRole('button', { name: 'Add' }))
expect(screen.getAllByRole('listitem').map((li) => li.textContent.replace('×', '').trim())).toEqual(['Buy milk'])
expect(input.value).toBe('')
expect(screen.getByText('1 left')).toBeTruthy()`,
      },
      {
        name: { ru: 'пустую строку и пробелы не добавляет', en: 'does not add an empty or blank title' },
        code: `render(<TodoList />)
await user.click(screen.getByRole('button', { name: 'Add' }))
await user.type(screen.getByLabelText('New task'), '   ')
await user.click(screen.getByRole('button', { name: 'Add' }))
expect(screen.queryByRole('listitem')).toBeNull()
expect(screen.getByText('0 left')).toBeTruthy()`,
      },
      {
        name: { ru: 'флажок отмечает задачу и уменьшает счётчик', en: 'the checkbox completes a task and lowers the counter' },
        code: `render(<TodoList initial={['Milk', 'Bread']} />)
expect(screen.getByText('2 left')).toBeTruthy()
const box = screen.getByRole('checkbox', { name: 'Milk' })
await user.click(box)
expect(box.checked).toBe(true)
expect(screen.getByText('1 left')).toBeTruthy()`,
      },
      {
        name: { ru: 'кнопка удаления убирает задачу', en: 'the delete button removes the task' },
        code: `render(<TodoList initial={['Milk', 'Bread']} />)
await user.click(screen.getByRole('button', { name: 'Delete Milk' }))
expect(screen.queryByRole('checkbox', { name: 'Milk' })).toBeNull()
expect(screen.getByRole('checkbox', { name: 'Bread' })).toBeTruthy()
expect(screen.getByText('1 left')).toBeTruthy()`,
      },
      {
        name: { ru: 'отправка формы (Enter) добавляет задачу без перезагрузки', en: 'submitting the form (Enter) adds a task without reloading' },
        hidden: true,
        code: `render(<TodoList />)
const input = screen.getByLabelText('New task')
await user.type(input, 'Walk')
input.form.requestSubmit()
await flush()
expect(screen.getByRole('checkbox', { name: 'Walk' })).toBeTruthy()`,
      },
      {
        name: { ru: 'одинаковые названия: отмечается и удаляется именно нужная задача', en: 'equal titles: exactly the right task is toggled and deleted' },
        hidden: true,
        code: `render(<TodoList initial={['Milk', 'Milk', 'Tea']} />)
await user.click(screen.getAllByRole('checkbox', { name: 'Milk' })[1])
await user.click(screen.getAllByRole('button', { name: 'Delete Milk' })[0])
const boxes = screen.getAllByRole('checkbox')
expect(boxes.map((b) => b.checked)).toEqual([true, false])
expect(screen.getByText('1 left')).toBeTruthy()`,
      },
    ],
    sources: [docs('Rendering Lists', 'learn/rendering-lists'), docs('Updating Arrays in State', 'learn/updating-arrays-in-state'), docs('<form>', 'reference/react-dom/components/form')],
    verified,
  },
  {
    id: 'accordion',
    track: 'react',
    runtime: 'react',
    preview: 'Demo',
    difficulty: 'easy',
    minutes: 15,
    title: { ru: '<Accordion />', en: '<Accordion />' },
    summary: {
      ru: 'Аккордеон, где открыта одна секция: состояние в родителе, кнопки с aria-expanded, панели с hidden.',
      en: 'An accordion with one open section: state in the parent, buttons with aria-expanded, panels with hidden.',
    },
    starter: `import { useState } from 'react'

export interface Section {
  title: string
  content: string
}

// Заголовки это кнопки; открыта не больше одной секции; повторный клик закрывает.
// Headers are buttons; at most one section is open; a second click closes it.
export function Accordion({ items }: { items: Section[] }) {
  return (
    <div>
      {items.map((item) => (
        <div key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.content}</p>
        </div>
      ))}
    </div>
  )
}

export function Demo() {
  return (
    <Accordion
      items={[
        { title: 'Shipping', content: 'We ship in 2 days.' },
        { title: 'Returns', content: 'Free returns for 30 days.' },
      ]}
    />
  )
}
`,
    solution: `import { useId, useState } from 'react'

export interface Section {
  title: string
  content: string
}

export function Accordion({ items }: { items: Section[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const id = useId()
  return (
    <div>
      {items.map((item, i) => {
        const expanded = open === i
        return (
          <div key={item.title}>
            <h3>
              <button
                type="button"
                id={id + '-header-' + i}
                aria-expanded={expanded}
                aria-controls={id + '-panel-' + i}
                onClick={() => setOpen(expanded ? null : i)}
              >
                {item.title}
              </button>
            </h3>
            <div role="region" id={id + '-panel-' + i} aria-labelledby={id + '-header-' + i} hidden={!expanded}>
              <p>{item.content}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function Demo() {
  return (
    <Accordion
      items={[
        { title: 'Shipping', content: 'We ship in 2 days.' },
        { title: 'Returns', content: 'Free returns for 30 days.' },
      ]}
    />
  )
}
`,
    tests: [
      {
        name: { ru: 'сначала все секции закрыты', en: 'all sections start closed' },
        code: `render(<Demo />)
expect(screen.getByRole('button', { name: 'Shipping' }).getAttribute('aria-expanded')).toBe('false')
expect(screen.queryByText('We ship in 2 days.')).toBeNull()
expect(screen.queryByText('Free returns for 30 days.')).toBeNull()`,
      },
      {
        name: { ru: 'клик открывает секцию', en: 'a click opens a section' },
        code: `render(<Demo />)
const shipping = screen.getByRole('button', { name: 'Shipping' })
await user.click(shipping)
expect(shipping.getAttribute('aria-expanded')).toBe('true')
expect(screen.getByText('We ship in 2 days.')).toBeTruthy()`,
      },
      {
        name: { ru: 'открытие другой секции закрывает первую', en: 'opening another section closes the first one' },
        code: `render(<Demo />)
await user.click(screen.getByRole('button', { name: 'Shipping' }))
await user.click(screen.getByRole('button', { name: 'Returns' }))
expect(screen.queryByText('We ship in 2 days.')).toBeNull()
expect(screen.getByText('Free returns for 30 days.')).toBeTruthy()
expect(screen.getByRole('button', { name: 'Shipping' }).getAttribute('aria-expanded')).toBe('false')`,
      },
      {
        name: { ru: 'повторный клик закрывает секцию', en: 'a second click closes the section' },
        hidden: true,
        code: `render(<Demo />)
const returns = screen.getByRole('button', { name: 'Returns' })
await user.click(returns)
await user.click(returns)
expect(returns.getAttribute('aria-expanded')).toBe('false')
expect(screen.queryByText('Free returns for 30 days.')).toBeNull()`,
      },
      {
        name: { ru: 'кнопка указывает на свою панель, панель подписана кнопкой', en: 'the button points to its panel, the panel is labelled by the button' },
        hidden: true,
        code: `render(<Demo />)
const button = screen.getByRole('button', { name: 'Returns' })
await user.click(button)
const panel = document.getElementById(button.getAttribute('aria-controls'))
expect(panel).toBeTruthy()
expect(panel.textContent).toBe('Free returns for 30 days.')
expect(screen.getByRole('region', { name: 'Returns' })).toBe(panel)`,
      },
    ],
    sources: [apg('Accordion', 'accordion/'), docs('Sharing State Between Components', 'learn/sharing-state-between-components'), docs('useId', 'reference/react/useId')],
    verified,
  },
  {
    id: 'use-debounced-value',
    track: 'react',
    runtime: 'react',
    preview: 'Demo',
    difficulty: 'medium',
    minutes: 15,
    title: { ru: 'useDebouncedValue', en: 'useDebouncedValue' },
    summary: {
      ru: 'Хук, который отдаёт значение с задержкой: таймер в эффекте, очистка при каждом изменении и размонтировании.',
      en: 'A hook that returns a value with a delay: a timer in an effect, cleared on every change and on unmount.',
    },
    starter: `import { useState } from 'react'

// Вернуть value, но только после того, как оно не менялось delay мс.
// Return value, but only once it has not changed for delay ms.
export function useDebouncedValue<T>(value: T, delay: number): T {
  return value
}

export function Demo() {
  const [text, setText] = useState('')
  const debounced = useDebouncedValue(text, 400)
  return (
    <div>
      <label>
        Search <input value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <p>Request for: {debounced || '…'}</p>
    </div>
  )
}
`,
    solution: `import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function Demo() {
  const [text, setText] = useState('')
  const debounced = useDebouncedValue(text, 400)
  return (
    <div>
      <label>
        Search <input value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <p>Request for: {debounced || '…'}</p>
    </div>
  )
}
`,
    tests: [
      {
        name: { ru: 'первое значение возвращается сразу', en: 'the first value is returned at once' },
        code: `function Probe({ value }) {
  return <p>value: {useDebouncedValue(value, 50)}</p>
}
render(<Probe value="a" />)
expect(screen.getByText('value: a')).toBeTruthy()`,
      },
      {
        name: { ru: 'новое значение появляется только после задержки', en: 'a new value appears only after the delay' },
        code: `function Probe({ value }) {
  return <p>value: {useDebouncedValue(value, 50)}</p>
}
const { rerender } = render(<Probe value="a" />)
rerender(<Probe value="ab" />)
await flush()
expect(screen.getByText('value: a')).toBeTruthy()
await waitFor(() => expect(screen.getByText('value: ab')).toBeTruthy())`,
      },
      {
        name: { ru: 'из серии быстрых изменений остаётся последнее', en: 'out of a quick burst of changes the last one wins' },
        code: `const seen = []
function Probe({ value }) {
  const v = useDebouncedValue(value, 200)
  seen.push(v)
  return <p>value: {v}</p>
}
const { rerender } = render(<Probe value="r" />)
for (const v of ['re', 'rea', 'reac', 'react']) {
  rerender(<Probe value={v} />)
  await sleep(10)
}
await waitFor(() => expect(screen.getByText('value: react')).toBeTruthy())
expect([...new Set(seen)]).toEqual(['r', 'react'])`,
      },
      {
        name: { ru: 'каждое изменение перезапускает таймер', en: 'every change restarts the timer' },
        hidden: true,
        code: `function Probe({ value }) {
  return <p>value: {useDebouncedValue(value, 250)}</p>
}
const { rerender } = render(<Probe value="1" />)
rerender(<Probe value="2" />)
await sleep(150)
rerender(<Probe value="3" />)
await sleep(150)
expect(screen.getByText('value: 1')).toBeTruthy()
await waitFor(() => expect(screen.getByText('value: 3')).toBeTruthy())`,
      },
      {
        name: { ru: 'после размонтирования таймер не срабатывает', en: 'the timer does not fire after unmount' },
        hidden: true,
        code: `let renders = 0
function Probe({ value }) {
  renders++
  return <p>value: {useDebouncedValue(value, 30)}</p>
}
const { rerender, unmount } = render(<Probe value="a" />)
rerender(<Probe value="b" />)
const before = renders
unmount()
await sleep(60)
expect(renders).toBe(before)`,
      },
    ],
    sources: [docs('Synchronizing with Effects', 'learn/synchronizing-with-effects'), docs('Reusing Logic with Custom Hooks', 'learn/reusing-logic-with-custom-hooks'), docs('useDeferredValue', 'reference/react/useDeferredValue')],
    verified,
  },
  {
    id: 'tabs',
    track: 'react',
    runtime: 'react',
    preview: 'Demo',
    difficulty: 'medium',
    minutes: 25,
    title: { ru: '<Tabs />', en: '<Tabs />' },
    summary: {
      ru: 'Доступные вкладки по WAI-ARIA: роли tablist, tab и tabpanel, roving tabindex, стрелки, Home и End.',
      en: 'Accessible tabs per WAI-ARIA: tablist, tab and tabpanel roles, roving tabindex, arrow keys, Home and End.',
    },
    starter: `import { useState } from 'react'

export interface Tab {
  label: string
  content: string
}

// Роли tablist, tab и tabpanel; выбранная вкладка aria-selected и tabIndex 0, остальные -1;
// стрелки влево и вправо (по кругу), Home и End переключают и переводят фокус.
// tablist, tab and tabpanel roles; the selected tab has aria-selected and tabIndex 0, the rest -1;
// Left and Right arrows (wrapping), Home and End switch tabs and move focus.
export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [selected, setSelected] = useState(0)
  return (
    <div>
      {tabs.map((tab, i) => (
        <button key={tab.label} onClick={() => setSelected(i)}>
          {tab.label}
        </button>
      ))}
      <div>{tabs[selected].content}</div>
    </div>
  )
}

export function Demo() {
  return (
    <Tabs
      tabs={[
        { label: 'Overview', content: 'What the product does.' },
        { label: 'Specs', content: 'Weight: 1.2 kg.' },
        { label: 'Reviews', content: '4.8 out of 5.' },
      ]}
    />
  )
}
`,
    solution: `import { useId, useRef, useState, type KeyboardEvent } from 'react'

export interface Tab {
  label: string
  content: string
}

export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [selected, setSelected] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()

  function select(i: number) {
    setSelected(i)
    refs.current[i]?.focus()
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = tabs.length - 1
    const next = { ArrowRight: selected === last ? 0 : selected + 1, ArrowLeft: selected === 0 ? last : selected - 1, Home: 0, End: last }[e.key]
    if (next === undefined) return
    e.preventDefault()
    select(next)
  }

  return (
    <div>
      <div role="tablist" onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            ref={(node) => {
              refs.current[i] = node
            }}
            type="button"
            role="tab"
            id={id + '-tab-' + i}
            aria-selected={i === selected}
            aria-controls={id + '-panel'}
            tabIndex={i === selected ? 0 : -1}
            onClick={() => select(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={id + '-panel'} aria-labelledby={id + '-tab-' + selected} tabIndex={0}>
        {tabs[selected].content}
      </div>
    </div>
  )
}

export function Demo() {
  return (
    <Tabs
      tabs={[
        { label: 'Overview', content: 'What the product does.' },
        { label: 'Specs', content: 'Weight: 1.2 kg.' },
        { label: 'Reviews', content: '4.8 out of 5.' },
      ]}
    />
  )
}
`,
    tests: [
      {
        name: { ru: 'роли tablist, tab и tabpanel, выбрана первая вкладка', en: 'tablist, tab and tabpanel roles, the first tab is selected' },
        code: `render(<Demo />)
expect(screen.getByRole('tablist')).toBeTruthy()
const tabs = screen.getAllByRole('tab')
expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false'])
expect(screen.getByRole('tabpanel').textContent).toBe('What the product does.')`,
      },
      {
        name: { ru: 'клик выбирает вкладку и меняет панель', en: 'a click selects a tab and changes the panel' },
        code: `render(<Demo />)
await user.click(screen.getByRole('tab', { name: 'Specs' }))
expect(screen.getByRole('tab', { name: 'Specs' }).getAttribute('aria-selected')).toBe('true')
expect(screen.getByRole('tabpanel').textContent).toBe('Weight: 1.2 kg.')`,
      },
      {
        name: { ru: 'стрелка вправо выбирает следующую и переводит фокус', en: 'Right arrow selects the next tab and moves focus' },
        code: `render(<Demo />)
await user.click(screen.getByRole('tab', { name: 'Overview' }))
await user.keyboard('ArrowRight')
const specs = screen.getByRole('tab', { name: 'Specs' })
expect(specs.getAttribute('aria-selected')).toBe('true')
expect(document.activeElement).toBe(specs)`,
      },
      {
        name: { ru: 'roving tabindex: 0 только у выбранной вкладки', en: 'roving tabindex: only the selected tab has 0' },
        code: `render(<Demo />)
await user.click(screen.getByRole('tab', { name: 'Reviews' }))
expect(screen.getAllByRole('tab').map((t) => t.tabIndex)).toEqual([-1, -1, 0])`,
      },
      {
        name: { ru: 'стрелки переходят по кругу', en: 'arrow keys wrap around' },
        hidden: true,
        code: `render(<Demo />)
await user.click(screen.getByRole('tab', { name: 'Overview' }))
await user.keyboard('ArrowLeft')
expect(document.activeElement.textContent).toBe('Reviews')
await user.keyboard('ArrowRight')
expect(document.activeElement.textContent).toBe('Overview')
expect(screen.getByRole('tabpanel').textContent).toBe('What the product does.')`,
      },
      {
        name: { ru: 'Home и End, панель подписана выбранной вкладкой', en: 'Home and End, the panel is labelled by the selected tab' },
        hidden: true,
        code: `render(<Demo />)
await user.click(screen.getByRole('tab', { name: 'Specs' }))
await user.keyboard('End')
expect(document.activeElement.textContent).toBe('Reviews')
await user.keyboard('Home')
expect(document.activeElement.textContent).toBe('Overview')
expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeTruthy()`,
      },
    ],
    sources: [apg('Tabs', 'tabs/'), docs('Manipulating the DOM with Refs', 'learn/manipulating-the-dom-with-refs'), docs('Responding to Events', 'learn/responding-to-events')],
    verified,
  },
  {
    id: 'search-users',
    track: 'react',
    runtime: 'react',
    preview: 'Demo',
    difficulty: 'medium',
    minutes: 25,
    title: { ru: '<SearchUsers />', en: '<SearchUsers />' },
    summary: {
      ru: 'Поиск по мере ввода: запрос в эффекте, состояние загрузки и ошибки, отмена через AbortController, без гонки ответов.',
      en: 'Search as you type: a request in an effect, loading and error states, cancellation with AbortController, no response races.',
    },
    starter: `import { useEffect, useState } from 'react'

export type Search = (query: string, signal: AbortSignal) => Promise<string[]>

// Поле «Search»; на каждое непустое значение вызвать search(query, signal);
// пока ждём, показать «Loading…»; результаты списком; при ошибке «Something went wrong».
// Ответ на устаревший запрос не показывать, сам запрос отменить.
// A "Search" input; call search(query, signal) for every non-empty value;
// show "Loading…" while waiting; results as a list; "Something went wrong" on error.
// Never show the response to a stale request, and abort that request.
export function SearchUsers({ search }: { search: Search }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<string[]>([])

  useEffect(() => {
    search(query, new AbortController().signal)
      .then(setResults)
      .catch(() => {
        // TODO: показать ошибку / show the error
      })
  }, [query, search])

  return (
    <div>
      <label>
        Search <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <ul>
        {results.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  )
}

const people = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Linus Torvalds', 'Margaret Hamilton']
const demoSearch: Search = (query, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(people.filter((p) => p.toLowerCase().includes(query.toLowerCase()))), 300 + Math.random() * 500)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

export function Demo() {
  return <SearchUsers search={demoSearch} />
}
`,
    solution: `import { useEffect, useState } from 'react'

export type Search = (query: string, signal: AbortSignal) => Promise<string[]>

type State = { status: 'idle' | 'loading' | 'error' } | { status: 'done'; results: string[] }

export function SearchUsers({ search }: { search: Search }) {
  const [query, setQuery] = useState('')
  const [state, setState] = useState<State>({ status: 'idle' })

  useEffect(() => {
    if (!query.trim()) {
      setState({ status: 'idle' })
      return
    }
    const controller = new AbortController()
    setState({ status: 'loading' })
    search(query, controller.signal).then(
      (results) => {
        if (!controller.signal.aborted) setState({ status: 'done', results })
      },
      () => {
        if (!controller.signal.aborted) setState({ status: 'error' })
      },
    )
    return () => controller.abort()
  }, [query, search])

  return (
    <div>
      <label>
        Search <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      {state.status === 'loading' && <p>Loading…</p>}
      {state.status === 'error' && <p role="alert">Something went wrong</p>}
      {state.status === 'done' && (
        <ul>
          {state.results.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

const people = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Linus Torvalds', 'Margaret Hamilton']
const demoSearch: Search = (query, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(people.filter((p) => p.toLowerCase().includes(query.toLowerCase()))), 300 + Math.random() * 500)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

export function Demo() {
  return <SearchUsers search={demoSearch} />
}
`,
    tests: [
      {
        name: { ru: 'показывает «Loading…», потом результаты', en: 'shows "Loading…", then the results' },
        code: `let respond = () => {}
const search = fn(() => new Promise((resolve) => { respond = () => resolve(['Ada', 'Alan']) }))
render(<SearchUsers search={search} />)
await user.type(screen.getByLabelText('Search'), 'a')
expect(screen.getByText('Loading…')).toBeTruthy()
respond()
await waitFor(() => expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Ada', 'Alan']))
expect(screen.queryByText('Loading…')).toBeNull()
expect(search).toHaveBeenCalledTimes(1)`,
      },
      {
        name: { ru: 'для пустого запроса search не вызывается', en: 'search is not called for an empty query' },
        code: `const search = fn(() => Promise.resolve(['x']))
render(<SearchUsers search={search} />)
await flush()
await user.type(screen.getByLabelText('Search'), '  ')
await sleep(30)
expect(search).toHaveBeenCalledTimes(0)
expect(screen.queryByRole('listitem')).toBeNull()`,
      },
      {
        name: { ru: 'медленный ответ на старый запрос не затирает новый', en: 'a slow response to an old query does not overwrite the new one' },
        code: `const pending = {}
const search = (query) => new Promise((resolve) => { pending[query] = () => resolve([query + ' result']) })
render(<SearchUsers search={search} />)
await user.type(screen.getByLabelText('Search'), 'ab')
pending.ab()
await waitFor(() => expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['ab result']))
// The slow answer for "a" arrives later and must not replace it.
pending.a()
await sleep(30)
expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['ab result'])`,
      },
      {
        name: { ru: 'ошибка показывает сообщение', en: 'an error shows a message' },
        code: `render(<SearchUsers search={() => Promise.reject(new Error('500'))} />)
await user.type(screen.getByLabelText('Search'), 'x')
await waitFor(() => expect(screen.getByText('Something went wrong')).toBeTruthy())`,
      },
      {
        name: { ru: 'предыдущий запрос отменяется через signal', en: 'the previous request is aborted through the signal' },
        hidden: true,
        code: `const signals = []
const search = (query, signal) => {
  signals.push(signal)
  return new Promise(() => {})
}
render(<SearchUsers search={search} />)
await user.type(screen.getByLabelText('Search'), 'abc')
expect(signals.map((s) => s.aborted)).toEqual([true, true, false])`,
      },
      {
        name: { ru: 'очистка поля убирает результаты', en: 'clearing the input removes the results' },
        hidden: true,
        code: `render(<SearchUsers search={() => Promise.resolve(['Ada'])} />)
const input = screen.getByLabelText('Search')
await user.type(input, 'a')
await waitFor(() => expect(screen.getByText('Ada')).toBeTruthy())
await user.clear(input)
expect(screen.queryByText('Ada')).toBeNull()
expect(screen.queryByText('Loading…')).toBeNull()`,
      },
    ],
    sources: [docs('useEffect: fetching data', 'reference/react/useEffect#fetching-data-with-effects'), docs('You Might Not Need an Effect', 'learn/you-might-not-need-an-effect'), { title: 'MDN: AbortController', url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController', kind: 'official' }],
    verified,
  },
  {
    id: 'like-button',
    track: 'react',
    runtime: 'react',
    preview: 'Demo',
    difficulty: 'medium',
    minutes: 20,
    title: { ru: '<LikeButton />', en: '<LikeButton />' },
    summary: {
      ru: 'Оптимистичный лайк на React 19: useOptimistic внутри Action, откат при ошибке, aria-pressed.',
      en: 'An optimistic like in React 19: useOptimistic inside an Action, rollback on error, aria-pressed.',
    },
    starter: `import { useState } from 'react'

// Кнопка «Like» с aria-pressed и счётчиком «N likes». По клику сразу показать новое
// состояние, затем вызвать save(liked). Если save отклонён, вернуть прежнее и показать «Could not save».
// A "Like" button with aria-pressed and an "N likes" counter. On click show the new state at once,
// then call save(liked). If save rejects, go back and show "Could not save".
export function LikeButton({ liked, count, save }: { liked: boolean; count: number; save: (liked: boolean) => Promise<void> }) {
  const [state, setState] = useState({ liked, count })

  function toggle() {
    const next = { liked: !state.liked, count: state.count + (state.liked ? -1 : 1) }
    setState(next)
    save(next.liked).catch(() => {
      // TODO: откатить и показать ошибку / roll back and show the error
    })
  }

  return (
    <div>
      <button aria-pressed={state.liked} onClick={toggle}>
        Like
      </button>
      <span>{state.count} likes</span>
    </div>
  )
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function Demo() {
  return <LikeButton liked={false} count={41} save={async () => { await wait(800); if (Math.random() < 0.3) throw new Error('offline') }} />
}
`,
    solution: `import { startTransition, useOptimistic, useState } from 'react'

interface Like {
  liked: boolean
  count: number
}

export function LikeButton({ liked, count, save }: { liked: boolean; count: number; save: (liked: boolean) => Promise<void> }) {
  const [state, setState] = useState<Like>({ liked, count })
  const [optimistic, setOptimistic] = useOptimistic(state)
  const [error, setError] = useState(false)

  function toggle() {
    const next = { liked: !optimistic.liked, count: optimistic.count + (optimistic.liked ? -1 : 1) }
    setError(false)
    startTransition(async () => {
      setOptimistic(next)
      try {
        await save(next.liked)
        startTransition(() => setState(next))
      } catch {
        startTransition(() => setError(true))
      }
    })
  }

  return (
    <div>
      <button aria-pressed={optimistic.liked} onClick={toggle}>
        Like
      </button>
      <span>{optimistic.count} likes</span>
      {error && <p role="alert">Could not save</p>}
    </div>
  )
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function Demo() {
  return <LikeButton liked={false} count={41} save={async () => { await wait(800); if (Math.random() < 0.3) throw new Error('offline') }} />
}
`,
    tests: [
      {
        name: { ru: 'новое состояние видно сразу, до ответа save', en: 'the new state shows at once, before save answers' },
        code: `let done: () => void = () => {}
render(<LikeButton liked={false} count={10} save={() => new Promise<void>((resolve) => { done = resolve })} />)
const button = screen.getByRole('button', { name: 'Like' })
await user.click(button)
expect(button.getAttribute('aria-pressed')).toBe('true')
expect(screen.getByText('11 likes')).toBeTruthy()
done()
await flush()`,
      },
      {
        name: { ru: 'после успешного save состояние остаётся', en: 'after a successful save the state stays' },
        code: `const save = fn(() => sleep(20))
render(<LikeButton liked={false} count={10} save={save} />)
await user.click(screen.getByRole('button', { name: 'Like' }))
await sleep(60)
await flush()
expect(save).toHaveBeenCalledWith(true)
expect(screen.getByRole('button', { name: 'Like' }).getAttribute('aria-pressed')).toBe('true')
expect(screen.getByText('11 likes')).toBeTruthy()`,
      },
      {
        name: { ru: 'при ошибке откат и сообщение', en: 'on error it rolls back and shows a message' },
        code: `let fail: (error: Error) => void = () => {}
render(<LikeButton liked={true} count={5} save={() => new Promise<void>((_, reject) => { fail = reject })} />)
await user.click(screen.getByRole('button', { name: 'Like' }))
expect(screen.getByText('4 likes')).toBeTruthy()
fail(new Error('offline'))
await waitFor(() => expect(screen.getByText('Could not save')).toBeTruthy())
expect(screen.getByText('5 likes')).toBeTruthy()
expect(screen.getByRole('button', { name: 'Like' }).getAttribute('aria-pressed')).toBe('true')`,
      },
      {
        name: { ru: 'снятие лайка уменьшает счётчик', en: 'unliking lowers the counter' },
        hidden: true,
        code: `const save = fn(() => Promise.resolve())
render(<LikeButton liked={true} count={3} save={save} />)
await user.click(screen.getByRole('button', { name: 'Like' }))
await flush()
expect(save).toHaveBeenCalledWith(false)
expect(screen.getByText('2 likes')).toBeTruthy()
expect(screen.getByRole('button', { name: 'Like' }).getAttribute('aria-pressed')).toBe('false')`,
      },
      {
        name: { ru: 'после ошибки следующий успешный клик убирает сообщение', en: 'after an error the next successful click removes the message' },
        hidden: true,
        code: `let fail = true
render(<LikeButton liked={false} count={0} save={() => (fail ? Promise.reject(new Error('x')) : Promise.resolve())} />)
await user.click(screen.getByRole('button', { name: 'Like' }))
await waitFor(() => expect(screen.getByText('Could not save')).toBeTruthy())
fail = false
await user.click(screen.getByRole('button', { name: 'Like' }))
await flush()
expect(screen.queryByText('Could not save')).toBeNull()
expect(screen.getByText('1 likes')).toBeTruthy()`,
      },
    ],
    sources: [docs('useOptimistic', 'reference/react/useOptimistic'), docs('useTransition', 'reference/react/useTransition'), docs('React 19: Actions', 'blog/2024/12/05/react-19#actions')],
    verified,
  },
]

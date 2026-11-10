## О чём урок

Как Vue превращает шаблон в DOM и почему ему почти не нужна ручная оптимизация: компилятор помечает, что в шаблоне может меняться, рендер компонента привязан к реактивным зависимостям, а обновления собираются в один проход. Здесь вывод настоящего компилятора Vue 3.5, сравнение с React, `v-memo` и `v-once`, ключи и Vapor Mode из Vue 3.6.

## Шаблон → render-функция → Virtual DOM → DOM

1. **Компиляция.** Шаблон превращается в render-функцию. В проекте на Vite это происходит при сборке (плагин `@vitejs/plugin-vue`); компилятор в браузер не попадает. Компиляция на лету нужна только полной сборке Vue со строковыми шаблонами.
2. **Рендер.** Render-функция выполняется внутри реактивного эффекта компонента и возвращает дерево VNode; всё реактивное, что она прочитала, становится зависимостями компонента.
3. **Патч.** Новое дерево сравнивается со старым, и в DOM вносится разница.

Отличие Vue от «чистого» Virtual DOM в том, что компилятор знает шаблон заранее и подсказывает рантайму:

```js run
import { compileTemplate } from 'vue/compiler-sfc'

const { code } = compileTemplate({
  id: 'demo',
  filename: 'Demo.vue',
  source: `<div class="card"><h2>Static title</h2><p :class="tone">{{ message }}</p><button @click="count++">+</button></div>`,
})
console.log(code.slice(code.indexOf('export function render')))
```

```output
export function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    _cache[1] || (_cache[1] = _createElementVNode("h2", null, "Static title", -1 /* CACHED */)),
    _createElementVNode("p", {
      class: _normalizeClass(_ctx.tone)
    }, _toDisplayString(_ctx.message), 3 /* TEXT, CLASS */),
    _createElementVNode("button", {
      onClick: _cache[0] || (_cache[0] = $event => (_ctx.count++))
    }, "+")
  ]))
}
```

- **Статика кэшируется**: `<h2>` создаётся один раз и помечен `CACHED`, при обновлениях его не сравнивают; атрибуты `class="card"` вынесены в константу `_hoisted_1`.
- **Patch flags**: у `<p>` флаг `3 /* TEXT, CLASS */` говорит рантайму, что сравнивать нужно только текст и класс, а не все атрибуты.
- **Обработчики кэшируются** (`_cache[0]`), поэтому дочерний компонент не получает «новую функцию» на каждом рендере.
- **Блоки** (`openBlock`, `createElementBlock`) собирают динамические узлы в плоский список: при обновлении Vue обходит только их, а не всё дерево.

## Какие компоненты рендерятся

Каждый компонент это отдельный реактивный эффект. Он рендерится заново, только если изменились данные, которые он сам прочитал при рендере, или его пропсы (сравниваются поверхностно). Рендер родителя **не** перерисовывает детей автоматически, как в React:

```js dom
import { createApp, defineComponent, h, nextTick, ref } from 'vue'

let childRenders = 0
const Child = defineComponent({
  props: { label: String },
  setup: (props) => () => (childRenders++, h('span', props.label)),
})

let parentRenders = 0
const count = ref(0)
const label = ref('A')
const Parent = defineComponent({
  setup: () => () => (parentRenders++, h('div', [h('b', count.value), h(Child, { label: label.value })])),
})

createApp(Parent).mount(document.createElement('div'))
count.value++
count.value++
await nextTick()
console.log('after count changes:', { parentRenders, childRenders })
label.value = 'B'
await nextTick()
console.log('after label change:', { parentRenders, childRenders })
```

```output
after count changes: { parentRenders: 2, childRenders: 1 }
after label change: { parentRenders: 3, childRenders: 2 }
```

- Два изменения `count` дали один повторный рендер родителя: обновления собираются планировщиком в один проход (микрозадача), как и наблюдатели.
- Дочерний компонент не рендерился, пока его проп `label` не изменился. Аналог `React.memo` в Vue не нужен.
- Новые объекты и функции в пропсах всё же заставляют ребёнка обновиться: `:options="{ a: 1 }"` в шаблоне создаёт объект на каждом рендере; такие значения выносят в `computed` или константы.

## Ручные подсказки

- `v-once` рендерит элемент один раз и больше не обновляет.
- `v-memo="[item.id === selectedId]"` пропускает обновление поддерева, пока значения в массиве не изменились; используют в больших `v-for`, где при выборе меняется пара строк из тысячи.
- `shallowRef` и `markRaw` для больших структур, которые не нужно отслеживать поэлементно.
- Ключи в `v-for` из данных: без них Vue переиспользует элементы по позиции (in-place patch), и состояние полей ввода «съезжает».
- Тяжёлые части выносят в асинхронные компоненты, длинные списки виртуализируют (например, `useVirtualList` из VueUse).

## Vapor Mode (Vue 3.6)

В Vue 3.6, который сейчас в статусе release candidate, появился **Vapor Mode**: необязательный режим компиляции SFC без Virtual DOM. Шаблон компилируется в код, который напрямую создаёт DOM и привязывает к реактивным значениям точечные обновления, как в Solid или Svelte. Цель: меньше базовый размер бандла и быстрее обновления. Режим включается для отдельных компонентов (`<script setup vapor>`), поддерживает подмножество API и может смешиваться с обычными компонентами. В той же версии реактивность переписана на основе библиотеки alien-signals. Пока это не стабильный релиз: в продакшене используют 3.5.

## Главное

- Шаблоны компилируются при сборке; render-функция выполняется в реактивном эффекте компонента.
- Компилятор кэширует статику и обработчики, ставит patch flags и собирает динамические узлы в блоки.
- Компонент перерисовывается только из-за своих зависимостей или изменённых пропсов; дети не рендерятся вместе с родителем.
- Обновления группируются в один проход; `v-once`, `v-memo`, `shallowRef` для особых случаев.
- Vapor Mode в 3.6 (RC) убирает Virtual DOM для выбранных компонентов.

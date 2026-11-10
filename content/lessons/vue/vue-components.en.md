## What this lesson covers

How Vue components are written today: a single-file component with `<script setup>`, props and events, `defineModel` for `v-model`, slots and scoped slots, `provide`/`inject`, element refs, directives and built-in components (`KeepAlive`, `Teleport`, async components). The `<script setup>` examples are shown as SFC code, and the runnable ones use the same API without the SFC compiler and run in jsdom on Vue 3.5.

## A single-file component and script setup

```vue
<script setup lang="ts">
import { computed } from 'vue'

const { label, max = 5 } = defineProps<{ label: string; max?: number }>() // reactive since 3.5
const emit = defineEmits<{ change: [value: number] }>()
const rating = defineModel<number>({ default: 0 }) // two-way: v-model on the parent

const stars = computed(() => Array.from({ length: max }, (_, i) => i < rating.value))
function pick(i: number) {
  rating.value = i + 1
  emit('change', i + 1) // not rating.value: see below
}
</script>

<template>
  <span :aria-label="label">
    <button v-for="(on, i) in stars" :key="i" @click="pick(i)">{{ on ? '★' : '☆' }}</button>
  </span>
</template>
```

- Everything declared in `<script setup>` (variables, functions, imports) is available to the template; no `return` is needed.
- `defineProps`, `defineEmits`, `defineModel`, `defineSlots`, `defineExpose` are **compiler macros**: they are not imported and work only in `<script setup>`.
- Since 3.5, destructuring `defineProps` is reactive, and defaults use plain syntax; `withDefaults` is no longer needed.
- `defineModel()` (stable since 3.4) returns a ref: reading gives the `modelValue` prop, writing emits `update:modelValue`. Named models: `defineModel('title')` and `v-model:title`.
- Props are read-only: the child reports changes with an event instead of mutating the prop. Vue does not copy an object prop, so mutating its fields "works", but it breaks the one-way data flow.

The same component without the SFC compiler: `useModel` is the function `defineModel` expands to. Note the model's value right after writing:

```js dom
import { createApp, ref, useModel } from 'vue'

const Rating = {
  props: { label: String, modelValue: { type: Number, default: 0 } },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const rating = useModel(props, 'modelValue')
    const pick = (i) => {
      rating.value = i + 1 // emits update:modelValue
      emit('change', { sent: i + 1, modelRightAfterSet: rating.value })
    }
    return { rating, pick }
  },
  template: `<span :aria-label="label"><button v-for="i in 5" :key="i" @click="pick(i - 1)">{{ i <= rating ? '★' : '☆' }}</button></span>`,
}

const el = document.createElement('div')
const vm = createApp({
  components: { Rating },
  setup: () => ({ score: ref(2), log: (v) => console.log('change event:', JSON.stringify(v)) }),
  template: `<Rating label="Quality" v-model="score" @change="log" /><p>score: {{ score }}</p>`,
}).mount(el)
await Promise.resolve()
el.querySelectorAll('button')[3].click()
await new Promise((r) => setTimeout(r))
console.log(el.textContent, '| parent ref:', vm.score)
```

```output
change event: {"sent":4,"modelRightAfterSet":2}
★★★★☆score: 4 | parent ref: 4
```

When the parent holds the value through `v-model`, writing to the model only emits `update:modelValue`; the new value comes back to the child as a prop on the next update. So right after the assignment the model is still old, and the event carries the computed value rather than `rating.value`. Without `v-model` on the parent, the model keeps the value locally and changes at once.

## Slots

A slot is a place where the parent passes markup. A **scoped slot** hands the child's data to the parent: the component owns the logic and structure, and the parent decides how each item looks.

```js dom
import { createApp, nextTick } from 'vue'

const DataList = {
  props: ['items'],
  template: `
    <ul>
      <li v-for="(item, index) in items" :key="item.id">
        <slot :item="item" :index="index">{{ item.name }}</slot>
      </li>
    </ul>
    <p v-if="$slots.footer"><slot name="footer" /></p>`,
}

const el = document.createElement('div')
createApp({
  components: { DataList },
  setup: () => ({ people: [{ id: 1, name: 'Ann' }, { id: 2, name: 'Bob' }] }),
  template: `
    <DataList :items="people">
      <template #default="{ item, index }">{{ index + 1 }}. {{ item.name.toUpperCase() }}</template>
      <template #footer>{{ people.length }} people</template>
    </DataList>
    <DataList :items="people" />`,
}).mount(el)
await nextTick()
console.log([...el.querySelectorAll('ul')].map((ul) => [...ul.children].map((li) => li.textContent.trim()).join(' | ')))
console.log(el.querySelector('p').textContent.trim())
```

```output
[ '1. ANN | 2. BOB', 'Ann | Bob' ]
2 people
```

The second list without a slot showed the default content. `$slots` (or `useSlots()`) lets you check whether a slot was passed.

## provide and inject

`provide(key, value)` in a component makes a value available to all descendants at any depth, and `inject(key, default)` reads it. The key is best a `Symbol` typed as `InjectionKey<T>`. If you provide a ref, descendants get a reactive value; to keep them from changing it directly, provide `readonly(ref)` plus an update function.

```js dom
import { createApp, inject, nextTick, provide, readonly, ref } from 'vue'

const ThemeKey = Symbol('theme')

const DeepButton = {
  setup() {
    const { theme, toggle } = inject(ThemeKey)
    return { theme, toggle }
  },
  template: `<button :class="theme" @click="toggle">{{ theme }}</button>`,
}
const Toolbar = { components: { DeepButton }, template: `<nav><DeepButton /></nav>` }

const el = document.createElement('div')
createApp({
  components: { Toolbar },
  setup() {
    const theme = ref('light')
    provide(ThemeKey, { theme: readonly(theme), toggle: () => (theme.value = theme.value === 'light' ? 'dark' : 'light') })
  },
  template: `<Toolbar />`,
}).mount(el)
el.querySelector('button').click()
await nextTick()
console.log(el.innerHTML)
```

```output
<nav><button class="dark">dark</button></nav>
```

`app.provide(...)` gives a value to the whole app: this is how the router, Pinia and i18n are installed. For state shared by many components, Pinia is the usual choice (see the composables lesson).

## Element refs, directives

- `useTemplateRef('input')` (3.5) returns a ref to the element or component with `ref="input"`; the value appears after mounting. A `<script setup>` component is closed: only what is passed to `defineExpose` is visible from outside.
- `useId()` (3.5) generates ids that match on the server and the client, for `label for` and `aria-*`.
- `v-if` creates and destroys the element (with its state and watchers), `v-show` only toggles `display`: the first is cheaper at start, the second for frequent toggling.
- `v-for` needs a stable `:key` from the data, as in React; an index breaks state on insertion. Do not combine `v-if` and `v-for` on one element: `v-if` has higher priority, and the loop variable is not visible in it.
- Event modifiers: `@submit.prevent`, `@keydown.enter`, `@click.stop`, `@click.once`; `v-model` has `.trim`, `.number`, `.lazy`.

## Built-in components

- `<KeepAlive>` caches instances of switched components (tabs, wizard steps): state is kept, and `onActivated`/`onDeactivated` are called.
- `<Teleport to="body">` renders its content elsewhere in the DOM (modals) while keeping it in the component tree. Since 3.5 `defer` allows teleporting into an element Vue renders later.
- `<Transition>` and `<TransitionGroup>` add classes for enter and leave animations.
- `defineAsyncComponent(() => import('./Chart.vue'))` loads a component as a separate chunk; since 3.5 it supports lazy hydration (`hydrate: hydrateOnVisible()`).
- `<Suspense>` waits for async `setup` and shows fallback content; it is still experimental.

## Key points

- SFC with `<script setup>`: the `defineProps`, `defineEmits`, `defineModel` macros; prop destructuring is reactive since 3.5.
- Props down, events up; `defineModel` gives `v-model` in one line.
- Scoped slots hand the child's data to the parent's markup.
- `provide`/`inject` for subtree data, ideally with a `Symbol` key and `readonly`.
- `useTemplateRef` and `useId` from 3.5, keys in `v-for`, `v-if` versus `v-show`.
- `KeepAlive`, `Teleport`, `Transition`, async components; `Suspense` is experimental.

## О чём урок

Реактивность это основа Vue: шаблон, `computed` и наблюдатели перезапускаются, потому что Vue знает, какие данные они прочитали. Здесь как устроены `ref` и `reactive`, почему `reactive` возвращает прокси, где теряется реактивность и как её вернуть, `computed` и его кэш, `shallowRef` и `readonly`. Примеры выполняются на Vue 3.5 в Node.js.

## ref и reactive

`ref(value)` хранит значение в свойстве `.value`. Чтение `.value` регистрирует зависимость у того, кто сейчас вычисляется (шаблон, `computed`, наблюдатель), запись уведомляет их. В шаблоне `.value` писать не нужно: ref верхнего уровня разворачивается автоматически.

`reactive(obj)` возвращает **прокси** объекта: перехватывает чтение и запись любых свойств, в том числе вложенных (вложенные объекты оборачиваются лениво при чтении). `ref` с объектом внутри делает то же: кладёт в `.value` результат `reactive`.

```js run
import { reactive, ref, isReactive } from 'vue'

const original = { count: 0, nested: { deep: 1 } }
const state = reactive(original)

console.log('proxy, not the object:', state === original)
console.log('same proxy again:', reactive(original) === state)
console.log('nested is reactive:', isReactive(state.nested))

const user = ref({ name: 'Ann' })
console.log('ref wraps objects with reactive:', isReactive(user.value))

const warn = console.warn
console.warn = (message) => console.log('warning:', message.split('\n')[0])
console.log('reactive(0) returns', reactive(0))
console.warn = warn
```

```output
proxy, not the object: false
same proxy again: true
nested is reactive: true
ref wraps objects with reactive: true
warning: [Vue warn] value cannot be made reactive: 0
reactive(0) returns 0
```

- Изменения через **исходный объект** Vue не видит: работать нужно с прокси.
- `reactive` не принимает примитивы: в разработке предупреждение и исходное значение, ошибки нет. Для примитивов `ref`.
- Документация рекомендует `ref` по умолчанию: у `reactive` больше ловушек (ниже).

## Где теряется реактивность

Реактивность живёт в прокси и в `.value`. Как только значение «достали» в обычную переменную, связь пропадает:

```js run
import { reactive, toRefs, watchEffect, nextTick } from 'vue'

const state = reactive({ count: 0, step: 1 })

let { count } = state // a plain number copied out of the proxy
const refs = toRefs(state) // refs linked to the proxy properties

watchEffect(() => console.log('effect sees', state.count, refs.count.value))
count++ // changes only the local variable
await nextTick()
refs.count.value = 5 // writes through to state.count
await nextTick()
console.log('local copy:', count, '| state:', state.count)
```

```output
effect sees 0 0
effect sees 5 5
local copy: 1 | state: 5
```

Типичные места потери:

- деструктуризация `reactive`: `const { count } = state`; решение `toRefs(state)` или `toRef(state, 'count')`;
- передача свойства в функцию: `useThing(state.count)` передаёт число, а не ссылку; передают ref или геттер `() => state.count`;
- замена всего `reactive`: `state = reactive({...})` ломает связь у всех, кто держал старый прокси; у `ref` можно заменить `.value` целиком;
- в `<script setup>` деструктуризация `defineProps` **реактивна с Vue 3.5**: компилятор превращает обращения к переменным в `props.x`.

## Разворачивание ref

- В шаблоне разворачиваются ref **верхнего уровня**: `{{ count }}`, но `{{ obj.nested }}` для ref внутри обычного объекта не развернётся (покажет объект ref).
- Внутри `reactive` ref разворачиваются при доступе к свойству: `state.count` вместо `state.count.value`. В массивах и `Map` не разворачиваются.

## computed

`computed(getter)` возвращает ref только для чтения, значение которого **ленивое и кэшируемое**: геттер выполняется при первом чтении и снова только после изменения зависимостей. Зависимости динамические: отслеживается только то, что прочитано в последнем вызове.

```js run
import { computed, ref } from 'vue'

const items = ref([3, 1, 2])
const showAll = ref(false)
let runs = 0
const visible = computed(() => {
  runs++
  const sorted = [...items.value].sort((a, b) => a - b)
  return showAll.value ? sorted : sorted.slice(0, 2)
})

console.log('created, runs:', runs)
console.log(visible.value, visible.value, 'runs:', runs)
items.value.push(0) // a mutation of the array inside the ref is tracked too
console.log(visible.value, 'runs:', runs)

const first = ref('Ann')
const last = ref('Lee')
const full = computed({
  get: () => `${first.value} ${last.value}`,
  set: (value) => ([first.value, last.value] = value.split(' ')),
})
full.value = 'Bob Ray'
console.log(first.value, '|', full.value)
```

```output
created, runs: 0
[ 1, 2 ] [ 1, 2 ] runs: 1
[ 0, 1 ] runs: 2
Bob | Bob Ray
```

- Геттер должен быть чистым: без запросов, записи в другие ref и мутации исходных данных (`items.value.sort()` отсортировал бы сам массив, поэтому копия).
- Асинхронным `computed` быть не может; для данных из сети это `watch` или библиотека запросов.
- С 3.4 `computed` уведомляет зависимых, только если результат действительно изменился, а геттер получает прошлое значение первым аргументом.

## shallowRef, readonly, markRaw

- `shallowRef` отслеживает только замену `.value`, а не мутации внутри: для больших неизменяемых структур и экземпляров библиотек. Обновление: присвоить новый объект или вызвать `triggerRef`.
- `shallowReactive` реактивен только на верхнем уровне.
- `readonly(obj)` возвращает прокси, запись в который запрещена (в разработке предупреждение); так стор или composable отдаёт состояние наружу.
- `markRaw(obj)` навсегда исключает объект из реактивности (карта, редактор, большие сторонние объекты).

## Главное

- `ref` для любых значений (`.value` в коде, без него в шаблоне), `reactive` для объектов, возвращает прокси.
- Изменения через исходный объект не отслеживаются; `reactive(0)` даёт предупреждение и 0.
- Деструктуризация и передача свойства в функцию теряют реактивность; помогают `toRefs`, `toRef`, геттеры; `defineProps` с 3.5 деструктурируется реактивно.
- `computed` ленивый, кэширует результат, зависимости динамические, геттер чистый и синхронный.
- `shallowRef`, `readonly`, `markRaw` для больших и чужих объектов.

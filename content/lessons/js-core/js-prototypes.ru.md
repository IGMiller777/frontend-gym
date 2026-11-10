## О чём урок

В [уроке про this](/learn/js-this) методы брали данные из объекта, на котором их вызвали. Но откуда у пустого объекта метод `toString`, а у массива `map`? Ответ: из прототипа. Разберём, как устроена цепочка прототипов, что делает `new` и почему `class` в JavaScript это удобная запись того же механизма.

## Цепочка прототипов

У каждого объекта есть скрытая ссылка `[[Prototype]]` на другой объект или на `null`. Когда вы читаете свойство, которого у объекта нет, движок ищет его в прототипе, потом в прототипе прототипа и так до `null`. Если свойство не нашлось нигде, результат `undefined`, а не ошибка.

```js run
const animal = {
  eats: true,
  describe() {
    return `eats: ${this.eats}`
  },
}
const rabbit = Object.create(animal)
rabbit.jumps = true
console.log(rabbit.jumps, rabbit.eats, rabbit.flies)
console.log(Object.hasOwn(rabbit, "eats"), "eats" in rabbit)
rabbit.eats = false
console.log(rabbit.describe(), animal.describe())
```

```output
true true undefined
false true
eats: false eats: true
```

Здесь видно три правила.

1. **Чтение идёт вверх по цепочке.** `rabbit.eats` нашлось в `animal`. Оператор `in` проверяет всю цепочку, `Object.hasOwn()` только собственные свойства.
2. **Запись не идёт вверх.** `rabbit.eats = false` создало собственное свойство у `rabbit`, а `animal` не изменился. Собственное свойство затеняет одноимённое свойство прототипа. Исключение: если в прототипе есть сеттер, вызовется он.
3. **`this` в унаследованном методе это объект, на котором метод вызвали**, а не объект, где метод лежит. Поэтому `rabbit.describe()` читает `eats` у `rabbit`.

## prototype и [[Prototype]]

Тут легко запутаться в названиях. `[[Prototype]]` есть у каждого объекта: это ссылка, по которой идёт поиск. Свойство `prototype` есть у функций-конструкторов (и классов): это объект, который станет `[[Prototype]]` для созданных через `new` экземпляров.

```js run
function User(name) {
  this.name = name
}
User.prototype.hi = function () {
  return `Hi, ${this.name}`
}
const u = new User("Ann")
console.log(Object.getPrototypeOf(u) === User.prototype, u.hi())
console.log(Object.getPrototypeOf(User.prototype) === Object.prototype)
```

```output
true Hi, Ann
true
```

`new User("Ann")` делает четыре шага: создаёт пустой объект, ставит ему `[[Prototype]]` равным `User.prototype`, вызывает `User` с `this`, равным этому объекту, и возвращает объект (если сама функция не вернула другой объект). Метод `hi` хранится один раз в `User.prototype` и общий для всех экземпляров.

Читать и менять прототип нужно через `Object.getPrototypeOf()` и `Object.create()`. Свойство `__proto__` устарело и оставлено только для совместимости. `Object.setPrototypeOf()` у уже созданного объекта работает, но MDN предупреждает: это медленная операция, которая ломает оптимизации движка.

## Классы

`class` строит ту же самую цепочку прототипов, только удобнее и безопаснее:

- методы класса попадают в `Класс.prototype`;
- `extends` связывает и прототипы экземпляров, и сами конструкторы (для статических методов);
- `super(...)` вызывает конструктор родителя, а `super.method()` метод родителя;
- поля с `#` настоящие приватные: снаружи класса к ним не обратиться;
- тело класса всегда в строгом режиме, а сам класс до строки объявления находится в мёртвой зоне, как `let`.

```js run
class Animal {
  #sound
  constructor(sound) {
    this.#sound = sound
  }
  speak() {
    return this.#sound
  }
}
class Dog extends Animal {
  constructor() {
    super("woof")
  }
}
const d = new Dog()
console.log(d.speak(), typeof Dog, Object.getPrototypeOf(Dog.prototype) === Animal.prototype)
```

```output
woof function true
```

`typeof Dog` равен `"function"`: класс это функция-конструктор, которую нельзя вызвать без `new`.

## Чего не делать

- Не расширяйте встроенные прототипы (`Array.prototype.myMethod = ...`). Если язык позже добавит метод с тем же именем, код сломается. Так однажды пришлось переименовать будущий `Array.prototype.flatten` в `flat`, потому что старая библиотека уже добавляла свой `flatten`.
- Не стройте глубокие иерархии наследования. В современном фронтенде чаще используют композицию: функции, хуки, объекты с нужными полями.

## Главное

- Чтение свойства идёт по цепочке `[[Prototype]]` до `null`; не нашлось значит `undefined`.
- Запись создаёт собственное свойство и затеняет прототип; `this` в методе это объект, на котором его вызвали.
- `prototype` у конструктора становится `[[Prototype]]` экземпляров, созданных через `new`.
- `class` это та же прототипная модель: методы в `prototype`, `#поля` приватные, `typeof` класса `"function"`.
- Используйте `Object.getPrototypeOf` и `Object.create`, а не `__proto__`; встроенные прототипы не трогайте.

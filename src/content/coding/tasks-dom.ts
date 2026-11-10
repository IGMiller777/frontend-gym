import type { Source } from '../sources'
import type { CodingTask } from './types'

/** Tasks that need a real DOM: run in the sandboxed iframe (jsdom in CI), tests get `html(markup)`. */
const mdn = (title: string, path: string): Source => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'DOM Living Standard' }

export const domTasks: CodingTask[] = [
  {
    id: 'get-elements-by-class-name',
    track: 'browser',
    runtime: 'dom',
    difficulty: 'medium',
    minutes: 20,
    title: { ru: 'Свой getElementsByClassName', en: 'Your own getElementsByClassName' },
    summary: {
      ru: 'Обойти дерево DOM и найти потомков, у которых есть все указанные классы, в порядке документа.',
      en: 'Walk the DOM tree and find descendants that have all the given classes, in document order.',
    },
    starter: `export function getElementsByClassName(root: Element, classNames: string): Element[] {
  // Без getElementsByClassName, querySelector и querySelectorAll.
  // Without getElementsByClassName, querySelector and querySelectorAll.
  return []
}
`,
    solution: `export function getElementsByClassName(root: Element, classNames: string): Element[] {
  const wanted = classNames.trim().split(/\\s+/).filter(Boolean) // "a  b" and " a " are fine
  const result: Element[] = []
  if (wanted.length === 0) return result

  const walk = (el: Element) => {
    for (const child of el.children) {
      // depth-first, parent before children: that is document order
      if (wanted.every((name) => child.classList.contains(name))) result.push(child)
      walk(child)
    }
  }
  walk(root) // the root itself is not included, like the built-in method
  return result
}
`,
    tests: [
      {
        name: { ru: 'находит потомков с классом', en: 'finds descendants with the class' },
        code: `const root = html('<div class="item" id="a"></div><p><span class="item" id="b"></span></p>')
expect(getElementsByClassName(root, 'item').map((e) => e.id)).toEqual(['a', 'b'])`,
      },
      {
        name: { ru: 'все классы сразу, в любом порядке', en: 'all classes at once, in any order' },
        code: `const root = html('<i class="a b" id="x"></i><i class="b" id="y"></i><i class="b c a" id="z"></i>')
expect(getElementsByClassName(root, 'b a').map((e) => e.id)).toEqual(['x', 'z'])`,
      },
      {
        name: { ru: 'сам корень не входит в результат', en: 'the root itself is not included' },
        code: `const root = html('<section class="box" id="outer"><div class="box" id="inner"></div></section>')
const outer = root.firstElementChild
expect(getElementsByClassName(outer, 'box').map((e) => e.id)).toEqual(['inner'])`,
      },
      {
        name: { ru: 'порядок документа на глубине', en: 'document order at depth' },
        hidden: true,
        code: `const root = html('<div class="t" id="1"><div class="t" id="2"><b class="t" id="3"></b></div></div><div class="t" id="4"></div>')
expect(getElementsByClassName(root, 't').map((e) => e.id)).toEqual(['1', '2', '3', '4'])`,
      },
      {
        name: { ru: 'лишние пробелы и пустой запрос', en: 'extra spaces and an empty query' },
        hidden: true,
        code: `const root = html('<i class="a" id="x"></i>')
expect(getElementsByClassName(root, '  a  ').map((e) => e.id)).toEqual(['x'])
expect(getElementsByClassName(root, '   ')).toEqual([])`,
      },
      {
        name: { ru: 'класс целиком, не подстрока', en: 'a whole class, not a substring' },
        hidden: true,
        code: `const root = html('<i class="button-primary" id="x"></i><i class="button" id="y"></i>')
expect(getElementsByClassName(root, 'button').map((e) => e.id)).toEqual(['y'])`,
      },
      {
        name: { ru: 'работает без встроенного поиска', en: 'works without the built-in lookups' },
        hidden: true,
        code: `const root = html('<i class="a" id="x"></i>')
const saved = { gc: Element.prototype.getElementsByClassName, qsa: Element.prototype.querySelectorAll, qs: Element.prototype.querySelector }
const ban = () => { throw new Error('built-in lookup used') }
Object.assign(Element.prototype, { getElementsByClassName: ban, querySelectorAll: ban, querySelector: ban })
let ids
try {
  ids = getElementsByClassName(root, 'a').map((e) => e.id)
} finally {
  Object.assign(Element.prototype, { getElementsByClassName: saved.gc, querySelectorAll: saved.qsa, querySelector: saved.qs })
}
expect(ids).toEqual(['x'])`,
      },
    ],
    sources: [mdn('Element.getElementsByClassName()', 'Web/API/Element/getElementsByClassName'), mdn('Element.children', 'Web/API/Element/children'), mdn('Element.classList', 'Web/API/Element/classList')],
    verified,
  },
  {
    id: 'get-elements-by-style',
    track: 'browser',
    runtime: 'dom',
    difficulty: 'medium',
    minutes: 25,
    title: { ru: 'Найти элементы по стилю', en: 'Find elements by style' },
    summary: {
      ru: 'Найти потомков с заданным вычисленным значением CSS-свойства: getComputedStyle и нормализация значений.',
      en: 'Find descendants with a given computed CSS value: getComputedStyle and value normalization.',
    },
    starter: `export function getElementsByStyle(root: Element, property: string, value: string): Element[] {
  return []
}
`,
    solution: `/** The browser's own form of a value: 'red' → 'rgb(255, 0, 0)', '16px' stays '16px'. */
function normalize(property: string, value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  document.body.append(probe) // computed styles need an element in the document
  const normalized = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return normalized
}

export function getElementsByStyle(root: Element, property: string, value: string): Element[] {
  const expected = normalize(property, value)
  const result: Element[] = []
  const walk = (el: Element) => {
    for (const child of el.children) {
      // computed style, not el.style: rules from stylesheets and inheritance count too
      if (getComputedStyle(child).getPropertyValue(property) === expected) result.push(child)
      walk(child)
    }
  }
  walk(root)
  return result
}
`,
    tests: [
      {
        name: { ru: 'находит по встроенному стилю', en: 'finds by inline style' },
        code: `const root = html('<p id="a" style="font-size: 12px"></p><p id="b" style="font-size: 20px"></p>')
expect(getElementsByStyle(root, 'font-size', '12px').map((e) => e.id)).toEqual(['a'])`,
      },
      {
        name: { ru: 'цвет в любой записи', en: 'a color in any notation' },
        code: `const root = html('<b id="a" style="color: rgb(255, 0, 0)"></b><b id="b" style="color: blue"></b>')
expect(getElementsByStyle(root, 'color', 'red').map((e) => e.id)).toEqual(['a'])`,
      },
      {
        name: { ru: 'учитывает стили из таблицы стилей', en: 'counts styles from a stylesheet' },
        code: `const root = html('<style>.big { font-weight: 700 }</style><span class="big" id="a"></span><span id="b"></span>')
expect(getElementsByStyle(root, 'font-weight', 'bold').map((e) => e.id)).toEqual(['a'])`,
      },
      {
        name: { ru: 'наследуемые свойства у потомков', en: 'inherited properties on descendants' },
        hidden: true,
        code: `const root = html('<div id="p" style="color: green"><span id="c"></span></div>')
expect(getElementsByStyle(root, 'color', 'green').map((e) => e.id)).toEqual(['p', 'c'])`,
      },
      {
        name: { ru: 'корень не входит, порядок документа', en: 'the root is excluded, document order' },
        hidden: true,
        code: `const root = html('<div style="display: none" id="x"><i id="y" style="display: none"></i></div>')
expect(getElementsByStyle(root.firstElementChild, 'display', 'none').map((e) => e.id)).toEqual(['y'])`,
      },
    ],
    sources: [mdn('Window.getComputedStyle()', 'Web/API/Window/getComputedStyle'), mdn('CSSStyleDeclaration.getPropertyValue()', 'Web/API/CSSStyleDeclaration/getPropertyValue'), mdn('Computed value', 'Web/CSS/Guides/Cascade/Property_value_processing#computed_value')],
    verified,
  },
]

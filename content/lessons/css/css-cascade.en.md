## What this lesson covers

"Why isn't my style applied" is almost always explained by the cascade: which declaration wins when several rules match one element. We cover the cascade order, specificity (and why it cannot be counted as 1000/100/10/1), `!important`, cascade layers with `@layer`, `@scope` and inheritance. Specificity in the examples is computed by the `@bramus/specificity` library, which implements the algorithm from the Selectors spec.

## The cascade order

When several declarations set the same property on one element, the browser compares them step by step and stops at the first difference:

1. **Origin and importance**: browser, user and author styles; `!important` declarations form a separate group where the order of origins is reversed.
2. **Context**: styles inside a Shadow DOM versus page styles.
3. **The `style` attribute** beats rules from stylesheets.
4. **Cascade layers** (`@layer`): a later layer beats an earlier one; unlayered styles beat all layers.
5. **Specificity** of the selector.
6. **Proximity** in `@scope`: closer to the scope root wins.
7. **Order**: all else equal, the declaration that comes later wins.

Important: layers are compared **before** specificity. A `.btn` rule in a later layer beats `#app .btn` in an earlier one.

## Specificity is three numbers

Specificity is written as a triple (A, B, C):

- **A**: `#id` selectors;
- **B**: classes `.x`, attributes `[type]`, pseudo-classes `:hover`;
- **C**: tags `div` and pseudo-elements `::before`.

Triples are compared left to right, like software versions, not added up. So no number of classes beats a single `id`.

```js run
import Specificity from "@bramus/specificity"
const selectors = ["#nav a", ".btn.btn-primary", "ul li a:hover", ".a.b.c.d.e.f.g.h.i.j.k", ":where(#app .card) p", ":is(#a, .b) span", "a:not(.x, #y)", "div:has(> img)"]
for (const s of selectors) console.log(s.padEnd(24), Specificity.calculate(s)[0].toString())
const elevenClasses = Specificity.calculate(".a.b.c.d.e.f.g.h.i.j.k")[0]
const oneId = Specificity.calculate("#x")[0]
console.log("11 classes vs 1 id:", Specificity.compare(elevenClasses, oneId) < 0 ? "id wins" : "classes win")
```

```output
#nav a                   (1,0,1)
.btn.btn-primary         (0,2,0)
ul li a:hover            (0,1,3)
.a.b.c.d.e.f.g.h.i.j.k   (0,11,0)
:where(#app .card) p     (0,0,1)
:is(#a, .b) span         (1,0,1)
a:not(.x, #y)            (1,0,1)
div:has(> img)           (0,0,2)
11 classes vs 1 id: id wins
```

Rules for functional pseudo-classes:

- `:where(...)` always gives **zero**: handy for base styles that are easy to override;
- `:is(...)`, `:not(...)` and `:has(...)` take the specificity of their **strongest** argument;
- the universal selector `*` and combinators (` `, `>`, `+`, `~`) add nothing.

## !important

`!important` moves a declaration into a separate group that beats **any** normal declaration, regardless of specificity. Between two `!important` declarations, layers, specificity and order decide again. For important declarations the layer order is reversed: `!important` in an early layer is stronger than in a late one. This lets a base layer protect, say, `[hidden] { display: none !important }`.

Use `!important` in your own code only for such protective rules and for utilities that must always win. Fighting specificity with `!important` ends in an importance war.

## Cascade layers

`@layer` gives an explicit order of style groups, independent of specificity and of file order:

```css
@layer reset, base, components, utilities;

@layer base {
  a { color: var(--link); }
}
@layer components {
  .card a { color: inherit; }
}
@layer utilities {
  .text-red { color: red; }
}
```

The order declared on the first line fixes precedence: the `.text-red` utility beats `.card a` from the components layer even though its specificity is lower. Third-party library styles go into an early layer (`@import url(lib.css) layer(vendor)`), and any of your own styles overrides them. Tailwind v4 itself puts its styles into the `theme`, `base`, `components` and `utilities` layers.

## @scope

`@scope (.card) to (.card-content) { … }` applies styles only inside `.card` and not past `.card-content`. If two scopes match, the one closest to the element wins. It is a native replacement for naming conventions like BEM and for part of what CSS Modules do; all major browsers support it.

## Inheritance

Some properties are inherited from the parent: `color`, `font-*`, `line-height`, `visibility`, `cursor`, and CSS variables. Others are not: `margin`, `padding`, `border`, `background`, `width`. Keywords help control this:

| Value | What it does |
|---|---|
| `inherit` | take the parent's value |
| `initial` | the initial value from the spec (`display: initial` is `inline`) |
| `unset` | `inherit` for inherited properties, `initial` for the rest |
| `revert` | go back to the browser style |
| `revert-layer` | go back to the value from the previous layer |

## Key points

- Cascade: origin and importance, context, `style`, layers, specificity, `@scope` proximity, order.
- Specificity is a triple (id, class, tag) that is compared, not added; 11 classes lose to one `id`.
- `:where()` gives zero; `:is()`, `:not()` and `:has()` take their strongest argument.
- `!important` beats any normal declaration; for important ones the layer order is reversed.
- `@layer` orders groups more strongly than specificity; unlayered styles beat all layers.

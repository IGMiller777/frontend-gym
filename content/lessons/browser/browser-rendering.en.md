## What this lesson covers

"What happens when you type an address into the browser" is a classic interview question. Here is the frontend half of the answer: how HTML, CSS and JavaScript become pixels, what blocks the first paint, and how to speed it up. The network half (DNS, TLS, HTTP/2 and HTTP/3, caching) is covered in the ["Network & HTTP"](/track/network) track.

## The critical rendering path

While HTML arrives over the network, the browser parses it **as a stream**, without waiting for the end of the file:

1. **DOM.** The parser turns markup into a tree of nodes.
2. **CSSOM.** Every style it finds (`<link rel="stylesheet">`, `<style>`) is parsed into a tree of rules.
3. **Render tree.** DOM and CSSOM are combined into a tree of what will be visible: `display: none` and the contents of `<head>` are left out, while `visibility: hidden` stays in (the space is taken).
4. **Layout** (reflow). The size and position of every box is computed.
5. **Paint.** Boxes become drawing commands: backgrounds, text, borders, shadows.
6. **Composite.** Layers are assembled into a frame, often on the GPU.

The first paint (FCP) happens once the browser has all the CSS needed for the first screen and has built the tree up to that point.

## What blocks rendering

- **CSS blocks rendering.** The browser does not paint until it has the stylesheets from `<head>`, or the user would see a flash of unstyled content. CSS does not stop HTML parsing, but it delays the scripts that follow it: a script may ask about styles.
- **A plain `<script>` blocks the parser.** HTML parsing stops while the script downloads and runs: the script may call `document.write` or change the DOM.

| Tag | Download | Execution | Order |
|---|---|---|---|
| `<script>` | stops the parser | at once | in order |
| `<script defer>` | in parallel | after HTML parsing, before `DOMContentLoaded` | in order |
| `<script async>` | in parallel | as soon as loaded, interrupting the parser | not guaranteed |
| `<script type="module">` | in parallel | like `defer` | in order |

A practical rule: load your own scripts with `defer` or as modules, and independent third-party ones (analytics) with `async`.

## The preload scanner

While the main parser waits on a script, a separate **preload scanner** reads ahead through the markup and requests the images, styles and scripts it sees. That is why resources inserted from JavaScript (`img.src = …` in code, styles imported at runtime) load later than the same resources in HTML: the scanner cannot see them.

Hints for the browser:

- `<link rel="preload" href="font.woff2" as="font" crossorigin>`: fetch an important resource the scanner would find late (a font from CSS, a hero image from styles).
- `<link rel="preconnect" href="https://cdn.example.com">`: open a connection to another origin early.
- `fetchpriority="high"` on the main `<img>`: raise its loading priority for LCP.
- `<img loading="lazy">` for images below the first screen; lazy-loading the LCP image hurts.

## How it is measured today

The FMP (First Meaningful Paint) and TTI (Time to Interactive) metrics from older articles are no longer used: Lighthouse dropped them because they reflected user experience poorly. Today people look at:

- **TTFB**: when the first byte of the response arrived;
- **FCP**: the first paint of any content;
- **LCP**: when the largest element of the first screen is painted, good under 2.5 s;
- **CLS**: layout shifts, good under 0.1;
- **INP**: responsiveness to input, good under 200 ms.

They are covered in detail in the ["Performance"](/track/performance) track. HTTP/2 Server Push, often recommended for speed, has been removed from Chrome; `preload` and the `103 Early Hints` response are used instead.

## Key points

- DOM, CSSOM, render tree, layout, paint, composite; HTML is parsed as a stream.
- CSS blocks rendering and the scripts after it; a plain script blocks the parser.
- `defer` and modules run in order after parsing, `async` runs as soon as it loads.
- The preload scanner fetches resources from markup early; it cannot see resources added by JS, which is what `preload` is for.
- Current metrics: TTFB, FCP, LCP, CLS, INP; FMP, TTI and Server Push are outdated.

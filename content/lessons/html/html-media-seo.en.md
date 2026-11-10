## What this lesson covers

Images are usually the heaviest part of a page, and the `<head>` decides how the page looks on a phone, in search results and in a link preview in a messenger. We cover responsive images (`srcset`, `sizes`, `<picture>`), loading attributes, the essential meta tags and the basics of technical SEO.

## Responsive images

A phone does not need a 2400-pixel-wide image. `srcset` lists variants with their widths, `sizes` tells how wide the image will be in the layout, and the browser picks the file itself, taking the screen's pixel density into account.

```html
<img
  src="/img/hero-800.jpg"
  srcset="/img/hero-400.jpg 400w, /img/hero-800.jpg 800w, /img/hero-1600.jpg 1600w"
  sizes="(max-width: 600px) 100vw, 50vw"
  width="1600"
  height="900"
  alt="Team at the office"
/>
```

`<picture>` is needed in two cases: a different **format** for browsers that understand it, and a different **crop** for narrow screens (art direction).

```html
<picture>
  <source type="image/avif" srcset="/img/hero.avif" />
  <source type="image/webp" srcset="/img/hero.webp" />
  <img src="/img/hero.jpg" width="1600" height="900" alt="Team at the office" />
</picture>
```

AVIF is usually lighter than WebP, and WebP lighter than JPEG at comparable quality; all modern browsers support both formats. Icons and logos are better as SVG.

## Loading attributes

| Attribute | What it does |
|---|---|
| `width`, `height` | the browser knows the proportions ahead of time and reserves space: no layout shift (CLS) |
| `loading="lazy"` | load when the image gets close to the viewport; not for first-screen images |
| `fetchpriority="high"` | raise the priority of the main (LCP) image |
| `decoding="async"` | decode without holding up the rest of the rendering |

The most common mistake: `loading="lazy"` on the main first-screen image. The browser postpones loading it until layout, and LCP gets worse.

## The essential head

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Orders — Acme</title>
    <meta name="description" content="Track and manage your Acme orders." />
    <link rel="canonical" href="https://acme.example/orders" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta property="og:title" content="Orders — Acme" />
    <meta property="og:image" content="https://acme.example/og/orders.png" />
  </head>
</html>
```

- `<meta charset="utf-8">` within the first 1024 bytes, or the browser may guess the encoding wrong.
- `viewport`: without it a phone shows the page as a shrunk desktop page. Disabling zoom (`user-scalable=no`, `maximum-scale=1`) is not allowed: it breaks accessibility.
- `<title>` unique and informative: it shows in the tab and in search, and a screen reader reads it first. In an SPA, update it on every navigation.
- `lang` on `<html>` sets the language for screen readers, hyphenation and spell checking.
- Open Graph tags (`og:title`, `og:description`, `og:image`) control link previews in social networks and messengers.

## Technical SEO for the frontend

- **Content in HTML.** Search engines can run JavaScript, but later and not always; ship important content and links in server-rendered HTML (SSR or static generation, see the ["Rendering architectures"](/track/rendering) track).
- **Real links.** Navigate with `<a href>`, not `onClick` on a `<div>`: search robots follow such links too.
- **`canonical`** points to the main address when a page is reachable by several (with sort parameters, with and without a trailing `/`).
- **Headings and semantics** help understand the page structure (see [the semantics lesson](/learn/html-semantics)).
- **Speed** (Core Web Vitals) counts in ranking.
- **Structured data** in JSON-LD with the schema.org vocabulary (product, article, breadcrumbs) enables rich results.
- `robots.txt` controls crawling, and `<meta name="robots" content="noindex">` forbids indexing a page.

## Key points

- `srcset` with `w` and `sizes` serve the right size; `<picture>` for formats (AVIF, WebP) and cropping.
- `width` and `height` against shifts; `loading="lazy"` not for the LCP image; `fetchpriority="high"` for it.
- In `<head>`: `charset`, `viewport` without disabling zoom, a unique `title`, `description`, `canonical`, Open Graph; `lang` on `<html>`.
- For SEO: content and links in HTML, `<a href>` for navigation, `canonical`, speed, JSON-LD.

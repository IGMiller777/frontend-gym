## О чём урок

Картинки обычно самая тяжёлая часть страницы, а `<head>` определяет, как страница выглядит на телефоне, в поиске и в превью ссылки в мессенджере. Здесь адаптивные изображения (`srcset`, `sizes`, `<picture>`), атрибуты загрузки, обязательные мета-теги и основы технического SEO.

## Адаптивные изображения

Телефону не нужна картинка шириной 2400 пикселей. `srcset` перечисляет варианты с их шириной, `sizes` говорит, какую ширину картинка займёт в вёрстке, а браузер выбирает файл сам, с учётом плотности пикселей экрана.

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

`<picture>` нужен в двух случаях: другой **формат** для браузеров, которые его понимают, и другое **кадрирование** для узких экранов (art direction).

```html
<picture>
  <source type="image/avif" srcset="/img/hero.avif" />
  <source type="image/webp" srcset="/img/hero.webp" />
  <img src="/img/hero.jpg" width="1600" height="900" alt="Team at the office" />
</picture>
```

AVIF обычно легче WebP, а WebP легче JPEG при сопоставимом качестве; все современные браузеры поддерживают оба формата. Иконки и логотипы лучше в SVG.

## Атрибуты загрузки

| Атрибут | Что делает |
|---|---|
| `width`, `height` | браузер заранее знает пропорции и резервирует место: нет сдвига вёрстки (CLS) |
| `loading="lazy"` | загрузить, когда картинка приблизится к экрану; не для картинок первого экрана |
| `fetchpriority="high"` | поднять приоритет главной (LCP) картинки |
| `decoding="async"` | декодировать, не задерживая отрисовку остального |

Самая частая ошибка: `loading="lazy"` у главной картинки первого экрана. Браузер откладывает её загрузку до раскладки, и LCP ухудшается.

## Обязательный head

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

- `<meta charset="utf-8">` в первых 1024 байтах, иначе браузер может неверно угадать кодировку.
- `viewport` без него телефон покажет страницу как десктопную, уменьшенную. Запрещать масштабирование (`user-scalable=no`, `maximum-scale=1`) нельзя: это ломает доступность.
- `<title>` уникальный и информативный: его видно во вкладке, в поиске и его первым читает скринридер. В SPA его меняют при каждом переходе.
- `lang` у `<html>` задаёт язык для скринридера, переносов и проверки орфографии.
- Теги Open Graph (`og:title`, `og:description`, `og:image`) управляют превью ссылки в соцсетях и мессенджерах.

## Техническое SEO для фронтенда

- **Контент в HTML.** Поисковики умеют выполнять JavaScript, но позже и не всегда; важный контент и ссылки лучше отдавать в HTML с сервера (SSR или статическая генерация, см. трек [«Архитектуры рендеринга»](/track/rendering)).
- **Настоящие ссылки.** Навигация через `<a href>`, а не `onClick` на `<div>`: по таким ссылкам переходит и поисковый робот.
- **`canonical`** указывает основной адрес, если страница доступна по нескольким (с параметрами сортировки, с `/` на конце и без).
- **Заголовки и семантика** помогают понять структуру страницы (см. [урок о семантике](/learn/html-semantics)).
- **Скорость** (Core Web Vitals) учитывается в ранжировании.
- **Структурированные данные** JSON-LD по словарю schema.org (товар, статья, хлебные крошки) дают расширенные сниппеты в выдаче.
- `robots.txt` управляет обходом, а `<meta name="robots" content="noindex">` запрещает индексацию страницы.

## Главное

- `srcset` с `w` и `sizes` отдают нужный размер; `<picture>` для форматов (AVIF, WebP) и кадрирования.
- `width` и `height` против сдвигов; `loading="lazy"` не для LCP-картинки; `fetchpriority="high"` для неё.
- В `<head>`: `charset`, `viewport` без запрета масштаба, уникальный `title`, `description`, `canonical`, Open Graph; `lang` у `<html>`.
- Для SEO: контент и ссылки в HTML, `<a href>` для навигации, `canonical`, скорость, JSON-LD.

# js-screenshot

[中文文档](./README.zh-CN.md)

A lightweight, framework-agnostic web screenshot SDK with built-in annotation tools. Capture any region of the page and annotate it with pen, arrow, text, shapes, and mosaic — all from a simple API call.

> [!WARNING]
> This project is under active development. APIs may change.

## Features

- **Region capture** — drag to select any area on the page
- **Multiple capture modes** — DOM snapshot (`snapdom`), screen recording (`media`), and `htmlInCanvas` (Chrome 148+)
- **Annotation tools** — pen, arrow, line, rectangle, ellipse, text box, and mosaic
- **Customizable** — configurable colors, sizes, line widths, font sizes per tool
- **Export options** — PNG, JPEG, or WebP with quality control
- **Dark / Light / Auto theme** support
- **Tiny runtime** — built on [Preact](https://preactjs.com), lightweight and fast
- **Easy integration** — simple class-based API, works in any web app

## Installation

```bash
git clone https://github.com/RadiumAg/js-screenshot.git
cd js-screenshot
pnpm install
pnpm build
```

## Quick Start

```ts
import ScreenShot from 'js-screenshot';
import 'js-screenshot/style';

const screenshot = new ScreenShot({
  mode: 'snapdom',
  theme: 'auto',
  exportFormat: 'image/png',
  quality: 0.92,
});

const result = await screenshot.shot();
```

Calling `shot()` opens the capture overlay. The user selects a region, optionally annotates, and clicks save. The returned promise resolves with the captured image data.

## Options

```ts
interface ScreenShotOptions {
  mode?: 'snapdom' | 'media' | 'htmlInCanvas';
  theme?: 'dark' | 'light' | 'auto';
  afterFinished?: () => void;
  tools?: ToolsConfig;
  exportFormat?: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number;
  filename?: string;
}
```

### Tool Configuration

```ts
const screenshot = new ScreenShot({
  tools: {
    pen:     { color: '#ff0000', lineWidth: 3 },
    arrow:   { color: '#00ff00', lineWidth: 2, lineType: 'arrow' },
    textBox: { fontSize: 16, fontFamily: 'Arial', color: '#000' },
    mosaic:  { blockSize: 10, brushSize: 20 },
    rect:    { color: '#0000ff', lineWidth: 2 },
    ellipse: { color: '#ff00ff', lineWidth: 2 },
    line:    { color: '#333', lineWidth: 2 },
  },
});
```

## API

| Method | Description |
|--------|-------------|
| `shot()` | Opens the capture overlay and returns a `Promise` with the result |
| `destroy()` | Manually destroys the screenshot instance and cleans up DOM |

The instance auto-destroys after capture completes or errors. You can also call `destroy()` manually.

## IIFE / Script Tag

```html
<link rel="stylesheet" href="./dist/iife/screen-shot.css">
<script src="./dist/iife/screen-shot.js"></script>
<script>
  const screenshot = new ScreenShot({ mode: 'snapdom' });
  screenshot.shot().then(result => console.log(result));
</script>
```

## Development

```bash
pnpm install
pnpm dev          # dev server with playground
pnpm build        # production build (esm + cjs + iife)
pnpm lint:fix     # lint and auto-fix
```

## Tech Stack

- **[Preact](https://preactjs.com)** — lightweight UI rendering
- **[Zustand](https://github.com/pmndrs/zustand)** — state management
- **[@zumer/snapdom](https://github.com/nickyamanern/snapdom)** — DOM-to-canvas snapshot
- **[Rollup](https://rollupjs.org)** — bundler (ESM, CJS, IIFE outputs)
- **TypeScript** + **CSS Modules**

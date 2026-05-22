# js-screenshot

[English](./README.md)

轻量级、无框架依赖的 Web 截图 SDK，内置丰富的标注工具。通过简单的 API 调用即可实现区域截图，并支持画笔、箭头、文字、形状、马赛克等标注功能。

> [!WARNING]
> 本项目尚在开发中，API 可能会发生变化。

## 特性

- **区域截图** — 拖拽选择页面任意区域
- **多种截图模式** — DOM 快照（`snapdom`）、屏幕录制（`media`）、`htmlInCanvas`（Chrome 148+）
- **标注工具** — 画笔、箭头、直线、矩形、椭圆、文本框、马赛克
- **高度可定制** — 每个工具均可独立配置颜色、大小、线宽、字号等
- **导出格式** — 支持 PNG、JPEG、WebP，可控制导出质量
- **主题切换** — 支持深色 / 浅色 / 跟随系统
- **轻量运行时** — 基于 [Preact](https://preactjs.com) 构建，已打包进产物，使用方无需额外安装
- **零框架绑定** — 纯 JS API，可在任意 Web 应用中直接使用

## 安装

```bash
git clone https://github.com/RadiumAg/js-screenshot.git
cd js-screenshot
pnpm install
pnpm build
```

## 快速开始

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

调用 `shot()` 会打开截图遮罩层，用户选择区域后可进行标注，点击保存后 Promise 会返回截图结果。

## 配置项

```ts
interface ScreenShotOptions {
  /** 截图模式（默认: 'snapdom'） */
  mode?: 'snapdom' | 'media' | 'htmlInCanvas';
  /** UI 主题 */
  theme?: 'dark' | 'light' | 'auto';
  /** 截图完成后的回调 */
  afterFinished?: () => void;
  /** 各工具的独立配置 */
  tools?: ToolsConfig;
  /** 导出格式（默认: 'image/png'） */
  exportFormat?: 'image/png' | 'image/jpeg' | 'image/webp';
  /** 导出质量，0-1（默认: 0.92） */
  quality?: number;
  /** 下载文件名 */
  filename?: string;
}
```

### 工具配置

每个标注工具均可独立配置：

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

| 方法 | 说明 |
|------|------|
| `shot()` | 打开截图遮罩层，返回包含截图结果的 `Promise` |
| `destroy()` | 手动销毁截图实例，清理 DOM |

截图完成或出错后实例会自动销毁，也可以手动调用 `destroy()`。

## Script 标签引入

```html
<link rel="stylesheet" href="./dist/iife/screen-shot.css">
<script src="./dist/iife/screen-shot.js"></script>
<script>
  const screenshot = new ScreenShot({ mode: 'snapdom' });
  screenshot.shot().then(result => console.log(result));
</script>
```

## 本地开发

```bash
pnpm install
pnpm dev          # 启动开发服务器（含 playground）
pnpm build        # 生产构建（esm + cjs + iife）
pnpm lint:fix     # lint 检查并自动修复
```

## 技术栈

- **[Preact](https://preactjs.com)** — 轻量 UI 渲染
- **[Zustand](https://github.com/pmndrs/zustand)** — 状态管理
- **[@zumer/snapdom](https://github.com/nickyamanern/snapdom)** — DOM 转 Canvas 快照
- **[Rollup](https://rollupjs.org)** — 构建打包（ESM、CJS、IIFE）
- **TypeScript** + **CSS Modules**

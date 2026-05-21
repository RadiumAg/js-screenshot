interface Window {
  operateHistory: import('./store/screenshot-store').HistoryEntry[]
}

interface DisplayMediaStreamOptions {
  preferCurrentTab?: boolean
}

/**
 * HTML-in-Canvas API 类型声明 (Chrome 148+)
 * @see https://developer.chrome.com/blog/html-in-canvas-origin-trial
 */
interface HTMLCanvasElement {
  onpaint: ((this: HTMLCanvasElement, ev: PaintEvent) => void) | null
}

interface PaintEvent extends Event {
  readonly elements: Element[]
}

interface CanvasRenderingContext2D {
  /**
   * 将 canvas 子元素绘制到 canvas 中
   * 需要 canvas 设置 layoutsubtree 属性
   */
  drawElementImage: (element: Element, x?: number, y?: number, width?: number, height?: number) => DOMMatrix
}

import type { ToolsConfig } from '@screenshots/utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface HistoryEntry {
  imageData: ImageData
  position: { x: number, y: number }
}

/**
 * 操作历史记录类
 */
const MAX_HISTORY_SIZE = 50;

class OperateHistory extends Array<HistoryEntry> {
  private currentHistoryIndex = -1;

  push(...items: HistoryEntry[]) {
    const result = super.push(...items);
    this.currentHistoryIndex = this.length - 1;
    // Evict oldest entries when exceeding max capacity
    while (this.length > MAX_HISTORY_SIZE) {
      this.shift();
      this.currentHistoryIndex--;
    }
    return result;
  }

  prev(): HistoryEntry | undefined {
    if (this.currentHistoryIndex <= 0) {
      return undefined;
    }
    this.currentHistoryIndex--;
    return this[this.currentHistoryIndex];
  }

  next(): HistoryEntry | undefined {
    if (this.currentHistoryIndex >= this.length - 1) {
      return undefined;
    }
    this.currentHistoryIndex++;
    return this[this.currentHistoryIndex];
  }

  clear() {
    this.length = 0;
    this.currentHistoryIndex = -1;
  }

  getCurrentIndex() {
    return this.currentHistoryIndex;
  }

  async getScreenShotUrl(index: number) {
    const entry = this[index];
    if (!entry)
      throw new Error('Invalid history index');

    const canvasElement = document.createElement('canvas') as HTMLCanvasElement;
    canvasElement.width = entry.imageData.width;
    canvasElement.height = entry.imageData.height;
    const context = canvasElement.getContext('2d');
    context?.putImageData(entry.imageData, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvasElement.toBlob((data) => {
        if (data)
          resolve(data);
        else
          reject(new Error('Failed to create blob'));
      });
    });
    return URL.createObjectURL(blob);
  }
}

/**
 * 激活目标类型
 */
export type ActiveTarget = string | null;

/**
 * Screenshot Store 接口
 */
export interface ScreenshotStore {
  // 容器元素
  container: HTMLDivElement | null

  // Canvas 元素
  drawCanvasElement: HTMLCanvasElement | null
  sourceCanvasElement: HTMLCanvasElement | null
  videoElement: HTMLVideoElement | null

  // 设置元素的方法
  setContainer: (container: HTMLDivElement) => void
  setDrawCanvasElement: (canvas: HTMLCanvasElement | null) => void
  setSourceCanvasElement: (canvas: HTMLCanvasElement | null) => void
  setVideoElement: (video: HTMLVideoElement | null) => void

  // 操作历史
  operateHistory: OperateHistory

  // 激活的目标
  activeTarget: ActiveTarget
  setActiveTarget: (target: ActiveTarget) => void

  // 状态标志
  isLock: boolean
  setIsLock: (value: boolean) => void

  isFirstInit: boolean
  setIsFirstInit: (value: boolean) => void

  // 常量
  dotControllerSize: number

  // 工具配置
  toolsConfig: ToolsConfig
  setToolsConfig: (config: ToolsConfig) => void

  // 当前颜色
  currentColor: string
  setCurrentColor: (color: string) => void

  // 重置状态
  resetState: () => void
}

/**
 * 创建 Screenshot Store
 */
export const useScreenshotStore = create<ScreenshotStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      container: null,
      drawCanvasElement: null,
      sourceCanvasElement: null,
      videoElement: null,
      operateHistory: new OperateHistory(),
      activeTarget: null,
      isLock: false,
      isFirstInit: true,
      dotControllerSize: 10,
      toolsConfig: {},
      currentColor: '#000000',

      // 设置容器
      setContainer: container => set({ container }),

      // 设置 Canvas 元素
      setDrawCanvasElement: drawCanvasElement => set({ drawCanvasElement }),
      setSourceCanvasElement: sourceCanvasElement => set({ sourceCanvasElement }),
      setVideoElement: videoElement => set({ videoElement }),

      // 设置激活目标
      setActiveTarget: activeTarget => set({ activeTarget }),

      // 设置状态标志
      setIsLock: isLock => set({ isLock }),
      setIsFirstInit: isFirstInit => set({ isFirstInit }),

      // 设置工具配置
      setToolsConfig: toolsConfig => set({ toolsConfig }),

      // 设置当前颜色
      setCurrentColor: (color) => {
        const { toolsConfig } = get();
        set({
          currentColor: color,
          toolsConfig: {
            ...toolsConfig,
            pen: { ...toolsConfig.pen, color },
            arrow: { ...toolsConfig.arrow, color },
            textBox: { ...toolsConfig.textBox, color },
            rect: { ...toolsConfig.rect, color },
            ellipse: { ...toolsConfig.ellipse, color },
            line: { ...toolsConfig.line, color },
          },
        });
      },

      // 重置状态
      resetState: () => {
        const { operateHistory, videoElement } = get();

        // 停止 MediaStream tracks
        if (videoElement?.srcObject) {
          const stream = videoElement.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoElement.srcObject = null;
        }

        operateHistory.clear();
        set({
          container: null,
          drawCanvasElement: null,
          sourceCanvasElement: null,
          videoElement: null,
          activeTarget: null,
          isLock: false,
          isFirstInit: true,
          currentColor: '#000000',
        });
      },
    }),
    {
      name: 'screenshot-store',
    },
  ),
);

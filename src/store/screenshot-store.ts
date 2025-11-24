import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * 操作历史记录类
 */
class OperateHistory extends Array<ImageData> {
  private currentHistoryIndex = -1;

  push(...items: ImageData[]) {
    this.currentHistoryIndex = this.length - 1;
    return super.push(...items);
  }

  prev() {
    if (this.currentHistoryIndex === 0) {
      return this[this.currentHistoryIndex];
    }
    this.currentHistoryIndex--;
    return this[this.currentHistoryIndex];
  }

  next() {
    if (this.currentHistoryIndex === this.length) {
      return this[this.currentHistoryIndex];
    }
    this.currentHistoryIndex++;
    return this[this.currentHistoryIndex];
  }

  clear() {
    this.length = 0;
    this.currentHistoryIndex = -1;
  }

  async getScreenShotUrl(index: number) {
    const canvasElement = document.createElement('canvas') as HTMLCanvasElement;
    const context = canvasElement.getContext('2d');
    context?.putImageData(this[index], 0, 0);
    const blob = await new Promise<Blob>((resolve) => {
      canvasElement.toBlob((data) => {
        if (data)
          resolve(data);
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

      // 重置状态
      resetState: () => {
        const { operateHistory } = get();
        operateHistory.clear();
        set({
          drawCanvasElement: null,
          sourceCanvasElement: null,
          videoElement: null,
          activeTarget: null,
          isLock: false,
          isFirstInit: true,
        });
      },
    }),
    {
      name: 'screenshot-store',
    },
  ),
);

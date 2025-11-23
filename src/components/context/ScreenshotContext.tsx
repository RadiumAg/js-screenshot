import type { ComponentChildren } from 'preact';
import type { ACTIVE_TYPE } from '../utils/share';
import { createContext } from 'preact';
import { useContext, useMemo, useRef, useState } from 'preact/hooks';

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
 * Screenshot Context 接口
 */
export interface ScreenshotContextValue {
  container: HTMLDivElement // 渲染的容器元素
  // Canvas 元素
  drawCanvasElement: HTMLCanvasElement | null
  sourceCanvasElement: HTMLCanvasElement | null
  videoElement: HTMLVideoElement | null

  // 设置 Canvas 元素的方法
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
}

const ScreenshotContext = createContext<ScreenshotContextValue | null>(null);

/**
 * Screenshot Context Provider
 */
export function ScreenshotProvider({ children, container}: { children: ComponentChildren, container: HTMLDivElement }) {
  const [drawCanvasElement, setDrawCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const [sourceCanvasElement, setSourceCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [activeTarget, setActiveTarget] = useState<ActiveTarget>(null);
  const [isLock, setIsLock] = useState(false);
  const [isFirstInit, setIsFirstInit] = useState(true);

  const operateHistoryRef = useRef(new OperateHistory());

  const value: ScreenshotContextValue = useMemo(() => ({
    drawCanvasElement,
    container,
    sourceCanvasElement,
    videoElement,
    operateHistory: operateHistoryRef.current,
    activeTarget,
    isLock,
    isFirstInit,
    dotControllerSize: 10,
    setDrawCanvasElement,
    setSourceCanvasElement,
    setVideoElement,
    setIsFirstInit,
    setIsLock,
    setActiveTarget,
  }
  ), [activeTarget, container, drawCanvasElement, isFirstInit, isLock, sourceCanvasElement, videoElement]);

  return (
    <ScreenshotContext value={value}>
      {children}
    </ScreenshotContext>
  );
}

/**
 * 使用 Screenshot Context 的 Hook
 */
export function useScreenshotContext() {
  // eslint-disable-next-line react/no-use-context
  const context = useContext(ScreenshotContext);
  if (!context) {
    throw new Error('useScreenshotContext must be used within ScreenshotProvider');
  }
  return context;
}

export { ScreenshotContext };

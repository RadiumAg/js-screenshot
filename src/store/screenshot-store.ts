import type { ExportFormat, ToolsConfig } from '@screenshots/utils';
import type { Shape } from '../components/shapes/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface HistoryEntry {
  imageData: ImageData
  position: { x: number, y: number }
  shapes?: Shape[]
}

/**
 * 操作历史记录类
 */
const MAX_HISTORY_SIZE = 50;

class OperateHistory extends Array<HistoryEntry> {
  private currentHistoryIndex = -1;

  push(...items: HistoryEntry[]) {
    if (this.currentHistoryIndex < this.length - 1) {
      this.length = this.currentHistoryIndex + 1;
    }
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
  container: HTMLDivElement | null

  // Canvas 元素
  drawCanvasElement: HTMLCanvasElement | null
  drawCanvasContext: CanvasRenderingContext2D | null
  sourceCanvasElement: HTMLCanvasElement | null
  videoElement: HTMLVideoElement | null

  setContainer: (container: HTMLDivElement) => void
  setDrawCanvasElement: (canvas: HTMLCanvasElement | null) => void
  setSourceCanvasElement: (canvas: HTMLCanvasElement | null) => void
  setVideoElement: (video: HTMLVideoElement | null) => void

  operateHistory: OperateHistory

  activeTarget: ActiveTarget
  setActiveTarget: (target: ActiveTarget) => void

  isLock: boolean
  setIsLock: (value: boolean) => void

  isFirstInit: boolean
  setIsFirstInit: (value: boolean) => void

  dotControllerSize: number
  themeColor: string
  setThemeColor: (color: string) => void

  uiTheme: 'dark' | 'light' | 'auto'
  setUiTheme: (theme: 'dark' | 'light' | 'auto') => void

  toolsConfig: ToolsConfig
  setToolsConfig: (config: ToolsConfig) => void

  exportFormat: ExportFormat
  exportQuality: number
  exportFilename: string
  setExportOptions: (format?: ExportFormat, quality?: number, filename?: string) => void

  currentColor: string
  setCurrentColor: (color: string) => void

  shapes: Shape[]
  selectedShapeId: string | null
  addShape: (shape: Shape) => void
  updateShape: (id: string, updates: Partial<Shape>) => void
  removeShape: (id: string) => void
  selectShape: (id: string | null) => void
  getShapesSnapshot: () => Shape[]
  restoreShapesSnapshot: (snapshot: Shape[]) => void

  undo: () => void
  redo: () => void

  resetState: () => void
}

/**
 * 创建 Screenshot Store
 */
export const useScreenshotStore = create<ScreenshotStore>()(
  devtools(
    (set, get) => ({
      container: null,
      drawCanvasElement: null,
      drawCanvasContext: null,
      sourceCanvasElement: null,
      videoElement: null,
      operateHistory: new OperateHistory(),
      activeTarget: null,
      isLock: false,
      isFirstInit: true,
      dotControllerSize: 10,
      themeColor: '#1677ff',
      setThemeColor: color => set({ themeColor: color }),
      uiTheme: 'auto' as const,
      setUiTheme: (theme: 'dark' | 'light' | 'auto') => set({ uiTheme: theme }),
      toolsConfig: {},
      exportFormat: 'image/png',
      exportQuality: 1,
      exportFilename: '',
      currentColor: '#000000',
      shapes: [],
      selectedShapeId: null,

      // 设置容器
      setContainer: container => set({ container }),

      // 设置 Canvas 元素
      setDrawCanvasElement: (drawCanvasElement) => {
        const drawCanvasContext = drawCanvasElement?.getContext('2d', { willReadFrequently: true }) ?? null;
        set({ drawCanvasElement, drawCanvasContext });
      },
      setSourceCanvasElement: sourceCanvasElement => set({ sourceCanvasElement }),
      setVideoElement: videoElement => set({ videoElement }),

      setActiveTarget: activeTarget => set({ activeTarget }),

      setIsLock: isLock => set({ isLock }),
      setIsFirstInit: isFirstInit => set({ isFirstInit }),

      setToolsConfig: toolsConfig => set({ toolsConfig }),

      setExportOptions: (format, quality, filename) => set({
        exportFormat: format ?? 'image/png',
        exportQuality: quality ?? 1,
        exportFilename: filename ?? '',
      }),

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
            textExtract: { ...toolsConfig.textExtract, color },
          },
        });
      },

      addShape: (shape) => {
        const { shapes } = get();
        set({ shapes: [...shapes, shape] });
      },
      updateShape: (id, updates) => {
        const { shapes } = get();
        set({
          shapes: shapes.map(s => (s.id === id ? { ...s, ...updates } as Shape : s)),
        });
      },
      removeShape: (id) => {
        const { shapes, selectedShapeId } = get();
        set({
          shapes: shapes.filter(s => s.id !== id),
          selectedShapeId: selectedShapeId === id ? null : selectedShapeId,
        });
      },
      selectShape: (id) => {
        set({ selectedShapeId: id });
      },
      getShapesSnapshot: () => {
        return JSON.parse(JSON.stringify(get().shapes));
      },
      restoreShapesSnapshot: (snapshot) => {
        set({ shapes: snapshot, selectedShapeId: null });
      },

      undo: () => {
        const { operateHistory, drawCanvasContext, restoreShapesSnapshot } = get();
        const entry = operateHistory.prev();
        if (entry && drawCanvasContext) {
          drawCanvasContext.putImageData(entry.imageData, entry.position.x, entry.position.y);
          restoreShapesSnapshot(entry.shapes ?? []);
        }
      },
      redo: () => {
        const { operateHistory, drawCanvasContext, restoreShapesSnapshot } = get();
        const entry = operateHistory.next();
        if (entry && drawCanvasContext) {
          drawCanvasContext.putImageData(entry.imageData, entry.position.x, entry.position.y);
          restoreShapesSnapshot(entry.shapes ?? []);
        }
      },

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
          shapes: [],
          selectedShapeId: null,
        });
      },
    }),
    {
      name: 'screenshot-store',
    },
  ),
);

import type { ScreenShotOptions } from '@screenshots/utils';
import type { FC } from 'preact/compat';
import { __isDev__ } from '@screenshots/utils';
import { snapdom } from '@zumer/snapdom';
import { useMemoizedFn, useMount } from 'ahooks';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useCanvas } from '../hooks/use-canvas';
import { useScreenshotStore } from '../store/screenshot-store';
import { CutoutBox } from './cutout-box';

export interface ScreenShotProps {
  options: ScreenShotOptions
  onComplete?: (result: any) => void
  onError?: (error: Error) => void
}

/**
 * ScreenShot 内部组件
 */
const ScreenShotInner: FC<ScreenShotProps> = ({ options, onComplete, onError }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    setDrawCanvasElement,
    setSourceCanvasElement,
    setVideoElement,
    setToolsConfig,
    setExportOptions,
    setUiTheme,
  } = useScreenshotStore(useShallow(state => ({
    setDrawCanvasElement: state.setDrawCanvasElement,
    setSourceCanvasElement: state.setSourceCanvasElement,
    setVideoElement: state.setVideoElement,
    setToolsConfig: state.setToolsConfig,
    setExportOptions: state.setExportOptions,
    setUiTheme: state.setUiTheme,
  })));

  const { createCanvas } = useCanvas();

  /**
   * 创建video element
   */
  const createVideoElement = (): HTMLVideoElement => {
    const videoElement = document.createElement('video');
    return videoElement;
  };

  const rafIdRef = useRef<number>(0);
  const playHandlerRef = useRef<(() => void) | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  /**
   * 初始化显示媒体模式
   */
  const initDisplayMediaMode = async (): Promise<void> => {
    const captureStream = await navigator.mediaDevices.getDisplayMedia({
      preferCurrentTab: true,
    });

    return new Promise((resolve, reject) => {
      const sourceCanvasElement = createCanvas();
      const drawCanvasElement = createCanvas();
      const videoElement = createVideoElement();
      videoElementRef.current = videoElement;
      const sourceContext = sourceCanvasElement.getContext('2d');

      setSourceCanvasElement(sourceCanvasElement);
      setDrawCanvasElement(drawCanvasElement);
      setVideoElement(videoElement);

      videoElement.srcObject = captureStream;

      const updateCanvas = () => {
        if (sourceContext && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
          // 用 video 实际分辨率设置 canvas 尺寸，避免缩放拉伸
          const videoWidth = videoElement.videoWidth;
          const videoHeight = videoElement.videoHeight;

          if (videoWidth && videoHeight) {
            // canvas 尺寸等于视口尺寸（CSS 像素），与 dot-controller 坐标系一致
            const canvasWidth = window.innerWidth;
            const canvasHeight = window.innerHeight;
            sourceCanvasElement.width = canvasWidth;
            sourceCanvasElement.height = canvasHeight;
            drawCanvasElement.width = canvasWidth;
            drawCanvasElement.height = canvasHeight;

            // 将 video 绘制到 canvas，缩放到视口尺寸
            sourceContext.drawImage(
              videoElement,
              0,
              0,
              canvasWidth,
              canvasHeight,
            );
          }

          setIsInitialized(true);
          resolve();
          return;
        }
        rafIdRef.current = requestAnimationFrame(updateCanvas);
      };

      const onPlay = () => {
        // 先设置初始尺寸，实际尺寸在 updateCanvas 中根据 video 确定
        const width = window.innerWidth;
        const height = window.innerHeight;
        sourceCanvasElement.width = width;
        sourceCanvasElement.height = height;
        drawCanvasElement.height = height;
        drawCanvasElement.width = width;
        document.body.append(drawCanvasElement);
        const timeFlag = setTimeout(() => {
          clearTimeout(timeFlag);
          updateCanvas();
        }, 500);
      };

      playHandlerRef.current = onPlay;
      videoElement.addEventListener('play', onPlay);

      videoElement.play().catch((err) => {
        reject(err);
      });
    });
  };

  /**
   * 初始化 SnapDOM 模式
   * 使用 @zumer/snapdom 将页面 DOM 渲染到 canvas，无需屏幕共享授权
   */
  const initSnapdomMode = async (): Promise<void> => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 使用 snapdom 捕获整个页面 DOM 到 canvas
    const capturedCanvas = await snapdom.toCanvas(document.documentElement, {
      width,
      height,
    });

    // 创建 sourceCanvas（保存原始截图数据）
    const sourceCanvasElement = createCanvas();
    sourceCanvasElement.width = width;
    sourceCanvasElement.height = height;
    const sourceContext = sourceCanvasElement.getContext('2d');
    if (sourceContext) {
      sourceContext.drawImage(capturedCanvas, 0, 0, width, height);
    }

    // 创建 drawCanvas（用于用户绘图标注）
    const drawCanvasElement = createCanvas();
    drawCanvasElement.width = width;
    drawCanvasElement.height = height;
    document.body.appendChild(drawCanvasElement);

    setSourceCanvasElement(sourceCanvasElement);
    setDrawCanvasElement(drawCanvasElement);
    setIsInitialized(true);
  };

  /**
   * 初始化 HTML-in-Canvas 模式
   * 使用 Chrome 148+ 的 drawElementImage API 将页面内容绘制到 canvas
   * 需要启用 chrome://flags/#canvas-draw-element
   */
  const initHtmlInCanvasMode = async (): Promise<void> => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 创建带 layoutsubtree 的源 canvas
    const sourceCanvasElement = createCanvas();
    sourceCanvasElement.setAttribute('layoutsubtree', '');
    sourceCanvasElement.width = width;
    sourceCanvasElement.height = height;
    sourceCanvasElement.style.width = `${width}px`;
    sourceCanvasElement.style.height = `${height}px`;
    sourceCanvasElement.style.pointerEvents = 'none';
    sourceCanvasElement.style.zIndex = '-1';
    sourceCanvasElement.style.opacity = '0';

    // 创建页面内容的容器作为 canvas 子元素
    const contentWrapper = document.createElement('div');
    contentWrapper.style.width = `${width}px`;
    contentWrapper.style.height = `${height}px`;
    contentWrapper.style.overflow = 'hidden';
    contentWrapper.style.position = 'absolute';
    contentWrapper.style.top = '0';
    contentWrapper.style.left = '0';

    // 克隆 body 内容到 wrapper 中
    const bodyClone = document.body.cloneNode(true) as HTMLElement;
    // 移除截图工具自身的容器避免循环
    const screenshotContainers = bodyClone.querySelectorAll('[data-screenshot-container]');
    screenshotContainers.forEach(el => el.remove());
    contentWrapper.appendChild(bodyClone);
    sourceCanvasElement.appendChild(contentWrapper);
    document.body.appendChild(sourceCanvasElement);

    const sourceContext = sourceCanvasElement.getContext('2d');
    if (!sourceContext) {
      throw new Error('Failed to get 2d context for HTML-in-Canvas');
    }

    // 检测 drawElementImage 是否可用
    if (typeof sourceContext.drawElementImage !== 'function') {
      sourceCanvasElement.remove();
      throw new Error(
        'HTML-in-Canvas API 不可用。请使用 Chrome 148+ 并启用 chrome://flags/#canvas-draw-element',
      );
    }

    // 等待浏览器完成渲染（paint record 需要至少一帧）
    // 优先用 onpaint 事件，回退到 rAF + setTimeout
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        sourceCanvasElement.onpaint = null;
        reject(new Error('等待渲染超时，请确认 chrome://flags/#canvas-draw-element 已启用'));
      }, 3000);

      const drawAndResolve = () => {
        clearTimeout(timeout);
        try {
          sourceContext!.drawElementImage(contentWrapper, 0, 0, width, height);
          resolve();
        }
        catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      };

      // 尝试用 onpaint 事件（规范推荐方式）
      if ('onpaint' in sourceCanvasElement) {
        sourceCanvasElement.onpaint = () => {
          sourceCanvasElement.onpaint = null;
          drawAndResolve();
        };
      }
      else {
        // 回退：等待两帧确保布局和绘制完成
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            drawAndResolve();
          });
        });
      }
    });

    // 创建绘图 canvas
    const drawCanvasElement = createCanvas();
    drawCanvasElement.width = width;
    drawCanvasElement.height = height;
    const drawContext = drawCanvasElement.getContext('2d');
    if (drawContext) {
      drawContext.drawImage(sourceCanvasElement, 0, 0);
    }

    document.body.appendChild(drawCanvasElement);

    // 清理源 canvas 的 DOM 节点（内容已绘制，不再需要）
    sourceCanvasElement.remove();

    // 创建一个干净的源 canvas（不带 layoutsubtree）用于后续流程
    const cleanSourceCanvas = createCanvas();
    cleanSourceCanvas.width = width;
    cleanSourceCanvas.height = height;
    const cleanSourceCtx = cleanSourceCanvas.getContext('2d');
    if (cleanSourceCtx) {
      cleanSourceCtx.drawImage(drawCanvasElement, 0, 0);
    }

    setSourceCanvasElement(cleanSourceCanvas);
    setDrawCanvasElement(drawCanvasElement);
    setIsInitialized(true);
  };

  /**
   * 开始截图
   */
  const startShot = useMemoizedFn(async () => {
    try {
      const { mode = 'snapdom' } = options;
      if (mode === 'media') {
        await initDisplayMediaMode();
      }
      else if (mode === 'htmlInCanvas') {
        await initHtmlInCanvasMode();
      }
      else {
        await initSnapdomMode();
      }
    }
    catch (error) {
      const isPermissionDenied = error instanceof DOMException && error.name === 'NotAllowedError';
      const message = isPermissionDenied
        ? '用户拒绝了屏幕捕获权限，请在浏览器设置中允许屏幕共享后重试'
        : String(error);
      onError?.(error instanceof Error ? error : new Error(message));
    }
  });

  // 组件挂载时自动开始截图流程
  useMount(() => {
    startShot();

    return () => {
      // 清理 rAF
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      // 清理 play 事件监听器
      const videoElement = videoElementRef.current;
      if (videoElement && playHandlerRef.current) {
        videoElement.removeEventListener('play', playHandlerRef.current);
      }
    };
  });

  useEffect(() => {
    if (__isDev__) {
      console.warn('[DEBUG] ScreenShot options', options);
    }
    if (options.tools) {
      setToolsConfig(options.tools);
    }
    if (options.theme) {
      setUiTheme(options.theme);
    }
    setExportOptions(options.exportFormat, options.quality, options.filename);
  }, [options, setToolsConfig, setExportOptions, setUiTheme]);

  if (!isInitialized) {
    return null;
  }

  return (
    <CutoutBox onComplete={onComplete} />
  );
};

/**
 * ScreenShot 函数式组件
 */
export const ScreenShot: FC<ScreenShotProps & { container?: HTMLDivElement | null }> = ({ options, container, onComplete, onError }) => {
  // 初始化store中的container
  const { setContainer } = useScreenshotStore(useShallow(state => ({
    setContainer: state.setContainer,
  })));

  // 设置容器
  useEffect(() => {
    if (container) {
      setContainer(container);
    }
  }, [container, setContainer]);

  return <ScreenShotInner options={options} onComplete={onComplete} onError={onError} />;
};

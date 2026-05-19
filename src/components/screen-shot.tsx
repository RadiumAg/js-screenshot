import type { ScreenShotOptions } from '@screenshots/utils';
import type { FC } from 'preact/compat';
import { __isDev__ } from '@screenshots/utils';
import { useMount } from 'ahooks';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../store/screenshot-store';
import { CutoutBox } from './cutout-box';
import { useCanvas } from './hooks/use-canvas';

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
  } = useScreenshotStore(useShallow(state => ({
    setDrawCanvasElement: state.setDrawCanvasElement,
    setSourceCanvasElement: state.setSourceCanvasElement,
    setVideoElement: state.setVideoElement,
    setToolsConfig: state.setToolsConfig,
    setExportOptions: state.setExportOptions,
  })));

  const { createCanvas } = useCanvas();

  useEffect(() => {
    if (__isDev__) {
      console.warn('[DEBUG] ScreenShot options', options);
    }
    if (options.tools) {
      setToolsConfig(options.tools);
    }
    setExportOptions(options.exportFormat, options.quality, options.filename);
  }, [options, setToolsConfig, setExportOptions]);

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
          /*
           * 必须指定目标宽高，将 video 缩放到 canvas 尺寸。
           * getDisplayMedia 捕获的 video 分辨率是物理像素
           * （Retina 屏下 = window.innerWidth * devicePixelRatio），
           * 而 canvas 尺寸是 CSS 像素（window.innerWidth），
           * 不指定目标宽高会按 video 原始分辨率 1:1 绘制，
           * 导致画面被"放大"（只画了左上角一部分）。
           */
          sourceContext.drawImage(
            videoElement,
            0,
            0,
            sourceCanvasElement.width,
            sourceCanvasElement.height,
          );
          setIsInitialized(true);
          resolve();
          return;
        }
        rafIdRef.current = requestAnimationFrame(updateCanvas);
      };

      const onPlay = () => {
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
   * 开始截图
   */
  const startShot = async () => {
    try {
      await initDisplayMediaMode();
    }
    catch (error) {
      const isPermissionDenied = error instanceof DOMException && error.name === 'NotAllowedError';
      const message = isPermissionDenied
        ? '用户拒绝了屏幕捕获权限，请在浏览器设置中允许屏幕共享后重试'
        : String(error);
      onError?.(error instanceof Error ? error : new Error(message));
    }
  };

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
export const ScreenShot: FC<ScreenShotProps & { container: HTMLDivElement | null }> = ({ options, container, onComplete, onError }) => {
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

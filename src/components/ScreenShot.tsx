import type { ScreenShotOptions } from '@screenshots/utils';
import { useMount } from '@screenshots/hooks/useMount';
import { __isDev__ } from '@screenshots/utils';
import { useEffect, useState } from 'preact/hooks';
import { ScreenshotProvider, useScreenshotContext } from './context/ScreenshotContext';
import { CutoutBox } from './CutoutBox';
import { useCanvas } from './hooks/useCanvas';

export interface ScreenShotProps {
  options: ScreenShotOptions
  onComplete?: (result: any) => void
}

/**
 * ScreenShot 内部组件
 */
function ScreenShotInner({ options, onComplete }: ScreenShotProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    setDrawCanvasElement,
    setSourceCanvasElement,
    setVideoElement,
  } = useScreenshotContext();

  const { createCanvas } = useCanvas();

  useEffect(() => {
    if (__isDev__) {
      console.log('[DEBUG] ScreenShot options', options);
    }
  }, [options]);

  /**
   * 创建video element
   */
  const createVideoElement = (): HTMLVideoElement => {
    const videoElement = document.createElement('video');
    return videoElement;
  };

  /**
   * 初始化显示媒体模式
   */
  const initDisplayMediaMode = async (): Promise<void> => {
    return new Promise(async (resolve) => {
      const captureStream = await navigator.mediaDevices.getDisplayMedia({
        preferCurrentTab: true,
      });

      const sourceCanvasElement = createCanvas();
      const drawCanvasElement = createCanvas();
      const videoElement = createVideoElement();
      const sourceContext = sourceCanvasElement.getContext('2d');

      setSourceCanvasElement(sourceCanvasElement);
      setDrawCanvasElement(drawCanvasElement);
      setVideoElement(videoElement);

      videoElement.srcObject = captureStream;
      videoElement.play();

      const updateCanvas = () => {
        if (sourceContext && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
          sourceContext.drawImage(videoElement, 0, 0);
          return;
        }
        requestAnimationFrame(updateCanvas);
      };

      videoElement.addEventListener('play', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        sourceCanvasElement.width = width;
        sourceCanvasElement.height = height;
        drawCanvasElement.height = height;
        drawCanvasElement.width = width;

        document.body.append(drawCanvasElement);

        updateCanvas();

        setIsInitialized(true);
        resolve();
      });
    });
  };

  /**
   * 开始截图
   */
  const startShot = async () => {
    await initDisplayMediaMode();
  };

  // 组件挂载时自动开始截图流程
  useMount(() => {
    startShot();
  });

  if (!isInitialized) {
    return null;
  }

  return (
    <CutoutBox onComplete={onComplete} />
  );
}

/**
 * ScreenShot 函数式组件（带 Provider）
 */
export function ScreenShot({ options, onComplete }: ScreenShotProps) {
  return (
    <ScreenshotProvider>
      <ScreenShotInner options={options} onComplete={onComplete} />
    </ScreenshotProvider>
  );
}

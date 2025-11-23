import type { ScreenShotOptions } from '@screenshots/utils';
import { useMount } from '@screenshots/hooks/use-mount';
import { __isDev__ } from '@screenshots/utils';
import type { FC } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';
import { CutoutBox } from './cutout-box';
import { useCanvas } from './hooks/use-canvas';
import { useScreenshotStore } from '../store/screenshot-store';

export interface ScreenShotProps {
  options: ScreenShotOptions;
  onComplete?: (result: any) => void;
}

/**
 * ScreenShot 内部组件
 */
const ScreenShotInner: FC<ScreenShotProps> = ({ options, onComplete }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    setDrawCanvasElement,
    setSourceCanvasElement,
    setVideoElement,
  } = useScreenshotStore();

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
 * ScreenShot 函数式组件
 */
export const ScreenShot: FC<ScreenShotProps & { container: HTMLDivElement }> = ({ options, container, onComplete }) => {
  // 初始化store中的container
  const { setContainer } = useScreenshotStore();
  
  // 设置容器
  useEffect(() => {
    setContainer(container);
  }, [container, setContainer]);
  
  return <ScreenShotInner options={options} onComplete={onComplete} />;
};

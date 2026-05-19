import type { FC } from 'preact/compat';
import copy from '@screenshots/assets/images/copy.svg';
import Style from '@screenshots/theme/copy.module.scss';
import { useCallback, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';

export interface CopyButtonProps {
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
}

/**
 * 复制到剪贴板按钮组件
 */
export const CopyButton: FC<CopyButtonProps> = ({
  cutoutBoxX,
  cutoutBoxY,
  cutoutBoxWidth,
  cutoutBoxHeight,
}) => {
  const { drawCanvasElement } = useScreenshotStore(useShallow(state => ({
    drawCanvasElement: state.drawCanvasElement,
  })));
  const [tipText, setTipText] = useState<string | null>(null);
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTip = useCallback((text: string) => {
    if (tipTimerRef.current) {
      clearTimeout(tipTimerRef.current);
    }
    setTipText(text);
    tipTimerRef.current = setTimeout(() => {
      setTipText(null);
      tipTimerRef.current = null;
    }, 1500);
  }, []);

  const handleClick = useCallback(async () => {
    if (!drawCanvasElement) {
      return;
    }

    const context = drawCanvasElement.getContext('2d');
    if (!context) {
      return;
    }

    const screenShotData = context.getImageData(
      cutoutBoxX,
      cutoutBoxY,
      cutoutBoxWidth,
      cutoutBoxHeight,
    );

    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = cutoutBoxWidth;
    screenCanvas.height = cutoutBoxHeight;
    screenCanvas.getContext('2d')?.putImageData(screenShotData, 0, 0);

    try {
      // 优先使用 ClipboardItem API
      if (typeof ClipboardItem !== 'undefined') {
        const blob = await new Promise<Blob>((resolve, reject) => {
          screenCanvas.toBlob((b) => {
            if (b) {
              resolve(b);
            }
            else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/png', 1);
        });

        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        showTip('已复制');
      }
      else {
        // 回退方案
        const dataUrl = screenCanvas.toDataURL('image/png');
        await navigator.clipboard.writeText(dataUrl);
        showTip('已复制(文本)');
      }
    }
    catch {
      showTip('复制失败');
    }
  }, [
    drawCanvasElement,
    cutoutBoxX,
    cutoutBoxY,
    cutoutBoxWidth,
    cutoutBoxHeight,
    showTip,
  ]);

  return (
    <div class={Style.copy} onClick={handleClick}>
      <img src={copy} alt="copy" />
      {tipText && <span class={Style.copyTip}>{tipText}</span>}
    </div>
  );
};

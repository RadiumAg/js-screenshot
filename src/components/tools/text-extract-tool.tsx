import type { FC } from 'preact/compat';
import textExtractIcon from '@screenshots/assets/images/text-extract.svg';
import { useScreenshotStore } from '@screenshots/store/screenshot-store';
import Style from '@screenshots/theme/text-extract.module.scss';
import { canvasToBlob, extractTextFromImage } from '@screenshots/work/text-extract';
import { useMemoizedFn } from 'ahooks';
import { useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { OcrResultPopup } from './ocr-result-popup';

export interface TextExtractToolProps {
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
}

export const TextExtractTool: FC<TextExtractToolProps> = (props) => {
  const { cutoutBoxX, cutoutBoxY, cutoutBoxWidth, cutoutBoxHeight } = props;

  const { drawCanvasElement, toolsConfig } = useScreenshotStore(useShallow(state => ({
    drawCanvasElement: state.drawCanvasElement,
    toolsConfig: state.toolsConfig,
  })));

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [tipText, setTipText] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTip = useMemoizedFn((text: string, duration = 2000) => {
    if (tipTimerRef.current) {
      clearTimeout(tipTimerRef.current);
    }
    setTipText(text);
    tipTimerRef.current = setTimeout(() => {
      setTipText(null);
      tipTimerRef.current = null;
    }, duration);
  });

  const handleClick = useMemoizedFn(async () => {
    if (status === 'loading')
      return;

    const config = toolsConfig.textExtract;
    if (!config?.apiKey) {
      showTip('请配置 apiKey');
      return;
    }

    if (!drawCanvasElement)
      return;

    const context = drawCanvasElement.getContext('2d');
    if (!context)
      return;

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

    setStatus('loading');

    try {
      const blob = await canvasToBlob(screenCanvas, 'image/png', 1);
      const result = await extractTextFromImage(blob, {
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        model: config.model,
        language: config.language,
      });

      if (result.text) {
        setResultText(result.text);
      }
      else {
        showTip('未识别到文字');
      }

      setStatus('success');
    }
    catch (err) {
      const message = err instanceof Error ? err.message : '提取失败';
      showTip(message);
      setStatus('error');
    }
    finally {
      setTimeout(() => setStatus('idle'), 300);
    }
  });

  const handleClosePopup = useMemoizedFn(() => {
    setResultText(null);
  });

  return (
    <>
      <div class={Style.textExtract} onClick={handleClick}>
        {status === 'loading'
          ? <div class={Style.textExtractLoading} />
          : <img src={textExtractIcon} alt="text extract" />}
        {tipText && <span class={Style.textExtractTip}>{tipText}</span>}
      </div>
      {resultText && (
        <OcrResultPopup
          text={resultText}
          cutoutBoxX={cutoutBoxX}
          cutoutBoxY={cutoutBoxY}
          cutoutBoxWidth={cutoutBoxWidth}
          cutoutBoxHeight={cutoutBoxHeight}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
};

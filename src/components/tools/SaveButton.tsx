import save from '@screenshots/assets/images/save.svg';
import Style from '@screenshots/theme/save.module.scss';
import { __isDev__, useDownLoad } from '@screenshots/utils';
import { useScreenshotContext } from '../context/ScreenshotContext';

export interface SaveButtonProps {
  cutoutBoxX: number;
  cutoutBoxY: number;
  cutoutBoxWidth: number;
  cutoutBoxHeight: number;
}

/**
 * 保存按钮组件
 */
export function SaveButton({
  cutoutBoxX,
  cutoutBoxY,
  cutoutBoxWidth,
  cutoutBoxHeight,
}: SaveButtonProps) {
  const { drawCanvasElement } = useScreenshotContext();
  const download = useDownLoad();

  const handleClick = () => {
    if (!drawCanvasElement) return;

    const context = drawCanvasElement.getContext('2d');
    if (!context) return;

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

    if (__isDev__) {
      console.info(
        '[DEBUG]',
        'screen width',
        cutoutBoxWidth,
        'screen height',
        cutoutBoxHeight,
        'screen x',
        cutoutBoxX,
        'screen y',
        cutoutBoxY,
      );
    }

    screenCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        download('截图', url);
      },
      'image/png',
      1,
    );
  };

  return (
    <div class={Style.save} onClick={handleClick}>
      <img src={save} alt="save" />
    </div>
  );
}

import type { FC } from 'preact/compat';
import save from '@screenshots/assets/images/save.svg';
import Style from '@screenshots/theme/save.module.scss';
import { downloadFile } from '@screenshots/utils';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';

export interface SaveButtonProps {
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
}

/**
 * 保存按钮组件 - 支持多格式/质量/文件名配置
 */
export const SaveButton: FC<SaveButtonProps> = ({
  cutoutBoxX,
  cutoutBoxY,
  cutoutBoxWidth,
  cutoutBoxHeight,
}) => {
  const {
    drawCanvasElement,
    exportFormat,
    exportQuality,
    exportFilename,
  } = useScreenshotStore(useShallow(state => ({
    drawCanvasElement: state.drawCanvasElement,
    exportFormat: state.exportFormat,
    exportQuality: state.exportQuality,
    exportFilename: state.exportFilename,
  })));

  const handleClick = () => {
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

    // 读取用户配置
    const format = exportFormat;
    const quality = exportQuality;
    const customFilename = exportFilename;

    // 生成文件名
    const now = new Date();
    const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const ext = format.replace('image/', '');
    const filename = customFilename || `screenshot_${ts}.${ext}`;

    screenCanvas.toBlob(
      (blob) => {
        if (!blob) {
          return;
        }
        const url = URL.createObjectURL(blob);
        downloadFile(filename, url);
      },
      format,
      quality,
    );
  };

  return (
    <div class={Style.save} onClick={handleClick}>
      <img src={save} alt="save" />
    </div>
  );
};

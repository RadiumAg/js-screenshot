import refuse from '@screenshots/assets/images/refuse.svg';
import Style from '@screenshots/theme/refuse.module.scss';
import type { FC } from 'preact/compat';
import { useScreenshotStore } from '../../store/screenshot-store';

export interface RefuseButtonProps {
  onCancel: () => void;
}

/**
 * 取消按钮组件
 */
export const RefuseButton: FC<RefuseButtonProps> = ({ onCancel }) => {
  const { operateHistory, drawCanvasElement } = useScreenshotStore();

  const handleClick = () => {
    // 清空操作历史
    operateHistory.clear();

    // 移除 canvas
    drawCanvasElement?.remove();

    // 调用取消回调
    onCancel();
  };

  return (
    <div class={Style.refuse} onClick={handleClick}>
      <img src={refuse} alt="refuse" />
    </div>
  );
}

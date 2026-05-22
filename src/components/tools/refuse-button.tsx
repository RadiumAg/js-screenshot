import type { FC } from 'preact/compat';
import refuse from '@screenshots/assets/images/refuse.svg';
import Style from '@screenshots/theme/refuse.module.scss';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';

export interface RefuseButtonProps {
  onCancel: () => void
}

/**
 * 取消按钮组件
 */
export const RefuseButton: FC<RefuseButtonProps> = ({ onCancel }) => {
  const { operateHistory, drawCanvasElement } = useScreenshotStore(useShallow(state => ({
    operateHistory: state.operateHistory,
    drawCanvasElement: state.drawCanvasElement,
  })));

  const handleClick = () => {
    operateHistory.clear();

    drawCanvasElement?.remove();

    onCancel();
  };

  return (
    <div class={Style.refuse} onClick={handleClick}>
      <img src={refuse} alt="refuse" />
    </div>
  );
};

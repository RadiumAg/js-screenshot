import type { FC } from 'preact/compat';
import undo from '@screenshots/assets/images/undo.svg';
import Style from '@screenshots/theme/copy.module.scss';
import { useScreenshotStore } from '../../store/screenshot-store';

/**
 * 撤销按钮组件
 */
export const UndoButton: FC = () => {
  const undo_ = useScreenshotStore(state => state.undo);

  return (
    <div class={Style.copy} onClick={undo_}>
      <img src={undo} alt="undo" />
    </div>
  );
};

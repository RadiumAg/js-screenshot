import type { FC } from 'preact/compat';
import redo from '@screenshots/assets/images/redo.svg';
import Style from '@screenshots/theme/copy.module.scss';
import { useScreenshotStore } from '../../store/screenshot-store';

/**
 * 重做按钮组件
 */
export const RedoButton: FC = () => {
  const redo_ = useScreenshotStore(state => state.redo);

  return (
    <div class={Style.copy} onClick={redo_}>
      <img src={redo} alt="redo" />
    </div>
  );
};

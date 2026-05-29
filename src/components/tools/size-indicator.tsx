import type { FC } from 'preact/compat';
import { useScreenshotStore } from '@screenshots/store/screenshot-store';
import Style from '@screenshots/theme/size-indicator.module.scss';
import { getPanelStyle, resolveTheme } from '@screenshots/theme/tokens';
import { useMemo } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';

export interface SizeIndicatorProps {
  width: number
  height: number
  dotControllerX: number
  dotControllerY: number
}

const FLIP_THRESHOLD = 32;

export const SizeIndicator: FC<SizeIndicatorProps> = (props) => {
  const { width, height, dotControllerX, dotControllerY } = props;

  const { uiTheme, themeColor } = useScreenshotStore(useShallow(state => ({
    uiTheme: state.uiTheme,
    themeColor: state.themeColor,
  })));

  const resolvedTheme = useMemo(() => resolveTheme(uiTheme), [uiTheme]);
  const panelTokens = useMemo(
    () => getPanelStyle(resolvedTheme, themeColor),
    [resolvedTheme, themeColor],
  );

  // 顶部空间不足时翻到选区内侧底部
  const placement = dotControllerY < FLIP_THRESHOLD ? 'inside' : 'outside';

  return (
    <div
      class={`${Style.sizeIndicator} ${Style[placement]}`}
      style={{
        ...panelTokens,
        top: `${dotControllerY}px`,
        left: `${dotControllerX}px`,
      } as any}
      role="status"
      aria-label={`尺寸 ${width} × ${height}`}
    >
      <span>{width}</span>
      <span class={Style.separator}>×</span>
      <span>{height}</span>
    </div>
  );
};

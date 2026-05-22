import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/arrow-options.module.scss';
import { useMemoizedFn } from 'ahooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { ACTIVE_TYPE } from '../utils/share';
import { ColorPalette, LineWidthSlider, OptionsPanel } from './options';

export const ArrowOptions: FC = () => {
  const { toolsConfig, setToolsConfig } = useScreenshotStore(useShallow(state => ({
    toolsConfig: state.toolsConfig,
    setToolsConfig: state.setToolsConfig,
  })));

  const arrowConfig = toolsConfig.arrow ?? {};
  const lineType = arrowConfig.lineType ?? 'arrow';
  const lineWidth = arrowConfig.lineWidth ?? 2;
  const arrowColor = arrowConfig.color ?? 'red';

  const handleSetLineType = useMemoizedFn((type: 'arrow' | 'line') => {
    setToolsConfig({
      ...toolsConfig,
      arrow: { ...arrowConfig, lineType: type },
    });
  });

  const handleSetLineWidth = useMemoizedFn((width: number) => {
    setToolsConfig({
      ...toolsConfig,
      arrow: { ...arrowConfig, lineWidth: width },
    });
  });

  const handleSetColor = useMemoizedFn((color: string) => {
    setToolsConfig({
      ...toolsConfig,
      arrow: { ...arrowConfig, color },
    });
  });

  return (
    <OptionsPanel activeType={ACTIVE_TYPE.arrow}>
      <div class={Style.section}>
        <div
          class={`${Style.optionBtn} ${lineType === 'arrow' ? Style.active : ''}`}
          onClick={() => handleSetLineType('arrow')}
          title="箭头"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <line x1="2" y1="14" x2="13" y2="3" stroke="currentColor" strokeWidth="2" />
            <polyline points="8,2 14,2 14,8" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div
          class={`${Style.optionBtn} ${lineType === 'line' ? Style.active : ''}`}
          onClick={() => handleSetLineType('line')}
          title="直线"
        >
          <div class={Style.lineIcon} />
        </div>
      </div>

      <div class={Style.divider} />
      <LineWidthSlider value={lineWidth} onChange={handleSetLineWidth} />
      <div class={Style.divider} />
      <ColorPalette currentColor={arrowColor} onColorChange={handleSetColor} />
    </OptionsPanel>
  );
};

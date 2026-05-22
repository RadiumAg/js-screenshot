import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/arrow-options.module.scss';
import { useMemoizedFn } from 'ahooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { ACTIVE_TYPE } from '../utils/share';
import { ColorPalette, FontSizeSelector, OptionsPanel } from './options';

export const TextBoxOptions: FC = () => {
  const { toolsConfig, setToolsConfig } = useScreenshotStore(useShallow(state => ({
    toolsConfig: state.toolsConfig,
    setToolsConfig: state.setToolsConfig,
  })));

  const textBoxConfig = toolsConfig.textBox ?? {};
  const fontSize = textBoxConfig.fontSize ?? 24;
  const textColor = textBoxConfig.color ?? '#ff0000';
  const filled = textBoxConfig.filled ?? false;

  const handleSetFontSize = useMemoizedFn((size: number) => {
    setToolsConfig({
      ...toolsConfig,
      textBox: { ...textBoxConfig, fontSize: size },
    });
  });

  const handleToggleFilled = useMemoizedFn(() => {
    setToolsConfig({
      ...toolsConfig,
      textBox: { ...textBoxConfig, filled: !filled },
    });
  });

  const handleSetColor = useMemoizedFn((color: string) => {
    setToolsConfig({
      ...toolsConfig,
      textBox: { ...textBoxConfig, color },
    });
  });

  return (
    <OptionsPanel activeType={ACTIVE_TYPE.textBox}>
      <FontSizeSelector value={fontSize} onChange={handleSetFontSize} />

      <div class={Style.divider} />

      <div class={Style.section}>
        <div
          class={`${Style.optionBtn} ${filled ? Style.active : ''}`}
          onClick={handleToggleFilled}
          title="填充背景"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" />
            <text x="8" y="12" textAnchor="middle" fill={filled ? 'var(--ss-surface, #fff)' : 'currentColor'} fontSize="9" fontWeight="bold">A</text>
          </svg>
        </div>
      </div>

      <div class={Style.divider} />
      <ColorPalette currentColor={textColor} onColorChange={handleSetColor} />
    </OptionsPanel>
  );
};

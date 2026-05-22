import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/arrow-options.module.scss';
import { useMemoizedFn } from 'ahooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { ColorPalette, LineWidthSlider, OptionsPanel } from './options';

export interface ShapeOptionsProps {
  activeType: string
  configKey: 'rect' | 'ellipse' | 'pen'
}

export const ShapeOptions: FC<ShapeOptionsProps> = (props) => {
  const { activeType, configKey } = props;
  const { toolsConfig, setToolsConfig } = useScreenshotStore(useShallow(state => ({
    toolsConfig: state.toolsConfig,
    setToolsConfig: state.setToolsConfig,
  })));

  const shapeConfig = toolsConfig[configKey] ?? {};
  const lineWidth = shapeConfig.lineWidth ?? 2;
  const shapeColor = shapeConfig.color ?? 'red';

  const handleSetLineWidth = useMemoizedFn((width: number) => {
    setToolsConfig({
      ...toolsConfig,
      [configKey]: { ...shapeConfig, lineWidth: width },
    });
  });

  const handleSetColor = useMemoizedFn((color: string) => {
    setToolsConfig({
      ...toolsConfig,
      [configKey]: { ...shapeConfig, color },
    });
  });

  return (
    <OptionsPanel activeType={activeType}>
      <LineWidthSlider value={lineWidth} onChange={handleSetLineWidth} />
      <div class={Style.divider} />
      <ColorPalette currentColor={shapeColor} onColorChange={handleSetColor} />
    </OptionsPanel>
  );
};

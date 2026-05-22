import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/arrow-options.module.scss';

const COLORS = [
  '#000000',
  '#ff0000',
  '#0000ff',
  '#00b050',
  '#ffc000',
  '#ff6600',
  '#9933ff',
  '#ffffff',
];

export interface ColorPaletteProps {
  currentColor: string
  onColorChange: (color: string) => void
}

export const ColorPalette: FC<ColorPaletteProps> = (props) => {
  const { currentColor, onColorChange } = props;

  return (
    <div class={Style.section}>
      {COLORS.map(color => (
        <div
          key={color}
          class={`${Style.colorDot} ${currentColor === color ? Style.active : ''} ${color === '#ffffff' ? Style.whiteDot : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => onColorChange(color)}
        />
      ))}
    </div>
  );
};

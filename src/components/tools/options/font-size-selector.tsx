import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/arrow-options.module.scss';

const FONT_SIZES = [8, 12, 16, 24, 36, 48, 60, 72];

export interface FontSizeSelectorProps {
  value: number
  onChange: (size: number) => void
}

export const FontSizeSelector: FC<FontSizeSelectorProps> = (props) => {
  const { value, onChange } = props;

  return (
    <div class={Style.fontSizeSection}>
      <select
        class={Style.fontSizeSelect}
        value={value}
        onChange={e => onChange(Number((e.target as HTMLSelectElement).value))}
      >
        {FONT_SIZES.map(size => (
          <option key={size} value={size}>{size}px</option>
        ))}
      </select>
    </div>
  );
};

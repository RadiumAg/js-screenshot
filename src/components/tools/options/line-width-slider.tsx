import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/arrow-options.module.scss';

export interface LineWidthSliderProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}

export const LineWidthSlider: FC<LineWidthSliderProps> = (props) => {
  const { value, min = 1, max = 10, onChange } = props;

  return (
    <div class={Style.sliderSection}>
      <input
        type="range"
        class={Style.slider}
        min={min}
        max={max}
        value={value}
        onInput={e => onChange(Number((e.target as HTMLInputElement).value))}
      />
    </div>
  );
};

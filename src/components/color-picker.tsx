import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/color-picker.module.scss';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../store/screenshot-store';

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

export const ColorPicker: FC = () => {
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { currentColor, setCurrentColor } = useScreenshotStore(useShallow(state => ({
    currentColor: state.currentColor,
    setCurrentColor: state.setCurrentColor,
  })));

  const handleToggle = useCallback(() => setVisible(v => !v), []);

  const handleSelect = useCallback((color: string) => {
    setCurrentColor(color);
    setVisible(false);
  }, [setCurrentColor]);

  useEffect(() => {
    if (!visible)
      return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible]);

  return (
    <div ref={panelRef} class={Style.colorPickerWrapper}>
      <div
        class={Style.colorButton}
        onClick={handleToggle}
      >
        <div class={Style.colorIndicator} style={{ backgroundColor: currentColor }} />
      </div>
      {visible && (
        <div class={Style.colorPanel}>
          {COLORS.map(color => (
            <div
              key={color}
              class={`${Style.colorDot} ${currentColor === color ? Style.active : ''} ${color === '#ffffff' ? Style.whiteDot : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleSelect(color)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

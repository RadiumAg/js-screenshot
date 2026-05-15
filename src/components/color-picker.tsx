import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/color-picker.module.scss';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../store/screenshot-store';
import { ACTIVE_TYPE } from './utils/share';

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

const DRAWING_TOOLS = [ACTIVE_TYPE.pen, ACTIVE_TYPE.arrow, ACTIVE_TYPE.textBox];

export const ColorPicker: FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const { currentColor, activeTarget, setCurrentColor } = useScreenshotStore(useShallow(state => ({
    currentColor: state.currentColor,
    activeTarget: state.activeTarget,
    setCurrentColor: state.setCurrentColor,
  })));

  const isVisible = DRAWING_TOOLS.includes(activeTarget as any);

  const handleSelect = useCallback((color: string) => {
    setCurrentColor(color);
  }, [setCurrentColor]);

  useEffect(() => {
    if (!isVisible)
      return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-tool-btn]') && !target.closest('canvas')) {
          useScreenshotStore.getState().setActiveTarget(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  if (!isVisible)
    return null;

  const activeBtn = document.querySelector(`[data-tool-btn="${activeTarget}"]`);

  return (
    <div
      ref={panelRef}
      class={Style.colorPanel}
      style={activeBtn ? {
        position: 'fixed',
        left: `${activeBtn.getBoundingClientRect().left + activeBtn.getBoundingClientRect().width / 2}px`,
        top: `${activeBtn.getBoundingClientRect().bottom + 6}px`,
        transform: 'translateX(-50%)',
      } : { display: 'none' }}
    >
      {COLORS.map(color => (
        <div
          key={color}
          class={`${Style.colorDot} ${currentColor === color ? Style.active : ''} ${color === '#ffffff' ? Style.whiteDot : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => handleSelect(color)}
        />
      ))}
    </div>
  );
};

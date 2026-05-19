import type { FC } from 'preact/compat';
import { useMemoizedFn } from 'ahooks';
import Style from '@screenshots/theme/color-picker.module.scss';
import { createPortal } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';
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

const DRAWING_TOOLS = [ACTIVE_TYPE.textBox, ACTIVE_TYPE.rect];

export const ColorPicker: FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number, y: number } | null>(null);
  const { currentColor, activeTarget, setCurrentColor } = useScreenshotStore(useShallow(state => ({
    currentColor: state.currentColor,
    activeTarget: state.activeTarget,
    setCurrentColor: state.setCurrentColor,
  })));

  const isVisible = activeTarget !== null && DRAWING_TOOLS.includes(activeTarget as ACTIVE_TYPE);

  const handleSelect = useMemoizedFn((color: string) => {
    setCurrentColor(color);
  });

  // 计算面板位置
  useEffect(() => {
    if (!isVisible) {
      setPos(null);
      return;
    }

    const updatePos = () => {
      const btn = document.querySelector(`[data-tool-btn="${activeTarget}"]`);
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setPos({ x: rect.left + rect.width / 2, y: rect.bottom + 6 });
      }
    };

    updatePos();
    // 延迟再更新一次，确保 DOM 已渲染
    const timer = setTimeout(updatePos, 0);
    return () => clearTimeout(timer);
  }, [isVisible, activeTarget]);

  // 点击外部关闭
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

  if (!isVisible || !pos)
    return null;

  return createPortal(
    <div
      ref={panelRef}
      class={Style.colorPanel}
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {COLORS.map(color => (
        <div
          key={color}
          class={`${Style.colorDot} ${currentColor === color ? Style.active : ''} ${color === '#ffffff' ? Style.whiteDot : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => handleSelect(color)}
        />
      ))}
    </div>,
    document.body,
  );
};

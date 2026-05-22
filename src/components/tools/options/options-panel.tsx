import type { ComponentChildren } from 'preact';
import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/arrow-options.module.scss';
import { getPanelStyle, resolveTheme } from '@screenshots/theme/tokens';
import { createPortal } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../../store/screenshot-store';

export interface OptionsPanelProps {
  activeType: string
  children: ComponentChildren
}

export const OptionsPanel: FC<OptionsPanelProps> = (props) => {
  const { activeType, children } = props;
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number, y: number } | null>(null);

  const { activeTarget, uiTheme, themeColor } = useScreenshotStore(useShallow(state => ({
    activeTarget: state.activeTarget,
    uiTheme: state.uiTheme,
    themeColor: state.themeColor,
  })));

  const resolvedTheme = resolveTheme(uiTheme);
  const panelTokens = getPanelStyle(resolvedTheme, themeColor);
  const isVisible = activeTarget === activeType;

  useEffect(() => {
    if (!isVisible) {
      setPos(null);
      return;
    }

    const updatePos = () => {
      const btn = document.querySelector(`[data-tool-btn="${activeType}"]`);
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setPos({ x: rect.left + rect.width / 2, y: rect.bottom + 12 });
      }
    };

    updatePos();
    const timer = setTimeout(updatePos, 0);
    return () => clearTimeout(timer);
  }, [isVisible]);

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

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isVisible]);

  if (!isVisible || !pos)
    return null;

  return createPortal(
    <div
      ref={panelRef}
      class={Style.optionsPanel}
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translateX(-50%)',
        ...panelTokens,
      }}
    >
      {children}
    </div>,
    document.body,
  );
};

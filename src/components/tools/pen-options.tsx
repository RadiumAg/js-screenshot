import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/arrow-options.module.scss';
import { getPanelStyle, resolveTheme } from '@screenshots/theme/tokens';
import { useMemoizedFn } from 'ahooks';
import { createPortal } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../../store/screenshot-store';
import { ACTIVE_TYPE } from '../utils/share';

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

export const PenOptions: FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number, y: number } | null>(null);
  const { activeTarget, toolsConfig, setToolsConfig, uiTheme } = useScreenshotStore(useShallow(state => ({
    activeTarget: state.activeTarget,
    toolsConfig: state.toolsConfig,
    setToolsConfig: state.setToolsConfig,
    uiTheme: state.uiTheme,
  })));

  const resolvedTheme = resolveTheme(uiTheme);
  const panelTokens = getPanelStyle(resolvedTheme);

  const isVisible = activeTarget === ACTIVE_TYPE.pen;
  const penConfig = toolsConfig.pen ?? {};
  const lineWidth = penConfig.lineWidth ?? 2;
  const penColor = penConfig.color ?? 'red';

  const handleSetLineWidth = useMemoizedFn((width: number) => {
    setToolsConfig({
      ...toolsConfig,
      pen: { ...penConfig, lineWidth: width },
    });
  });

  const handleSetColor = useMemoizedFn((color: string) => {
    setToolsConfig({
      ...toolsConfig,
      pen: { ...penConfig, color },
    });
  });

  useEffect(() => {
    if (!isVisible) {
      setPos(null);
      return;
    }

    const updatePos = () => {
      const btn = document.querySelector(`[data-tool-btn="${ACTIVE_TYPE.pen}"]`);
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
      {/* 粗细滑块 */}
      <div class={Style.sliderSection}>
        <input
          type="range"
          class={Style.slider}
          min="1"
          max="20"
          value={lineWidth}
          onInput={e => handleSetLineWidth(Number((e.target as HTMLInputElement).value))}
        />
      </div>

      <div class={Style.divider} />

      {/* 颜色选择 */}
      <div class={Style.section}>
        {COLORS.map(color => (
          <div
            key={color}
            class={`${Style.colorDot} ${penColor === color ? Style.active : ''} ${color === '#ffffff' ? Style.whiteDot : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => handleSetColor(color)}
          />
        ))}
      </div>
    </div>,
    document.body,
  );
};

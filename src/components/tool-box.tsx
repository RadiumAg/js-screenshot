import type { FC } from 'preact/compat';
import { getPanelStyle } from '@screenshots/theme/tokens';
import Style from '@screenshots/theme/tool-box.module.scss';
import { animateThrottleFn } from '@screenshots/utils';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useScreenshotStore } from '../store/screenshot-store';
import { ArrowTool } from './tools/arrow-tool';
import { CopyButton } from './tools/copy-button';
import { EllipseTool } from './tools/ellipse-tool';
import { MosaicTool } from './tools/mosaic-tool';
import { PenTool } from './tools/pen-tool';
import { RectTool } from './tools/rect-tool';
import { RefuseButton } from './tools/refuse-button';
import { SaveButton } from './tools/save-button';
import { ShapeOptions } from './tools/shape-options';
import { TextBoxOptions } from './tools/text-box-options';
import { TextBoxTool } from './tools/text-box-tool';

export interface ToolBoxProps {
  cutoutBoxX: number
  cutoutBoxY: number
  cutoutBoxWidth: number
  cutoutBoxHeight: number
  onCancel: () => void
}

/**
 * 工具箱组件
 */
export const ToolBox: FC<ToolBoxProps> = ({
  cutoutBoxX,
  cutoutBoxY,
  cutoutBoxWidth,
  cutoutBoxHeight,
  onCancel,
}) => {
  const elRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });

  const { uiTheme, themeColor } = useScreenshotStore(useShallow(state => ({
    uiTheme: state.uiTheme,
    themeColor: state.themeColor,
  })));

  // 解析实际主题：auto 模式跟随系统 prefers-color-scheme
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    if (uiTheme !== 'auto')
      return uiTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (uiTheme !== 'auto') {
      setResolvedTheme(uiTheme);
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      setResolvedTheme(event.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [uiTheme]);

  const updatePosition = (x: number, y: number) => {
    if (!elRef.current)
      return;

    positionRef.current = { x, y };
    elRef.current.style.left = `${x}px`;
    elRef.current.style.top = `${y + 10}px`;
    elRef.current.style.transform = `translateX(-100%)`;
  };

  const throttledUpdatePosition = useMemo(
    () => animateThrottleFn((x: number, y: number) => {
      updatePosition(x, y);
    }),
    [],
  );

  // 初始化位置
  useEffect(() => {
    updatePosition(cutoutBoxX + cutoutBoxWidth, cutoutBoxY + cutoutBoxHeight);
  }, [cutoutBoxX, cutoutBoxY, cutoutBoxWidth, cutoutBoxHeight]);

  // 当裁剪框位置或尺寸变化时更新工具箱位置
  useEffect(() => {
    throttledUpdatePosition(cutoutBoxX + cutoutBoxWidth, cutoutBoxY + cutoutBoxHeight);
  }, [cutoutBoxX, cutoutBoxY, cutoutBoxWidth, cutoutBoxHeight, throttledUpdatePosition]);

  const toolBoxClass = `${Style.toolBox} ${Style[resolvedTheme]}`;
  const panelTokens = getPanelStyle(resolvedTheme, themeColor);

  return (
    <div
      ref={elRef}
      class={toolBoxClass}
      style={{
        ...panelTokens,
      } as any}
    >
      <TextBoxTool
        cutoutBoxX={cutoutBoxX}
        cutoutBoxY={cutoutBoxY}
        cutoutBoxWidth={cutoutBoxWidth}
        cutoutBoxHeight={cutoutBoxHeight}
      />
      <PenTool
        cutoutBoxX={cutoutBoxX}
        cutoutBoxY={cutoutBoxY}
        cutoutBoxWidth={cutoutBoxWidth}
        cutoutBoxHeight={cutoutBoxHeight}
      />
      <ArrowTool
        cutoutBoxX={cutoutBoxX}
        cutoutBoxY={cutoutBoxY}
        cutoutBoxWidth={cutoutBoxWidth}
        cutoutBoxHeight={cutoutBoxHeight}
      />
      <RectTool
        cutoutBoxX={cutoutBoxX}
        cutoutBoxY={cutoutBoxY}
        cutoutBoxWidth={cutoutBoxWidth}
        cutoutBoxHeight={cutoutBoxHeight}
      />
      <EllipseTool
        cutoutBoxX={cutoutBoxX}
        cutoutBoxY={cutoutBoxY}
        cutoutBoxWidth={cutoutBoxWidth}
        cutoutBoxHeight={cutoutBoxHeight}
      />
      <MosaicTool
        cutoutBoxX={cutoutBoxX}
        cutoutBoxY={cutoutBoxY}
        cutoutBoxWidth={cutoutBoxWidth}
        cutoutBoxHeight={cutoutBoxHeight}
      />
      <RefuseButton onCancel={onCancel} />
      <CopyButton
        cutoutBoxX={cutoutBoxX}
        cutoutBoxY={cutoutBoxY}
        cutoutBoxWidth={cutoutBoxWidth}
        cutoutBoxHeight={cutoutBoxHeight}
      />
      <SaveButton
        cutoutBoxX={cutoutBoxX}
        cutoutBoxY={cutoutBoxY}
        cutoutBoxWidth={cutoutBoxWidth}
        cutoutBoxHeight={cutoutBoxHeight}
      />
      <TextBoxOptions />
      <ShapeOptions activeType="rect" configKey="rect" />
      <ShapeOptions activeType="ellipse" configKey="ellipse" />
    </div>
  );
};

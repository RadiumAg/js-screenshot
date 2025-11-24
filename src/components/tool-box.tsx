import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/tool-box.module.scss';
import { animateThrottleFn } from '@screenshots/utils';
import { useEffect, useRef } from 'preact/hooks';
import { ArrowTool } from './tools/arrow-tool';
import { MosaicTool } from './tools/mosaic-tool';
import { PenTool } from './tools/pen-tool';
import { RefuseButton } from './tools/refuse-button';
import { SaveButton } from './tools/save-button';
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

  const updatePosition = (x: number, y: number) => {
    if (!elRef.current)
      return;

    positionRef.current = { x, y };
    elRef.current.style.left = `${x}px`;
    elRef.current.style.top = `${y + 10}px`;
    elRef.current.style.transform = `translateX(-100%)`;
  };

  const throttledUpdatePosition = useRef(
    animateThrottleFn((x: number, y: number) => {
      updatePosition(x, y);
    }),
  ).current;

  // 初始化位置
  useEffect(() => {
    updatePosition(cutoutBoxX + cutoutBoxWidth, cutoutBoxY + cutoutBoxHeight);
  }, [cutoutBoxX, cutoutBoxY, cutoutBoxWidth, cutoutBoxHeight]);

  // 当裁剪框位置或尺寸变化时更新工具箱位置
  useEffect(() => {
    throttledUpdatePosition(cutoutBoxX + cutoutBoxWidth, cutoutBoxY + cutoutBoxHeight);
  }, [cutoutBoxX, cutoutBoxY, cutoutBoxWidth, cutoutBoxHeight, throttledUpdatePosition]);

  return (
    <div
      ref={elRef}
      class={Style.toolBox}
      style={{
        position: 'fixed',
        zIndex: '4',
      }}
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
      <MosaicTool
        cutoutBoxX={cutoutBoxX}
        cutoutBoxY={cutoutBoxY}
        cutoutBoxWidth={cutoutBoxWidth}
        cutoutBoxHeight={cutoutBoxHeight}
      />
      <RefuseButton onCancel={onCancel} />
      <SaveButton
        cutoutBoxX={cutoutBoxX}
        cutoutBoxY={cutoutBoxY}
        cutoutBoxWidth={cutoutBoxWidth}
        cutoutBoxHeight={cutoutBoxHeight}
      />
    </div>
  );
};

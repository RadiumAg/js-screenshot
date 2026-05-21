import type { ArrowShape, BoundingBox, ControlPoint, EllipseShape, LineShape, RectShape, Shape, TextShape } from './types';
import { ControlPointPosition, ShapeType } from './types';

/**
 * 渲染单个矩形
 */
function renderRect(ctx: CanvasRenderingContext2D, shape: RectShape): void {
  ctx.beginPath();
  ctx.strokeStyle = shape.style.color;
  ctx.lineWidth = shape.style.lineWidth;
  ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
}

/**
 * 渲染单个椭圆
 */
function renderEllipse(ctx: CanvasRenderingContext2D, shape: EllipseShape): void {
  ctx.beginPath();
  ctx.strokeStyle = shape.style.color;
  ctx.lineWidth = shape.style.lineWidth;
  ctx.ellipse(shape.cx, shape.cy, Math.abs(shape.rx), Math.abs(shape.ry), 0, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * 渲染单个箭头
 */
function renderArrow(ctx: CanvasRenderingContext2D, shape: ArrowShape): void {
  const { startX, startY, endX, endY, arrowSize, lineType, style } = shape;
  ctx.beginPath();
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.lineWidth;
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  if (lineType === 'arrow') {
    const angle = Math.atan2(endY - startY, endX - startX);
    const headLength = arrowSize * style.lineWidth / 2;

    ctx.beginPath();
    ctx.fillStyle = style.color;
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLength * Math.cos(angle - Math.PI / 6),
      endY - headLength * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      endX - headLength * Math.cos(angle + Math.PI / 6),
      endY - headLength * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * 渲染单条线段
 */
function renderLine(ctx: CanvasRenderingContext2D, shape: LineShape): void {
  ctx.beginPath();
  ctx.strokeStyle = shape.style.color;
  ctx.lineWidth = shape.style.lineWidth;
  ctx.moveTo(shape.startX, shape.startY);
  ctx.lineTo(shape.endX, shape.endY);
  ctx.stroke();
}

/**
 * 渲染单个文本
 */
function renderText(ctx: CanvasRenderingContext2D, shape: TextShape): void {
  const { x, y, lines, style } = shape;
  ctx.fillStyle = style.color;
  ctx.font = `${style.fontSize}px ${style.fontFamily}`;
  ctx.textBaseline = 'top';

  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * style.lineHeight);
  });
}

/**
 * 渲染单个图形
 */
export function renderShape(ctx: CanvasRenderingContext2D, shape: Shape): void {
  switch (shape.type) {
    case ShapeType.Rect:
      renderRect(ctx, shape);
      break;
    case ShapeType.Ellipse:
      renderEllipse(ctx, shape);
      break;
    case ShapeType.Arrow:
      renderArrow(ctx, shape);
      break;
    case ShapeType.Line:
      renderLine(ctx, shape);
      break;
    case ShapeType.Text:
      renderText(ctx, shape);
      break;
  }
}

/**
 * 渲染所有图形
 */
export function renderAllShapes(ctx: CanvasRenderingContext2D, shapes: Shape[]): void {
  for (const shape of shapes) {
    renderShape(ctx, shape);
  }
}

/**
 * 获取图形的包围盒
 */
export function getShapeBoundingBox(shape: Shape): BoundingBox {
  switch (shape.type) {
    case ShapeType.Rect:
      return {
        x: Math.min(shape.x, shape.x + shape.width),
        y: Math.min(shape.y, shape.y + shape.height),
        width: Math.abs(shape.width),
        height: Math.abs(shape.height),
      };
    case ShapeType.Ellipse:
      return {
        x: shape.cx - Math.abs(shape.rx),
        y: shape.cy - Math.abs(shape.ry),
        width: Math.abs(shape.rx) * 2,
        height: Math.abs(shape.ry) * 2,
      };
    case ShapeType.Arrow:
    case ShapeType.Line:
      return {
        x: Math.min(shape.startX, shape.endX),
        y: Math.min(shape.startY, shape.endY),
        width: Math.abs(shape.endX - shape.startX),
        height: Math.abs(shape.endY - shape.startY),
      };
    case ShapeType.Text:
      return {
        x: shape.x,
        y: shape.y,
        width: getTextWidth(shape),
        height: shape.lines.length * shape.style.lineHeight,
      };
  }
}

/**
 * 估算文本宽度（用于包围盒计算）
 */
function getTextWidth(shape: TextShape): number {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx)
    return 100;

  ctx.font = `${shape.style.fontSize}px ${shape.style.fontFamily}`;
  let maxWidth = 0;
  for (const line of shape.lines) {
    const measured = ctx.measureText(line).width;
    if (measured > maxWidth)
      maxWidth = measured;
  }
  return Math.max(maxWidth, 40);
}

/**
 * 获取图形选中态的控制点列表
 */
export function getControlPoints(shape: Shape): ControlPoint[] {
  const box = getShapeBoundingBox(shape);
  const { x, y, width, height } = box;

  return [
    { position: ControlPointPosition.TopLeft, x, y, cursor: 'nwse-resize' },
    { position: ControlPointPosition.TopCenter, x: x + width / 2, y, cursor: 'ns-resize' },
    { position: ControlPointPosition.TopRight, x: x + width, y, cursor: 'nesw-resize' },
    { position: ControlPointPosition.MiddleLeft, x, y: y + height / 2, cursor: 'ew-resize' },
    { position: ControlPointPosition.MiddleRight, x: x + width, y: y + height / 2, cursor: 'ew-resize' },
    { position: ControlPointPosition.BottomLeft, x, y: y + height, cursor: 'nesw-resize' },
    { position: ControlPointPosition.BottomCenter, x: x + width / 2, y: y + height, cursor: 'ns-resize' },
    { position: ControlPointPosition.BottomRight, x: x + width, y: y + height, cursor: 'nwse-resize' },
  ];
}

/**
 * 渲染选中态（包围盒虚线 + 控制点）
 * TextShape 只显示包围盒，不显示控制点
 */
export function renderSelection(ctx: CanvasRenderingContext2D, shape: Shape, themeColor = '#1677ff'): void {
  const box = getShapeBoundingBox(shape);
  const controlPointRadius = 4;

  // 绘制虚线包围盒
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(box.x - 4, box.y - 4, box.width + 8, box.height + 8);
  ctx.setLineDash([]);

  // TextShape 不需要控制点
  if (shape.type !== ShapeType.Text) {
    const controlPoints = getControlPoints(shape);
    for (const point of controlPoints) {
      ctx.beginPath();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 1.5;
      ctx.arc(point.x, point.y, controlPointRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}

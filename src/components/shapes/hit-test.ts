import type { ControlPoint, Shape } from './types';
import { getControlPoints, getShapeBoundingBox } from './shape-renderer';
import { ShapeType } from './types';

const CONTROL_POINT_RADIUS = 6;
const LINE_HIT_TOLERANCE = 6;

/**
 * 检测点是否在控制点上，返回命中的控制点
 */
export function hitTestControlPoint(
  mouseX: number,
  mouseY: number,
  shape: Shape,
): ControlPoint | null {
  const controlPoints = getControlPoints(shape);
  for (const point of controlPoints) {
    const dx = mouseX - point.x;
    const dy = mouseY - point.y;
    if (dx * dx + dy * dy <= CONTROL_POINT_RADIUS * CONTROL_POINT_RADIUS) {
      return point;
    }
  }
  return null;
}

/**
 * 检测点是否在线段附近（用于 Line 和 Arrow 的命中检测）
 */
function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

/**
 * 检测点是否在矩形边框上
 */
function hitTestRect(mouseX: number, mouseY: number, shape: Shape & { type: typeof ShapeType.Rect }): boolean {
  const box = getShapeBoundingBox(shape);
  const tolerance = Math.max(LINE_HIT_TOLERANCE, shape.style.lineWidth / 2 + 2);
  const { x, y, width, height } = box;

  // 检测四条边
  const onTop = pointToSegmentDistance(mouseX, mouseY, x, y, x + width, y) <= tolerance;
  const onBottom = pointToSegmentDistance(mouseX, mouseY, x, y + height, x + width, y + height) <= tolerance;
  const onLeft = pointToSegmentDistance(mouseX, mouseY, x, y, x, y + height) <= tolerance;
  const onRight = pointToSegmentDistance(mouseX, mouseY, x + width, y, x + width, y + height) <= tolerance;

  return onTop || onBottom || onLeft || onRight;
}

/**
 * 检测点是否在椭圆边框上
 */
function hitTestEllipse(mouseX: number, mouseY: number, shape: Shape & { type: typeof ShapeType.Ellipse }): boolean {
  const { cx, cy, rx, ry, style } = shape;
  const absRx = Math.abs(rx);
  const absRy = Math.abs(ry);

  if (absRx === 0 || absRy === 0)
    return false;

  // 椭圆方程: (x-cx)²/rx² + (y-cy)²/ry² = 1
  // 检测点到椭圆边的距离是否在容差内
  const tolerance = Math.max(LINE_HIT_TOLERANCE, style.lineWidth / 2 + 2);
  const outerScale = (absRx + tolerance) / absRx;
  const innerScale = Math.max(0, (absRx - tolerance) / absRx);

  const outerDistance = ((mouseX - cx) ** 2) / ((absRx * outerScale) ** 2) + ((mouseY - cy) ** 2) / ((absRy * outerScale) ** 2);
  const innerDistance = ((mouseX - cx) ** 2) / ((absRx * innerScale) ** 2) + ((mouseY - cy) ** 2) / ((absRy * innerScale) ** 2);

  return outerDistance <= 1 && innerDistance >= 1;
}

/**
 * 检测点是否在线段/箭头上
 */
function hitTestLine(mouseX: number, mouseY: number, shape: Shape & { type: typeof ShapeType.Line | typeof ShapeType.Arrow }): boolean {
  const tolerance = Math.max(LINE_HIT_TOLERANCE, shape.style.lineWidth / 2 + 2);
  return pointToSegmentDistance(mouseX, mouseY, shape.startX, shape.startY, shape.endX, shape.endY) <= tolerance;
}

/**
 * 检测点击命中了哪个图形（从后往前检测，后绘制的在上面）
 */
export function hitTestShape(mouseX: number, mouseY: number, shapes: Shape[]): Shape | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    let hit = false;

    switch (shape.type) {
      case ShapeType.Rect:
        hit = hitTestRect(mouseX, mouseY, shape);
        break;
      case ShapeType.Ellipse:
        hit = hitTestEllipse(mouseX, mouseY, shape);
        break;
      case ShapeType.Arrow:
      case ShapeType.Line:
        hit = hitTestLine(mouseX, mouseY, shape);
        break;
    }

    if (hit)
      return shape;
  }

  return null;
}

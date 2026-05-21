/**
 * 图形类型枚举
 */
export enum ShapeType {
  Rect = 'rect',
  Ellipse = 'ellipse',
  Arrow = 'arrow',
  Line = 'line',
  Text = 'text',
}

/**
 * 控制点位置枚举
 */
export enum ControlPointPosition {
  TopLeft = 'top-left',
  TopCenter = 'top-center',
  TopRight = 'top-right',
  MiddleLeft = 'middle-left',
  MiddleRight = 'middle-right',
  BottomLeft = 'bottom-left',
  BottomCenter = 'bottom-center',
  BottomRight = 'bottom-right',
}

/**
 * 图形基础属性
 */
export interface ShapeStyle {
  color: string
  lineWidth: number
}

/**
 * 矩形图形
 */
export interface RectShape {
  id: string
  type: ShapeType.Rect
  x: number
  y: number
  width: number
  height: number
  style: ShapeStyle
}

/**
 * 椭圆图形
 */
export interface EllipseShape {
  id: string
  type: ShapeType.Ellipse
  cx: number
  cy: number
  rx: number
  ry: number
  style: ShapeStyle
}

/**
 * 箭头图形
 */
export interface ArrowShape {
  id: string
  type: ShapeType.Arrow
  startX: number
  startY: number
  endX: number
  endY: number
  arrowSize: number
  lineType: 'arrow' | 'line'
  style: ShapeStyle
}

/**
 * 线条图形
 */
export interface LineShape {
  id: string
  type: ShapeType.Line
  startX: number
  startY: number
  endX: number
  endY: number
  style: ShapeStyle
}

/**
 * 文本样式
 */
export interface TextStyle {
  color: string
  fontSize: number
  fontFamily: string
  lineHeight: number
}

/**
 * 文本图形
 */
export interface TextShape {
  id: string
  type: ShapeType.Text
  x: number
  y: number
  text: string
  lines: string[]
  style: TextStyle
}

/**
 * 所有图形的联合类型
 */
export type Shape = RectShape | EllipseShape | ArrowShape | LineShape | TextShape;

/**
 * 图形的包围盒（用于选中态和控制点计算）
 */
export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 控制点信息
 */
export interface ControlPoint {
  position: ControlPointPosition
  x: number
  y: number
  cursor: string
}

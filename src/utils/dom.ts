/**
 * 检查是否在当前区域内
 */
const isCurrentArea
  = (minX: number, maxX: number, minY: number, maxY: number, x: number, y: number) => {
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  };

export { isCurrentArea };

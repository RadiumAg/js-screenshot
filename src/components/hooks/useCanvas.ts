import { useEffect, useRef } from 'preact/hooks';

/**
 * Canvas Hook - 用于管理 Canvas 相关操作
 */
export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext('2d', {
        willReadFrequently: true,
      });
    }
  }, []);

  const createCanvas = (styles?: Partial<CSSStyleDeclaration>) => {
    const canvas = document.createElement('canvas');

    // 默认样式
    canvas.style.position = 'fixed';
    canvas.style.top = '0px';
    canvas.style.left = '0px';

    // 应用自定义样式
    if (styles) {
      Object.assign(canvas.style, styles);
    }

    return canvas;
  };

  const getContext = () => contextRef.current;

  const getCanvas = () => canvasRef.current;

  return {
    canvasRef,
    contextRef,
    createCanvas,
    getContext,
    getCanvas,
  };
}

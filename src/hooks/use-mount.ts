import { useEffect } from 'preact/hooks';

/**
 * useMount - 在组件挂载时执行副作用
 *
 * @param fn - 要执行的副作用函数
 *
 * @example
 * ```tsx
 * import { useMount } from './hooks/useMount';
 *
 * function MyComponent() {
 *   useMount(() => {
 *     console.log('Component mounted');
 *     // 执行初始化逻辑
 *   });
 *
 *   return <div>Hello World</div>;
 * }
 * ```
 */
export function useMount(fn: () => void): void {
  useEffect(() => {
    fn();
  }, []);
}

import { useCallback, useRef } from 'preact/hooks';

/**
 * useMemoizedFn - 持久化函数的 Hook
 *
 * 在某些场景中，我们需要使用 useCallback 来记住一个函数，但是在第二个参数 deps 变化时，
 * 会重新生成函数，导致函数地址变化。
 *
 * 使用 useMemoizedFn，可以省略第二个参数 deps，同时保证函数地址永远不会变化。
 *
 * @param fn 需要持久化的函数
 * @returns 持久化后的函数
 *
 * @example
 * ```tsx
 * import { useMemoizedFn } from './hooks/useMemoizedFn';
 *
 * function MyComponent() {
 *   const [count, setCount] = useState(0);
 *
 *   const handleClick = useMemoizedFn(() => {
 *     console.log('Current count:', count);
 *     setCount(count + 1);
 *   });
 *
 *   return <button onClick={handleClick}>Count: {count}</button>;
 * }
 * ```
 */
export function useMemoizedFn<T extends (...args: any[]) => any>(fn: T): T {
  const fnRef = useRef<T>(fn);

  // 每次渲染时更新 ref 中的函数，确保闭包中的值是最新的
  fnRef.current = fn;

  // 使用 useCallback 创建一个稳定的函数引用
  const memoizedFn = useCallback(
    ((...args: Parameters<T>) => {
      // 调用最新的函数
      return fnRef.current(...args);
    }) as T,
    [], // 空依赖数组，确保函数引用永远不变
  );

  return memoizedFn;
}

export default useMemoizedFn;

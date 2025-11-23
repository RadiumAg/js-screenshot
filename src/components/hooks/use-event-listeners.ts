import { useEffect, useRef } from 'preact/hooks';

export type EventListenerMap = Map<EventTarget, Map<string, EventListener>>;

/**
 * Event Listeners Hook - 用于管理事件监听器
 */
export function useEventListeners() {
  const eventListenersRef = useRef<EventListenerMap>(new Map());

  const addEventListener = (
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    target.addEventListener(type, listener, options);
    
    // 记录事件监听器以便清理
    if (!eventListenersRef.current.has(target)) {
      eventListenersRef.current.set(target, new Map());
    }
    eventListenersRef.current.get(target)!.set(type, listener);
  };

  const removeEventListener = (
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions
  ) => {
    target.removeEventListener(type, listener, options);
    
    // 从记录中移除
    const targetListeners = eventListenersRef.current.get(target);
    if (targetListeners) {
      targetListeners.delete(type);
      if (targetListeners.size === 0) {
        eventListenersRef.current.delete(target);
      }
    }
  };

  const clearAllEventListeners = () => {
    eventListenersRef.current.forEach((listeners, target) => {
      listeners.forEach((listener, type) => {
        target.removeEventListener(type, listener);
      });
    });
    eventListenersRef.current.clear();
  };

  // 组件卸载时清理所有事件监听器
  useEffect(() => {
    return () => {
      clearAllEventListeners();
    };
  }, []);

  return {
    addEventListener,
    removeEventListener,
    clearAllEventListeners,
  };
}

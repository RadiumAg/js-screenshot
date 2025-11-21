import { render } from 'preact';
import type { ComponentChildren } from 'preact';

/**
 * 渲染 Preact 组件到指定容器
 */
export function renderComponent(component: ComponentChildren, container?: HTMLElement) {
  const targetContainer = container || document.body;
  render(component, targetContainer);
}

/**
 * 创建一个临时容器并渲染组件
 */
export function createAndRenderComponent(component: ComponentChildren): HTMLElement {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9999';
  
  document.body.appendChild(container);
  render(component, container);
  
  return container;
}

/**
 * 销毁组件容器
 */
export function destroyComponentContainer(container: HTMLElement) {
  if (container && container.parentNode) {
    render(null, container);
    container.parentNode.removeChild(container);
  }
}

/**
 * 获取组件的 DOM 元素
 */
export function getComponentElement(container: HTMLElement): HTMLElement | null {
  return container.firstElementChild as HTMLElement;
}

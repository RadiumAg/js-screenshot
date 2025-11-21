import type { AnyFun } from './types';

function animateThrottleFn(fn: AnyFun) {
  let isFinished = false;

  return (...args: any[]) => {
    if (isFinished)
      return;
    isFinished = true;

    requestAnimationFrame(async () => {
      await fn(...args);
      isFinished = false;
    });
  };
}

export { animateThrottleFn };

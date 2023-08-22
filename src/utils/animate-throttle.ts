import { AnyFun } from './types';

const animateThrottleFn = (fn: AnyFun) => {
  let isFinished = false;

  return () => {
    if (isFinished) return;
    isFinished = true;

    requestAnimationFrame(() => {
      fn();
      isFinished = false;
    });
  };
};

export { animateThrottleFn };

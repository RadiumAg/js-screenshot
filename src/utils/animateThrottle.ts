import { AnyFun } from './types';

const animateThrottleFn = (fn: AnyFun) => {
  let isFinished = false;

  return (...args: any[]) => {
    let resolveFn: (value: unknown) => void;
    const promise = new Promise(resolve => {
      resolveFn = resolve;
    });
    if (isFinished) return;
    isFinished = true;

    requestAnimationFrame(async () => {
      await fn(...args);
      resolveFn('finish');
      isFinished = false;
    });

    return promise;
  };
};

export { animateThrottleFn };

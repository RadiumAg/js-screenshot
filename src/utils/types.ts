type AnyFun = (...args: any[]) => any;

type ScreenShotOptions = {
  mode?: 'media';
  afterFinished?: () => void;
};

export type { AnyFun, ScreenShotOptions };

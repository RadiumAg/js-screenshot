type AnyFun = (...args: any[]) => any;

interface ScreenShotOptions {
  mode?: 'media'
  afterFinished?: () => void
}

export type { AnyFun, ScreenShotOptions };

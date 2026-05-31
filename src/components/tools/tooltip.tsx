import type { FC } from 'preact/compat';
import Style from '@screenshots/theme/tooltip.module.scss';
import { useState } from 'preact/hooks';

interface TooltipProps {
  text: string
  children: preact.ComponentChildren
}

export const Tooltip: FC<TooltipProps> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      class={Style.wrapper}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && <span class={Style.tip}>{text}</span>}
    </div>
  );
};

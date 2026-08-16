// Badge.tsx
// Small type pill for settings labels (Integer, Boolean, etc.).
// --------------------------------------------------

import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export const Badge = ({ children, className }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex shrink-0 items-center rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-medium text-accent',
      className
    )}
  >
    {children}
  </span>
);

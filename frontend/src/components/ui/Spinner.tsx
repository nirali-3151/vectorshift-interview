// Spinner.tsx

import { cn } from '@/lib/cn';

type SpinnerProps = {
  className?: string;
};

export const Spinner = ({ className }: SpinnerProps) => (
  <span
    role="status"
    aria-label="Loading"
    className={cn(
      'inline-block size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent',
      className
    )}
  />
);

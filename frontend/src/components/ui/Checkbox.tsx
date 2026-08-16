// Checkbox.tsx
// Deliberately not built on controlClass: a checkbox has a fixed box rather
// than a growing field, so it shares only the focus ring.
// --------------------------------------------------

import { cn } from '@/lib/cn';

export const Checkbox = ({
  className,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'>) => (
  <input
    type="checkbox"
    className={cn(
      'size-3.5 shrink-0 cursor-pointer accent-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
      className
    )}
    {...props}
  />
);

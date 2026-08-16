// Button.tsx

import { cn } from '@/lib/cn';

const variants = {
  primary: 'bg-accent text-on-ink hover:bg-accent-hover',
  ghost: 'bg-transparent text-ink hover:bg-surface-muted',
} as const;

type ButtonVariant = keyof typeof variants;

type ButtonProps = React.ComponentProps<'button'> & {
  variant?: ButtonVariant;
};

export const Button = ({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) => (
  <button
    className={cn(
      'inline-flex cursor-pointer items-center justify-center gap-2 rounded-node px-4 py-1.5 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60',
      variants[variant],
      className
    )}
    {...props}
  />
);

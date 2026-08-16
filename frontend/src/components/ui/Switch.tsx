// Switch.tsx
// On/off toggle with optional Yes/No labels.
// --------------------------------------------------

import { cn } from '@/lib/cn';

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  showLabels?: boolean;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
};

export const Switch = ({
  checked,
  onChange,
  showLabels = false,
  className,
  disabled,
  'aria-label': ariaLabel,
}: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-sm text-[11px] font-medium transition',
      disabled && 'cursor-not-allowed opacity-50',
      className
    )}
  >
    {showLabels && (
      <span className={cn('transition', checked ? 'text-ink-muted' : 'text-accent')}>
        No
      </span>
    )}

    <span
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition',
        checked ? 'bg-accent' : 'bg-line'
      )}
    >
      <span
        className={cn(
          'inline-block size-3.5 translate-x-0.5 rounded-full bg-surface shadow-sm transition',
          checked && 'translate-x-[18px]'
        )}
      />
    </span>

    {showLabels && (
      <span className={cn('transition', checked ? 'text-accent' : 'text-ink-muted')}>
        Yes
      </span>
    )}
  </button>
);

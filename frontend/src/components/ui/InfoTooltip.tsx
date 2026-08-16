// InfoTooltip.tsx
// Info icon with a native title tooltip.
// --------------------------------------------------

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

type InfoTooltipProps = {
  hint: string;
  className?: string;
};

export const InfoTooltip = ({ hint, className }: InfoTooltipProps) => (
  <span
    title={hint}
    aria-label={hint}
    className={cn('inline-flex shrink-0 text-ink-muted', className)}
  >
    <Icon name="info" size={11} strokeWidth={2} />
  </span>
);

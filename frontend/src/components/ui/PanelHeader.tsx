// PanelHeader.tsx
// Title bar with close button for panels and popovers.
// --------------------------------------------------

import { type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

type PanelHeaderProps = {
  title: ReactNode;
  onClose?: () => void;
  className?: string;
};

export const PanelHeader = ({ title, onClose, className }: PanelHeaderProps) => (
  <div
    className={cn(
      'flex items-center justify-between gap-2 border-b border-line px-3 py-2',
      className
    )}
  >
    <span className="text-[13px] font-semibold text-ink">{title}</span>

    {onClose && (
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="flex size-5 items-center justify-center rounded-sm text-ink-muted transition hover:bg-surface-muted hover:text-ink"
      >
        <Icon name="x" size={14} strokeWidth={2} />
      </button>
    )}
  </div>
);

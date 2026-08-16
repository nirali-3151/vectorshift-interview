// SettingsFieldRow.tsx
// Reusable settings row: label (+ optional info) on top, control below.
// --------------------------------------------------

import { type ReactNode } from 'react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { cn } from '@/lib/cn';

type SettingsFieldRowProps = {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

export const SettingsFieldRow = ({
  label,
  hint,
  className,
  children,
}: SettingsFieldRowProps) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <div className="flex min-w-0 items-center gap-1">
      <span className="text-[11px] font-medium text-ink">{label}</span>
      {hint && <InfoTooltip hint={hint} />}
    </div>

    <div className="min-w-0">{children}</div>
  </div>
);

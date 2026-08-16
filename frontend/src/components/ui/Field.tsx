// Field.tsx
// A labelled control row. Purely presentational: it knows nothing about where
// the label came from or what the control does.
// --------------------------------------------------

import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const orientations = {
  row: 'flex-row items-center justify-between',
  // The controls carry flex-1 so they fill the row. In a column that basis
  // applies to height instead, which would override a measured textarea
  // height, so growth is switched off on this axis.
  column: 'flex-col items-stretch [&>:last-child]:flex-none',
} as const;

type FieldOrientation = keyof typeof orientations;

type FieldProps = {
  label: ReactNode;
  required?: boolean;
  orientation?: FieldOrientation;
  className?: string;
  labelClassName?: string;
  children?: ReactNode;
};

export const Field = ({
  label,
  required = false,
  orientation = 'row',
  className,
  labelClassName,
  children,
}: FieldProps) => (
  <label
    className={cn('flex gap-1.5', orientations[orientation], className)}
    aria-required={required || undefined}
  >
    <span className="inline-flex items-center gap-0.5 text-ink-muted">
      <span className={labelClassName}>{label}</span>
      {required && (
        <span className="text-[11px] leading-none text-red-500" aria-hidden>
          *
        </span>
      )}
    </span>
    {children}
  </label>
);

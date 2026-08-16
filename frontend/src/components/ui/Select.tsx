// Select.tsx
// Styled native <select>. Pass `options` for the common case, or `children`
// for placeholders, optgroups, or other custom markup.
// --------------------------------------------------

import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { controlClass } from '@/components/ui/controlStyles';

type SelectOption = string | { value: string; label: string };

type SelectProps = Omit<React.ComponentProps<'select'>, 'children'> & {
  options?: SelectOption[];
  children?: ReactNode;
};

const toOption = (option: SelectOption): { value: string; label: string } =>
  typeof option === 'string' ? { value: option, label: option } : option;

export const Select = ({ className, options, children, ...props }: SelectProps) => (
  <select className={cn(controlClass, className)} {...props}>
    {options
      ? options.map(toOption).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))
      : children}
  </select>
);

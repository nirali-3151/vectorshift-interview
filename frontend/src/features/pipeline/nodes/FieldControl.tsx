// FieldControl.tsx
// Maps a NodeFieldDef kind to the correct control. Shared by inline and
// settings field renderers.
// --------------------------------------------------

import {
  Checkbox,
  Input,
  Select,
  Slider,
  Switch,
  Textarea,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { controlClass } from '@/components/ui/controlStyles';
import type { NodeFieldDef } from '@/features/pipeline/nodes/nodeConfigs';

const invalidClass = `${controlClass} border-red-400 focus:outline-red-400`;

type FieldControlProps = {
  field: NodeFieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  expanded?: boolean;
  invalid?: boolean;
  className?: string;
};

export const FieldControl = ({
  field,
  value,
  onChange,
  expanded,
  invalid = false,
  className,
}: FieldControlProps) => {
  const asText = value == null ? '' : String(value);
  const canvasClass = cn('nodrag nokey w-full', className);
  const inputClass = cn(invalid ? invalidClass : controlClass, canvasClass);
  const borderInvalid = invalid && 'border-red-400 focus:outline-red-400';

  switch (field.kind) {
    case 'textarea':
      return (
        <Textarea
          className={cn(canvasClass, borderInvalid)}
          rows={expanded ? (field.rows ?? 8) : (field.rows ?? 2)}
          autoSize={field.autoSize ?? false}
          value={asText}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'select':
      return (
        <Select
          className={cn(canvasClass, borderInvalid)}
          options={field.options}
          value={asText}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'number':
      return (
        <Input
          className={inputClass}
          type="number"
          min={field.min}
          max={field.max}
          value={asText}
          aria-invalid={invalid || undefined}
          onChange={(e) =>
            onChange(e.target.value === '' ? '' : e.target.valueAsNumber)
          }
        />
      );
    case 'decimal':
      return (
        <Slider
          className={canvasClass}
          min={field.min}
          max={field.max}
          step={field.step}
          value={typeof value === 'number' && !Number.isNaN(value) ? value : field.min ?? 0}
          onChange={onChange}
        />
      );
    case 'toggle':
      return (
        <Switch
          className={cn('nodrag nokey', className)}
          checked={Boolean(value)}
          showLabels={false}
          aria-label={field.label}
          onChange={onChange}
        />
      );
    case 'checkbox':
      return (
        <Checkbox
          className={canvasClass}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    default:
      return (
        <Input
          className={inputClass}
          type="text"
          value={asText}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
};

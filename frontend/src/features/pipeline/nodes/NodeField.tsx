// NodeField.tsx
// Renders one field descriptor with the shared Field layout. Adapts ui/
// inputs to the node field contract and marks controls nodrag/nokey so React
// Flow ignores interaction inside them.
// --------------------------------------------------

import { Field } from '@/components/ui';
import { FieldControl } from '@/features/pipeline/nodes/FieldControl';
import type { NodeFieldDef } from '@/features/pipeline/nodes/nodeConfigs';

type NodeFieldProps = {
  field: NodeFieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  expanded?: boolean;
  error?: string;
};

export const NodeField = ({
  field,
  value,
  onChange,
  expanded,
  error,
}: NodeFieldProps) => {
  const isRequired = 'isRequired' in field && Boolean(field.isRequired);
  const invalid = Boolean(error);

  return (
    <Field
      label={field.label}
      required={isRequired}
      orientation="column"
      className="gap-1"
      labelClassName="text-[9px] font-semibold tracking-wide uppercase"
    >
      <FieldControl
        field={field}
        value={value}
        onChange={onChange}
        expanded={expanded}
        invalid={invalid}
      />
    </Field>
  );
};

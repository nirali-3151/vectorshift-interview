// NodeSettingsField.tsx
// Maps one NodeFieldDef to the settings row layout.
// --------------------------------------------------

import { SettingsFieldRow } from '@/components/ui';
import { FieldControl } from '@/features/pipeline/nodes/FieldControl';
import type { NodeFieldDef } from '@/features/pipeline/nodes/nodeConfigs';

type NodeSettingsFieldProps = {
  field: NodeFieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
};

export const NodeSettingsField = ({
  field,
  value,
  onChange,
  error,
}: NodeSettingsFieldProps) => (
  <SettingsFieldRow label={field.label} hint={field.hint}>
    <FieldControl
      field={field}
      value={value}
      onChange={onChange}
      invalid={Boolean(error)}
    />
  </SettingsFieldRow>
);

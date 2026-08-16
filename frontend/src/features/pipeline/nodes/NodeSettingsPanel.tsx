// NodeSettingsPanel.tsx
// Settings popover for nodes with settingsFields config.
// --------------------------------------------------

import { useState } from 'react';
import { Icon, PanelHeader, Popover } from '@/components/ui';
import { NodeSettingsField } from '@/features/pipeline/nodes/NodeSettingsField';
import { cn } from '@/lib/cn';
import type { NodeConfig, NodeFieldDef } from '@/features/pipeline/nodes/nodeConfigs';

type NodeSettingsPanelProps = {
  nodeId: string;
  config: NodeConfig;
  data: Record<string, unknown>;
  fieldIssues: Map<string, string>;
  onFieldChange: (fieldName: string, value: unknown) => void;
  triggerClassName?: string;
};

export const NodeSettingsPanel = ({
  nodeId,
  config,
  data,
  fieldIssues,
  onFieldChange,
  triggerClassName,
}: NodeSettingsPanelProps) => {
  const [open, setOpen] = useState(false);
  const settingsFields = config.settingsFields ?? [];

  if (settingsFields.length === 0) return null;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="right"
      contentClassName="w-[280px]"
      trigger={
        <button
          type="button"
          title="Settings"
          aria-label="Settings"
          aria-expanded={open}
          className={cn(
            'nodrag flex size-6 items-center justify-center rounded-md text-on-ink/70 transition',
            'hover:bg-on-ink/15 hover:text-on-ink',
            open && 'bg-on-ink/15 text-on-ink',
            triggerClassName
          )}
        >
          <Icon name="settings" size={12} strokeWidth={2.25} />
        </button>
      }
    >
      <PanelHeader title="Settings" onClose={() => setOpen(false)} />

      <div
        className="nodrag nokey flex max-h-[420px] flex-col gap-3 overflow-y-auto overscroll-contain p-3"
        onWheel={(event) => event.stopPropagation()}
      >
        {settingsFields.map((field: NodeFieldDef) => (
          <NodeSettingsField
            key={`${nodeId}-${field.name}`}
            field={field}
            value={data?.[field.name]}
            error={fieldIssues.get(field.name)}
            onChange={(value) => onFieldChange(field.name, value)}
          />
        ))}
      </div>
    </Popover>
  );
};

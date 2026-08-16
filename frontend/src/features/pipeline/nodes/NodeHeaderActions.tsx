// NodeHeaderActions.tsx
// Expand, reset, and delete controls in the node header.
// --------------------------------------------------

import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

type NodeHeaderActionsProps = {
  expanded: boolean;
  onToggleExpand: () => void;
  onReset?: () => void;
  onDelete: () => void;
};

export const NodeHeaderActions = ({
  expanded,
  onToggleExpand,
  onReset,
  onDelete,
}: NodeHeaderActionsProps) => (
  <div className="flex shrink-0 items-center gap-0.5">
    <HeaderButton
      label={expanded ? 'Shrink node' : 'Expand node'}
      onClick={onToggleExpand}
    >
      <Icon
        name={expanded ? 'minimize2' : 'maximize2'}
        size={12}
        strokeWidth={2.25}
      />
    </HeaderButton>

    {onReset && (
      <HeaderButton label="Reset node" onClick={onReset}>
        <Icon name="refreshCw" size={12} strokeWidth={2.25} />
      </HeaderButton>
    )}

    <HeaderButton label="Delete node" onClick={onDelete} danger>
      <Icon name="circleX" size={12} strokeWidth={2.25} />
    </HeaderButton>
  </div>
);

type HeaderButtonProps = {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
};

const HeaderButton = ({ label, onClick, danger, children }: HeaderButtonProps) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    className={cn(
      'nodrag flex size-6 items-center justify-center rounded-md text-on-ink/70 transition',
      'hover:bg-on-ink/15 hover:text-on-ink',
      danger && 'hover:bg-red-500/20 hover:text-red-100'
    )}
  >
    {children}
  </button>
);

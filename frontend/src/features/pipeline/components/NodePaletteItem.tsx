// NodePaletteItem.tsx
// One draggable entry in the palette. Carries only the node type; the canvas
// decides where the dropped node lands.
// --------------------------------------------------

import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { dragDataType } from '@/features/pipeline/constants';
import { styleFor } from '@/features/pipeline/nodes/categories';
import type { NodeTypeEntry } from '@/features/pipeline/nodes';

type NodePaletteItemProps = {
  entry: NodeTypeEntry;
  compact?: boolean;
  onDragStart?: () => void;
};

export const NodePaletteItem = ({
  entry,
  compact = false,
  onDragStart,
}: NodePaletteItemProps) => {
  const { label, icon, category, type } = entry;
  const style = styleFor(category);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData(dragDataType, JSON.stringify({ nodeType: type }));
    event.dataTransfer.effectAllowed = 'move';
    onDragStart?.();
  };

  return (
    <div
      className={cn(
        'flex cursor-grab items-center rounded-node border border-line bg-surface text-[13px] transition select-none hover:border-ink-muted hover:shadow-node active:cursor-grabbing',
        compact ? 'justify-center px-1.5 py-1.5' : 'gap-2 px-2 py-1.5'
      )}
      draggable
      title={compact ? label : undefined}
      onDragStart={handleDragStart}
    >
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-sm',
          style.soft,
          style.accent
        )}
      >
        <Icon name={icon} size={14} strokeWidth={2} />
      </span>

      {!compact && <span className="truncate">{label}</span>}
    </div>
  );
};

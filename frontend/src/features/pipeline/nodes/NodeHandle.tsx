// NodeHandle.tsx
// One connection point plus its label. Vertical placement is derived from the
// handle's index within its side, so a node whose handle count depends on user
// input never needs hardcoded offsets.
// --------------------------------------------------

import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/cn';
import type { NodeHandleDef } from '@/features/pipeline/nodes/nodeConfigs';

type NodeHandleProps = {
  nodeId: string;
  handle: NodeHandleDef;
  index: number;
  total: number;
  isConnected?: boolean;
  suggestionsEnabled?: boolean;
  onSuggestClick?: (handleId: string, event: React.MouseEvent) => void;
};

// One handle sits at 50%, two at 33% and 66%, and so on.
const offsetFor = (index: number, total: number) =>
  `${((index + 1) / (total + 1)) * 100}%`;

export const NodeHandle = ({
  nodeId,
  handle,
  index,
  total,
  isConnected = false,
  suggestionsEnabled = false,
  onSuggestClick,
}: NodeHandleProps) => {
  const top = offsetFor(index, total);
  const isLeft = handle.position === Position.Left;
  const isSource = handle.type === 'source';
  const showSuggestionCue =
    isSource && suggestionsEnabled && !isConnected && Boolean(onSuggestClick);

  const handleClick = (event: React.MouseEvent) => {
    if (!showSuggestionCue || !onSuggestClick) return;
    event.stopPropagation();
    onSuggestClick(handle.id, event);
  };

  return (
    <>
      <Handle
        type={handle.type}
        position={handle.position}
        id={`${nodeId}-${handle.id}`}
        style={{ top }}
        onClick={handleClick}
        className={cn(
          showSuggestionCue &&
            'size-3! cursor-pointer border-2! border-accent! bg-accent/20! hover:bg-accent/35!'
        )}
      />

      {handle.label && (
        <span
          style={{ top }}
          className={cn(
            // Sits outside the node so it cannot collide with the fields.
            'pointer-events-none absolute z-20 -translate-y-1/2 text-[10px] whitespace-nowrap text-ink-muted max-md:hidden',
            isLeft ? 'right-full mr-2' : 'left-full ml-2'
          )}
        >
          {handle.label}
        </span>
      )}
    </>
  );
};

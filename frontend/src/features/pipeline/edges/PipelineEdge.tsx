// PipelineEdge.tsx
// Smooth-step edge with a delete control when selected.
// --------------------------------------------------

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

export const PipelineEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
  style,
}: EdgeProps) => {
  const { deleteElements } = useReactFlow();
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeDasharray: selected ? undefined : '6 4',
          strokeWidth: selected ? 2.25 : 1.75,
          opacity: selected ? 1 : 0.85,
        }}
      />

      {selected && (
        <EdgeLabelRenderer>
          <button
            type="button"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={cn(
              'nodrag nopan absolute flex size-5 cursor-pointer items-center justify-center',
              'rounded-full border border-line bg-surface text-ink shadow-node',
              'transition hover:border-red-300 hover:bg-red-50 hover:text-red-600'
            )}
            aria-label="Delete connection"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              deleteElements({ edges: [{ id }] });
            }}
          >
            <Icon name="x" size={12} strokeWidth={2.5} />
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

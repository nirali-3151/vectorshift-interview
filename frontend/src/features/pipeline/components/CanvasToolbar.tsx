// CanvasToolbar.tsx
// Floating canvas controls: zoom, fit, and clear.
// --------------------------------------------------

import { useCallback } from 'react';
import { useReactFlow, useViewport } from '@xyflow/react';
import { useShallow } from 'zustand/shallow';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useStore } from '@/features/pipeline/store';

type CanvasToolbarProps = {
  onClear: () => void;
  hasNodes: boolean;
  locked: boolean;
  onLockedChange: (locked: boolean) => void;
};

export const CanvasToolbar = ({
  onClear,
  hasNodes,
  locked,
  onLockedChange,
}: CanvasToolbarProps) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const { undo, redo, undoAvailable, redoAvailable } = useStore(
    useShallow((state) => ({
      undo: state.undo,
      redo: state.redo,
      undoAvailable: state.past.length > 0,
      redoAvailable: state.future.length > 0,
    }))
  );
  const zoomLabel = `${Math.round(zoom * 100)}%`;

  const handleFit = useCallback(() => {
    fitView({ padding: 0.2, duration: 220 });
  }, [fitView]);

  const handleClear = () => {
    if (!hasNodes) return;
    if (window.confirm('Clear the canvas? This removes all nodes and connections.')) {
      onClear();
    }
  };

  return (
    <div
      className={cn(
        'absolute bottom-3 left-3 z-10 flex items-center gap-0.5',
        'rounded-node border border-line bg-surface/95 p-1 shadow-raised backdrop-blur-sm'
      )}
    >
      <ToolbarButton label="Zoom in" onClick={() => zoomIn()}>
        <Icon name="plus" size={15} strokeWidth={2.25} />
      </ToolbarButton>

      <span className="min-w-11 px-1 text-center font-mono text-[11px] text-ink-muted tabular-nums">
        {zoomLabel}
      </span>

      <ToolbarButton label="Zoom out" onClick={() => zoomOut()}>
        <Icon name="minus" size={15} strokeWidth={2.25} />
      </ToolbarButton>

      <span className="mx-0.5 h-5 w-px bg-line" aria-hidden />

      <ToolbarButton label="Fit to view" onClick={handleFit}>
        <Icon name="focus" size={15} strokeWidth={2.25} />
      </ToolbarButton>

      <span className="mx-0.5 h-5 w-px bg-line" aria-hidden />

      <ToolbarButton
        label="Undo"
        onClick={undo}
        disabled={locked || !undoAvailable}
      >
        <Icon name="undo" size={15} strokeWidth={2.25} />
      </ToolbarButton>

      <ToolbarButton
        label="Redo"
        onClick={redo}
        disabled={locked || !redoAvailable}
      >
        <Icon name="redo" size={15} strokeWidth={2.25} />
      </ToolbarButton>

      <ToolbarButton
        label={locked ? 'Unlock editing' : 'Lock editing'}
        onClick={() => onLockedChange(!locked)}
        active={locked}
      >
        <Icon name={locked ? 'unlock' : 'lock'} size={15} strokeWidth={2.25} />
      </ToolbarButton>

      <ToolbarButton
        label="Clear canvas"
        onClick={handleClear}
        disabled={!hasNodes || locked}
        danger
      >
        <Icon name="trash2" size={15} strokeWidth={2.25} />
      </ToolbarButton>
    </div>
  );
};

type ToolbarButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  active?: boolean;
  children: React.ReactNode;
};

const ToolbarButton = ({
  label,
  onClick,
  disabled,
  danger,
  active,
  children,
}: ToolbarButtonProps) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'flex size-8 items-center justify-center rounded-md text-ink transition',
      'hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40',
      active && 'bg-accent/10 text-accent hover:bg-accent/15',
      danger && !active && 'hover:bg-red-50 hover:text-red-600'
    )}
  >
    {children}
  </button>
);

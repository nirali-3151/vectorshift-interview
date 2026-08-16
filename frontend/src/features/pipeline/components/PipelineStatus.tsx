// PipelineStatus.tsx
// Live graph health and autosave indicator for the header.
// --------------------------------------------------

import { useMemo } from 'react';
import { Icon } from '@/components/ui';
import { useShallow } from 'zustand/shallow';
import { inspectPipeline } from '@/features/pipeline/lib/validatePipeline';
import type { SaveStatus } from '@/features/pipeline/hooks/usePersistPipeline';
import { useStore, type PipelineStore } from '@/features/pipeline/store';
import { cn } from '@/lib/cn';

const graphSelector = (state: PipelineStore) => ({
  nodes: state.nodes,
  edges: state.edges,
});

type PipelineStatusProps = {
  saveStatus: SaveStatus;
  onValidationClick?: () => void;
};

export const PipelineStatus = ({ saveStatus, onValidationClick }: PipelineStatusProps) => {
  const { nodes, edges } = useStore(useShallow(graphSelector));
  const issues = useMemo(() => inspectPipeline({ nodes, edges }), [nodes, edges]);
  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length;

  const graphBadge =
    nodes.length === 0
      ? { label: 'Empty', tone: 'muted' as const, icon: null }
      : errorCount > 0
        ? {
            label: `${errorCount} error${errorCount === 1 ? '' : 's'}`,
            tone: 'error' as const,
            icon: 'circleAlert' as const,
          }
        : warningCount > 0
          ? {
              label: `${warningCount} warning${warningCount === 1 ? '' : 's'}`,
              tone: 'warn' as const,
              icon: 'circleAlert' as const,
            }
          : { label: 'Valid', tone: 'ok' as const, icon: 'check' as const };

  const saveLabel =
    saveStatus === 'saving'
      ? 'Saving…'
      : saveStatus === 'saved'
        ? 'Saved'
        : null;

  const clickable =
    Boolean(onValidationClick) &&
    (graphBadge.tone === 'error' || graphBadge.tone === 'warn');

  return (
    <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:justify-center sm:gap-3">
      {clickable ? (
        <button
          type="button"
          onClick={onValidationClick}
          className={cn(
            'inline-flex max-w-full cursor-pointer items-center gap-1 truncate rounded-full border px-2 py-0.5 text-[10px] font-medium transition hover:brightness-95 sm:px-2.5 sm:py-1 sm:text-[11px]',
            graphBadge.tone === 'warn' &&
              'border-amber-200 bg-amber-50 text-amber-900',
            graphBadge.tone === 'error' &&
              'border-red-200 bg-red-50 text-red-900'
          )}
        >
          {graphBadge.icon && (
            <Icon name={graphBadge.icon} size={11} strokeWidth={2.5} />
          )}
          {graphBadge.label}
          {nodes.length > 0 && (
            <span className="hidden text-ink-muted/80 sm:inline">
              · {nodes.length} nodes · {edges.length} edges
            </span>
          )}
        </button>
      ) : (
        <span
          className={cn(
            'inline-flex max-w-full items-center gap-1 truncate rounded-full border px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:py-1 sm:text-[11px]',
            graphBadge.tone === 'ok' &&
              'border-emerald-200 bg-emerald-50 text-emerald-800',
            graphBadge.tone === 'warn' &&
              'border-amber-200 bg-amber-50 text-amber-900',
            graphBadge.tone === 'error' &&
              'border-red-200 bg-red-50 text-red-900',
            graphBadge.tone === 'muted' &&
              'border-line bg-surface-muted text-ink-muted'
          )}
        >
          {graphBadge.icon && (
            <Icon name={graphBadge.icon} size={11} strokeWidth={2.5} />
          )}
          {graphBadge.label}
          {nodes.length > 0 && (
            <span className="hidden text-ink-muted/80 sm:inline">
              · {nodes.length} nodes · {edges.length} edges
            </span>
          )}
        </span>
      )}

      {saveLabel && (
        <span className="hidden items-center gap-1 text-[11px] text-ink-muted sm:inline-flex">
          <Icon
            name={saveStatus === 'saving' ? 'loaderCircle' : 'cloudCheck'}
            size={12}
            strokeWidth={saveStatus === 'saving' ? 2 : 2}
            className={saveStatus === 'saving' ? 'animate-spin' : undefined}
          />
          {saveLabel}
        </span>
      )}
    </div>
  );
};

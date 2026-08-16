// InspectorPanel.tsx
// Right sidebar showing live validation issues and run history.
// --------------------------------------------------

import { useEffect, useMemo, useState } from 'react';
import { Button, Icon } from '@/components/ui';
import { inspectPipeline } from '@/features/pipeline/lib/validatePipeline';
import { useStore, type PipelineStore } from '@/features/pipeline/store';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';
import { useShallow } from 'zustand/shallow';

type InspectorPanelProps = {
  id?: string;
  open?: boolean;
  onClose?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
  expandSignal?: number;
};

const selector = (state: PipelineStore) => ({
  nodes: state.nodes,
  edges: state.edges,
  runLogs: state.runLogs,
  focusNode: state.focusNode,
  clearRunLogs: state.clearRunLogs,
});

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const InspectorPanel = ({
  id,
  open = false,
  onClose,
  dismissible = false,
  onDismiss,
  expandSignal = 0,
}: InspectorPanelProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [runLogOpen, setRunLogOpen] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const compact = collapsed && isDesktop;

  useEffect(() => {
    if (expandSignal > 0) setCollapsed(false);
  }, [expandSignal]);

  const { nodes, edges, runLogs, focusNode, clearRunLogs } = useStore(
    useShallow(selector)
  );
  const issues = useMemo(() => inspectPipeline({ nodes, edges }), [nodes, edges]);

  const handleIssueClick = (nodeId?: string) => {
    if (!nodeId) return;
    focusNode(nodeId);
    onClose?.();
  };

  return (
    <aside
      id={id}
      className={cn(
        'flex shrink-0 flex-col overflow-hidden border-line bg-surface',
        'md:relative md:z-0 md:translate-x-0 md:border-l md:transition-[width] md:duration-200 md:ease-out',
        collapsed ? 'md:w-14' : 'md:w-72',
        'absolute inset-y-0 right-0 z-40 w-[min(18rem,88vw)] border-l shadow-raised transition-transform duration-200 ease-out',
        open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-3 py-2.5 md:hidden">
        <h2 className="text-sm font-semibold">Inspector</h2>
        <Button
          type="button"
          variant="ghost"
          className="px-2 py-0 text-lg leading-none"
          aria-label="Close inspector"
          onClick={dismissible ? onDismiss : onClose}
        >
          <Icon name="x" size={18} strokeWidth={2} />
        </Button>
      </div>

      <div
        className={cn(
          'hidden shrink-0 items-center border-b border-line md:flex',
          collapsed ? 'justify-center px-1 py-2' : 'justify-between gap-2 px-2 py-2'
        )}
      >
        {!compact && (
          <h2 className="truncate px-1 text-sm font-semibold">Inspector</h2>
        )}

        <div className="flex shrink-0 items-center">
          {dismissible && !compact && (
            <Button
              type="button"
              variant="ghost"
              className="px-2 py-1"
              aria-label="Close inspector"
              onClick={onDismiss}
            >
              <Icon name="x" size={18} strokeWidth={2} />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            className="px-2 py-1"
            aria-expanded={!collapsed}
            aria-controls={id}
            aria-label={collapsed ? 'Expand inspector' : 'Collapse inspector'}
            onClick={() => setCollapsed((value) => !value)}
          >
            <Icon
              name={collapsed ? 'chevronLeft' : 'chevronRight'}
              size={18}
              strokeWidth={2}
            />
          </Button>
        </div>
      </div>

      {!compact && (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          <section>
            <h3 className="mb-2 px-0.5 text-[10px] font-semibold tracking-wider text-ink-muted uppercase">
              Inspector
            </h3>

            {issues.length === 0 ? (
              <p className="rounded-node border border-line bg-surface-muted/60 px-3 py-2.5 text-xs text-ink-muted">
                {nodes.length === 0
                  ? 'Add nodes to the canvas to see validation feedback.'
                  : 'No issues found. Pipeline looks good.'}
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {issues.map((issue) => (
                  <li key={issue.id}>
                    <button
                      type="button"
                      disabled={!issue.nodeId}
                      onClick={() => handleIssueClick(issue.nodeId)}
                      className={cn(
                        'flex w-full items-start gap-2 rounded-node border px-2.5 py-2 text-left text-xs leading-snug transition',
                        issue.severity === 'error'
                          ? 'border-red-200 bg-red-50 text-red-900'
                          : 'border-amber-200 bg-amber-50 text-amber-950',
                        issue.nodeId && 'cursor-pointer hover:brightness-95'
                      )}
                    >
                      <Icon
                        name="circleAlert"
                        size={14}
                        strokeWidth={2.25}
                        className={cn(
                          'mt-0.5 shrink-0',
                          issue.severity === 'error' ? 'text-red-600' : 'text-amber-600'
                        )}
                      />
                      <span>{issue.message}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-4 border-t border-line pt-3">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                className="flex flex-1 items-center gap-1.5 px-0.5 text-left text-[10px] font-semibold tracking-wider text-ink-muted uppercase"
                aria-expanded={runLogOpen}
                onClick={() => setRunLogOpen((value) => !value)}
              >
                <Icon
                  name="chevronDown"
                  size={14}
                  strokeWidth={2.25}
                  className={cn('transition-transform', !runLogOpen && '-rotate-90')}
                />
                Run log
              </button>
              {runLogs.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="px-1.5 py-0.5 text-[10px] text-ink-muted"
                  onClick={clearRunLogs}
                >
                  Clear
                </Button>
              )}
            </div>

            {runLogOpen && (
              <div className="mt-2">
                {runLogs.length === 0 ? (
                  <p className="px-0.5 text-xs text-ink-muted">
                    No runs yet. Press Submit to analyse the pipeline.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {runLogs.map((entry) => (
                      <li
                        key={entry.id}
                        className={cn(
                          'rounded-node border px-2.5 py-2 text-xs',
                          entry.level === 'error' &&
                            'border-red-200 bg-red-50 text-red-900',
                          entry.level === 'success' &&
                            'border-emerald-200 bg-emerald-50 text-emerald-900',
                          entry.level === 'warning' &&
                            'border-amber-200 bg-amber-50 text-amber-950',
                          entry.level === 'info' &&
                            'border-line bg-surface-muted/60 text-ink-muted'
                        )}
                      >
                        <div className="mb-0.5 font-mono text-[10px] opacity-70">
                          {formatTime(entry.at)}
                        </div>
                        {entry.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </aside>
  );
};

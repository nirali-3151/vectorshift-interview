// BaseNode.tsx
// Renders any node described by a config in nodeConfigs.ts.
// --------------------------------------------------

import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useReactFlow, useUpdateNodeInternals, Position } from '@xyflow/react';
import { useShallow } from 'zustand/shallow';
import { useOptionalSuggestionContext } from '@/features/pipeline/context/suggestionContext';
import { useStore } from '@/features/pipeline/store';
import { NodeField } from '@/features/pipeline/nodes/NodeField';
import { NodeHandle } from '@/features/pipeline/nodes/NodeHandle';
import { NodeHeaderActions } from '@/features/pipeline/nodes/NodeHeaderActions';
import { NodeSettingsPanel } from '@/features/pipeline/nodes/NodeSettingsPanel';
import { styleFor } from '@/features/pipeline/nodes/categories';
import {
  resolveHandles,
  type NodeConfig,
  type NodeHandleDef,
  type NodeType,
} from '@/features/pipeline/nodes/nodeConfigs';
import { Icon } from '@/components/ui';
import { widthForText } from '@/features/pipeline/lib/nodeWidth';
import { getFieldIssues } from '@/features/pipeline/lib/validatePipeline';
import { cn } from '@/lib/cn';
import type { PipelineNodeData } from '@/features/pipeline/types';

type BaseNodeProps = {
  id: string;
  data: PipelineNodeData;
  config: NodeConfig;
  nodeType: NodeType;
  selected?: boolean;
  children?: ReactNode;
};

// Handles are spaced within their own side, so left and right are counted
// separately.
const groupByPosition = (handles: NodeHandleDef[]) =>
  handles.reduce((sides, handle) => {
    const side = sides.get(handle.position) ?? [];
    side.push(handle);
    return sides.set(handle.position, side);
  }, new Map<Position, NodeHandleDef[]>());

export const BaseNode = ({
  id,
  data,
  config,
  nodeType,
  selected,
  children,
}: BaseNodeProps) => {
  const { deleteElements } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const suggestionContext = useOptionalSuggestionContext();
  const edges = useStore(useShallow((state) => state.edges));
  const updateNodeField = useStore((state) => state.updateNodeField);
  const resetNode = useStore((state) => state.resetNode);
  const [expanded, setExpanded] = useState(false);
  const [outputsOpen, setOutputsOpen] = useState(true);

  const connectedSourceHandles = useMemo(() => {
    const connected = new Set<string>();
    for (const edge of edges) {
      if (edge.source === id && edge.sourceHandle) {
        connected.add(edge.sourceHandle.replace(`${id}-`, ''));
      }
    }
    return connected;
  }, [edges, id]);

  const handleSuggestClick = useCallback(
    (handleId: string, event: React.MouseEvent) => {
      if (!suggestionContext) return;
      if (!suggestionContext.suggestionsEnabled || suggestionContext.canvasLocked) return;

      suggestionContext.openSuggestions({
        nodeId: id,
        handleId,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [id, suggestionContext]
  );

  const handles = resolveHandles(config, data);

  // A config may derive its handles from data (the text node grows one input
  // per {{variable}}). React Flow caches handle bounds per node, so edges keep
  // pointing at stale positions unless it is told the set changed. Compare a
  // string rather than the array, which is a new reference on every render.
  const handleSignature = handles
    .map((handle) => `${handle.type}:${handle.id}`)
    .join('|');

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, handleSignature, updateNodeInternals]);

  const sides = groupByPosition(handles);
  const sourceHandles = handles.filter((handle) => handle.type === 'source');
  const width = config.growWith
    ? widthForText(data[config.growWith])
    : typeof config.width === 'function'
      ? config.width(data)
      : config.width;
  const style = styleFor(config.category);
  const hasFields =
    (config.fields?.length ?? 0) > 0 || (config.settingsFields?.length ?? 0) > 0;
  const hasOutputs = sourceHandles.length > 0;
  const fieldIssues = getFieldIssues({
    id,
    type: nodeType,
    data,
    position: { x: 0, y: 0 },
  });

  return (
    <div style={{ width }} className="relative overflow-visible">
      <div
        className={cn(
          'relative min-w-[220px] overflow-visible bg-surface text-xs shadow-node transition-shadow',
          expanded ? 'w-[520px] max-w-none' : 'max-w-[320px]',
          selected
            ? cn('rounded-node border shadow-raised', style.border)
            : 'rounded-node border border-line hover:shadow-raised'
        )}
      >
        {[...sides.values()].flatMap((side) =>
          side.map((handle, index) => (
            <NodeHandle
              key={handle.id}
              nodeId={id}
              handle={handle}
              index={index}
              total={side.length}
              isConnected={connectedSourceHandles.has(handle.id)}
              suggestionsEnabled={suggestionContext?.suggestionsEnabled ?? false}
              onSuggestClick={
                handle.type === 'source' ? handleSuggestClick : undefined
              }
            />
          ))
        )}

        <div className="relative z-0">
          <div
            className={cn(
              'flex items-stretch rounded-t-[9px] text-on-ink',
              style.header
            )}
          >
            <div className="flex min-w-0 flex-1 items-start gap-2 px-2.5 py-2">
              <Icon
                name={config.icon}
                size={14}
                strokeWidth={2.25}
                className="mt-0.5 shrink-0"
              />

              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="truncate text-[13px] leading-tight font-semibold">
                  {config.title}
                </div>
                {config.subtitle && (
                  <div className="truncate text-[11px] leading-snug text-on-ink/65">
                    {config.subtitle}
                  </div>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              {(config.settingsFields?.length ?? 0) > 0 && (
                <NodeSettingsPanel
                  nodeId={id}
                  config={config}
                  data={data}
                  fieldIssues={fieldIssues}
                  onFieldChange={(fieldName, value) => updateNodeField(id, fieldName, value)}
                />
              )}

              <NodeHeaderActions
                expanded={expanded}
                onToggleExpand={() => setExpanded((value) => !value)}
                onReset={hasFields ? () => resetNode(id) : undefined}
                onDelete={() => deleteElements({ nodes: [{ id }] })}
              />
            </div>
          </div>

          {hasOutputs && (
            <button
              type="button"
              title={outputsOpen ? 'Hide outputs' : 'Show outputs'}
              aria-label={outputsOpen ? 'Hide outputs' : 'Show outputs'}
              aria-expanded={outputsOpen}
              onClick={() => setOutputsOpen((value) => !value)}
              className={cn(
                'nodrag absolute top-1/2 left-full z-10 flex -translate-x-px -translate-y-1/2 items-center justify-center',
                'rounded-r-[9px] rounded-l-none border border-l-0 p-1 shadow-node transition',
                style.tabHover,
                outputsOpen
                  ? cn('bg-surface text-ink-muted border-line', style.soft, style.accent, style.border)
                  : style.tabCollapsed
              )}
            >
              <Icon name="panelRight" size={12} strokeWidth={2.25} />
            </button>
          )}
        </div>

        <div
          className={cn('relative z-0 py-1 text-center font-mono text-[10px] text-ink', style.header)}
          title="Node name"
        >
          <div className="absolute inset-0 bg-white/90" aria-hidden />
          <span className="relative">{id}</span>
        </div>

        <div className="relative z-0 flex">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-2.5">
            {config.fields?.map((field) => (
              <NodeField
                key={field.name}
                field={field}
                value={data?.[field.name]}
                expanded={expanded}
                error={fieldIssues.get(field.name)}
                onChange={(value) => updateNodeField(id, field.name, value)}
              />
            ))}

            {children}
          </div>

          {hasOutputs && outputsOpen && (
            <div
              className="flex w-18 shrink-0 flex-col gap-1 border-l border-line/70 px-2 py-2.5"
              aria-label="Outputs"
            >
              <span className="text-[9px] font-semibold tracking-wide text-ink-muted uppercase">
                Out
              </span>
              {sourceHandles.map((handle) => (
                <span
                  key={handle.id}
                  className="truncate font-mono text-[10px] text-ink-muted"
                  title={handle.label}
                >
                  {handle.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

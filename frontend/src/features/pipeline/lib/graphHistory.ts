// graphHistory.ts
// Snapshot helpers for undo/redo over nodes, edges, and id counters.
// --------------------------------------------------

import type { EdgeChange, NodeChange } from '@xyflow/react';
import type { PersistedPipeline } from '@/features/pipeline/lib/persistPipeline';
import type { PipelineEdge, PipelineNode } from '@/features/pipeline/types';

export const MAX_HISTORY = 50;
export const FIELD_HISTORY_DEBOUNCE_MS = 400;

export type GraphSnapshot = PersistedPipeline;

export type GraphSlice = Pick<GraphSnapshot, 'nodes' | 'edges' | 'nodeIDs'>;

export type HistoryPatch = Partial<GraphSlice> & {
  past?: GraphSnapshot[];
  future?: GraphSnapshot[];
};

export const takeSnapshot = (state: GraphSnapshot): GraphSnapshot =>
  structuredClone(state);

export const appendHistory = (
  past: GraphSnapshot[],
  snapshot: GraphSnapshot
): GraphSnapshot[] => [...past, snapshot].slice(-MAX_HISTORY);

export const withHistory = (
  past: GraphSnapshot[],
  current: GraphSnapshot,
  patch: Partial<GraphSlice>
): HistoryPatch => ({
  ...patch,
  past: appendHistory(past, takeSnapshot(current)),
  future: [],
});

export const shouldRecordNodesChange = (
  changes: NodeChange<PipelineNode>[]
) =>
  changes.some((change) => {
    if (change.type === 'select' || change.type === 'dimensions') return false;
    if (change.type === 'position') return change.dragging === false;
    return true;
  });

export const shouldRecordEdgesChange = (
  changes: EdgeChange<PipelineEdge>[]
) => changes.some((change) => change.type !== 'select');

export const isDebouncedFieldKind = (kind: string | undefined) =>
  kind === 'text' || kind === 'textarea';

const fieldHistoryTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const clearFieldHistoryTimers = () => {
  for (const timer of fieldHistoryTimers.values()) {
    clearTimeout(timer);
  }
  fieldHistoryTimers.clear();
};

// Records one undo step at the start of a typing burst; further edits within
// the debounce window apply without additional history entries.
export const shouldPushDebouncedFieldHistory = (key: string): boolean => {
  if (fieldHistoryTimers.has(key)) {
    const timer = fieldHistoryTimers.get(key)!;
    clearTimeout(timer);
    fieldHistoryTimers.set(
      key,
      setTimeout(() => fieldHistoryTimers.delete(key), FIELD_HISTORY_DEBOUNCE_MS)
    );
    return false;
  }

  fieldHistoryTimers.set(
    key,
    setTimeout(() => fieldHistoryTimers.delete(key), FIELD_HISTORY_DEBOUNCE_MS)
  );
  return true;
};

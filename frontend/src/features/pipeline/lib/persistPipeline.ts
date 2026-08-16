// persistPipeline.ts
// Serialises the graph to localStorage so a refresh does not wipe the canvas.
// --------------------------------------------------

import type { PipelineEdge, PipelineNode } from '@/features/pipeline/types';
import type { NodeType } from '@/features/pipeline/nodes/nodeConfigs';
import { filterOrphanEdges } from '@/features/pipeline/lib/validatePipeline';

const STORAGE_KEY = 'pipeline-builder:v1';

export type PersistedPipeline = {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  nodeIDs: Partial<Record<NodeType, number>>;
};

export const loadPipeline = (): PersistedPipeline | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersistedPipeline;
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return null;

    return {
      ...parsed,
      edges: filterOrphanEdges(parsed.nodes, parsed.edges),
    };
  } catch {
    return null;
  }
};

export const savePipeline = (snapshot: PersistedPipeline) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

export const clearStoredPipeline = () => {
  localStorage.removeItem(STORAGE_KEY);
};

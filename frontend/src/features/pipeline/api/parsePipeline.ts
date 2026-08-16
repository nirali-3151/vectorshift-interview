// parsePipeline.ts
// Sends the graph to the backend for analysis via POST /pipelines/parse.
// --------------------------------------------------

import { postJson } from '@/lib/apiClient';
import type { PipelineGraph, PipelineStats } from '@/features/pipeline/types';

type PipelinePayload = {
  nodes: Array<{
    id: string;
    type?: string;
    position: PipelineGraph['nodes'][number]['position'];
    data: PipelineGraph['nodes'][number]['data'];
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  }>;
};

// React Flow decorates nodes and edges with view state (measured sizes,
// selection, drag flags) that the API has no use for.
const toPayload = ({ nodes = [], edges = [] }: PipelineGraph): PipelinePayload => ({
  nodes: nodes.map(({ id, type, position, data }) => ({
    id,
    type,
    position,
    data,
  })),
  edges: edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
  })),
});

export const parsePipeline = (graph: PipelineGraph) =>
  postJson<PipelineStats>('/pipelines/parse', toPayload(graph));

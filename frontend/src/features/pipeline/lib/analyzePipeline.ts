// analyzePipeline.ts
// Local node/edge counts and DAG check for the inspector.
// --------------------------------------------------

import { isDag } from '@/features/pipeline/lib/isDag';
import type { PipelineGraph, PipelineStats } from '@/features/pipeline/types';

export const analyzePipeline = ({
  nodes = [],
  edges = [],
}: Partial<PipelineGraph> = {}): PipelineStats => ({
  num_nodes: nodes.length,
  num_edges: edges.length,
  is_dag: isDag(nodes, edges),
});

import type { Edge, Node } from '@xyflow/react';

export type PipelineStats = {
  num_nodes: number;
  num_edges: number;
  is_dag: boolean;
};

export type PipelineNodeData = Record<string, unknown> & {
  id: string;
  nodeType: string;
};

export type PipelineNode = Node<PipelineNodeData>;
export type PipelineEdge = Edge;

export type PipelineGraph = {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
};

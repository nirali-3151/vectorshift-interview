// edges/index.tsx
// Edge types registered with React Flow.
// --------------------------------------------------

import type { EdgeTypes } from '@xyflow/react';
import { PipelineEdge } from '@/features/pipeline/edges/PipelineEdge';
import { edgeType } from '@/features/pipeline/constants';

export const edgeTypes = {
  [edgeType]: PipelineEdge,
} satisfies EdgeTypes;

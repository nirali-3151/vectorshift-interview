// index.tsx
// Turns the node configs into the nodeTypes map React Flow expects.
// --------------------------------------------------

import { type NodeProps, type NodeTypes } from '@xyflow/react';
import { BaseNode } from '@/features/pipeline/nodes/BaseNode';
import { nodeConfigs, type NodeType } from '@/features/pipeline/nodes/nodeConfigs';
import type { IconName } from '@/constants/icons';
import type { NodeCategory } from '@/features/pipeline/nodes/categories';
import type { PipelineNodeData } from '@/features/pipeline/types';

// Must stay module-level so the reference is stable across renders.
export const nodeTypes = Object.fromEntries(
  Object.entries(nodeConfigs).map(([type, config]) => [
    type,
    (props: NodeProps) => (
      <BaseNode
        id={props.id}
        data={props.data as PipelineNodeData}
        config={config}
        nodeType={type as NodeType}
        selected={props.selected}
      />
    ),
  ])
) as NodeTypes;

export type NodeTypeEntry = {
  type: NodeType;
  label: string;
  category: NodeCategory;
  icon: IconName;
};

// Everything the toolbar needs, so it never reaches into the configs itself.
export const nodeTypeList: NodeTypeEntry[] = Object.entries(nodeConfigs).map(
  ([type, config]) => ({
    type: type as NodeType,
    label: config.title,
    category: config.category,
    icon: config.icon,
  })
);

export const nodeTypesByCategory = (category: NodeCategory) =>
  nodeTypeList.filter((entry) => entry.category === category);

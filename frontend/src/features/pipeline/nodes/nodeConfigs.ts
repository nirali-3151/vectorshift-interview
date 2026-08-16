// nodeConfigs.ts
// Merged node registry. Add a node in configs/<category>.ts — it appears in
// the palette and on the canvas automatically.
// --------------------------------------------------

import { aiNodes } from '@/features/pipeline/nodes/configs/ai';
import { dataNodes } from '@/features/pipeline/nodes/configs/data';
import { ioNodes } from '@/features/pipeline/nodes/configs/io';
import { logicNodes } from '@/features/pipeline/nodes/configs/logic';
import { utilityNodes } from '@/features/pipeline/nodes/configs/utility';
import { resolveHandles } from '@/features/pipeline/nodes/configs/helpers';
import type {
  NodeConfig,
  NodeFieldDef,
  NodeHandleDef,
  NodeHandleInput,
} from '@/features/pipeline/nodes/configs/types';
import type { PipelineNodeData } from '@/features/pipeline/types';

export type { NodeConfig, NodeFieldDef, NodeHandleDef, NodeHandleInput };
export { resolveHandles };

export const nodeConfigs = {
  ...ioNodes,
  ...aiNodes,
  ...logicNodes,
  ...dataNodes,
  ...utilityNodes,
} satisfies Record<string, NodeConfig>;

export type NodeType = keyof typeof nodeConfigs;

export const createNodeData = (id: string, type: NodeType): PipelineNodeData => {
  const data: PipelineNodeData = { id, nodeType: type };
  const config = nodeConfigs[type] as NodeConfig;

  for (const field of [...(config.fields ?? []), ...(config.settingsFields ?? [])]) {
    data[field.name] =
      typeof field.initial === 'function' ? field.initial(id) : field.initial;
  }

  return data;
};

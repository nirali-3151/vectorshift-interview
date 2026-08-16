// helpers.ts
// Small builders shared by every node config file.
// --------------------------------------------------

import { Position } from '@xyflow/react';
import type { NodeCategory } from '@/features/pipeline/nodes/categories';
import type {
  NodeConfig,
  NodeConfigInput,
  NodeHandleDef,
  NodeHandleInput,
} from '@/features/pipeline/nodes/configs/types';
import type { PipelineNodeData } from '@/features/pipeline/types';

const positionFor = (type: NodeHandleInput['type']) =>
  type === 'source' ? Position.Right : Position.Left;

export const normalizeHandle = (handle: NodeHandleInput): NodeHandleDef => ({
  ...handle,
  position: handle.position ?? positionFor(handle.type),
  label: handle.label ?? handle.id,
});

export const normalizeHandles = (handles: NodeHandleInput[]): NodeHandleDef[] =>
  handles.map(normalizeHandle);

export const input = (id: string, label?: string): NodeHandleInput => ({
  type: 'target',
  id,
  label,
});

export const output = (id: string, label?: string): NodeHandleInput => ({
  type: 'source',
  id,
  label,
});

export const passthrough = (inId = 'input', outId = 'output'): NodeHandleInput[] =>
  [input(inId), output(outId)];

// Handles named by the user get their own id space, so a template that writes
// {{output}} cannot shadow a statically declared `output` handle. A colon
// cannot appear in a JavaScript identifier, so the two can never collide.
export const VARIABLE_HANDLE_PREFIX = 'var:';

export const variableInput = (name: string): NodeHandleInput => ({
  type: 'target',
  id: `${VARIABLE_HANDLE_PREFIX}${name}`,
  label: name,
});

export const autoName = (prefix: string) => (id: string) =>
  `${prefix}_${id.split('-').pop()}`;

export const resolveHandles = (
  config: NodeConfig | undefined,
  data: PipelineNodeData | undefined
): NodeHandleDef[] => {
  const raw =
    typeof config?.handles === 'function'
      ? config.handles(data ?? ({} as PipelineNodeData))
      : config?.handles ?? [];

  return normalizeHandles(raw);
};

export const defineNodes = <C extends NodeCategory, T extends Record<string, NodeConfigInput>>(
  category: C,
  nodes: T
): { [K in keyof T]: NodeConfig & { category: C } } =>
  Object.fromEntries(
    Object.entries(nodes).map(([key, config]) => [key, { ...config, category }])
  ) as { [K in keyof T]: NodeConfig & { category: C } };

// types.ts
// Shared node-config shapes. Handles may omit position (derived from type)
// and label (defaults to id).
// --------------------------------------------------

import type { Position } from '@xyflow/react';
import type { IconName } from '@/constants/icons';
import type { NodeCategory } from '@/features/pipeline/nodes/categories';
import type { PipelineNodeData } from '@/features/pipeline/types';

export type NodeHandleInput = {
  type: 'source' | 'target';
  id: string;
  label?: string;
  position?: Position;
};

export type NodeHandleDef = NodeHandleInput & {
  position: Position;
  label: string;
};

type FieldBase = {
  name: string;
  label: string;
  isRequired?: boolean;
  hint?: string;
  initial?: string | number | boolean | ((id: string) => string);
};

export type NodeFieldDef =
  | (FieldBase & { kind: 'text' })
  | (FieldBase & { kind: 'textarea'; rows?: number; autoSize?: boolean })
  | (FieldBase & { kind: 'select'; options: string[] })
  | (FieldBase & { kind: 'number'; min?: number; max?: number })
  | (FieldBase & { kind: 'checkbox' })
  | (FieldBase & { kind: 'toggle' })
  | (FieldBase & { kind: 'decimal'; min?: number; max?: number; step?: number });

export type NodeConfig = {
  title: string;
  category: NodeCategory;
  icon: IconName;
  subtitle?: string;
  fields?: NodeFieldDef[];
  settingsFields?: NodeFieldDef[];
  handles:
    | NodeHandleInput[]
    | ((data: PipelineNodeData) => NodeHandleInput[]);
  growWith?: string;
  width?: string | ((data: PipelineNodeData) => string);
};

// Written in category config files; defineNodes injects category.
export type NodeConfigInput = Omit<NodeConfig, 'category'>;

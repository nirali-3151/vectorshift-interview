// validatePipeline.ts
// Shared validation helpers for the inspector, inline field errors, and submit.
// --------------------------------------------------

import { isDag } from '@/features/pipeline/lib/isDag';
import { findTemplateSyntaxIssues } from '@/features/pipeline/lib/parseVariables';
import {
  nodeConfigs,
  resolveHandles,
  type NodeConfig,
  type NodeFieldDef,
  type NodeType,
} from '@/features/pipeline/nodes/nodeConfigs';
import type { PipelineEdge, PipelineGraph, PipelineNode } from '@/features/pipeline/types';

export type InspectorSeverity = 'error' | 'warning';

export type InspectorIssue = {
  id: string;
  severity: InspectorSeverity;
  message: string;
  nodeId?: string;
  fieldName?: string;
  fieldMessage?: string;
};

export const isEmpty = (value: unknown) =>
  value == null ||
  (typeof value === 'string' && value.trim() === '') ||
  (typeof value === 'number' && Number.isNaN(value));

const isValidUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'https://' || trimmed === 'http://') return false;

  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const isFieldRequired = (
  nodeType: NodeType,
  field: NodeFieldDef,
  data: PipelineNode['data']
) => {
  if ('isRequired' in field && field.isRequired) return true;

  if (nodeType === 'trigger' && field.name === 'schedule') {
    return data?.triggerType === 'Schedule';
  }

  if (nodeType === 'transform' && field.name === 'template') {
    return data?.operation === 'Template';
  }

  return false;
};

const validateNumberField = (
  field: NodeFieldDef & { kind: 'number' | 'decimal' },
  value: unknown
) => {
  if (value === '' || value == null) return 'is required';
  if (typeof value !== 'number' || Number.isNaN(value)) return 'must be a number';
  if (field.min != null && value < field.min) return `must be at least ${field.min}`;
  if (field.max != null && value > field.max) return `must be at most ${field.max}`;
  return null;
};

const getConfigFields = (config: NodeConfig) => [
  ...(config.fields ?? []),
  ...(config.settingsFields ?? []),
];

const templateFieldNames = new Set(['text', 'template']);

export const validateField = (
  node: PipelineNode,
  field: NodeFieldDef,
  config: NodeConfig
): InspectorIssue[] => {
  const type = node.type as NodeType;
  const value = node.data?.[field.name];
  const issues: InspectorIssue[] = [];
  const push = (severity: InspectorSeverity, fieldMessage: string) => {
    issues.push({
      id: `${node.id}-${field.name}-${severity}-${issues.length}`,
      severity,
      message: `${config.title}: '${field.label}' ${fieldMessage}`,
      fieldMessage,
      nodeId: node.id,
      fieldName: field.name,
    });
  };

  if (isFieldRequired(type, field, node.data)) {
    if (field.kind === 'number' || field.kind === 'decimal') {
      const numberError = validateNumberField(field, value);
      if (numberError) push('error', numberError);
    } else if (isEmpty(value)) {
      push('error', 'is required');
    }
  } else if (
    (field.kind === 'number' || field.kind === 'decimal') &&
    value !== '' &&
    value != null
  ) {
    const numberError = validateNumberField(field, value);
    if (numberError) push('error', numberError);
  }

  if (type === 'httpRequest' && field.name === 'url' && typeof value === 'string' && value.trim()) {
    if (!isValidUrl(value)) {
      push('error', 'must be a valid http(s) URL');
    }
  }

  if (templateFieldNames.has(field.name) && typeof value === 'string' && value.length > 0) {
    for (const syntaxIssue of findTemplateSyntaxIssues(value)) {
      push('error', syntaxIssue);
    }
  }

  return issues;
};

const handleKey = (nodeId: string, handleId: string) => `${nodeId}-${handleId}`;

const edgeIdentity = (edge: PipelineEdge) =>
  `${edge.source}:${edge.sourceHandle ?? ''}:${edge.target}:${edge.targetHandle ?? ''}`;

export const validateNode = (
  node: PipelineNode,
  edges: PipelineEdge[]
): InspectorIssue[] => {
  const type = node.type as NodeType | undefined;
  const config = type ? nodeConfigs[type] : undefined;
  if (!config) return [];

  const issues: InspectorIssue[] = [];

  for (const field of getConfigFields(config)) {
    issues.push(...validateField(node, field, config));
  }

  const handles = resolveHandles(config, node.data);
  if (handles.length === 0) return issues;

  const connected = edges.some(
    (edge) => edge.source === node.id || edge.target === node.id
  );

  if (!connected) {
    issues.push({
      id: `disconnected-${node.id}`,
      severity: 'warning',
      message: `${config.title} is not connected to anything`,
      nodeId: node.id,
    });
    return issues;
  }

  for (const handle of handles) {
    if (handle.type !== 'target') continue;

    const fullHandleId = handleKey(node.id, handle.id);
    const inputConnected = edges.some(
      (edge) => edge.target === node.id && edge.targetHandle === fullHandleId
    );

    if (!inputConnected) {
      issues.push({
        id: `unconnected-${node.id}-${handle.id}`,
        severity: 'warning',
        message: `${config.title}: '${handle.label}' input is not connected`,
        nodeId: node.id,
      });
    }
  }

  return issues;
};

export const validateGraph = ({
  nodes = [],
  edges = [],
}: Partial<PipelineGraph> = {}): InspectorIssue[] => {
  const issues: InspectorIssue[] = [];

  for (const node of nodes) {
    issues.push(...validateNode(node, edges));
  }

  const seenEdges = new Set<string>();
  for (const edge of edges) {
    const key = edgeIdentity(edge);
    if (seenEdges.has(key)) {
      issues.push({
        id: `duplicate-${edge.id ?? key}`,
        severity: 'warning',
        message: 'Duplicate connection between the same handles',
      });
    }
    seenEdges.add(key);
  }

  if (nodes.length > 0 && !isDag(nodes, edges)) {
    issues.push({
      id: 'cycle',
      severity: 'error',
      message: 'Pipeline contains a cycle',
    });
  }

  return issues;
};

export const inspectPipeline = validateGraph;

export const getFieldIssues = (node: PipelineNode): Map<string, string> => {
  const type = node.type as NodeType | undefined;
  const config = type ? nodeConfigs[type] : undefined;
  if (!config) return new Map();

  const map = new Map<string, string>();

  for (const field of getConfigFields(config)) {
    for (const issue of validateField(node, field, config)) {
      if (
        issue.severity === 'error' &&
        issue.fieldName &&
        issue.fieldMessage &&
        !map.has(issue.fieldName)
      ) {
        map.set(issue.fieldName, issue.fieldMessage);
      }
    }
  }

  return map;
};

export const hasInspectorErrors = (graph: Partial<PipelineGraph>) =>
  validateGraph(graph).some((issue) => issue.severity === 'error');

export const countIssues = (graph: Partial<PipelineGraph>) => {
  const issues = validateGraph(graph);
  return {
    errors: issues.filter((issue) => issue.severity === 'error').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
  };
};

export const isValidConnection = (
  connection: {
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  },
  edges: PipelineEdge[]
) => {
  if (!connection.source || !connection.target) return false;
  if (connection.source === connection.target) return false;

  const duplicate = edges.some(
    (edge) =>
      edge.source === connection.source &&
      edge.target === connection.target &&
      edge.sourceHandle === connection.sourceHandle &&
      edge.targetHandle === connection.targetHandle
  );
  if (duplicate) return false;

  return true;
};

export const filterOrphanEdges = (
  nodes: PipelineNode[],
  edges: PipelineEdge[]
): PipelineEdge[] => {
  const nodeIds = new Set(nodes.map((node) => node.id));
  return edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );
};

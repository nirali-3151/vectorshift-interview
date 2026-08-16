// store.ts
// Single source of truth for the graph. React Flow is driven from this store
// rather than keeping its own copy of nodes and edges.
// --------------------------------------------------

import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react';
import { defaultEdgeOptions } from '@/features/pipeline/constants';
import {
  clearFieldHistoryTimers,
  isDebouncedFieldKind,
  MAX_HISTORY,
  shouldPushDebouncedFieldHistory,
  shouldRecordEdgesChange,
  shouldRecordNodesChange,
  takeSnapshot,
  withHistory,
  type GraphSnapshot,
  type GraphSlice,
} from '@/features/pipeline/lib/graphHistory';
import type { PersistedPipeline } from '@/features/pipeline/lib/persistPipeline';
import { filterOrphanEdges } from '@/features/pipeline/lib/validatePipeline';
import {
  createNodeData,
  nodeConfigs,
  resolveHandles,
  type NodeConfig,
  type NodeType,
} from '@/features/pipeline/nodes/nodeConfigs';
import type { PipelineEdge, PipelineNode } from '@/features/pipeline/types';

export type RunLogEntry = {
  id: string;
  at: string;
  message: string;
  level: 'info' | 'error' | 'success' | 'warning';
};

export type PipelineStore = GraphSlice & {
  past: GraphSnapshot[];
  future: GraphSnapshot[];
  runLogs: RunLogEntry[];
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
  getNodeID: (type: NodeType) => string;
  addNode: (node: PipelineNode) => void;
  insertConnectedNode: (
    sourceNodeId: string,
    sourceHandleId: string,
    targetType: NodeType
  ) => void;
  onNodesChange: (changes: NodeChange<PipelineNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<PipelineEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  updateNodeField: (nodeId: string, fieldName: string, fieldValue: unknown) => void;
  resetNode: (nodeId: string) => void;
  addRunLog: (message: string, level?: RunLogEntry['level']) => void;
  clearRunLogs: () => void;
  focusNode: (nodeId: string) => void;
  hydrate: (snapshot: PersistedPipeline) => void;
  clearGraph: () => void;
};

// Handles are namespaced per node, matching the ids BaseNode renders.
const handleKey = (nodeId: string, handleId: string) => `${nodeId}-${handleId}`;

const currentGraph = (state: PipelineStore): GraphSnapshot => ({
  nodes: state.nodes,
  edges: state.edges,
  nodeIDs: state.nodeIDs,
});

const commitGraphChange = (
  get: () => PipelineStore,
  set: (partial: Partial<PipelineStore>) => void,
  updater: (state: PipelineStore) => Partial<GraphSlice>,
  options?: { recordHistory?: boolean }
) => {
  const state = get();
  const patch = updater(state);

  if (options?.recordHistory === false) {
    set(patch);
    return;
  }

  set(
    withHistory(state.past, currentGraph(state), patch) as Partial<PipelineStore>
  );
};

const fieldKindFor = (node: PipelineNode, fieldName: string) => {
  const type = node.type as NodeType | undefined;
  if (!type) return undefined;

  const config = nodeConfigs[type] as NodeConfig | undefined;
  const field = [...(config?.fields ?? []), ...(config?.settingsFields ?? [])].find(
    (entry) => entry.name === fieldName
  );

  return field?.kind;
};

// A node's handles can depend on its data (the text node grows one input per
// {{variable}}), so editing a field can strand an edge on a handle that no
// longer exists. React Flow only hides those; drop them from state instead.
const pruneEdgesForNode = (edges: PipelineEdge[], node: PipelineNode) => {
  const type = node.type as NodeType | undefined;
  const live = new Set(
    resolveHandles(type ? nodeConfigs[type] : undefined, node.data).map(
      (handle) => handleKey(node.id, handle.id)
    )
  );

  const isStranded = (
    edge: PipelineEdge,
    endpoint: 'source' | 'target',
    handleId: string | null | undefined
  ) => edge[endpoint] === node.id && handleId && !live.has(handleId);

  return edges.filter(
    (edge) =>
      !isStranded(edge, 'source', edge.sourceHandle) &&
      !isStranded(edge, 'target', edge.targetHandle)
  );
};

const applyNodeFieldUpdate = (
  state: PipelineStore,
  nodeId: string,
  fieldName: string,
  fieldValue: unknown
): Partial<GraphSlice> => {
  const nodes = state.nodes.map((node) =>
    node.id === nodeId
      ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
      : node
  );

  const updated = nodes.find((node) => node.id === nodeId);

  return {
    nodes,
    edges: updated ? pruneEdgesForNode(state.edges, updated) : state.edges,
  };
};

export const useStore = create<PipelineStore>((set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: {},
  past: [],
  future: [],
  runLogs: [],

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  undo: () => {
    const { past, future, nodes, edges, nodeIDs } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];

    set({
      past: past.slice(0, -1),
      future: [takeSnapshot({ nodes, edges, nodeIDs }), ...future].slice(
        0,
        MAX_HISTORY
      ),
      nodes: previous.nodes,
      edges: previous.edges,
      nodeIDs: previous.nodeIDs,
    });
  },

  redo: () => {
    const { past, future, nodes, edges, nodeIDs } = get();
    if (future.length === 0) return;

    const next = future[0];

    set({
      past: [...past, takeSnapshot({ nodes, edges, nodeIDs })].slice(-MAX_HISTORY),
      future: future.slice(1),
      nodes: next.nodes,
      edges: next.edges,
      nodeIDs: next.nodeIDs,
    });
  },

  getNodeID: (type) => {
    const next = (get().nodeIDs[type] ?? 0) + 1;
    return `${type}-${next}`;
  },

  addNode: (node) => {
    commitGraphChange(get, set, (state) => {
      const type = node.type as NodeType;

      return {
        nodes: [...state.nodes, node],
        nodeIDs: {
          ...state.nodeIDs,
          [type]: (state.nodeIDs[type] ?? 0) + 1,
        },
      };
    });
  },

  insertConnectedNode: (sourceNodeId, sourceHandleId, targetType) => {
    const state = get();
    const sourceNode = state.nodes.find((node) => node.id === sourceNodeId);
    if (!sourceNode) return;

    const targetId = get().getNodeID(targetType);
    const targetData = createNodeData(targetId, targetType);
    const targetHandles = resolveHandles(nodeConfigs[targetType], targetData);
    const firstInput = targetHandles.find((handle) => handle.type === 'target');
    if (!firstInput) return;

    const sourceHandle = handleKey(sourceNodeId, sourceHandleId);
    const alreadyConnected = state.edges.some(
      (edge) => edge.source === sourceNodeId && edge.sourceHandle === sourceHandle
    );
    if (alreadyConnected) return;

    const newNode: PipelineNode = {
      id: targetId,
      type: targetType,
      position: {
        x: sourceNode.position.x + 300,
        y: sourceNode.position.y,
      },
      data: targetData,
    };

    const connection: Connection = {
      source: sourceNodeId,
      target: targetId,
      sourceHandle,
      targetHandle: handleKey(targetId, firstInput.id),
    };

    commitGraphChange(get, set, (current) => ({
      nodes: [...current.nodes, newNode],
      edges: addEdge({ ...connection, ...defaultEdgeOptions }, current.edges),
      nodeIDs: {
        ...current.nodeIDs,
        [targetType]: (current.nodeIDs[targetType] ?? 0) + 1,
      },
    }));
  },

  onNodesChange: (changes) => {
    const recordHistory = shouldRecordNodesChange(changes);

    commitGraphChange(
      get,
      set,
      (state) => ({ nodes: applyNodeChanges(changes, state.nodes) }),
      { recordHistory }
    );
  },

  onEdgesChange: (changes) => {
    const recordHistory = shouldRecordEdgesChange(changes);

    commitGraphChange(
      get,
      set,
      (state) => ({ edges: applyEdgeChanges(changes, state.edges) }),
      { recordHistory }
    );
  },

  onConnect: (connection) => {
    if (connection.source === connection.target) return;

    const duplicate = get().edges.some(
      (edge) =>
        edge.source === connection.source &&
        edge.target === connection.target &&
        edge.sourceHandle === connection.sourceHandle &&
        edge.targetHandle === connection.targetHandle
    );
    if (duplicate) return;

    commitGraphChange(get, set, (state) => ({
      edges: addEdge({ ...connection, ...defaultEdgeOptions }, state.edges),
    }));
  },

  updateNodeField: (nodeId, fieldName, fieldValue) => {
    const current = get().nodes.find((node) => node.id === nodeId);
    if (!current || current.data?.[fieldName] === fieldValue) return;

    const fieldKind = fieldKindFor(current, fieldName);
    const debounced = isDebouncedFieldKind(fieldKind);
    const recordHistory =
      !debounced ||
      shouldPushDebouncedFieldHistory(`${nodeId}:${fieldName}`);

    commitGraphChange(
      get,
      set,
      (state) => applyNodeFieldUpdate(state, nodeId, fieldName, fieldValue),
      { recordHistory }
    );
  },

  resetNode: (nodeId) => {
    commitGraphChange(get, set, (state) => {
      const nodes = state.nodes.map((node) =>
        node.id === nodeId && node.type
          ? { ...node, data: createNodeData(nodeId, node.type as NodeType) }
          : node
      );

      const updated = nodes.find((node) => node.id === nodeId);

      return {
        nodes,
        edges: updated ? pruneEdgesForNode(state.edges, updated) : state.edges,
      };
    });
  },

  addRunLog: (message, level = 'info') => {
    set({
      runLogs: [
        {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          message,
          level,
        },
        ...get().runLogs,
      ].slice(0, 50),
    });
  },

  clearRunLogs: () => {
    set({ runLogs: [] });
  },

  focusNode: (nodeId) => {
    set({
      nodes: get().nodes.map((node) => ({
        ...node,
        selected: node.id === nodeId,
      })),
    });
  },

  hydrate: ({ nodes, edges, nodeIDs }) => {
    clearFieldHistoryTimers();

    set({
      nodes,
      edges: filterOrphanEdges(nodes, edges),
      nodeIDs,
      past: [],
      future: [],
    });
  },

  clearGraph: () => {
    if (get().nodes.length > 0 || get().edges.length > 0) {
      commitGraphChange(get, set, () => ({
        nodes: [],
        edges: [],
        nodeIDs: {},
      }));
    } else {
      set({ nodes: [], edges: [], nodeIDs: {}, runLogs: [] });
      return;
    }

    set({ runLogs: [] });
  },
}));

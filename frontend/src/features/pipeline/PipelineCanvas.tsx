// PipelineCanvas.tsx
// The drag-and-drop React Flow canvas.
// --------------------------------------------------

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
  ConnectionLineType,
  type Connection,
} from '@xyflow/react';
import { useShallow } from 'zustand/shallow';
import { CanvasToolbar } from '@/features/pipeline/components/CanvasToolbar';
import { SuggestionPanel } from '@/features/pipeline/components/SuggestionPanel';
import type { SuggestionAnchor } from '@/features/pipeline/context/suggestionContext';
import { SuggestionProvider } from '@/features/pipeline/context/SuggestionProvider';
import { edgeTypes } from '@/features/pipeline/edges';
import { getSuggestions } from '@/features/pipeline/lib/suggestions';
import { useStore } from '@/features/pipeline/store';
import { nodeTypes } from '@/features/pipeline/nodes';
import {
  createNodeData,
  nodeConfigs,
  type NodeType,
} from '@/features/pipeline/nodes/nodeConfigs';
import { styleFor } from '@/features/pipeline/nodes/categories';
import { dragDataType, gridSize, proOptions } from '@/features/pipeline/constants';
import { isValidConnection } from '@/features/pipeline/lib/validatePipeline';
import type { PipelineStore } from '@/features/pipeline/store';
import type { PipelineNode, PipelineEdge } from '@/features/pipeline/types';

const selector = (state: PipelineStore) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  insertConnectedNode: state.insertConnectedNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  undo: state.undo,
  redo: state.redo,
  canUndo: state.canUndo,
  canRedo: state.canRedo,
});

const miniMapNodeColor = (node: PipelineNode) =>
  styleFor(nodeConfigs[node.type as NodeType]?.category).swatch;

type CanvasProps = {
  onClear: () => void;
  suggestionsEnabled?: boolean;
};

const Canvas = ({ onClear, suggestionsEnabled = true }: CanvasProps) => {
  const [overviewLocked, setOverviewLocked] = useState(false);
  const [suggestionAnchor, setSuggestionAnchor] = useState<SuggestionAnchor | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    insertConnectedNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useStore(useShallow(selector));

  const openSuggestions = useCallback(
    (anchor: SuggestionAnchor) => {
      if (!suggestionsEnabled || overviewLocked) return;

      const sourceNode = nodes.find((node) => node.id === anchor.nodeId);
      const sourceType = sourceNode?.type as NodeType | undefined;
      if (!sourceType || getSuggestions(sourceType).length === 0) return;

      setSuggestionAnchor(anchor);
    },
    [nodes, overviewLocked, suggestionsEnabled]
  );

  const closeSuggestions = useCallback(() => {
    setSuggestionAnchor(null);
  }, []);

  const handleSuggestionSelect = useCallback(
    (nodeType: NodeType) => {
      if (!suggestionAnchor) return;
      insertConnectedNode(
        suggestionAnchor.nodeId,
        suggestionAnchor.handleId,
        nodeType
      );
      closeSuggestions();
    },
    [closeSuggestions, insertConnectedNode, suggestionAnchor]
  );

  const suggestionContextValue = useMemo(
    () => ({
      suggestionsEnabled,
      canvasLocked: overviewLocked,
      openSuggestions,
    }),
    [openSuggestions, overviewLocked, suggestionsEnabled]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (overviewLocked) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest('input, textarea, select, [role="textbox"]'))
      ) {
        return;
      }

      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;

      if (event.key === 'z' && !event.shiftKey && canUndo()) {
        event.preventDefault();
        undo();
        return;
      }

      if (
        (event.key === 'z' && event.shiftKey && canRedo()) ||
        (event.key === 'y' && canRedo())
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [overviewLocked, undo, redo, canUndo, canRedo]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (overviewLocked) return;

      const payload = event.dataTransfer?.getData(dragDataType);
      if (!payload) return;

      let type: NodeType | undefined;
      try {
        type = JSON.parse(payload)?.nodeType as NodeType | undefined;
      } catch {
        return;
      }
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeID = getNodeID(type);
      addNode({
        id: nodeID,
        type,
        position,
        data: createNodeData(nodeID, type),
      });
    },
    [overviewLocked, screenToFlowPosition, getNodeID, addNode]
  );

  const onDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (overviewLocked) return;
      event.dataTransfer.dropEffect = 'move';
    },
    [overviewLocked]
  );

  const validateConnection = useCallback(
    (connection: Connection | PipelineEdge) =>
      isValidConnection(
        {
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle ?? null,
          targetHandle: connection.targetHandle ?? null,
        },
        edges
      ),
    [edges]
  );

  return (
    <SuggestionProvider value={suggestionContextValue}>
      <div
        className={cn(
          'pipeline-canvas relative min-h-0 flex-1',
          overviewLocked && 'canvas-locked'
        )}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={validateConnection}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          proOptions={proOptions}
          snapToGrid
          snapGrid={[gridSize, gridSize]}
          connectionLineType={ConnectionLineType.SmoothStep}
          deleteKeyCode={overviewLocked ? null : ['Backspace', 'Delete']}
          nodesDraggable={!overviewLocked}
          nodesConnectable={!overviewLocked}
          elementsSelectable={!overviewLocked}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={gridSize}
            size={1.25}
            color="var(--color-grid-dot)"
          />
          <MiniMap
            className="react-flow-minimap-responsive"
            nodeColor={miniMapNodeColor}
            pannable
            zoomable
          />
        </ReactFlow>

        <CanvasToolbar
          onClear={onClear}
          hasNodes={nodes.length > 0}
          locked={overviewLocked}
          onLockedChange={setOverviewLocked}
        />

        {nodes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
            <div className="max-w-sm rounded-node border border-dashed border-line bg-surface/90 px-5 py-4 text-center shadow-node backdrop-blur-sm">
              <p className="text-sm font-medium text-ink">Start your pipeline</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                <span className="md:hidden">Open Nodes and drag a block here</span>
                <span className="hidden md:inline">
                  Drag blocks from the palette and wire handles left to right
                </span>
              </p>
            </div>
          </div>
        )}

        {suggestionAnchor && suggestionsEnabled && (
          <SuggestionPanel
            anchor={suggestionAnchor}
            onClose={closeSuggestions}
            onSelect={handleSuggestionSelect}
          />
        )}
      </div>
    </SuggestionProvider>
  );
};

export const PipelineCanvas = ({
  onClear,
  suggestionsEnabled = true,
}: CanvasProps) => (
  <ReactFlowProvider>
    <Canvas onClear={onClear} suggestionsEnabled={suggestionsEnabled} />
  </ReactFlowProvider>
);

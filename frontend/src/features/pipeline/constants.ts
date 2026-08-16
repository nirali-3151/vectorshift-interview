// constants.ts
// Canvas and edge defaults, kept out of the components so the look of a
// connection is defined in one place.
// --------------------------------------------------

import { MarkerType } from '@xyflow/react';

export const gridSize = 20;

export const proOptions = { hideAttribution: true };

export const edgeType = 'smoothstep' as const;

// Matches --color-accent. Edges are SVG strokes set through React Flow's
// options rather than CSS, so the value has to be literal here.
const edgeColor = '#4f6bed';

export const defaultEdgeOptions = {
  type: edgeType,
  animated: false,
  style: { stroke: edgeColor, strokeWidth: 1.75 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    height: 16,
    width: 16,
    color: edgeColor,
  },
};

// The drag-and-drop payload key, shared by the palette that writes it and the
// canvas that reads it.
export const dragDataType = 'application/reactflow';

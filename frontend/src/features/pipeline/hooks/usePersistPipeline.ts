// usePersistPipeline.ts
// Loads the graph once on mount and debounces writes after each edit.
// --------------------------------------------------

import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import {
  clearStoredPipeline,
  loadPipeline,
  savePipeline,
} from '@/features/pipeline/lib/persistPipeline';
import { useStore, type PipelineStore } from '@/features/pipeline/store';

export type SaveStatus = 'idle' | 'saving' | 'saved';

const selector = (state: PipelineStore) => ({
  nodes: state.nodes,
  edges: state.edges,
  nodeIDs: state.nodeIDs,
  hydrate: state.hydrate,
  clearGraph: state.clearGraph,
});

export const usePersistPipeline = () => {
  const { nodes, edges, nodeIDs, hydrate, clearGraph } = useStore(
    useShallow(selector)
  );
  const [status, setStatus] = useState<SaveStatus>('idle');
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;

    const saved = loadPipeline();
    if (saved) hydrate(saved);

    hydrated.current = true;
    setStatus(saved ? 'saved' : 'idle');
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated.current) return;

    setStatus('saving');
    const timer = window.setTimeout(() => {
      savePipeline({ nodes, edges, nodeIDs });
      setStatus('saved');
    }, 350);

    return () => window.clearTimeout(timer);
  }, [nodes, edges, nodeIDs]);

  const resetCanvas = () => {
    clearGraph();
    clearStoredPipeline();
    setStatus('idle');
  };

  return { status, resetCanvas };
};

// useSubmitPipeline.ts
// Owns the submit lifecycle: reads the graph from the store, validates it,
// triggers the parse mutation, and exposes loading/result/error for the dialog.
// --------------------------------------------------

import { useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useParsePipelineMutation } from '@/features/pipeline/hooks/useParsePipelineMutation';
import {
  hasInspectorErrors,
  inspectPipeline,
  type InspectorIssue,
} from '@/features/pipeline/lib/validatePipeline';
import { useStore, type PipelineStore } from '@/features/pipeline/store';

const selector = (state: PipelineStore) => ({
  nodes: state.nodes,
  edges: state.edges,
  addRunLog: state.addRunLog,
});

export const useSubmitPipeline = () => {
  const { nodes, edges, addRunLog } = useStore(useShallow(selector));
  const { mutate, reset, isPending, data, error } = useParsePipelineMutation();
  const [blockedIssues, setBlockedIssues] = useState<InspectorIssue[] | null>(
    null
  );

  const issues = useMemo(() => inspectPipeline({ nodes, edges }), [nodes, edges]);
  const submitBlocked = hasInspectorErrors({ nodes, edges });

  const submit = useCallback(() => {
    const currentIssues = inspectPipeline({ nodes, edges });
    const errors = currentIssues.filter((issue) => issue.severity === 'error');

    if (errors.length > 0) {
      setBlockedIssues(errors);
      reset();
      addRunLog(
        `Submit blocked — fix ${errors.length} validation error${errors.length === 1 ? '' : 's'} first.`,
        'error'
      );
      return;
    }

    setBlockedIssues(null);
    reset();

    mutate(
      { nodes, edges },
      {
        onSuccess: (stats) => {
          addRunLog(
            stats.is_dag
              ? `Analysed ${stats.num_nodes} nodes, ${stats.num_edges} edges — valid DAG.`
              : `Analysed ${stats.num_nodes} nodes, ${stats.num_edges} edges — cycle detected.`,
            stats.is_dag ? 'success' : 'warning'
          );
        },
        onError: (cause) => {
          const message = cause instanceof Error ? cause.message : String(cause);
          addRunLog(message, 'error');
        },
      }
    );
  }, [nodes, edges, addRunLog, mutate, reset]);

  const dismiss = useCallback(() => {
    reset();
    setBlockedIssues(null);
  }, [reset]);

  return {
    submit,
    isSubmitting: isPending,
    result: data ?? null,
    error: error?.message ?? null,
    dismiss,
    issues,
    submitBlocked,
    blockedIssues,
  };
};

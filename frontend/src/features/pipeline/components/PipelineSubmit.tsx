// PipelineSubmit.tsx
// Submit control plus the dialog reporting what the pipeline looks like.
// --------------------------------------------------

import { Fragment } from 'react';
import { Button, Dialog, Spinner } from '@/components/ui';
import { useSubmitPipeline } from '@/features/pipeline/hooks/useSubmitPipeline';
import type { PipelineStats } from '@/features/pipeline/types';

const summaryRows = ({ num_nodes, num_edges, is_dag }: PipelineStats) =>
  [
    ['Nodes', num_nodes],
    ['Edges', num_edges],
    ['Valid DAG', is_dag ? 'Yes' : 'No'],
  ] as const;

export const PipelineSubmit = () => {
  const {
    submit,
    isSubmitting,
    result,
    error,
    dismiss,
    submitBlocked,
    blockedIssues,
  } = useSubmitPipeline();

  const dialogOpen = Boolean(result || error || blockedIssues);

  return (
    <>
      <Button onClick={submit} disabled={isSubmitting || submitBlocked}>
        {isSubmitting && <Spinner />}
        Submit
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={dismiss}
        title={
          error
            ? 'Could not analyse the pipeline'
            : blockedIssues
              ? 'Fix validation errors'
              : 'Pipeline summary'
        }
      >
        {error && <p className="text-ink-muted">{error}</p>}

        {blockedIssues && (
          <>
            <p className="mb-3 text-ink-muted">
              Submit is blocked until these errors are resolved:
            </p>
            <ul className="flex flex-col gap-1.5">
              {blockedIssues.map((issue) => (
                <li
                  key={issue.id}
                  className="rounded-node border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-900"
                >
                  {issue.message}
                </li>
              ))}
            </ul>
          </>
        )}

        {result && (
          <>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
              {summaryRows(result).map(([label, value]) => (
                <Fragment key={label}>
                  <dt className="text-ink-muted">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </Fragment>
              ))}
            </dl>

            {!result.is_dag && (
              <p className="mt-3 text-ink-muted">
                The graph contains a cycle, so it cannot be executed in order.
              </p>
            )}
          </>
        )}
      </Dialog>
    </>
  );
};

// useParsePipelineMutation.ts
// TanStack Query mutation for POST /pipelines/parse.
// --------------------------------------------------

import { useMutation } from '@tanstack/react-query';
import { parsePipeline } from '@/features/pipeline/api/parsePipeline';
import { pipelineKeys } from '@/features/pipeline/api/keys';

export const useParsePipelineMutation = () =>
  useMutation({
    mutationKey: pipelineKeys.parse(),
    mutationFn: parsePipeline,
  });

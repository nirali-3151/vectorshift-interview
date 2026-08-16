// keys.ts
// TanStack Query key factory for pipeline endpoints.
// --------------------------------------------------

export const pipelineKeys = {
  all: ['pipeline'] as const,
  parse: () => [...pipelineKeys.all, 'parse'] as const,
};

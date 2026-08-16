// index.ts
// Public surface of the pipeline feature. Nothing outside this folder should
// import its internals directly.
// --------------------------------------------------

export { PipelineCanvas } from '@/features/pipeline/PipelineCanvas';
export { NodePalette } from '@/features/pipeline/components/NodePalette';
export { InspectorPanel } from '@/features/pipeline/components/InspectorPanel';
export { AppSettingsMenu } from '@/features/pipeline/components/AppSettingsMenu';
export { PipelineSubmit } from '@/features/pipeline/components/PipelineSubmit';
export { PipelineStatus } from '@/features/pipeline/components/PipelineStatus';
export { usePersistPipeline } from '@/features/pipeline/hooks/usePersistPipeline';
export { useAppSettings } from '@/features/pipeline/hooks/useAppSettings';

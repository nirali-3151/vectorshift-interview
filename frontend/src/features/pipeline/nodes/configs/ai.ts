import { defineNodes, input, output } from '@/features/pipeline/nodes/configs/helpers';

export const aiNodes = defineNodes('ai', {
  llm: {
    title: 'LLM',
    icon: 'sparkles',
    subtitle: 'Prompt a language model',
    handles: [input('system'), input('prompt'), output('response')],
    fields: [
      {
        name: 'model',
        label: 'Model',
        kind: 'select',
        options: ['GPT-4o', 'GPT-4', 'GPT-3.5', 'Claude 3.5', 'Claude 3'],
        initial: 'GPT-4o',
        isRequired: true,
      },
      {
        name: 'system',
        label: 'System',
        kind: 'textarea',
        initial: 'You are a helpful assistant.',
        rows: 2,
      },
      {
        name: 'prompt',
        label: 'Prompt',
        kind: 'textarea',
        initial: '',
        rows: 2,
        isRequired: true,
      },
    ],
    settingsFields: [
      {
        name: 'maxChunksPerQuery',
        label: 'Max Chunks Per Query',
        kind: 'number',
        initial: 10,
        min: 1,
        max: 100,
      },
      { name: 'enableFilter', label: 'Enable Filter', kind: 'toggle', initial: false },
      { name: 'enableContext', label: 'Enable Context', kind: 'toggle', initial: false },
      { name: 'rerankDocuments', label: 'Rerank Documents', kind: 'toggle', initial: false },
      { name: 'transformQuery', label: 'Transform Query', kind: 'toggle', initial: false },
      {
        name: 'answerMultipleQuestions',
        label: 'Answer Multiple Questions',
        kind: 'toggle',
        initial: false,
      },
      { name: 'expandQuery', label: 'Expand Query', kind: 'toggle', initial: false },
      {
        name: 'scoreCutoff',
        label: 'Score Cutoff',
        kind: 'decimal',
        initial: 0,
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        name: 'retrievalUnit',
        label: 'Retrieval Unit',
        kind: 'select',
        options: ['Chunks', 'Documents', 'Pages'],
        initial: 'Chunks',
      },
    ],
  },
  chatGpt: {
    title: 'ChatGPT',
    icon: 'sparkles',
    subtitle: 'Prompt a language model',
    handles: [input('system'), input('prompt'), output('response')],
    fields: [
      {
        name: 'model',
        label: 'Model',
        kind: 'select',
        options: ['GPT-4o', 'GPT-4', 'GPT-3.5', 'GPT-5'],
        initial: 'GPT-5',
        isRequired: true,
      },
      {
        name: 'system',
        label: 'System',
        kind: 'textarea',
        initial: 'You are a helpful assistant.',
        rows: 2,
      },
    ],
    settingsFields: [
      {
        name: 'maxChunksPerQuery',
        label: 'Max Chunks Per Query',
        kind: 'number',
        initial: 10,
        min: 1,
        max: 100,
      },
    ]
  }
});

// suggestions.ts
// Static, per-node-type suggestion rules for the suggestion panel.
// --------------------------------------------------

import { nodeConfigs, type NodeType } from '@/features/pipeline/nodes/nodeConfigs';

export type SuggestionItem = {
  nodeType: NodeType;
  label?: string;
};

export type SuggestionGroup = {
  title: string;
  items: SuggestionItem[];
};

const group = (title: string, items: SuggestionItem[]): SuggestionGroup => ({
  title,
  items,
});

const item = (nodeType: NodeType, label?: string): SuggestionItem => ({
  nodeType,
  label,
});

const SUGGESTION_RULES: Partial<Record<NodeType, SuggestionGroup[]>> = {
  customInput: [
    group('Suggested next steps', [
      item('llm', 'Process with LLM'),
      item('transform', 'Transform data'),
      item('text', 'Build a template'),
    ]),
    group('Add to pipeline', [item('filter'), item('httpRequest')]),
  ],

  trigger: [
    group('Suggested next steps', [
      item('llm', 'Process with LLM'),
      item('httpRequest', 'Fetch data'),
      item('transform', 'Transform data'),
    ]),
    group('Add to pipeline', [item('text'), item('filter')]),
  ],

  llm: [
    group('Suggested next steps', [
      item('transform', 'Transform response'),
      item('customOutput', 'Pipeline output'),
      item('filter', 'Filter results'),
    ]),
    group('Add to pipeline', [item('text'), item('knowledgeBase')]),
  ],

  transform: [
    group('Suggested next steps', [
      item('llm', 'Process with LLM'),
      item('customOutput', 'Pipeline output'),
    ]),
    group('Add to pipeline', [item('transform'), item('filter')]),
  ],

  filter: [
    group('Suggested next steps', [
      item('llm', 'Process with LLM'),
      item('customOutput', 'Pipeline output'),
    ]),
    group('Add to pipeline', [item('transform'), item('filter')]),
  ],

  math: [
    group('Suggested next steps', [
      item('llm', 'Process with LLM'),
      item('customOutput', 'Pipeline output'),
    ]),
    group('Add to pipeline', [item('transform'), item('filter')]),
  ],

  text: [
    group('Suggested next steps', [
      item('llm', 'Process with LLM'),
      item('customOutput', 'Pipeline output'),
    ]),
    group('Add to pipeline', [item('transform'), item('filter')]),
  ],

  httpRequest: [
    group('Suggested next steps', [
      item('llm', 'Process with LLM'),
      item('customOutput', 'Pipeline output'),
    ]),
    group('Add to pipeline', [item('transform'), item('filter')]),
  ],

  knowledgeBase: [
    group('Suggested next steps', [
      item('llm', 'Process with LLM'),
      item('customOutput', 'Pipeline output'),
    ]),
    group('Add to pipeline', [item('transform'), item('text')]),
  ],

  codeExec: [
    group('Suggested next steps', [
      item('llm', 'Process with LLM'),
      item('customOutput', 'Pipeline output'),
    ]),
    group('Add to pipeline', [item('transform'), item('filter')]),
  ],
};

export const getSuggestions = (sourceNodeType: NodeType): SuggestionGroup[] =>
  SUGGESTION_RULES[sourceNodeType] ?? [];

export const getSuggestionLabel = (suggestion: SuggestionItem): string =>
  suggestion.label ?? nodeConfigs[suggestion.nodeType]?.title ?? suggestion.nodeType;

export const filterSuggestionGroups = (
  groups: SuggestionGroup[],
  query: string
): SuggestionGroup[] => {
  const needle = query.trim().toLowerCase();
  if (!needle) return groups;

  return groups
    .map((groupEntry) => ({
      ...groupEntry,
      items: groupEntry.items.filter((entry) => {
        const label = getSuggestionLabel(entry).toLowerCase();
        const type = entry.nodeType.toLowerCase();
        return label.includes(needle) || type.includes(needle);
      }),
    }))
    .filter((groupEntry) => groupEntry.items.length > 0);
};

import {
  defineNodes,
  input,
  output,
  passthrough,
} from '@/features/pipeline/nodes/configs/helpers';

export const logicNodes = defineNodes('logic', {
  transform: {
    title: 'Transform',
    icon: 'crop',
    subtitle: 'Shape or format data',
    handles: passthrough(),
    fields: [
      {
        name: 'operation',
        label: 'Operation',
        kind: 'select',
        options: ['Uppercase', 'Lowercase', 'Trim', 'JSON parse', 'Template'],
        initial: 'Template',
        isRequired: true,
      },
      {
        name: 'template',
        label: 'Template',
        kind: 'textarea',
        initial: '{{input}}',
        autoSize: true,
      },
    ],
  },

  filter: {
    title: 'Filter',
    icon: 'filter',
    subtitle: 'Split a stream in two',
    handles: [input('input'), output('kept'), output('dropped')],
    fields: [
      {
        name: 'condition',
        label: 'Where',
        kind: 'select',
        options: ['contains', 'equals', 'starts with', 'matches regex'],
        initial: 'contains',
      },
      { name: 'value', label: 'Value', kind: 'text', initial: '' },
    ],
  },

  math: {
    title: 'Math',
    icon: 'binary',
    subtitle: 'Combine two numbers',
    handles: [input('a'), input('b'), output('result')],
    fields: [
      {
        name: 'operation',
        label: 'Operation',
        kind: 'select',
        options: ['Add', 'Subtract', 'Multiply', 'Divide'],
        initial: 'Add',
      },
    ],
  },
});

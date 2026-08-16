import { parseVariables } from '@/features/pipeline/lib/parseVariables';
import {
  defineNodes,
  output,
  passthrough,
  variableInput,
} from '@/features/pipeline/nodes/configs/helpers';

export const utilityNodes = defineNodes('utility', {
  text: {
    title: 'Text',
    icon: 'type',
    subtitle: 'Template with {{variables}}',
    handles: (data) => [
      ...parseVariables(data.text).map(variableInput),
      output('output'),
    ],
    growWith: 'text',
    fields: [
      {
        name: 'text',
        label: 'Text',
        kind: 'textarea',
        initial: '{{input}}',
        autoSize: true,
        isRequired: true,
      },
    ],
  },

  codeExec: {
    title: 'CodeExec',
    icon: 'code',
    subtitle: 'Run custom code',
    handles: passthrough('input', 'result'),
    fields: [
      {
        name: 'language',
        label: 'Language',
        kind: 'select',
        options: ['Python', 'JavaScript'],
        initial: 'Python',
        isRequired: true,
      },
      {
        name: 'code',
        label: 'Code',
        kind: 'textarea',
        initial: 'return input',
        rows: 4,
        isRequired: true,
      },
    ],
  },

  note: {
    title: 'Note',
    icon: 'stickyNote',
    subtitle: 'Canvas annotation',
    handles: [],
    growWith: 'note',
    fields: [
      {
        name: 'note',
        label: 'Note',
        kind: 'textarea',
        initial: 'Jot down anything the pipeline should not run.',
        autoSize: true,
      },
    ],
  },
});

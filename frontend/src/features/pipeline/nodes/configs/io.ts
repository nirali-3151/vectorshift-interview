import { autoName, defineNodes, output, input } from '@/features/pipeline/nodes/configs/helpers';

export const ioNodes = defineNodes('io', {
  customInput: {
    title: 'Input',
    icon: 'logIn',
    subtitle: 'Pipeline entry point',
    handles: [output('value', 'text')],
    fields: [
      { name: 'inputName', label: 'Name', kind: 'text', initial: autoName('input') },
      {
        name: 'inputType',
        label: 'Type',
        kind: 'select',
        options: ['Text', 'File'],
        initial: 'Text',
      },
    ],
  },

  customOutput: {
    title: 'Output',
    icon: 'logOut',
    subtitle: 'Pipeline result',
    handles: [input('value', 'output')],
    fields: [
      { name: 'outputName', label: 'Name', kind: 'text', initial: autoName('output') },
      {
        name: 'outputType',
        label: 'Type',
        kind: 'select',
        options: ['Text', 'Image'],
        initial: 'Text',
      },
    ],
  },

  trigger: {
    title: 'Trigger',
    icon: 'zap',
    subtitle: 'Start the pipeline',
    handles: [output('event')],
    fields: [
      {
        name: 'triggerType',
        label: 'Type',
        kind: 'select',
        options: ['Manual', 'Webhook', 'Schedule'],
        initial: 'Manual',
        isRequired: true,
      },
      { name: 'schedule', label: 'Cron', kind: 'text', initial: '0 9 * * *' },
    ],
  },
});

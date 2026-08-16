import { defineNodes, input, output } from '@/features/pipeline/nodes/configs/helpers';

export const dataNodes = defineNodes('data', {
  httpRequest: {
    title: 'HTTP Request',
    icon: 'globe',
    subtitle: 'Call an external API',
    handles: [input('body'), output('response'), output('error')],
    fields: [
      {
        name: 'method',
        label: 'Method',
        kind: 'select',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        initial: 'GET',
        isRequired: true,
      },
      {
        name: 'url',
        label: 'URL',
        kind: 'text',
        initial: 'https://',
        isRequired: true,
      },
    ],
  },

  knowledgeBase: {
    title: 'Knowledge Base',
    icon: 'bookOpen',
    subtitle: 'Retrieve matching documents',
    handles: [input('query'), output('chunks')],
    fields: [
      {
        name: 'index',
        label: 'Index',
        kind: 'select',
        options: ['Docs', 'Support tickets', 'Product wiki'],
        initial: 'Docs',
      },
      { name: 'topK', label: 'Top K', kind: 'number', initial: 4, min: 1, max: 20 },
      { name: 'rerank', label: 'Rerank', kind: 'checkbox', initial: true },
    ],
  },
});

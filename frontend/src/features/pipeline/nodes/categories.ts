// categories.ts
// The palette a node draws from. A node config names a category and inherits
// its section in the toolbar, its header colour, and its minimap dot, so a new
// node type never picks its own colours.
//
// The hex values mirror the --color-cat-* tokens in styles/index.css. They are
// repeated here because the minimap writes an SVG fill attribute, which cannot
// resolve a CSS variable.
// --------------------------------------------------

export type NodeCategory = keyof typeof categories;

export const categories = {
  io: {
    label: 'Input / Output',
    swatch: '#0d9488',
    header: 'bg-cat-io',
    tabHover: 'hover:bg-cat-io hover:text-on-ink hover:border-cat-io',
    tabCollapsed: 'bg-cat-io text-on-ink border-cat-io',
    accent: 'text-cat-io',
    soft: 'bg-cat-io/10',
    ring: 'ring-cat-io',
    border: 'border-cat-io',
  },
  ai: {
    label: 'AI',
    swatch: '#7c3aed',
    header: 'bg-cat-ai',
    tabHover: 'hover:bg-cat-ai hover:text-on-ink hover:border-cat-ai',
    tabCollapsed: 'bg-cat-ai text-on-ink border-cat-ai',
    accent: 'text-cat-ai',
    soft: 'bg-cat-ai/10',
    ring: 'ring-cat-ai',
    border: 'border-cat-ai',
  },
  logic: {
    label: 'Logic',
    swatch: '#d97706',
    header: 'bg-cat-logic',
    tabHover: 'hover:bg-cat-logic hover:text-on-ink hover:border-cat-logic',
    tabCollapsed: 'bg-cat-logic text-on-ink border-cat-logic',
    accent: 'text-cat-logic',
    soft: 'bg-cat-logic/10',
    ring: 'ring-cat-logic',
    border: 'border-cat-logic',
  },
  data: {
    label: 'Data',
    swatch: '#2563eb',
    header: 'bg-cat-data',
    tabHover: 'hover:bg-cat-data hover:text-on-ink hover:border-cat-data',
    tabCollapsed: 'bg-cat-data text-on-ink border-cat-data',
    accent: 'text-cat-data',
    soft: 'bg-cat-data/10',
    ring: 'ring-cat-data',
    border: 'border-cat-data',
  },
  utility: {
    label: 'Utility',
    swatch: '#64748b',
    header: 'bg-cat-utility',
    tabHover: 'hover:bg-cat-utility hover:text-on-ink hover:border-cat-utility',
    tabCollapsed: 'bg-cat-utility text-on-ink border-cat-utility',
    accent: 'text-cat-utility',
    soft: 'bg-cat-utility/10',
    ring: 'ring-cat-utility',
    border: 'border-cat-utility',
  },
} as const;

// Sections appear in the toolbar in this order.
export const categoryOrder = Object.keys(categories) as NodeCategory[];

export const styleFor = (category: NodeCategory | undefined) =>
  categories[category ?? 'utility'];

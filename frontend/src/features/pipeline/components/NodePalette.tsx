// NodePalette.tsx
// Sidebar of draggable node types, derived from the node registry.
// --------------------------------------------------

import { useMemo, useState } from 'react';
import { Button, Icon, Input } from '@/components/ui';
import { NodePaletteItem } from '@/features/pipeline/components/NodePaletteItem';
import { nodeTypeList } from '@/features/pipeline/nodes';
import {
  categories,
  categoryOrder,
  type NodeCategory,
} from '@/features/pipeline/nodes/categories';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';

type NodePaletteProps = {
  id?: string;
  open?: boolean;
  onClose?: () => void;
};

export const NodePalette = ({ id, open = false, onClose }: NodePaletteProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const compact = collapsed && isDesktop;

  const filteredByCategory = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = needle
      ? nodeTypeList.filter(
          (entry) =>
            entry.label.toLowerCase().includes(needle) ||
            entry.type.toLowerCase().includes(needle)
        )
      : nodeTypeList;

    const grouped = new Map<NodeCategory, typeof nodeTypeList>();
    for (const entry of matches) {
      const list = grouped.get(entry.category) ?? [];
      list.push(entry);
      grouped.set(entry.category, list);
    }

    return grouped;
  }, [query]);

  return (
    <aside
      id={id}
      className={cn(
        'flex shrink-0 flex-col overflow-hidden border-line bg-surface',
        'md:relative md:z-0 md:translate-x-0 md:border-r md:transition-[width] md:duration-200 md:ease-out',
        collapsed ? 'md:w-14' : 'md:w-60',
        'absolute inset-y-0 left-0 z-40 w-[min(18rem,88vw)] border-r shadow-raised transition-transform duration-200 ease-out',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-3 py-2.5 md:hidden">
        <h2 className="text-sm font-semibold">Nodes</h2>
        <Button
          type="button"
          variant="ghost"
          className="px-2 py-0 text-lg leading-none"
          aria-label="Close node palette"
          onClick={onClose}
        >
          <Icon name="x" size={18} strokeWidth={2} />
        </Button>
      </div>

      <div
        className={cn(
          'hidden shrink-0 items-center border-b border-line md:flex',
          collapsed ? 'justify-center px-1 py-2' : 'justify-between gap-2 px-2 py-2'
        )}
      >
        {!compact && (
          <h2 className="truncate px-1 text-sm font-semibold">Nodes</h2>
        )}

        <Button
          type="button"
          variant="ghost"
          className="shrink-0 px-2 py-1"
          aria-expanded={!collapsed}
          aria-controls={id}
          aria-label={collapsed ? 'Expand node palette' : 'Collapse node palette'}
          onClick={() => setCollapsed((value) => !value)}
        >
          <Icon
            name={collapsed ? 'chevronRight' : 'chevronLeft'}
            size={18}
            strokeWidth={2}
          />
        </Button>
      </div>

      {!compact && (
        <div className="shrink-0 border-b border-line px-3 py-2">
          <div className="relative w-full">
            <Icon
              name="search"
              size={14}
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-muted"
            />
            <Input
              type="search"
              value={query}
              placeholder="Search nodes…"
              className="nodrag nokey h-8 w-full pl-8 text-xs"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      )}

      <div
        className={cn(
          'min-h-0 flex-1 overflow-y-auto overscroll-contain',
          collapsed ? 'p-1.5 md:p-2' : 'p-3'
        )}
      >
        {categoryOrder.map((category) => {
          const entries = filteredByCategory.get(category);
          if (!entries?.length) return null;

          return (
            <section key={category} className={cn('mb-4 last:mb-0', compact && 'mb-2')}>
              {!compact && (
                <h2 className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-semibold tracking-wider text-ink-muted uppercase">
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: categories[category].swatch }}
                    aria-hidden
                  />
                  {categories[category].label}
                </h2>
              )}

              <div className="flex flex-col gap-1">
                {entries.map((entry) => (
                  <NodePaletteItem
                    key={entry.type}
                    entry={entry}
                    compact={compact}
                    onDragStart={onClose}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {!compact && query && filteredByCategory.size === 0 && (
          <p className="px-1 py-6 text-center text-xs text-ink-muted">
            No nodes match &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </aside>
  );
};

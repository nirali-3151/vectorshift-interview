// SuggestionPanel.tsx
// Floating panel of contextual next-step suggestions.
// --------------------------------------------------

import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, Input } from '@/components/ui';
import type { SuggestionAnchor } from '@/features/pipeline/context/suggestionContext';
import {
  filterSuggestionGroups,
  getSuggestionLabel,
  getSuggestions,
} from '@/features/pipeline/lib/suggestions';
import { styleFor } from '@/features/pipeline/nodes/categories';
import { nodeConfigs, type NodeType } from '@/features/pipeline/nodes/nodeConfigs';
import { useStore } from '@/features/pipeline/store';
import { cn } from '@/lib/cn';

type SuggestionPanelProps = {
  anchor: SuggestionAnchor;
  onClose: () => void;
  onSelect: (nodeType: NodeType) => void;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const SuggestionPanel = ({ anchor, onClose, onSelect }: SuggestionPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const sourceNode = useStore((state) => state.nodes.find((node) => node.id === anchor.nodeId));
  const sourceType = sourceNode?.type as NodeType | undefined;

  const groups = useMemo(() => {
    if (!sourceType) return [];
    return filterSuggestionGroups(getSuggestions(sourceType), query);
  }, [sourceType, query]);

  const position = useMemo(() => {
    const margin = 12;
    const width = 280;
    const height = 360;
    const x = clamp(anchor.x + 16, margin, window.innerWidth - width - margin);
    const y = clamp(anchor.y - 24, margin, window.innerHeight - height - margin);
    return { x, y, width, maxHeight: height };
  }, [anchor.x, anchor.y]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!panelRef.current?.contains(target)) {
        onClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const toggleGroup = (title: string) => {
    setCollapsed((current) => ({ ...current, [title]: !current[title] }));
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Suggested next steps"
      className="fixed z-50 flex flex-col overflow-hidden rounded-node border border-line bg-surface shadow-raised"
      style={{
        left: position.x,
        top: position.y,
        width: position.width,
        maxHeight: position.maxHeight,
      }}
    >
      <div className="border-b border-line px-3 py-2.5">
        <div className="relative">
          <Icon
            name="search"
            size={14}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-muted"
          />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search steps..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {groups.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-ink-muted">
            No suggestions match your search.
          </p>
        ) : (
          groups.map((groupEntry) => {
            const isCollapsed = collapsed[groupEntry.title] ?? false;

            return (
              <section key={groupEntry.title} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(groupEntry.title)}
                  className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] font-semibold tracking-wide text-ink-muted uppercase hover:bg-surface-muted"
                >
                  <Icon
                    name="chevronDown"
                    size={12}
                    strokeWidth={2}
                    className={cn('transition-transform', isCollapsed && '-rotate-90')}
                  />
                  {groupEntry.title}
                </button>

                {!isCollapsed && (
                  <ul className="mt-0.5 space-y-0.5">
                    {groupEntry.items.map((suggestion) => {
                      const config = nodeConfigs[suggestion.nodeType];
                      const style = styleFor(config.category);
                      const label = getSuggestionLabel(suggestion);

                      return (
                        <li key={`${groupEntry.title}-${suggestion.nodeType}`}>
                          <button
                            type="button"
                            onClick={() => onSelect(suggestion.nodeType)}
                            className="flex w-full items-center gap-2 rounded-node border border-transparent px-2 py-1.5 text-left text-[13px] transition hover:border-line hover:bg-surface-muted"
                          >
                            <span
                              className={cn(
                                'flex size-6 shrink-0 items-center justify-center rounded-sm',
                                style.soft,
                                style.accent
                              )}
                            >
                              <Icon name={config.icon} size={14} strokeWidth={2} />
                            </span>
                            <span className="truncate">{label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};

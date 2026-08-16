// AppSettingsMenu.tsx
// Header menu for global UI preferences.
// --------------------------------------------------

import { useEffect, useRef, useState } from 'react';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

type AppSettingsMenuProps = {
  inspectorOpen: boolean;
  onInspectorOpenChange: (open: boolean) => void;
  suggestionsEnabled: boolean;
  onSuggestionsEnabledChange: (enabled: boolean) => void;
};

export const AppSettingsMenu = ({
  inspectorOpen,
  onInspectorOpenChange,
  suggestionsEnabled,
  onSuggestionsEnabledChange,
}: AppSettingsMenuProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        className="px-2.5"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Settings"
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="settings" size={18} strokeWidth={2} />
      </Button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute top-full right-0 z-50 mt-1 w-52 rounded-node border border-line',
            'bg-surface p-2 shadow-raised'
          )}
        >
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs hover:bg-surface-muted">
            <input
              type="checkbox"
              className="size-3.5 accent-accent"
              checked={inspectorOpen}
              onChange={(event) => onInspectorOpenChange(event.target.checked)}
            />
            <span>Show inspector panel</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs hover:bg-surface-muted">
            <input
              type="checkbox"
              className="size-3.5 accent-accent"
              checked={suggestionsEnabled}
              onChange={(event) => onSuggestionsEnabledChange(event.target.checked)}
            />
            <span>Show suggestions</span>
          </label>
        </div>
      )}
    </div>
  );
};

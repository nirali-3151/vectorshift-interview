import { useCallback, useState } from 'react';
import { Button, Icon } from '@/components/ui';
import {
  PipelineCanvas,
  NodePalette,
  InspectorPanel,
  AppSettingsMenu,
  PipelineSubmit,
  PipelineStatus,
  usePersistPipeline,
  useAppSettings,
} from '@/features/pipeline';

function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [inspectorMobileOpen, setInspectorMobileOpen] = useState(false);
  const [inspectorDismissible, setInspectorDismissible] = useState(false);
  const [inspectorExpandSignal, setInspectorExpandSignal] = useState(0);
  const { status, resetCanvas } = usePersistPipeline();
  const { inspectorOpen, setInspectorOpen, suggestionsEnabled, setSuggestionsEnabled } =
    useAppSettings();

  const handleValidationClick = useCallback(() => {
    if (!inspectorOpen) {
      setInspectorOpen(true);
      setInspectorDismissible(true);
    }
    setInspectorExpandSignal((value) => value + 1);
    setInspectorMobileOpen(true);
  }, [inspectorOpen, setInspectorOpen]);

  const handleInspectorDismiss = useCallback(() => {
    setInspectorOpen(false);
    setInspectorDismissible(false);
    setInspectorMobileOpen(false);
  }, [setInspectorOpen]);

  return (
    <div className="flex h-dvh flex-col bg-surface-muted">
      <header className="flex shrink-0 items-center gap-3 border-b border-line bg-surface px-4 py-2.5 sm:gap-4 sm:px-5 sm:py-3">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <img
            src="/VS_logo.png"
            alt=""
            className="size-7 shrink-0 rounded-node object-contain sm:size-8"
          />
          <div className="min-w-0">
            <h1 className="truncate text-sm leading-tight font-semibold tracking-tight">
              Pipeline Builder
            </h1>
            <p className="hidden text-xs text-ink-muted sm:block">
              Compose flows visually — validate before you run
            </p>
          </div>
        </div>

        <PipelineStatus
          saveStatus={status}
          onValidationClick={handleValidationClick}
        />

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            className="px-2.5 md:hidden"
            aria-expanded={paletteOpen}
            aria-controls="node-palette"
            onClick={() => setPaletteOpen((open) => !open)}
          >
            <Icon name="layoutGrid" size={18} strokeWidth={2} />
            <span className="sr-only sm:not-sr-only sm:inline">Nodes</span>
          </Button>

          {inspectorOpen && (
            <Button
              type="button"
              variant="ghost"
              className="px-2.5 md:hidden"
              aria-expanded={inspectorMobileOpen}
              aria-controls="inspector-panel"
              onClick={() => setInspectorMobileOpen((open) => !open)}
            >
              <Icon name="panelRight" size={18} strokeWidth={2} />
              <span className="sr-only sm:not-sr-only sm:inline">Inspector</span>
            </Button>
          )}

          <AppSettingsMenu
            inspectorOpen={inspectorOpen}
            onInspectorOpenChange={(open) => {
              setInspectorOpen(open);
              if (open) setInspectorDismissible(false);
            }}
            suggestionsEnabled={suggestionsEnabled}
            onSuggestionsEnabledChange={setSuggestionsEnabled}
          />

          <PipelineSubmit />
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {paletteOpen && (
          <button
            type="button"
            className="absolute inset-0 z-30 bg-ink/30 md:hidden"
            aria-label="Close node palette"
            onClick={() => setPaletteOpen(false)}
          />
        )}

        {inspectorOpen && inspectorMobileOpen && (
          <button
            type="button"
            className="absolute inset-0 z-30 bg-ink/30 md:hidden"
            aria-label="Close inspector"
            onClick={() => setInspectorMobileOpen(false)}
          />
        )}

        <NodePalette
          id="node-palette"
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
        />

        <PipelineCanvas onClear={resetCanvas} suggestionsEnabled={suggestionsEnabled} />

        {inspectorOpen && (
          <InspectorPanel
            id="inspector-panel"
            open={inspectorMobileOpen}
            onClose={() => setInspectorMobileOpen(false)}
            dismissible={inspectorDismissible}
            onDismiss={handleInspectorDismiss}
            expandSignal={inspectorExpandSignal}
          />
        )}
      </div>
    </div>
  );
}

export default App;

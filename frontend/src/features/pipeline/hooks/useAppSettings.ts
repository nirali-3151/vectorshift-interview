// useAppSettings.ts
// Global UI settings with localStorage persistence.
// --------------------------------------------------

import { useCallback, useEffect, useState } from 'react';
import {
  loadSettings,
  saveSettings,
  type AppSettings,
} from '@/features/pipeline/lib/persistSettings';

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const setInspectorOpen = useCallback((inspectorOpen: boolean) => {
    setSettings((current) => ({ ...current, inspectorOpen }));
  }, []);

  const setSuggestionsEnabled = useCallback((suggestionsEnabled: boolean) => {
    setSettings((current) => ({ ...current, suggestionsEnabled }));
  }, []);

  return {
    inspectorOpen: settings.inspectorOpen,
    setInspectorOpen,
    suggestionsEnabled: settings.suggestionsEnabled,
    setSuggestionsEnabled,
  };
};

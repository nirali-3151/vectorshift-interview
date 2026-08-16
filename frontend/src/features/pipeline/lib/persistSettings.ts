// persistSettings.ts
// Persists global UI preferences such as inspector visibility.
// --------------------------------------------------

export type AppSettings = {
  inspectorOpen: boolean;
  suggestionsEnabled: boolean;
};

const SETTINGS_KEY = 'pipeline-builder:settings:v1';

const defaults: AppSettings = {
  inspectorOpen: true,
  suggestionsEnabled: true,
};

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;

    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      inspectorOpen: parsed.inspectorOpen ?? defaults.inspectorOpen,
      suggestionsEnabled: parsed.suggestionsEnabled ?? defaults.suggestionsEnabled,
    };
  } catch {
    return defaults;
  }
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

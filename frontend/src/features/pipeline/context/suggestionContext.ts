// suggestionContext.ts
// Context for opening the suggestion panel from node handles.
// --------------------------------------------------

import { createContext, useContext } from 'react';

export type SuggestionAnchor = {
  nodeId: string;
  handleId: string;
  x: number;
  y: number;
};

export type SuggestionContextValue = {
  suggestionsEnabled: boolean;
  canvasLocked: boolean;
  openSuggestions: (anchor: SuggestionAnchor) => void;
};

export const SuggestionContext = createContext<SuggestionContextValue | null>(null);

export const useSuggestionContext = () => {
  const context = useContext(SuggestionContext);
  if (!context) {
    throw new Error('useSuggestionContext must be used within SuggestionProvider');
  }
  return context;
};

export const useOptionalSuggestionContext = () => useContext(SuggestionContext);

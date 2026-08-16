// SuggestionProvider.tsx
// Provides suggestion panel controls to nodes on the canvas.
// --------------------------------------------------

import { type ReactNode } from 'react';
import {
  SuggestionContext,
  type SuggestionContextValue,
} from '@/features/pipeline/context/suggestionContext';

type SuggestionProviderProps = {
  value: SuggestionContextValue;
  children: ReactNode;
};

export const SuggestionProvider = ({ value, children }: SuggestionProviderProps) => (
  <SuggestionContext.Provider value={value}>{children}</SuggestionContext.Provider>
);

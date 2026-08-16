// AppProviders.tsx
// Root providers for the application.
// --------------------------------------------------

import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { queryClient } from '@/lib/queryClient';

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

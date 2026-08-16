import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/styles/index.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppProviders } from '@/providers/AppProviders';
import App from '@/App';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootEl);
root.render(
  <React.StrictMode>
    <AppProviders>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AppProviders>
  </React.StrictMode>
);

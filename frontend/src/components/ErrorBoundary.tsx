// ErrorBoundary.tsx
// Catches render-time errors so a broken node config shows a recoverable
// message instead of a blank page. Must be a class: there is no hook
// equivalent of componentDidCatch.
// --------------------------------------------------

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui';

type ErrorBoundaryProps = {
  children?: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error in the React tree:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="max-w-prose text-[13px] text-ink-muted">{error.message}</p>
        <Button onClick={() => this.setState({ error: null })}>Try again</Button>
      </div>
    );
  }
}

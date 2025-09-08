import React from 'react';

interface ErrorBoundaryState { hasError: boolean; error?: Error }

class ErrorBoundary extends React.Component<React.PropsWithChildren<Record<string, unknown>>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<Record<string, unknown>>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if ((window as any).appInsights) {
      (window as any).appInsights.trackException({ exception: error });
      (window as any).appInsights.trackTrace({ message: 'React error boundary', properties: { componentStack: info.componentStack } });
    }
    console.error('ErrorBoundary caught error', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center bg-black/60">
          <h1 className="text-3xl font-bold text-red-300">Something went wrong</h1>
          <p className="text-red-400 max-w-xl">{this.state.error?.message || 'Unknown error'}</p>
          <button onClick={this.handleReset} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-md transition">Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

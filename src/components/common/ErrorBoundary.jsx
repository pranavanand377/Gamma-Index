import { Component } from 'react';
import { logError } from '../../services/errorLogger';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logError({
      errorType: 'render',
      message: error?.message || 'React render error',
      stack: error?.stack || errorInfo?.componentStack || null,
      source: 'ErrorBoundary',
      metadata: {
        componentStack: errorInfo?.componentStack?.slice(0, 2000) || null,
      },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface-raised p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-status-error/20 border border-status-error/50 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Something went wrong</h2>
            <p className="text-sm text-text-secondary mb-2">
              An unexpected error occurred. The error has been automatically logged for the admin to review.
            </p>
            {this.state.error?.message && (
              <p className="text-xs text-status-error bg-status-error/10 border border-status-error/20 rounded-lg px-3 py-2 mb-6 break-words">
                {this.state.error.message}
              </p>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="w-full rounded-lg bg-gamma-500 px-4 py-2.5 text-sm font-semibold text-surface-base transition-colors hover:bg-gamma-400"
              >
                Try Again
              </button>
              <button
                onClick={() => { window.location.hash = '#/'; window.location.reload(); }}
                className="w-full rounded-lg border border-surface-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

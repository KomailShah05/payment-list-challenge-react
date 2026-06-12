import { Component, ErrorInfo, ReactNode } from "react";
import { I18N } from "../constants";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this would ship to an observability service (e.g. Sentry)
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8 text-center"
          >
            <p className="text-base font-semibold text-red-700">
              {I18N.SOMETHING_WENT_WRONG}
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-2 max-w-xl overflow-auto rounded bg-red-100 p-3 text-left text-xs text-red-600">
                {this.state.error.message}
              </pre>
            )}
            <button
              className="mt-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { useState, useEffect, ReactNode } from "react";
import { AppError } from "../lib/errors/AppError";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: AppError | null) => ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    if (hasError && error) {
      console.error("Error caught by boundary:", error);
    }
  }, [hasError, error]);

  if (hasError && error) {
    if (fallback) {
      return fallback(error);
    }

    return (
      <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded">
        <h2 className="text-red-800 font-bold">Something went wrong</h2>
        <p className="text-red-600">{error?.message}</p>
        <button
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => {
            setHasError(false);
            setError(null);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return children;
};

// Higher-order component to catch errors in class components
interface ErrorHandler<Props> {
  (props: Props): ReactNode;
}

export function withErrorBoundary<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  fallback?: (error: AppError | null) => ReactNode,
): React.FC<P> {
  return function ErrorBoundaryWrapper(props: P) {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState<AppError | null>(null);

    useEffect(() => {
      if (hasError && error) {
        console.error("Error caught by boundary:", error);
      }
    }, [hasError, error]);

    if (hasError && error) {
      if (fallback) {
        return fallback(error);
      }

      return (
        <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-bold">Something went wrong</h2>
          <p className="text-red-600">{error?.message}</p>
          <button
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => {
              setHasError(false);
              setError(null);
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

export default ErrorBoundary;

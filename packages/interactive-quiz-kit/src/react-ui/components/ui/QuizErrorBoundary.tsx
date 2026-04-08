import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  children?: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('QuizQuestion render error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="font-semibold text-destructive">Error Rendering Question</p>
          </div>
          <p className="text-sm text-foreground">
            {this.props.fallbackMessage || 'An unexpected error occurred while rendering this question. The rest of the quiz can still be completed.'}
          </p>
          {this.state.error && (
            <p className="text-xs text-muted-foreground mt-2 font-mono break-all line-clamp-2">
              {this.state.error.message}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export function QuizErrorBoundary({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <ErrorBoundary fallbackMessage={t('practiceFlow.player.renderError', 'An unexpected error occurred while rendering this question. Defaulting to safe mode.')}>
      {children}
    </ErrorBoundary>
  );
}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from './UI';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      try {
        const parsedError = JSON.parse(this.state.error?.message || "");
        if (parsedError.error) {
          errorMessage = `Firestore Error: ${parsedError.error} (Operation: ${parsedError.operationType})`;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0A0A0A] border border-red-500/30 p-8 rounded-3xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">System Error</h2>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              {errorMessage}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full py-4 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white border-none"
            >
              <RefreshCcw size={18} />
              Restart System
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

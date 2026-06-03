import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private renderErrorInfo() {
    if (!this.state.error) return null;
    
    try {
      const errorInfo = JSON.parse(this.state.error.message);
      if (errorInfo.error && errorInfo.operationType) {
        return (
          <div className="mt-8 p-4 bg-black/60 border border-red-500/30 rounded-sm text-left font-mono text-[10px] overflow-auto max-h-60">
            <p className="text-red-400 font-bold mb-2">Detalhes Técnicos:</p>
            <pre className="text-gold/80">{JSON.stringify(errorInfo, null, 2)}</pre>
          </div>
        );
      }
    } catch (e) {
      // Not a JSON error
    }
    
    return (
      <p className="text-gold/40 text-xs mt-4 italic">
        {this.state.error.message}
      </p>
    );
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-mythos-bg text-gold p-8 text-center">
          <div className="max-w-2xl space-y-6">
            <h2 className="text-3xl font-cinzel text-gold-gradient">Ocorreu um Erro Crítico</h2>
            <p className="text-gold/60 italic">"As crônicas foram interrompidas por uma força desconhecida."</p>
            
            {this.renderErrorInfo()}

            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gold/10 border border-gold/30 rounded-full hover:bg-gold/20 transition-all text-gold text-xs uppercase tracking-widest"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

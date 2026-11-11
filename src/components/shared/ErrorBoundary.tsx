import { Component, ErrorInfo, ReactNode } from "react";
import { AnalyticsService } from "../../lib/analytics";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  globalError: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    globalError: null
  };

  private isThirdPartyError(event: ErrorEvent | PromiseRejectionEvent): boolean {
    const message = event instanceof ErrorEvent ? event.message : String((event as any).reason);
    const filename = event instanceof ErrorEvent ? event.filename : '';
    const errorObj = event instanceof ErrorEvent ? event.error : (event as any).reason;
    const stack = errorObj?.stack || '';

    const thirdPartyDomains = [
      'connect.facebook.net',
      'google-analytics.com',
      'googletagmanager.com',
      'clarity.ms',
      'analytics.tiktok.com',
      'snap.licdn.com'
    ];

    const isThirdPartyDomain = thirdPartyDomains.some(domain => 
      (filename && filename.includes(domain)) || 
      (stack && stack.includes(domain))
    );

    const isKnownMetaPixelError = message.includes('getBoundingClientRect is not a function');

    return isThirdPartyDomain || isKnownMetaPixelError;
  }

  private handleGlobalError = (event: ErrorEvent) => {
    console.error("[Global Error]:", event.error || event.message);
    AnalyticsService.trackError(event.error || event.message, { type: "global_error", url: window.location.href, filename: event.filename });
    
    if (!this.isThirdPartyError(event)) {
      this.setState({
        hasError: true,
        globalError: `[Global] ${event.message}\n${event.filename}:${event.lineno}:${event.colno}`,
        error: event.error
      });
    } else {
      console.warn("[ErrorBoundary] Suppressed third-party script error to prevent app crash.");
    }
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error("[Unhandled Promise Rejection]:", event.reason);
    AnalyticsService.trackError(event.reason instanceof Error ? event.reason : String(event.reason), { type: "unhandled_rejection", url: window.location.href });
    
    if (!this.isThirdPartyError(event)) {
      this.setState({
        hasError: true,
        globalError: `[Promise Rejection] ${event.reason}`,
        error: event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      });
    } else {
      console.warn("[ErrorBoundary] Suppressed third-party unhandled rejection to prevent app crash.");
    }
  };

  public componentDidMount() {
    window.addEventListener("error", this.handleGlobalError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  public componentWillUnmount() {
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, globalError: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[React ErrorBoundary Crash]:", error, errorInfo);
    AnalyticsService.trackError(error, { type: "react_error_boundary", componentStack: errorInfo.componentStack, url: window.location.href });
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      const errorString = this.state.error?.message || this.state.error?.toString() || this.state.globalError || "";
      const isChunkError = errorString.includes('Failed to fetch dynamically imported module') || 
                           errorString.includes('ChunkLoadError') || 
                           this.state.error?.name === 'ChunkLoadError';

      if (isChunkError) {
        return (
          <div className="min-h-dvh bg-surface flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl font-display text-white mb-4">Connection Interrupted</h1>
            <p className="text-text-muted text-lg mb-8 max-w-md">
              We couldn't load this section of the application. This usually happens when the app has been updated or your connection drops.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
              >
                Reload Page
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-full font-medium hover:bg-white/10 transition-colors"
              >
                Return to Services
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-dvh bg-background text-text flex items-center justify-center p-8 flex-col text-left">
          <div className="w-full max-w-4xl bg-[#0a0f18] border border-red-500/30 p-6 rounded-lg shadow-2xl overflow-hidden">
            <h1 className="text-2xl font-mono font-bold text-red-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              RUNTIME CRASH DETECTED
            </h1>
            
            <div className="space-y-4 font-mono text-sm">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded text-red-200 break-words">
                <span className="text-red-400 font-bold block mb-1">Error Message:</span>
                {this.state.error?.message || this.state.error?.toString() || this.state.globalError || "Unknown error"}
              </div>

              {this.state.errorInfo?.componentStack && (
                <div className="bg-white/5 border border-white/10 p-4 rounded text-gray-300 overflow-x-auto">
                  <span className="text-gray-400 font-bold block mb-1">Component Stack:</span>
                  <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                </div>
              )}

              {this.state.error?.stack && (
                <div className="bg-white/5 border border-white/10 p-4 rounded text-gray-300 overflow-x-auto">
                  <span className="text-gray-400 font-bold block mb-1">Stack Trace:</span>
                  <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                </div>
              )}
              
              <div className="bg-white/5 border border-white/10 p-4 rounded text-gray-300">
                <span className="text-gray-400 font-bold block mb-1">Lifecycle State:</span>
                <div>URL: {window.location.href}</div>
                <div>Time: {new Date().toISOString()}</div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-2 rounded font-mono font-bold hover:bg-red-500/30 transition-colors auto-focus"
              >
                RELOAD SYSTEM
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

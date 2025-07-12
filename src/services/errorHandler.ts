// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  WALLET = 'WALLET',
  CONTRACT = 'CONTRACT',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

// Error class
export class AppError extends Error {
  type: ErrorType;
  details?: any;
  
  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, details?: any) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.details = details;
    
    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[${type}] ${message}`, details || '');
    }
  }
  
  // Get user-friendly message
  getUserMessage(): string {
    switch (this.type) {
      case ErrorType.NETWORK:
        return 'Network connection error. Please check your internet connection and try again.';
      case ErrorType.WALLET:
        return 'Wallet connection error. Please make sure your wallet is unlocked and try again.';
      case ErrorType.CONTRACT:
        return 'Smart contract error. The transaction could not be completed.';
      case ErrorType.AUTHENTICATION:
        return 'Authentication error. Please reconnect your wallet.';
      case ErrorType.VALIDATION:
        return this.message; // Use the original message for validation errors
      case ErrorType.SERVER:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

// Global error handler
export const handleError = (error: any): AppError => {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }
  
  // Network errors
  if (error.message?.includes('network') || error.message?.includes('connection')) {
    return new AppError(error.message, ErrorType.NETWORK, error);
  }
  
  // Wallet errors
  if (
    error.message?.includes('wallet') || 
    error.message?.includes('MetaMask') ||
    error.code === 4001 || // User rejected request
    error.code === -32603 // Internal JSON-RPC error
  ) {
    return new AppError(error.message, ErrorType.WALLET, error);
  }
  
  // Contract errors
  if (
    error.message?.includes('contract') ||
    error.message?.includes('transaction') ||
    error.message?.includes('gas')
  ) {
    return new AppError(error.message, ErrorType.CONTRACT, error);
  }
  
  // Authentication errors
  if (
    error.message?.includes('auth') ||
    error.message?.includes('token') ||
    error.message?.includes('signature')
  ) {
    return new AppError(error.message, ErrorType.AUTHENTICATION, error);
  }
  
  // Server errors
  if (error.status >= 500 || error.message?.includes('server')) {
    return new AppError(error.message, ErrorType.SERVER, error);
  }
  
  // Default to unknown error
  return new AppError(
    error.message || 'An unexpected error occurred',
    ErrorType.UNKNOWN,
    error
  );
};

// Error boundary component for React
export const withErrorBoundary = (Component: React.ComponentType<any>) => {
  return class ErrorBoundary extends React.Component<any, { hasError: boolean, error: Error | null }> {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    render() {
      if (this.state.hasError) {
        const appError = handleError(this.state.error);
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center max-w-md">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-gray-300 mb-6">
                {appError.getUserMessage()}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Reload Page
              </button>
            </div>
          </div>
        );
      }
      
      return <Component {...this.props} />;
    }
  };
};
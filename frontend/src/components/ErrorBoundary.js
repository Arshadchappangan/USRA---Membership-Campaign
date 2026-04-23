import React from 'react';
import usraLogo from '../assets/usra-logo.png';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    const errorId = `ERR-${Date.now()}`;
    this.setState({ errorId });
    // In production, send to error tracking (Sentry, etc.)
    if (process.env.NODE_ENV === 'production') {
      console.error('[ErrorBoundary]', error, info, { errorId });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center px-4 text-center">
        <img src={usraLogo} alt="USRA" className="w-20 h-20 object-contain mb-6 opacity-60" />
        <h1 className="text-4xl font-black text-gray-800 mb-3">Something went wrong</h1>
        <p className="text-gray-500 mb-2 max-w-sm">
          An unexpected error occurred. Your data has not been lost.
        </p>
        {this.state.errorId && (
          <p className="text-xs text-gray-400 mb-6 font-mono">Error ID: {this.state.errorId}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
            style={{ padding: '12px 24px' }}
          >
            Reload Page
          </button>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
            className="px-6 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold hover:border-usra-blue hover:text-usra-blue transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

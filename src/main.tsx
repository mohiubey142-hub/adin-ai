import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './index.css'

// ✅ INSTAGRAM WEBVIEW FIX: Error Boundary to catch and log errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('📱 App crashed:', error, errorInfo);
    // Send error to analytics if needed
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#0a0a0a',
          color: 'white',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            fontSize: '32px'
          }}>
            ⚡
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            Adin AI
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '8px' }}>
            Something went wrong
          </p>
          <p style={{ color: '#4b5563', fontSize: '14px', maxWidth: '400px' }}>
            Please try refreshing the page
          </p>
          {this.state.error && (
            <details style={{
              marginTop: '20px',
              padding: '12px',
              background: '#1a1a1a',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '100%',
              textAlign: 'left',
              fontSize: '12px',
              color: '#9ca3af'
            }}>
              <summary style={{ cursor: 'pointer', color: '#6b7280' }}>
                Technical details
              </summary>
              <pre style={{
                marginTop: '8px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px',
              padding: '10px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              color: 'white',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ✅ INSTAGRAM WEBVIEW FIX: Check for critical browser APIs
const checkBrowserSupport = () => {
  const issues = [];
  
  // Check localStorage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    issues.push('localStorage not available');
  }

  // Check navigator
  if (typeof navigator === 'undefined') {
    issues.push('navigator not available');
  }

  // Log issues
  if (issues.length > 0) {
    console.warn('📱 Browser compatibility issues:', issues);
  }

  return issues.length === 0;
};

// ✅ Run browser check
const browserSupported = checkBrowserSupport();

// ✅ Create root
const root = ReactDOM.createRoot(document.getElementById('root')!);

// ✅ Render with Error Boundary
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

// ✅ Log environment info
console.log('📱 Adin AI starting...');
console.log('📱 User Agent:', navigator.userAgent);
console.log('📱 Browser supported:', browserSupported);
console.log('📱 Instagram WebView:', navigator.userAgent.includes('Instagram') && navigator.userAgent.includes('Android'));
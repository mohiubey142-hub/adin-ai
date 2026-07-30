import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { ErrorBoundary } from './ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </ErrorBoundary>
)
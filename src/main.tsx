// src/main.tsx
// ============================================================
// App entry point
// ============================================================
// ✅ NEW: Load Groq keys from backend before rendering App.
// ✅ Falls back to VITE_ env vars if backend fails — app never crashes.
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ErrorBoundary } from './ErrorBoundary';
import './index.css';

import { loadKeysFromBackend } from './components/cv-builder/services/providers/groqKeyManager';

// ============================================================
// Bootstrap: load backend keys ONCE, then render the app.
// ============================================================
const bootstrap = async () => {
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    console.error('❌ #root element not found');
    return;
  }

  // 🔑 Fetch all 5 Groq keys from the backend before first render.
  //    Never throws — on failure, the key manager falls back to
  //    VITE_ env vars (Step 6 will remove that fallback later).
  try {
    await loadKeysFromBackend();
  } catch (err) {
    console.warn('⚠️ [bootstrap] loadKeysFromBackend failed — continuing with env fallback:', err);
  }

  // 🚀 Render the app
  ReactDOM.createRoot(rootEl).render(
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  );
};

bootstrap();
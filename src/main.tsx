import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initWebVitals } from './observability/webVitals';

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        options: {
          // Always fetch the latest SW script, bypassing the HTTP cache.
          // Prevents the "wrong version" warning after MSW upgrades.
          updateViaCache: 'none',
        },
      },
    });
    console.log('Mock Service Worker started');
  } catch (error) {
    console.error('Failed to start Mock Service Worker:', error);
  }
}

// Core Web Vitals (LCP / CLS / INP) → telemetry
initWebVitals();

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

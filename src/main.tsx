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

    const startWorker = () =>
      worker.start({
        // 'warn' (not 'bypass') surfaces any request MSW didn't intercept,
        // instead of silently letting it hit the real network and return an
        // empty/404 response that looks like "no data".
        onUnhandledRequest: 'warn',
        serviceWorker: {
          options: {
            // Always fetch the latest SW script, bypassing the HTTP cache.
            // Prevents the "wrong version" warning after MSW upgrades.
            updateViaCache: 'none',
          },
        },
      });

    await startWorker();
    console.log('Mock Service Worker started');

    // The browser terminates an idle service worker after the tab sits
    // inactive. The next fetch (e.g. applying a filter) can then fire before
    // the worker has woken up, fall through to the real network, and return
    // no data. Re-arm the worker whenever the tab becomes visible again so
    // it's guaranteed active before that fetch. worker.start() is idempotent.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        startWorker().catch((error) =>
          console.error('Failed to re-arm Mock Service Worker:', error),
        );
      }
    });
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

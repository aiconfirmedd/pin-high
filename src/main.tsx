import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  let refreshing = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✓ Service Worker registered:', registration.scope);

        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.addEventListener('updatefound', () => {
          const nextWorker = registration.installing;
          if (!nextWorker) return;

          nextWorker.addEventListener('statechange', () => {
            if (nextWorker.state === 'installed' && navigator.serviceWorker.controller) {
              nextWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every 60 seconds
      })
      .catch(err => {
        console.log('Service Worker registration failed:', err);
      });
  });
}

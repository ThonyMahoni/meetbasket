import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import CookieConsent from './components/CookieConsent';
import './index.css';

function App() {
  return (
    <>
      <CookieConsent />
      <Router>
        <AuthProvider>
          <LocationProvider>
            <AppRoutes />
          </LocationProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;

// ✅ Service Worker Registrierung
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[SW] Registriert:', reg.scope);
      })
      .catch((err) => {
        console.error('[SW] Registrierung fehlgeschlagen:', err);
      });
  });
}

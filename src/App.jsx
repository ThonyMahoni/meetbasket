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

//Notification.requestPermission();
if ('Notification' in window && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Benachrichtigungen erlaubt');

      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BDvgrOdRZhTRkJoJ0OFHbCTiedN4ltKHHoiywON399mge80E7NrYbYD8982jfDzVWmi9Ah2JQ7VE9IoDHEbWEh8',
      });

      // Sende die subscription an dein Backend:
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subscribe`, {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📬 Abo erfolgreich registriert', subscription);
    } else {
      console.warn('🔕 Benachrichtigungen nicht erlaubt');
    }
  });
}

import React, { useEffect, useState } from 'react';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // immer true – keine Zustimmung nötig
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem('cookieConsent');
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const savePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setVisible(false);

    // Optional: z. B. Google Analytics nur aktivieren wenn erlaubt
    if (preferences.analytics) {
      // initGoogleAnalytics()
    }

    if (preferences.marketing) {
      // initMarketingPixel()
    }
  };

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setVisible(false);

    // Optional: alle Tracker laden
    // initGoogleAnalytics()
    // initMarketingPixel()
  };

  const declineAll = () => {
    const declined = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(declined);
    localStorage.setItem('cookieConsent', JSON.stringify(declined));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-6 z-50 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm md:text-base mb-2">
            Wir verwenden Cookies, um unsere Website und unseren Service zu optimieren. Sie können Ihre Präferenzen wählen.
          </p>
          <div className="space-y-1 text-sm">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked disabled className="accent-green-500" />
              <span>Technisch notwendige Cookies (immer aktiv)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) =>
                  setPreferences({ ...preferences, analytics: e.target.checked })
                }
                className="accent-green-500"
              />
              <span>Statistik / Tracking (z. B. Google Analytics)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) =>
                  setPreferences({ ...preferences, marketing: e.target.checked })
                }
                className="accent-green-500"
              />
              <span>Marketing (z. B. Meta Pixel)</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-2">
          <button
            onClick={savePreferences}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Auswahl speichern
          </button>
          <button
            onClick={acceptAll}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Alle akzeptieren
          </button>
          <button
            onClick={declineAll}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Ablehnen
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

import React, { useEffect, useState } from 'react';
import {
  isStandaloneMode,
  isIOS,
  isAndroid,
  setupInstallPromptListener,
  getInstallPromptEvent
} from '../utils/install';

const InstallAppPage = () => {
const [isInstallable, setIsInstallable] = useState(false);
const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);
const installPromptEventRef = React.useRef(null);


useEffect(() => {
    console.log('[InstallAppPage] Standalone mode:', isStandaloneMode());
    console.log('[InstallAppPage] promptRef initial:', getInstallPromptEvent());
    if (isStandaloneMode()) {
      setIsAlreadyInstalled(true);
    }
  
    // Event möglicherweise schon gesetzt?
    const prompt = getInstallPromptEvent();
    if (prompt) {
      installPromptEventRef.current = prompt;
      setIsInstallable(true);
    }
  
    const removeListener = setupInstallPromptListener((e) => {
      installPromptEventRef.current = e;
      setIsInstallable(true);
    });
  
    return removeListener;
  }, []);
  

  const handleInstallClick = async () => {
    const promptEvent = installPromptEventRef.current;
    if (!promptEvent) return;
  
    promptEvent.prompt();
  
    const { outcome } = await promptEvent.userChoice;
    console.log(`[PWA] User install outcome: ${outcome}`);
  
    installPromptEventRef.current = null;
    setIsInstallable(false);
  };
  

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Installiere die MeetBasket App</h1>

      {isAlreadyInstalled ? (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-8 rounded-md">
          <p className="font-bold">App bereits installiert!</p>
          <p>Sie verwenden derzeit die MeetBasket-App im Standalone-Modus.</p>
        </div>
      ) : (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8 rounded-md">
          <p className="font-bold">Zum Home-Bildschirm hinzufügen</p>
          <p>Installieren Sie MeetBasket auf Ihrem Gerät für das beste Erlebnis, schnelleren Zugriff ohne Verzögerung</p>
        </div>
      )}

      {/* Main content with device-specific instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column with device-specific instructions */}
        <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-bold mb-4">Schnelle Installation </h2>
  <p className="mb-4">Ihr Browser unterstützt möglicherweise die Installation dieser Webanwendung:</p>
  <button
    onClick={handleInstallClick}
    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md w-full"
  >
    Zum Home-Bildschirm hinzufügen
  </button>
</div> {!isInstallable && !isAlreadyInstalled && (
 <>
 {console.log('[InstallAppPage] Installable:', isInstallable)}
 <p className="text-sm text-gray-600 mt-2">
   Derzeit ist keine Installation möglich. Bitte verwende Chrome oder füge manuell hinzu.
 </p>
</>
)}



          {isIOS && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Auf iOS installieren</h2>
              <ol className="list-decimal pl-6 space-y-4">
                <li>
                  <span className="font-medium">Im Safari öffnen:</span> Für das beste Erlebnis verwenden Sie den Safari-Browser (die iOS-Installation funktioniert nicht in Chrome oder Firefox).
                </li>
                <li>
                  <span className="font-medium">Tippen Sie auf das Freigabesymbol:</span> Drücke die Teilen-Taste{' '}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 inline-block"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"
                    />
                  </svg>{' '}
                  at the bottom of your screen.
                </li>
                <li>
                  <span className="font-medium">Wählen Sie "Zum Home-Bildschirm hinzufügen":</span> Scrollen Sie im Freigabemenü nach unten und tippen Sie auf "Zum Startbildschirm hinzufügen".
                </li>
                <li>
                  <span className="font-medium">Bestätigen:</span> Tippen Sie auf "Hinzufügen" in der oberen rechten Ecke.
                </li>
              </ol>
              <div className="mt-4 bg-gray-100 p-4 rounded-md text-center">
                <img 
                  src="/public/icons/install-app.png" 
                  alt="iOS Installation Steps - Visueller Leitfaden zum Hinzufügen von Apps zu deinem iOS-Startbildschirm" 
                  className="max-h-40 mx-auto"
                />
                <p className="text-sm text-gray-600 mt-2">
                Visueller Leitfaden zum Hinzufügen von Apps zu deinem iOS-Startbildschirm
                </p> 
              </div>
            </div>
          )}

          {isAndroid && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Auf Android installieren</h2>
              <ol className="list-decimal pl-6 space-y-4">
                <li>
                  <span className="font-medium">Im Chrome öffnen:</span> Für das beste Erlebnis verwenden Sie den Chrome-Browser.
                </li>
                <li>
                  <span className="font-medium">Tippen Sie auf das Menü-Symbol:</span> Drücke das Drei-Punkte-Menü ⋮ oben rechts.
                </li>
                <li>
                  <span className="font-medium">Wählen Sie "Zum Home-Bildschirm hinzufügen"</span> Tippen Sie diese Option im Dropdown-Menü an.
                </li>
                <li>
                  <span className="font-medium">Bestätigen:</span> Tippen Sie auf "Hinzufügen", wenn Sie dazu aufgefordert werden.
                </li>
              </ol>
              <div className="mt-4 bg-gray-100 p-4 rounded-md text-center">
                <img 
                  src="/public/icons/install-app-adroid.png" 
                  alt="Android Installation Steps- Visueller Leitfaden zum Hinzufügen von Apps zu deinem Adroid-Startbildschirm" 
                  className="max-h-40 mx-auto"
                />
                <p className="text-sm text-gray-600 mt-2">
                Visuelle Anleitung zum Hinzufügen von Apps zu Ihrem Android-Startbildschirm
                </p>
              </div>
            </div>
          )}

          {!isIOS && !isAndroid && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Auf dem Desktop installieren</h2>
              <ol className="list-decimal pl-6 space-y-4">
                <li>
                  <span className="font-medium">Öffnen Sie in Chrome oder Edge:</span> Für das beste Erlebnis verwenden Sie einen unterstützten Browser wie Chrome oder Edge.
                </li>
                <li>
                  <span className="font-medium">Suchen Sie nach dem Installationssymbol:</span> In der Adressleiste sehen Sie ein Installationssymbol (typischerweise ein '+' oder ein Computer-Symbol).
                </li>
                <li>
                  <span className="font-medium">Klicken Sie auf "Installieren"</span> Befolgen Sie die Anweisungen, um die Installation abzuschließen.
                </li>
              </ol>
              <div className="mt-4 bg-gray-100 p-4 rounded-md text-center">
                <img 
                  src="https://developer.chrome.com/docs/extensions/mv3/homepage/images/omnibox-ui.png" 
                  alt="Desktop Installation Steps" 
                  className="max-h-40 mx-auto"
                />
                <p className="text-sm text-gray-600 mt-2">
                Suchen Sie das Installationssymbol in der Adressleiste Ihres Browsers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right column with benefits and features */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Warum die App installieren?</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  <strong>Schneller Zugriff:</strong> Öffnen Sie die App mit einem Tap von Ihrem Startbildschirm aus.
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  <strong>App-ähnliche Erfahrung:</strong> Vollbildmodus ohne Browsersteuerelemente
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  <strong>Offline-Zugriff:</strong> Verwenden Sie MeetBasket sogar mit eingeschränkter Konnektivität.
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  <strong>Weitere Funktionen:</strong> Zugriff auf Gerätefunktionen wie Benachrichtigungen
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  <strong>Kein App Store:</strong> Kein Bedarf, einen App-Store zu besuchen - direkt aus dem Web installieren.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">MeetBasket Features</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-orange-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Finde lokale Basketballplätze
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-orange-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Nehmen Sie an Aufnahmespielen teil
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-orange-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Nachricht an andere Spieler
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-orange-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Verfolge deine Basketballfähigkeiten
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-orange-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Basketball-Veranstaltungen organisieren
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallAppPage;

// src/utils/install.js

export function isStandaloneMode() {
    return window.matchMedia('(display-mode: standalone)').matches;
  }
  
  export function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }
  
  export function isAndroid() {
    return /Android/.test(navigator.userAgent);
  }
  
  let deferredPrompt = null;

  export function setupInstallPromptListener(onPromptAvailable) {
    const handler = (e) => {
      console.log('[PWA] beforeinstallprompt fired (global handler)');
      e.preventDefault();
      deferredPrompt = e; // 🔥 WICHTIG: hier speichern!
      onPromptAvailable(e);
    };
  
    window.addEventListener('beforeinstallprompt', handler);
  
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }
  
  export function getInstallPromptEvent() {
    return deferredPrompt;
  }
  
  
// utils/analytics.js
export const initializeAnalytics = () => {
    if (!window.gtag) {
      // Google Analytics laden (GA4)
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`; // <-- Deine GA-ID
      script.async = true;
      document.head.appendChild(script);
  
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX'); // <-- Gleiche GA-ID
    }
  };
  
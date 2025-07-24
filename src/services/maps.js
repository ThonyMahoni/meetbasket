// src/services/maps.js

let isScriptLoading = false;
let scriptLoadPromise = null;

export const loadGoogleMapsAPI = () => {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (isScriptLoading && scriptLoadPromise) {
    return scriptLoadPromise;
  }

  isScriptLoading = true;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error('❌ Google Maps API-Schlüssel fehlt in .env'));
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('❌ Fehler beim Laden der Google Maps API'));

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
};

/**
 * Adresse in Koordinaten umwandeln
 */
export const geocodeAddress = (address) => {
  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK') {
        const location = results[0].geometry.location;
        resolve({ lat: location.lat(), lng: location.lng() });
      } else {
        reject(new Error(`Geocoding fehlgeschlagen: ${status}`));
      }
    });
  });
};

/**
 * Koordinaten in Adresse umwandeln
 */
export const reverseGeocode = (lat, lng) => {
  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = new window.google.maps.LatLng(lat, lng);
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        resolve(results[0].formatted_address);
      } else {
        reject(new Error(`Reverse Geocoding fehlgeschlagen: ${status}`));
      }
    });
  });
};




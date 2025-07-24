import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the location context
const LocationContext = createContext();

// Location provider component
export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  // Initialize location on component mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Check if geolocation permission is granted
  const checkLocationPermission = () => {
    if ('geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setLocationPermissionGranted(true);
          getUserLocation();
        } else if (result.state === 'prompt') {
          setLocationPermissionGranted(false);
          setLocationLoading(false);
        } else {
          setLocationPermissionGranted(false);
          setLocationLoading(false);
          setLocationError('Location permission denied');
        }
      });
    } else {
      setLocationError('Geolocation not supported by your browser');
      setLocationLoading(false);
    }
  };

  // Get user's current location
  const getUserLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setLocationLoading(false);
        setLocationPermissionGranted(true);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError(`Error getting location: ${error.message}`);
        setLocationLoading(false);
        setLocationPermissionGranted(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
  if (!locationPermissionGranted) {
    requestLocationPermission();
  } else if (locationPermissionGranted && !userLocation) {
    // Wenn Erlaubnis da ist, aber Location noch nicht gesetzt, holen wir sie
    getUserLocation();
  }
}, [locationPermissionGranted]);


  // Request location permission
  const requestLocationPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setLocationPermissionGranted(true);
          setLocationLoading(false);
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError(`Location permission denied: ${error.message}`);
          setLocationLoading(false);
          setLocationPermissionGranted(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError('Geolocation not supported by your browser');
      setLocationLoading(false);
    }
  };
  

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    // Haversine formula to calculate distance between two points
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  // Find nearby locations
  const findNearbyLocations = (locations, radius = 5) => {
    if (!userLocation || !locations || !Array.isArray(locations)) return [];

    return locations.filter((location) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        location.latitude || location.location?.latitude,
        location.longitude || location.location?.longitude
      );
      return distance !== null && distance <= radius;
    });
  };

  // Value to be provided to consuming components
  const value = {
    userLocation,
    locationPermissionGranted,
    locationLoading,
    locationError,
    setUserLocation,
    requestLocationPermission,
    calculateDistance,
    findNearbyLocations,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

// Custom hook to use the location context
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;
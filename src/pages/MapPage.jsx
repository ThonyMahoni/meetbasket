import React, { useState, useEffect } from 'react';
import { useLocation } from '../contexts/LocationContext';
import { loadGoogleMapsAPI } from '../services/maps';
import { useNavigate } from 'react-router-dom';
//import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { useAuth } from '../contexts/AuthContext'; // 👈 Auth importieren
import { useRef } from 'react'; // 👈 Ergänzen


const MapPage = () => {
  const navigate = useNavigate();
  const { userLocation, locationPermissionGranted, requestLocationPermission } = useLocation();
  const { user } = useAuth(); // 👈 Auth-Kontext verwenden
  const mapRef = useRef(null);    // 👈 Direkt innerhalb von MapPage definieren

  const [courts, setCourts] = useState([]);
  const [players, setPlayers] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [mapsReady, setMapsReady] = useState(false);

  const [selectedCourt, setSelectedCourt] = useState(null);
  const [showAddCourtModal, setShowAddCourtModal] = React.useState(false);
  const [filterOptions, setFilterOptions] = useState({
    radius: 5,
    hasLights: false,
    isIndoor: false,
    isFree: false,
  });

   
  
  // Hole Standort, Court- und Spieler-Daten
  useEffect(() => {
    const initialize = async () => {
      try {
        await loadGoogleMapsAPI(); // Warte, bis die Google Maps API geladen ist
        
        // ⚠️ setMapsReady NICHT direkt hier setzen
  
        if (!locationPermissionGranted) {
          await requestLocationPermission();
        }
  
        await fetchCourtData();
        await fetchPlayerData();
  
        // ✅ setMapsReady ganz am Ende setzen, wenn alles bereit
        setMapsReady(true);
  
      } catch (err) {
        console.error('Initialisierungsfehler:', err);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);
  
  
  

  // Initialisiere Karte
  useEffect(() => {
    if (mapsReady && userLocation && mapRef.current && !map) {
      
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        },
        zoom: 13,
        mapTypeId: 'roadmap',
      });
  
      new window.google.maps.Marker({
        map: googleMap,
        position: {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        },
        title: 'Dein Standort',
        icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      });
  
      setMap(googleMap);
    }
  }, [mapsReady, userLocation, mapRef, map]);
  

  // Marker setzen bei Änderungen
  useEffect(() => {
    if (map && courts.length > 0) {
      updateMarkers();
    }
  }, [map, courts, players, filterOptions]);

  const handleCourtImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courts/upload`, {
        method: 'POST',
        body: formData,
      });
  
      if (!res.ok) throw new Error('Upload fehlgeschlagen');
      const data = await res.json();
      return data.imageUrl; // z. B. /uploads/courts/abc123.jpg
    } catch (err) {
      console.error('Bild-Upload fehlgeschlagen:', err);
      alert('Fehler beim Hochladen des Court-Bilds');
      return null;
    }
  };
  

  const fetchCourtData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courts`);
      if (!res.ok) throw new Error('Court API fehlgeschlagen');
      const result = await res.json();
     
      const data = result.courts;
  
      const courtsWithLocation = await Promise.all(
        data.map(async (court) => {
          const fullAddress = `${court.address}, ${court.city}`;
          const location = await geocodeAddress(fullAddress);
          return location
            ? {
                ...court,
                location,
                hasLights: court.hasLights === true || court.hasLights === 'true' || court.hasLights === 1,
                isIndoor: court.isIndoor === true || court.isIndoor === 'true' || court.isIndoor === 1,
                isFree: court.isFree === true || court.isFree === 'true' || court.isFree === 1,

              }
            : null;
        })
      );
  
      setCourts(courtsWithLocation.filter(Boolean));
    } catch (err) {
      console.error(err);
    }
  };
  
  

  const fetchPlayerData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/players`);
      if (!res.ok) throw new Error('Player API fehlgeschlagen');
      const result = await res.json();
      const data = result.players; // 👈 Zugriff auf das eigentliche Array
      setPlayers(data);
    } catch (err) {
      console.error(err);
    }
  };
  

  

  const updateMarkers = () => {
    markers.forEach(m => m.setMap(null));
    const newMarkers = [];
    const infoWindow = new window.google.maps.InfoWindow();
  
    const filteredCourts = courts.filter(court => {
      if (!court?.location) return false;
      const dist = getDistance(
        userLocation.latitude,
        userLocation.longitude,
        court.location.latitude,
        court.location.longitude
      );
  
      if (dist > filterOptions.radius) return false;
      if (filterOptions.hasLights && !court.hasLights) return false;
      if (filterOptions.isIndoor && !court.isIndoor) return false;
      if (filterOptions.isFree && !court.isFree) return false;
  
      return true;
    });
  
    // Courts Marker mit Bild im InfoWindow
    filteredCourts.forEach(court => {
      const marker = new window.google.maps.Marker({
        map,
        position: {
          lat: court.location.latitude,
          lng: court.location.longitude,
        },
        title: court.name,
        icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      });
  
      marker.addListener('click', () => {
        const imageHTML = court.image
          ? `<img src="${court.image}" alt="Court" style="width:100%;max-width:200px;margin-top:5px;border-radius:8px;" />`
          : '';
  
        infoWindow.setContent(`
          <div style="max-width: 250px;">
            <strong>${court.name}</strong><br/>
            <b>Adresse:</b> ${court.address}<br/>
           
            ${imageHTML}
          </div>
        `);
        infoWindow.open(map, marker);
      });
  
      newMarkers.push(marker);
    });
  
    // Player Marker mit Bild im InfoWindow
    players.forEach(player => {
      if (!player.location) return;
  
      const marker = new window.google.maps.Marker({
        map,
        position: {
          lat: player.location.latitude,
          lng: player.location.longitude,
        },
        title: player.username || player.name,
        icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      });
  
      marker.addListener('click', () => {
        const avatar = player.profile?.avatar || player.image;
        const imageHTML = avatar
          ? `<img src="${avatar}" alt="Avatar" style="width:60px;height:60px;border-radius:50%;margin-top:5px;" />`
          : '';
  
        infoWindow.setContent(`
          <div style="text-align:center;max-width:200px;">
            ${imageHTML}
            <div><strong>${player.username || player.name}</strong></div>
          </div>
        `);
        infoWindow.open(map, marker);
      });
  
      newMarkers.push(marker);
    });
  
    setMarkers(newMarkers);
  };
  


  

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = deg => deg * (Math.PI / 180);

  const handleFilterChange = e => {
    const { name, value, type, checked } = e.target;
    setFilterOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value),
    }));
  };

  const geocodeAddress = async (address) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            latitude: location.lat(),
            longitude: location.lng(),
          });
        } else {
          console.error(`Geocoding fehlgeschlagen für ${address}: ${status}`);
          resolve(null); // Gib null zurück, statt reject
        }
      });
    });
  };

  const handleCheckIn = async (courtId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courts/${courtId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Check-in fehlgeschlagen');
      alert('Check-in erfolgreich!');
    } catch (error) {
      console.error(error);
      alert('Fehler beim Check-in.');
    }
  };
  
  const handleCreateGame = (courtId) => {
    navigate(`/games/create?courtId=${courtId}`);
  };
  

  //Funktion Implementieren damit neues Court hinzugefügt werden kann
  const submitNewCourt = async () => {
    const location = {
      latitude: newCourtData.latitude,
      longitude: newCourtData.longitude,
    };
  
    if (!location.latitude || !location.longitude) {
      alert("Standortinformationen fehlen.");
      return;
    }
  
    let imageUrl = null;
  
    // 🖼 Bild hochladen (nur wenn es existiert und noch nicht hochgeladen ist)
    if (newCourtData.image && typeof newCourtData.image !== 'string') {
      try {
        imageUrl = await handleCourtImageUpload(newCourtData.image);
      } catch (err) {
        console.error("Bild konnte nicht hochgeladen werden:", err);
        alert("Fehler beim Hochladen des Bildes.");
      }
    } else if (typeof newCourtData.image === 'string') {
      imageUrl = newCourtData.image; // Falls es bereits eine URL ist
    }
  
    const courtToAdd = {
      name: newCourtData.name,
      address: newCourtData.address,
      city: '', // ggf. später durch Reverse-Geocoding ersetzen
      latitude: newCourtData.latitude,
      longitude: newCourtData.longitude,
      hasLights: newCourtData.hasLights,
      isIndoor: newCourtData.isIndoor,
      isFree: newCourtData.isFree,
      image: imageUrl || null,
    };
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courtToAdd),
      });
  
      if (!response.ok) throw new Error("Speichern fehlgeschlagen");
  
      const savedCourt = await response.json();
      const courtWithLocation = {
        ...savedCourt,
        location: {
          latitude: savedCourt.latitude,
          longitude: savedCourt.longitude,
        },
        hasLights: savedCourt.hasLights === true || savedCourt.hasLights === "true" || savedCourt.hasLights === 1,
        isIndoor: savedCourt.isIndoor === true || savedCourt.isIndoor === "true" || savedCourt.isIndoor === 1,
        isFree: savedCourt.isFree === true || savedCourt.isFree === "true" || savedCourt.isFree === 1,
      };
  
      setCourts(prev => [...prev, courtWithLocation]);
      setShowAddCourtModal(false);
      setNewCourtData({
        name: "",
        address: "",
        hasLights: false,
        isIndoor: false,
        isFree: true,
        latitude: null,
        longitude: null,
        image: null
      });
    } catch (error) {
      alert("Fehler beim Speichern: " + error.message);
      console.error("Serverfehler:", error);
    }
  };
  
  
  
  

  const [newCourtData, setNewCourtData] = React.useState({
    name: '',
    address: '',
    hasLights: false,
    isIndoor: false,
    isFree: true,
    longitude: null,
    image: null     
  });

  const handleAddNewCourt = () => {
    const isPremium =
      user?.isPremium === true ||
      user?.isPremium === "true" ||
      user?.isPremium === 1 ||
      user?.isPremium === "1";
  
    if (!isPremium) {
      alert('Nur Premium-Mitglieder können neue Plätze eintragen.');
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
  
        const geocoder = new window.google.maps.Geocoder();
  
        geocoder.geocode(
          { location: { lat: latitude, lng: longitude } },
          (results, status) => {
            let address = "Standort ermittelt"; // fallback
  
            if (status === "OK" && results?.length > 0) {
              address = results[0].formatted_address;
            } else {
              console.warn("Reverse-Geocoding fehlgeschlagen:", status);
              console.warn("Koordinaten:", latitude, longitude);
            }
  
            setNewCourtData({
              name: '',
              address,
              hasLights: false,
              isIndoor: false,
              isFree: true,
              latitude,
              longitude
            });
  
            console.log('Adresse nach Reverse-Geocoding:', address);
            setShowAddCourtModal(true);
          }
        );
      },
      (error) => {
        console.error('Fehler beim Standortzugriff:', error);
        alert('Standort konnte nicht ermittelt werden.');
      }
    );
  };
  
  
  
  

  

  return (
    <div className="h-full">
      <div className="flex flex-col md:flex-row h-[calc(100vh-150px)]">
        <div className="w-full md:w-1/4 p-4 bg-white rounded-lg shadow-md mb-4 md:mb-0 md:mr-4">
          <h2 className="text-xl font-bold mb-4">Finde Basketballplätze in deiner Nähe</h2>

          {!locationPermissionGranted && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
              Standortdienste sind erforderlich, um Courts in der Nähe zu finden.
              </p>
              <button
                onClick={requestLocationPermission}
                className="mt-2 w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md text-sm"
              >
                Standort aktivieren
              </button>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distanz (km)
            </label>
            <input
              type="range"
              name="radius"
              min="1"
              max="100"
              value={filterOptions.radius}
              onChange={handleFilterChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 km</span>
              <span>{filterOptions.radius} km</span>
              <span>100 km</span>
            </div>
          </div>

          {['hasLights', 'isIndoor', 'isFree'].map(option => (
            <div key={option} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={option}
                name={option}
                checked={filterOptions[option]}
                onChange={handleFilterChange}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor={option} className="ml-2 text-sm text-gray-700">
                {option === 'hasLights'
                  ? 'Beleuchtet'
                  : option === 'isIndoor'
                  ? 'Sporthalle'
                  : 'Freiplatz'}
              </label>
            </div>
          ))}
          {showAddCourtModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white p-6 rounded shadow-lg w-96 max-w-full">
    <h3 className="text-lg font-bold mb-4">Neuen Court hinzufügen</h3>

    <label className="block mb-2">
      Name
      <input
        type="text"
        value={newCourtData.name}
        onChange={e => setNewCourtData(prev => ({ ...prev, name: e.target.value }))}
        className="w-full border border-gray-300 rounded p-2 mt-1"
      />
    </label>

    <label className="block mb-2">
      Adresse
      <input
        type="text"
        value={newCourtData.address || ''}
        onChange={e => setNewCourtData(prev => ({ ...prev, address: e.target.value }))}
        className="w-full border border-gray-300 rounded p-2 mt-1"
      />
    </label>

    <div className="mb-4">
      {['hasLights', 'isIndoor', 'isFree'].map(option => (
        <label key={option} className="flex items-center space-x-2 mb-1">
          <input
            type="checkbox"
            checked={newCourtData[option]}
            onChange={e => setNewCourtData(prev => ({ ...prev, [option]: e.target.checked }))}
          />
          <span>
            {option === 'hasLights' ? 'Beleuchtung vorhanden' : option === 'isIndoor' ? 'Halle' : 'Freiplatz'}
          </span>
        </label>
      ))}
    </div>

    {/* Image Upload */}
<div className="mb-4">
  <label className="block mb-1 font-medium">Platzbild (optional)</label>
  <input
    type="file"
    accept="image/*"
    onChange={e => {
      const file = e.target.files[0];
      if (file) {
        setNewCourtData(prev => ({ ...prev, image: file }));
        setPreviewImage(URL.createObjectURL(file)); // 🧠 Vorschau-URL setzen
      }
    }}
    className="block w-full"
  />
  <div className="mt-2">
    <img
      src={previewImage || '/public/icons/basketball-plaetze.png'} // ⚠️ Base64 ersetzt durch URL.createObjectURL
      alt="Court preview"
      className="w-full h-48 object-cover rounded border"
    />
  </div>
</div>


    <div className="flex justify-end space-x-2">
      <button
        onClick={() => setShowAddCourtModal(false)}
        className="px-4 py-2 border rounded hover:bg-gray-100"
      >
        Abbrechen
      </button>
      <button
        onClick={submitNewCourt}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={!newCourtData.name || newCourtData.address === 'Unbekannte Adresse'}
      >
        Speichern
      </button>
    </div>
  </div>
</div>

)}


          <button
            onClick={fetchCourtData}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md my-2"
          >
            Platz suchen
          </button>

          <button
            onClick={handleAddNewCourt}
            className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 rounded-md"
          >
           Neuen Court hinzufügen
          </button>
        </div>

        {/* Map & Court Details */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 rounded-lg">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-3 text-gray-700">Loading courts...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Map Container */}
            <div ref={mapRef} id="map" className="h-full rounded-lg shadow-md"></div>

              

              {/* Court Detail Popup */}

              {selectedCourt && (

                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-md">

                  <div className="flex justify-between items-start">

                  {selectedCourt.image?.trim() ? (
      <img
        src={selectedCourt.image}
        alt={`${selectedCourt.name} Bild`}
        className="w-full h-48 object-cover rounded mb-3"
      />
    ) : (
      <img
        src="/fallback-court.jpg"
        alt="Standard Court Bild"
        className="w-full h-48 object-cover rounded mb-3"
      />
    )}

    <div className="flex justify-between items-start">
      <h3 className="text-lg font-bold">{selectedCourt.name}</h3>
      <button
        onClick={() => setSelectedCourt(null)}
        className="text-gray-500 hover:text-gray-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>

                    <h3 className="text-lg font-bold">{selectedCourt.name}</h3>

                    <button 

                      onClick={() => setSelectedCourt(null)}

                      className="text-gray-500 hover:text-gray-700"

                    >

                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">

                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />

                      </svg>

                    </button>

                  </div>

                  

                  <p className="text-gray-600 text-sm mt-1">{selectedCourt.description}</p>

                  

                  <div className="mt-3 flex items-center">

                    <div className="flex items-center">

                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">

                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />

                      </svg>

                      <span className="ml-1 text-sm font-medium">{selectedCourt.averageRating}</span>

                    </div>

                    <span className="mx-2 text-gray-300">|</span>

                    <div className="flex items-center">

                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">

                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />

                      </svg>

                      <span className="ml-1 text-sm">{selectedCourt.checkinCount} check-ins</span>

                    </div>

                  </div>

                  

                  <div className="mt-3">

                    <div className="flex flex-wrap gap-2">

                      {selectedCourt.amenities.map((amenity, index) => (

                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">

                          {amenity}

                        </span>

                      ))}

                    </div>

                  </div>

                  

                  <div className="mt-4 flex space-x-2">
      <button 
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition text-sm"
        onClick={() => handleCheckIn(selectedCourt.id)}
      >
        Check In
      </button>
      <button 
        className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 rounded-md transition text-sm"
        onClick={() => handleCreateGame(selectedCourt.id)}
      >
        Create Game
      </button>

                  </div>

                </div>

              )}

            </>
          )}
        </div>
      </div>
    </div>

    
  );
};

export default MapPage;
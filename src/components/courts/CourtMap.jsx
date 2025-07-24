import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { calculateDistance } from '../../utils/mapUtils';
import { useGeolocation } from '../../hooks/useGeolocation';

const CourtMap = () => {
  const [courts, setCourts] = useState([]);
  const [filteredCourts, setFilteredCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapView, setMapView] = useState(true);
  const [filterDistance, setFilterDistance] = useState(5); // 5km default
  const [filters, setFilters] = useState({
    outdoor: false,
    indoor: false,
    lighted: false,
    free: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { position, error: geoError } = useGeolocation();


  useEffect(() => {
    const loadCourts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/courts'); // ✅ Pfad an dein System anpassen
        if (!res.ok) throw new Error('Court-Daten konnten nicht geladen werden');
        const data = await res.json();
  
        setCourts(data);
        setFilteredCourts(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    loadCourts();
  
    return () => {
      if (markersRef.current.length) {
        markersRef.current = [];
      }
    };
  }, []);
  

  // Initialize map when component mounts
  useEffect(() => {
    useEffect(() => {
      if (!position || !mapRef.current || courts.length === 0) return;
    
      const courtsWithDistance = courts.map(court => ({
        ...court,
        distance: calculateDistance(
          position.latitude, 
          position.longitude, 
          court.location.lat, 
          court.location.lng
        )
      }));
    
      setCourts(courtsWithDistance); // Optional – nur nötig wenn distance gespeichert werden soll
      filterCourts(courtsWithDistance);
    
    }, [position, filters, filterDistance, courts]);
    
    
    // Cleanup function
    return () => {
      if (markersRef.current.length) {
        // Clean up any markers
        markersRef.current = [];
      }
    };
  }, []);

  // Update markers when position or filtered courts change
  useEffect(() => {
    if (!position || !mapRef.current) return;
    
    // In a real app with Google Maps:
    // 1. We would clear previous markers
    // 2. Add new markers for each filtered court
    // 3. Center map on user's position
    // 4. Update distances based on position

    // For mock purposes:
    const courtsWithDistance = mockCourts.map(court => ({
      ...court,
      distance: calculateDistance(
        position.latitude, 
        position.longitude, 
        court.location.lat, 
        court.location.lng
      )
    }));
    
    setCourts(courtsWithDistance);
    
    // Apply filters
    filterCourts(courtsWithDistance);
    
  }, [position, filters, filterDistance]);
  
  const filterCourts = (courtsToFilter = courts) => {
    let filtered = [...courtsToFilter];
    
    // Filter by distance
    if (position) {
      filtered = filtered.filter(court => court.distance <= filterDistance);
    }
    
    // Apply feature filters
    if (filters.outdoor) filtered = filtered.filter(court => court.features.outdoor);
    if (filters.indoor) filtered = filtered.filter(court => court.features.indoor);
    if (filters.lighted) filtered = filtered.filter(court => court.features.lighted);
    if (filters.free) filtered = filtered.filter(court => court.features.free);
    
    setFilteredCourts(filtered);
  };

  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handleCourtSelect = (courtId) => {
    navigate(`/courts/${courtId}`);
  };

  // Render stars for ratings
  const renderRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg 
          key={i}
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-500' : 'text-gray-300'}`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="mb-16">
      {/* Top controls */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Basketball Courts</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filter
          </button>
          <button 
            onClick={() => setMapView(!mapView)} 
            className="flex items-center px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            {mapView ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                List
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                </svg>
                Map
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <h3 className="font-bold mb-3">Filters</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Distance: {filterDistance} km
            </label>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={filterDistance}
              onChange={(e) => setFilterDistance(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1km</span>
              <span>5km</span>
              <span>10km</span>
              <span>20km</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="outdoor"
                checked={filters.outdoor}
                onChange={() => handleFilterChange('outdoor')}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="outdoor" className="ml-2 text-sm text-gray-700">Outdoor</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="indoor"
                checked={filters.indoor}
                onChange={() => handleFilterChange('indoor')}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="indoor" className="ml-2 text-sm text-gray-700">Indoor</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="lighted"
                checked={filters.lighted}
                onChange={() => handleFilterChange('lighted')}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="lighted" className="ml-2 text-sm text-gray-700">Lighted</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="free"
                checked={filters.free}
                onChange={() => handleFilterChange('free')}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="free" className="ml-2 text-sm text-gray-700">Free</label>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {(error || geoError) && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error || "Location services are disabled. Some features might not work properly."}
        </div>
      )}

      {/* Court display - Map or List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {mapView ? (
            <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden mb-4">
              {/* Map placeholder - in a real app, this would be a Google Maps component */}
              <div className="absolute inset-0 bg-blue-50" ref={mapRef}>
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-4">
                    <p className="mb-2">Map View</p>
                    <p className="text-sm text-gray-500">In a real app, this would display an interactive map with court markers.</p>
                    <p className="text-sm mt-2">Found {filteredCourts.length} courts within {filterDistance}km</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Courts list */}
          <div className={mapView ? "mt-4" : ""}>
            {filteredCourts.length > 0 ? (
              <div className="space-y-4">
                {filteredCourts.map(court => (
                  <div 
                    key={court.id}
                    onClick={() => handleCourtSelect(court.id)}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
                  >
                    <div className="md:flex">
                      <div className="md:w-1/3 h-48 overflow-hidden">
                        <img 
                          src={court.photos[0]} 
                          alt={court.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-4">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-bold">{court.name}</h3>
                          <div className="flex items-center">
                            {renderRating(court.rating)}
                            <span className="text-sm text-gray-500 ml-1">({court.numRatings})</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2">{court.address}</p>
                        
                        {court.distance && (
                          <p className="text-blue-600 font-semibold text-sm mb-2">
                            {court.distance.toFixed(1)} km away
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {court.features.outdoor && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Outdoor</span>
                          )}
                          {court.features.indoor && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Indoor</span>
                          )}
                          {court.features.lighted && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Lighted</span>
                          )}
                          {court.features.free && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Free</span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-sm font-semibold mb-1">
                              {court.activeUsers > 0 
                                ? `${court.activeUsers} players active now` 
                                : 'No active players'}
                            </p>
                            {court.activePlayers.length > 0 && (
                              <div className="flex -space-x-2">
                                {court.activePlayers.slice(0, 3).map(player => (
                                  <div key={player.id} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                                    <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                                {court.activePlayers.length > 3 && (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold">
                                    +{court.activePlayers.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-700 mb-2">No courts found</h3>
                <p className="text-gray-500">Try adjusting your filters or increasing the distance range</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Bottom navigation for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 md:hidden">
        <div className="flex justify-around">
          <button 
            onClick={() => setMapView(true)} 
            className={`flex flex-col items-center px-4 py-2 ${mapView ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-xs mt-1">Map</span>
          </button>
          <button 
            onClick={() => setMapView(false)} 
            className={`flex flex-col items-center px-4 py-2 ${!mapView ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="text-xs mt-1">List</span>
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`flex flex-col items-center px-4 py-2 ${showFilters ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-xs mt-1">Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourtMap;
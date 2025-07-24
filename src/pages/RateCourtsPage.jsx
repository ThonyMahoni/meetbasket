import React, { useState, useEffect } from 'react';
import { useLocation } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://meetbasket.com'; // API Basis-URL anpassen

const RateCourtsPage = () => {
    const { user } = useAuth();  // user.id ist userId
    const userId = user?.id;
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
const [courtReviews, setCourtReviews] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    sortBy: 'rating', 
    filterBy: 'all' 
  });
  const [reviewText, setReviewText] = useState('');

  const { userLocation } = useLocation();

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };
  

  // Fetch courts data von Backend API
  useEffect(() => {
    const fetchCourts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/courts`);
        if (!response.ok) throw new Error('Fehler beim Laden der Courts');
        const data = await response.json();
  
        let courtsData = data.courts || [];
  
        if (userLocation?.latitude && userLocation?.longitude) {
          courtsData = courtsData.map(court => {
            if (court.latitude && court.longitude) {
              const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                court.latitude,
                court.longitude
              );
              return { ...court, distance };
            }
            return court;
          });
        }
  
        setCourts(courtsData);
  
        // Initialisiere userRatings mit gespeicherten Bewertungen
        // Falls in deinem Backend keine info, wer bewertet hat, dann evtl. nur Durchschnitt anzeigen
        // Beispiel: court.userRating - musst du vom Backend ausliefern, falls möglich
        const initialRatings = {};
        courtsData.forEach(court => {
          // Beispiel, wenn court.userRating vom Backend kommt
          if (court.userRating) {
            initialRatings[court.id] = court.userRating;
          }
        });
        setUserRatings(initialRatings);
  
      } catch (error) {
        console.error(error);
        setCourts([]);
      }
      setLoading(false);
    };
  
    fetchCourts();
  }, [userLocation]);
  

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Erdradius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  const fetchReviews = async (courtId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courts/${courtId}/reviews`);
      if (!res.ok) throw new Error('Fehler beim Laden der Reviews');
      const data = await res.json();
      setCourtReviews(data.reviews || []);
      setShowReviewModal(true);
    } catch (error) {
      console.error(error);
    }
  };
  

  const handleRatingChange = async (courtId, rating) => {
    if (!userId) {
      alert('Du musst eingeloggt sein, um zu bewerten.');
      return;
    }
  
    try {
      const res = await fetch(`${API_BASE_URL}/api/courts/${courtId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, userId }),
      });
  
      if (!res.ok) throw new Error('Bewertung konnte nicht gespeichert werden');
  
      const updatedData = await res.json();
  
      // ⭐️ Benutzer-Rating speichern, damit Sterne bleiben
      setUserRatings(prev => ({
        ...prev,
        [courtId]: rating
      }));
  
      // Optional: Court-Daten aktualisieren (z. B. Durchschnitt)
      setCourts(prevCourts =>
        prevCourts.map(court =>
          court.id === courtId
            ? {
                ...court,
                averageRating: updatedData.averageRating,
                checkinCount: updatedData.checkinCount,
              }
            : court
        )
      );
    } catch (error) {
      console.error(error);
      alert('Fehler beim Speichern der Bewertung');
    }
  };
  
  
  
  
  const handleSubmitReview = async (courtId, reviewText) => {
    const rating = court.userRating || 0;

  
    try {
      const res = await fetch(`${API_BASE_URL}/api/courts/${courtId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, reviewText }),
      });
      if (!res.ok) throw new Error('Review konnte nicht gespeichert werden');
      // Optional: Feedback an Nutzer
    } catch (error) {
      console.error(error);
    }
  
    setSelectedCourt(null);
    setReviewText('');
  };
  

  const handleSortChange = (e) => {
    const { value } = e.target;
    setFilterOptions(prev => ({ ...prev, sortBy: value }));
  };

  const handleFilterChange = (e) => {
    const { value } = e.target;
    setFilterOptions(prev => ({ ...prev, filterBy: value }));
  };

  const getSortedAndFilteredCourts = () => {
    let filteredCourts = [...courts];

    // Filter anwenden
    if (filterOptions.filterBy === 'rated') {
      filteredCourts = filteredCourts.filter(court => court.userHasRated);
    } else if (filterOptions.filterBy === 'notRated') {
      filteredCourts = filteredCourts.filter(court => !court.userHasRated);
    }

    // Sortierung
    if (filterOptions.sortBy === 'rating') {
      filteredCourts.sort((a, b) => b.averageRating - a.averageRating);
    } else if (filterOptions.sortBy === 'distance') {
      filteredCourts.sort((a, b) => a.distance - b.distance);
    } else if (filterOptions.sortBy === 'name') {
      filteredCourts.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filteredCourts;
  };

  useEffect(() => {
    const fetchUserRatings = async () => {
        const res = await fetch(`${API_BASE_URL}/api/courts/user-ratings?userId=${userId}`);
        const data = await res.json();
        const ratingsMap = {};
        data.forEach(r => {
          ratingsMap[r.courtId] = r.rating;
        });
        setUserRatings(ratingsMap);
      };
      
  
    if (userId) {
      fetchUserRatings();
    }
  }, [userId]);

  
  const renderStars = (courtId, interactive = true) => {
    const rating = userRatings[courtId] || 0;
    const maxRating = 5;
  
    return (
      <div className="flex">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          return (
            <button
              key={index}
              type="button"
              onClick={() => interactive && handleRatingChange(courtId, starValue)}
              className={`${interactive ? 'cursor-pointer' : 'cursor-default'} text-2xl focus:outline-none`}
              disabled={!interactive}
            >
              {starValue <= rating ? (
                <span className="text-yellow-500">★</span>
              ) : (
                <span className="text-gray-300">★</span>
              )}
            </button>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Bewerte Basketball Courts</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <p className="text-gray-600 mb-4 md:mb-0">
          Bewerte und rezensiere Basketballplätze in deiner Umgebung. Dein Feedback hilft anderen Spielern, die besten Orte zum Spielen zu finden.          </p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <select
              value={filterOptions.sortBy}
              onChange={handleSortChange}
              className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating">Sortiert nach Bewertung</option>
              <option value="distance">Sortiert nach Entfernung</option>
              <option value="name">Sortiert nach Name</option>
            </select>
            <select
              value={filterOptions.filterBy}
              onChange={handleFilterChange}
              className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Courts</option>
              <option value="rated">Bewertet von mir</option>
              <option value="notRated">Nicht bewertet</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getSortedAndFilteredCourts().map(court => (
            <div key={court.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                {/* Court-Bild anzeigen, erstes Bild aus imageUrls oder Platzhalter */}
                {court.image ? (
  <img
    src={court.image}
    alt={court.name}
    className="object-cover w-full h-40"
  />
) : (
  <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-500">
    Kein Bild verfügbar
  </div>
)}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-800">{court.name}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {typeof court.distance === 'number'
  ? `${(court.distance * 1000).toFixed(1)} km`
  : '–'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-2">{court.description}</p>
                
                <div className="mt-4">
                <div className="flex items-center">
  <div className="text-yellow-500 mr-1">★</div>
  <span className="font-semibold">{court.averageRating.toFixed(1)}</span>
  <button
    onClick={() => fetchReviews(court.id)}
    className="text-gray-500 text-sm ml-1 underline hover:text-blue-600"
  >
    ({court.reviewCount} reviews)
  </button>
</div>

                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {court.amenities && court.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {amenity}
                      </span>
                    ))}
                    {court.amenities && court.amenities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{court.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Deine Bewertung</h3>
                  {renderStars(court.id)}
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setSelectedCourt(court);
                      setReviewText(''); // Review-Textarea leeren beim Öffnen
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
                  >
                    Schreibe eine Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedCourt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-800">Bewertung {selectedCourt.name}</h2>
                <button 
                  onClick={() => setSelectedCourt(null)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close review modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Dein Rating</h3>
                {renderStars(selectedCourt.id)}
              </div>
              
              <div className="mt-4">
                <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                  Dein Review
                </label>
                <textarea
                  id="review"
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Tell others about your experience at this court..."
                ></textarea>
              </div>
              
              <div className="mt-6 flex space-x-2">
                <button
                  onClick={() => handleSubmitReview(selectedCourt.id, reviewText)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
                >
                  Bewertung einreichen
                </button>
                <button
                  onClick={() => setSelectedCourt(null)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-md transition"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showReviewModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Bewertungen</h2>
      {courtReviews.length > 0 ? (
        courtReviews.map((review, index) => (
          <div key={index} className="border-b border-gray-200 pb-3 mb-3">
            <div className="text-yellow-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
            <p className="text-gray-700 mt-1">{review.comment}</p>
            <p className="text-gray-400 text-xs">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500">Noch keine Reviews vorhanden.</p>
      )}
      <button
        onClick={() => setShowReviewModal(false)}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Schließen
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default RateCourtsPage;

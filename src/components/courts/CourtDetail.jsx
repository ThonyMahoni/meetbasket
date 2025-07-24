import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';



const CourtDetail = () => {
  const { courtId } = useParams();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showOrganizeGameModal, setShowOrganizeGameModal] = useState(false);
  const { currentUser, isPremium } = useAuth();
  const navigate = useNavigate();

  const [organizeForm, setOrganizeForm] = useState({
    type: '3v3',
    dateTime: '',
    maxPlayers: 10,
    description: ''
  });

  const handleOrganizeCourtGame = async () => {
    if (!currentUser,isPremium ) {
      navigate('/login');
      return;
    }
  
    const { type, dateTime, maxPlayers, description } = organizeForm;
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: type,
          date: dateTime.split('T')[0],
          time: dateTime.split('T')[1],
          courtId: court.id,
          maxPlayers: Number(maxPlayers),
          skillLevel: 'All Levels',
          description,
          isPublic: true,
          organizerId: currentUser.id
        })
      });
  
      if (!response.ok) throw new Error('Fehler beim Erstellen des Spiels');
  
      // Optional: Spiele neu laden, falls du nicht mit Mock arbeitest
      alert('Spiel erfolgreich erstellt!');
      setShowOrganizeGameModal(false);
      setOrganizeForm({ type: '3v3', dateTime: '', maxPlayers: 10, description: '' });
  
    } catch (err) {
      console.error(err);
      alert('Etwas ist schiefgelaufen beim Erstellen des Spiels.');
    }
  };
  
  
  

  // Mock court data (in a real app this would be fetched from API)
  const mockCourt = {
    id: 1,
    name: 'Downtown Community Court',
    location: { lat: 40.7128, lng: -74.006 },
    address: '123 Main St, New York, NY',
    photos: [
      '/assets/courts/court1.jpg', 
      '/assets/courts/court1_2.jpg',
      '/assets/courts/court1_3.jpg'
    ],
    rating: 4.5,
    numRatings: 32,
    activeUsers: 8,
    features: {
      outdoor: true,
      indoor: false,
      lighted: true,
      free: true,
      toilets: false,
      parking: true,
    },
    activePlayers: [
      { id: 101, username: 'JordanFan23', avatar: '/assets/avatars/default1.png', rating: 4.3 },
      { id: 102, username: 'CourtKing', avatar: '/assets/avatars/default2.png', rating: 4.8 },
      { id: 103, username: 'StreetBaller', avatar: '/assets/avatars/default3.png', rating: 3.9 },
      { id: 104, username: 'Shooter101', avatar: '/assets/avatars/default1.png', rating: 4.1 },
      { id: 105, username: 'DunkMaster', avatar: '/assets/avatars/default2.png', rating: 4.7 },
    ],
    upcomingGames: [
      { 
        id: 201, 
        type: '3v3', 
        date: '2023-06-02T18:00:00',
        organizer: { id: 102, username: 'CourtKing', avatar: '/assets/avatars/default2.png' },
        participants: 4,
        maxParticipants: 6
      },
      { 
        id: 202, 
        type: 'Pickup', 
        date: '2023-06-03T16:30:00',
        organizer: { id: 105, username: 'DunkMaster', avatar: '/assets/avatars/default2.png' },
        participants: 8,
        maxParticipants: 10
      }
    ],
    reviews: [
      { 
        id: 301,
        user: { id: 101, username: 'JordanFan23', avatar: '/assets/avatars/default1.png' },
        rating: 5,
        comment: 'Great court, always well maintained!',
        date: '2023-05-15'
      },
      { 
        id: 302,
        user: { id: 103, username: 'StreetBaller', avatar: '/assets/avatars/default3.png' },
        rating: 4,
        comment: 'Good spot, can get crowded on weekends.',
        date: '2023-05-10'
      },
      { 
        id: 303,
        user: { id: 104, username: 'Shooter101', avatar: '/assets/avatars/default1.png' },
        rating: 4,
        comment: 'Nice rims and good surface. Lighting works well at night.',
        date: '2023-05-05'
      }
    ]
  };

  useEffect(() => {
    const fetchCourt = async () => {
      try {
        setLoading(true);
        // In a real app, we would fetch the court data from an API
        // For demo purposes, we'll use mock data
        setTimeout(() => {
          setCourt(mockCourt);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load court details');
        setLoading(false);
      }
    };

    fetchCourt();
  }, [courtId]);

  const handleCheckIn = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // In a real app, we would make an API call to check in at this court
    setIsCheckedIn(!isCheckedIn);
    
    // If checking in, add current user to active players
    if (!isCheckedIn && court) {
      const updatedCourt = { 
        ...court, 
        activeUsers: court.activeUsers + 1,
        activePlayers: [
          {
            id: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.avatar || '/assets/avatars/default1.png',
            rating: currentUser.rating || 4.0
          },
          ...court.activePlayers
        ]
      };
      setCourt(updatedCourt);
    }
    // If checking out, remove current user from active players
    else if (isCheckedIn && court) {
      const updatedCourt = { 
        ...court, 
        activeUsers: Math.max(0, court.activeUsers - 1),
        activePlayers: court.activePlayers.filter(player => player.id !== currentUser.id)
      };
      setCourt(updatedCourt);
    }
  };

  const handleStartNavigation = () => {
    // In a real app, this would open maps navigation
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${court.location.lat},${court.location.lng}`);
  };

  const handleJoinGame = (gameId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // In a real app, we would make an API call to join the game
    alert(`You have joined game ${gameId}!`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !court) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg">
        {error || "Court not found"}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mb-8">
      {/* Photo gallery */}
      <div className="relative h-80 md:h-96 overflow-hidden rounded-lg mb-4">
        <div className="absolute inset-0">
          <img 
            src={court.photos[activeImageIndex]} 
            alt={`${court.name} - photo ${activeImageIndex + 1}`} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Photo navigation arrows */}
        <div className="absolute inset-0 flex justify-between items-center p-4">
          <button 
            onClick={() => setActiveImageIndex(prev => (prev === 0 ? court.photos.length - 1 : prev - 1))}
            className="bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => setActiveImageIndex(prev => (prev === court.photos.length - 1 ? 0 : prev + 1))}
            className="bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Photo counter */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-black bg-opacity-50 rounded-full px-3 py-1 text-white text-sm">
            {activeImageIndex + 1} / {court.photos.length}
          </div>
        </div>
      </div>
      
      {/* Thumbnail row */}
      {court.photos.length > 1 && (
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {court.photos.map((photo, index) => (
            <div 
              key={index} 
              onClick={() => setActiveImageIndex(index)}
              className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden cursor-pointer ${
                activeImageIndex === index ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <img src={photo} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
      
      {/* Court info header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{court.name}</h1>
          <p className="text-gray-600">{court.address}</p>
          <div className="flex items-center mt-1">
            {renderRating(court.rating)}
            <span className="ml-2 text-gray-600">{court.rating} ({court.numRatings} ratings)</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={handleCheckIn}
            className={`px-4 py-2 rounded-md ${
              isCheckedIn 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isCheckedIn ? 'Check Out' : 'Check In'}
          </button>
          
          <button 
            onClick={() => setShowOrganizeGameModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Organize Game
          </button>
        </div>
      </div>
      
      {/* Features */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Court Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${court.features.outdoor ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
            <span>Outdoor</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${court.features.indoor ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
            <span>Indoor</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${court.features.lighted ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
            <span>Lighted</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${court.features.free ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
            <span>Free</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${court.features.toilets ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
            <span>Toilets</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${court.features.parking ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
            <span>Parking</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <button 
            onClick={handleStartNavigation}
            className="flex items-center text-blue-600 hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Get Directions
          </button>
        </div>
      </div>
      
      {/* Active players */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Active Players ({court.activeUsers})</h2>
        {court.activePlayers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {court.activePlayers.map(player => (
              <div key={player.id} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
                  <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                </div>
                <span className="font-medium">{player.username}</span>
                <div className="flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-sm text-gray-600">{player.rating}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No players currently active at this court.</p>
        )}
      </div>
      
      {/* Upcoming games */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Upcoming Games</h2>
        {court.upcomingGames.length > 0 ? (
          <div className="space-y-4">
            {court.upcomingGames.map(game => (
              <div key={game.id} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{game.type}</h3>
                  <p className="text-gray-600">{formatDate(game.date)}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                      <img src={game.organizer.avatar} alt={game.organizer.username} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm">Organized by {game.organizer.username}</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold">{game.participants}/{game.maxParticipants}</p>
                  <p className="text-xs text-gray-500">Players</p>
                  <button
                    onClick={() => handleJoinGame(game.id)}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming games at this court.</p>
        )}
        
        <button
          onClick={() => setShowOrganizeGameModal(true)}
          className="mt-4 flex items-center text-blue-600 hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Organize a Game
        </button>
      </div>
      
      {/* Reviews */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Reviews ({court.numRatings})</h2>
          <button className="text-blue-600 hover:underline">Write a Review</button>
        </div>
        
        {court.reviews.length > 0 ? (
          <div className="space-y-6">
            {court.reviews.map(review => (
              <div key={review.id} className="flex">
                <div className="mr-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img src={review.user.avatar} alt={review.user.username} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <span className="font-bold mr-2">{review.user.username}</span>
                    {renderRating(review.rating)}
                  </div>
                  <p className="text-gray-700 mb-1">{review.comment}</p>
                  <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews for this court yet.</p>
        )}
        
        {court.numRatings > 3 && (
          <button className="mt-4 text-blue-600 hover:underline">
            View All {court.numRatings} Reviews
          </button>
        )}
      </div>
      
      {/* Organize Game Modal */}
      {showOrganizeGameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Organize a Game</h2>
              <button onClick={() => setShowOrganizeGameModal(false)} className="text-gray-500 hover:text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-4">
  <div>
    <label className="block text-gray-700 mb-1" htmlFor="gameType">Game Type</label>
    <select 
      id="gameType"
      className="w-full px-3 py-2 border rounded-lg"
      value={organizeForm.type}
      onChange={(e) => setOrganizeForm(prev => ({ ...prev, type: e.target.value }))}
    >
      <option value="1v1">1v1</option>
      <option value="2v2">2v2</option>
      <option value="3v3">3v3</option>
      <option value="5v5">5v5</option>
      <option value="pickup">Pickup Game</option>
    </select>
  </div>

  <div>
    <label className="block text-gray-700 mb-1" htmlFor="gameDate">Date & Time</label>
    <input 
      type="datetime-local" 
      id="gameDate"
      className="w-full px-3 py-2 border rounded-lg"
      value={organizeForm.dateTime}
      onChange={(e) => setOrganizeForm(prev => ({ ...prev, dateTime: e.target.value }))}
      min={new Date().toISOString().slice(0, 16)}
    />
  </div>

  <div>
    <label className="block text-gray-700 mb-1" htmlFor="maxPlayers">Maximum Players</label>
    <input 
      type="number"
      id="maxPlayers"
      className="w-full px-3 py-2 border rounded-lg"
      value={organizeForm.maxPlayers}
      onChange={(e) => setOrganizeForm(prev => ({ ...prev, maxPlayers: e.target.value }))}
      min="2"
      max="30"
    />
  </div>

  <div>
    <label className="block text-gray-700 mb-1" htmlFor="gameDescription">Description (Optional)</label>
    <textarea 
      id="gameDescription"
      className="w-full px-3 py-2 border rounded-lg"
      rows="3"
      placeholder="Add any additional information about your game..."
      value={organizeForm.description}
      onChange={(e) => setOrganizeForm(prev => ({ ...prev, description: e.target.value }))}
    />
  </div>

  <div className="pt-4 flex space-x-3">
    <button 
      type="button"
      onClick={() => setShowOrganizeGameModal(false)}
      className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-100 flex-1"
    >
      Cancel
    </button>
    <button 
      type="button"
      onClick={handleOrganizeCourtGame}
      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex-1"
    >
      Create Game
    </button>
  </div>
</form>

          </div>
        </div>
      )}
    </div>
  );
};

export default CourtDetail;
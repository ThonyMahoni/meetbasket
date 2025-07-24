import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const GameOrganizer = () => {
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [gameType, setGameType] = useState('3v3');
  const [gameDate, setGameDate] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [description, setDescription] = useState('');
  const [myGames, setMyGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameDetailsVisible, setGameDetailsVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourts, setFilteredCourts] = useState([]);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Mock data for courts
  const mockCourts = [
    {
      id: 1,
      name: 'Downtown Community Court',
      address: '123 Main St, New York, NY',
      image: '/assets/courts/court1.jpg',
      rating: 4.5
    },
    {
      id: 2,
      name: 'Riverfront Park Courts',
      address: '456 River Ave, New York, NY',
      image: '/assets/courts/court2.jpg',
      rating: 3.8
    },
    {
      id: 3,
      name: 'City Rec Center',
      address: '789 Recreation Blvd, New York, NY',
      image: '/assets/courts/court3.jpg',
      rating: 4.2
    }
  ];

  // Mock data for user's created games
  const mockMyGames = [
    {
      id: 101,
      type: '3v3',
      date: '2023-06-15T18:00:00',
      court: {
        id: 1,
        name: 'Downtown Community Court'
      },
      participants: [
        { id: 201, username: 'JordanFan23', avatar: '/assets/avatars/default1.png' },
        { id: 202, username: 'CourtKing', avatar: '/assets/avatars/default2.png' },
        { id: 203, username: 'StreetBaller', avatar: '/assets/avatars/default3.png' }
      ],
      maxParticipants: 6,
      description: 'Casual 3v3 game, all skill levels welcome!'
    },
    {
      id: 102,
      type: '5v5',
      date: '2023-06-20T17:30:00',
      court: {
        id: 3,
        name: 'City Rec Center'
      },
      participants: [
        { id: 201, username: 'JordanFan23', avatar: '/assets/avatars/default1.png' },
        { id: 202, username: 'CourtKing', avatar: '/assets/avatars/default2.png' },
        { id: 204, username: 'Shooter101', avatar: '/assets/avatars/default1.png' },
        { id: 205, username: 'DunkMaster', avatar: '/assets/avatars/default2.png' },
        { id: 206, username: 'PointGuardPro', avatar: '/assets/avatars/default3.png' },
        { id: 207, username: 'FastBreak', avatar: '/assets/avatars/default1.png' },
        { id: 208, username: 'DefenseGuru', avatar: '/assets/avatars/default2.png' }
      ],
      maxParticipants: 10,
      description: 'Competitive 5v5 full court game. Looking for experienced players!'
    }
  ];

  useEffect(() => {
    // In a real app, this would fetch from an API
    setCourts(mockCourts);
    setFilteredCourts(mockCourts);
    setMyGames(mockMyGames);
    
    // Set default date (tomorrow at 18:00)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    setGameDate(tomorrow.toISOString().slice(0, 16));
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = courts.filter(court => 
        court.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        court.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourts(filtered);
    } else {
      setFilteredCourts(courts);
    }
  }, [searchQuery, courts]);

  const handleCreateGame = (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!selectedCourt) {
      setError('Please select a court');
      return;
    }
    
    if (!gameDate) {
      setError('Please select a date and time');
      return;
    }
    
    setLoading(true);
    
    // In a real app, this would make an API call to create the game
    setTimeout(() => {
      const newGame = {
        id: Date.now(),
        type: gameType,
        date: gameDate,
        court: {
          id: selectedCourt.id,
          name: selectedCourt.name
        },
        participants: [
          { id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar || '/assets/avatars/default1.png' }
        ],
        maxParticipants: maxPlayers,
        description
      };
      
      setMyGames([newGame, ...myGames]);
      
      // Reset form
      setSelectedCourt(null);
      setGameType('3v3');
      setMaxPlayers(6);
      setDescription('');
      setError('');
      setLoading(false);
      
      // Show success message
      alert('Game created successfully!');
    }, 1000);
  };

  const handleViewGame = (game) => {
    setSelectedGame(game);
    setGameDetailsVisible(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Game Organizer</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Create a Game</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleCreateGame}>
          {/* Court selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Select Court</label>
            
            <div className="mb-4">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courts..." 
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {filteredCourts.map(court => (
                <div 
                  key={court.id}
                  onClick={() => setSelectedCourt(court)}
                  className={`border rounded-lg overflow-hidden cursor-pointer ${
                    selectedCourt?.id === court.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="h-32 bg-gray-200 overflow-hidden">
                    <img 
                      src={court.image} 
                      alt={court.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between">
                      <h3 className="font-bold">{court.name}</h3>
                      <div className="flex items-center">
                        {renderRating(court.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{court.address}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredCourts.length === 0 && (
              <p className="text-gray-500 text-center py-4">No courts found matching your search.</p>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="gameType">Game Type</label>
              <select 
                id="gameType"
                value={gameType}
                onChange={(e) => setGameType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="1v1">1v1</option>
                <option value="2v2">2v2</option>
                <option value="3v3">3v3</option>
                <option value="5v5">5v5</option>
                <option value="pickup">Pickup Game</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="maxPlayers">Maximum Players</label>
              <input 
                type="number" 
                id="maxPlayers"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
                min="2"
                max="20"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="gameDate">Date & Time</label>
            <input 
              type="datetime-local" 
              id="gameDate"
              value={gameDate}
              onChange={(e) => setGameDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="gameDescription">Description (Optional)</label>
            <textarea 
              id="gameDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows="3"
              placeholder="Add any additional information about your game..."
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Creating Game...' : 'Create Game'}
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">My Games</h2>
        
        {myGames.length > 0 ? (
          <div className="space-y-4">
            {myGames.map(game => (
              <div key={game.id} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{game.type} at {game.court.name}</h3>
                    <p className="text-gray-600">{formatDate(game.date)}</p>
                    <p className="text-sm mt-1">
                      {game.participants.length}/{game.maxParticipants} players joined
                    </p>
                  </div>
                  <div>
                    <button 
                      onClick={() => handleViewGame(game)} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 py-4 text-center">You haven't created any games yet.</p>
        )}
      </div>
      
      {/* Game Details Modal */}
      {gameDetailsVisible && selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{selectedGame.type} Game Details</h2>
              <button 
                onClick={() => setGameDetailsVisible(false)} 
                className="text-gray-500 hover:text-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium">Court</p>
                <p>{selectedGame.court.name}</p>
              </div>
              
              <div>
                <p className="font-medium">Date & Time</p>
                <p>{formatDate(selectedGame.date)}</p>
              </div>
              
              {selectedGame.description && (
                <div>
                  <p className="font-medium">Description</p>
                  <p>{selectedGame.description}</p>
                </div>
              )}
              
              <div>
                <p className="font-medium">Participants ({selectedGame.participants.length}/{selectedGame.maxParticipants})</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedGame.participants.map(player => (
                    <div key={player.id} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                        <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm">{player.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t flex space-x-3">
              <button 
                className="flex-1 px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-100"
                onClick={() => setGameDetailsVisible(false)}
              >
                Close
              </button>
              <button 
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => {
                  alert('Invitation link copied to clipboard!');
                }}
              >
                Share Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameOrganizer;
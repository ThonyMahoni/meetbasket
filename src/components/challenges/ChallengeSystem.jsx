import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ChallengeSystem = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [challengeType, setChallengeType] = useState('1v1');
  const [courtOptions, setCourtOptions] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [challengeDate, setChallengeDate] = useState('');
  const [challengeDescription, setChallengeDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myChallenges, setMyChallenges] = useState([]);
  const [challengesReceived, setChallengesReceived] = useState([]);
  const [challengeDetailsVisible, setChallengeDetailsVisible] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Mock data for players
  const mockPlayers = [
    {
      id: 101,
      username: 'JordanFan23',
      avatar: '/assets/avatars/default1.png',
      skillLevel: 4,
      position: 'Guard',
      rating: 4.3,
      gamesWon: 23,
      gamesLost: 7
    },
    {
      id: 102,
      username: 'CourtKing',
      avatar: '/assets/avatars/default2.png',
      skillLevel: 5,
      position: 'Forward',
      rating: 4.8,
      gamesWon: 42,
      gamesLost: 8
    },
    {
      id: 103,
      username: 'StreetBaller',
      avatar: '/assets/avatars/default3.png',
      skillLevel: 3,
      position: 'Center',
      rating: 3.9,
      gamesWon: 15,
      gamesLost: 12
    },
    {
      id: 104,
      username: 'Shooter101',
      avatar: '/assets/avatars/default1.png',
      skillLevel: 4,
      position: 'Guard',
      rating: 4.1,
      gamesWon: 19,
      gamesLost: 11
    },
    {
      id: 105,
      username: 'DunkMaster',
      avatar: '/assets/avatars/default2.png',
      skillLevel: 5,
      position: 'Forward',
      rating: 4.7,
      gamesWon: 31,
      gamesLost: 5
    }
  ];

  // Mock data for courts
  const mockCourts = [
    {
      id: 1,
      name: 'Downtown Community Court',
      address: '123 Main St, New York, NY',
      image: '/assets/courts/court1.jpg'
    },
    {
      id: 2,
      name: 'Riverfront Park Courts',
      address: '456 River Ave, New York, NY',
      image: '/assets/courts/court2.jpg'
    },
    {
      id: 3,
      name: 'City Rec Center',
      address: '789 Recreation Blvd, New York, NY',
      image: '/assets/courts/court3.jpg'
    }
  ];

  // Mock data for sent challenges
  const mockSentChallenges = [
    {
      id: 201,
      challenger: {
        id: currentUser?.id || 999,
        username: currentUser?.username || 'YourUsername',
        avatar: currentUser?.avatar || '/assets/avatars/default1.png'
      },
      challenged: {
        id: 102,
        username: 'CourtKing',
        avatar: '/assets/avatars/default2.png'
      },
      type: '1v1',
      date: '2023-06-10T16:00:00',
      court: {
        id: 1,
        name: 'Downtown Community Court'
      },
      status: 'pending',
      description: 'Let\'s see who\'s the best shooter!'
    },
    {
      id: 202,
      challenger: {
        id: currentUser?.id || 999,
        username: currentUser?.username || 'YourUsername',
        avatar: currentUser?.avatar || '/assets/avatars/default1.png'
      },
      challenged: {
        id: 105,
        username: 'DunkMaster',
        avatar: '/assets/avatars/default2.png'
      },
      type: '2v2',
      date: '2023-06-15T18:30:00',
      court: {
        id: 3,
        name: 'City Rec Center'
      },
      status: 'accepted',
      description: 'Bring your best teammate!'
    }
  ];

  // Mock data for received challenges
  const mockReceivedChallenges = [
    {
      id: 301,
      challenger: {
        id: 103,
        username: 'StreetBaller',
        avatar: '/assets/avatars/default3.png'
      },
      challenged: {
        id: currentUser?.id || 999,
        username: currentUser?.username || 'YourUsername',
        avatar: currentUser?.avatar || '/assets/avatars/default1.png'
      },
      type: '1v1',
      date: '2023-06-12T17:00:00',
      court: {
        id: 2,
        name: 'Riverfront Park Courts'
      },
      status: 'pending',
      description: 'Heard you were good. Let\'s play!'
    },
    {
      id: 302,
      challenger: {
        id: 104,
        username: 'Shooter101',
        avatar: '/assets/avatars/default1.png'
      },
      challenged: {
        id: currentUser?.id || 999,
        username: currentUser?.username || 'YourUsername',
        avatar: currentUser?.avatar || '/assets/avatars/default1.png'
      },
      type: '3v3',
      date: '2023-06-18T16:00:00',
      court: {
        id: 1,
        name: 'Downtown Community Court'
      },
      status: 'pending',
      description: '3v3 tournament prep. Bring 2 teammates.'
    }
  ];

  useEffect(() => {
    // In a real app, this would fetch from an API
    setPlayers(mockPlayers);
    setFilteredPlayers(mockPlayers);
    setCourtOptions(mockCourts);
    setMyChallenges(mockSentChallenges);
    setChallengesReceived(mockReceivedChallenges);
    
    // Set default date (tomorrow at 18:00)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    setChallengeDate(tomorrow.toISOString().slice(0, 16));
  }, [currentUser]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = players.filter(player => 
        player.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlayers(filtered);
    } else {
      setFilteredPlayers(players);
    }
  }, [searchQuery, players]);

  const handleCreateChallenge = (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!selectedPlayer) {
      setError('Please select a player to challenge');
      return;
    }
    
    if (!selectedCourt) {
      setError('Please select a court');
      return;
    }
    
    if (!challengeDate) {
      setError('Please select a date and time');
      return;
    }
    
    setLoading(true);
    
    // In a real app, this would make an API call to create the challenge
    setTimeout(() => {
      const newChallenge = {
        id: Date.now(),
        challenger: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar || '/assets/avatars/default1.png'
        },
        challenged: {
          id: selectedPlayer.id,
          username: selectedPlayer.username,
          avatar: selectedPlayer.avatar
        },
        type: challengeType,
        date: challengeDate,
        court: {
          id: selectedCourt.id,
          name: selectedCourt.name
        },
        status: 'pending',
        description: challengeDescription
      };
      
      setMyChallenges([newChallenge, ...myChallenges]);
      
      // Reset form
      setSelectedPlayer(null);
      setChallengeType('1v1');
      setSelectedCourt(null);
      setChallengeDescription('');
      setError('');
      setLoading(false);
      
      // Show success message
      alert('Challenge sent successfully!');
    }, 1000);
  };

  const handleViewChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setChallengeDetailsVisible(true);
  };

  const handleChallengeResponse = (challengeId, accept) => {
    // In a real app, this would make an API call
    setChallengesReceived(prevChallenges => 
      prevChallenges.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, status: accept ? 'accepted' : 'declined' }
          : challenge
      )
    );
    
    setChallengeDetailsVisible(false);
    
    // Show success message
    alert(`Challenge ${accept ? 'accepted' : 'declined'} successfully!`);
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

  // Render skill level
  const renderSkillLevel = (level) => {
    const dots = [];
    for (let i = 1; i <= 5; i++) {
      dots.push(
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i <= level ? 'bg-blue-600' : 'bg-gray-300'
          } mx-0.5`}
        ></div>
      );
    }
    return <div className="flex">{dots}</div>;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Challenge System</h1>
      
      {/* Create Challenge */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Create Challenge</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleCreateChallenge}>
          {/* Player selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Select Player to Challenge</label>
            
            <div className="mb-4">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search players..." 
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {filteredPlayers.map(player => (
                <div 
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className={`border rounded-lg overflow-hidden cursor-pointer ${
                    selectedPlayer?.id === player.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center p-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        src={player.avatar} 
                        alt={player.username} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-bold">{player.username}</h3>
                      <div className="flex items-center text-sm space-x-3">
                        <span className="text-gray-600">{player.position}</span>
                        <div className="flex items-center">
                          {renderRating(player.rating)}
                        </div>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500 mr-2">Skill:</span>
                        {renderSkillLevel(player.skillLevel)}
                      </div>
                    </div>
                    <div className="ml-auto text-center">
                      <div className="text-sm font-semibold">{player.gamesWon}-{player.gamesLost}</div>
                      <div className="text-xs text-gray-500">W-L</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredPlayers.length === 0 && (
              <p className="text-gray-500 text-center py-4">No players found matching your search.</p>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="challengeType">Challenge Type</label>
              <select 
                id="challengeType"
                value={challengeType}
                onChange={(e) => setChallengeType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="1v1">1v1</option>
                <option value="2v2">2v2</option>
                <option value="3v3">3v3</option>
                <option value="HORSE">HORSE</option>
                <option value="Shooting Contest">Shooting Contest</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="challengeDate">Date & Time</label>
              <input 
                type="datetime-local" 
                id="challengeDate"
                value={challengeDate}
                onChange={(e) => setChallengeDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Select Court</label>
            <div className="grid md:grid-cols-3 gap-3">
              {courtOptions.map(court => (
                <div 
                  key={court.id}
                  onClick={() => setSelectedCourt(court)}
                  className={`border rounded-lg overflow-hidden cursor-pointer ${
                    selectedCourt?.id === court.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="h-24 bg-gray-200">
                    <img 
                      src={court.image} 
                      alt={court.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="font-medium text-sm">{court.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="challengeDescription">Challenge Message (Optional)</label>
            <textarea 
              id="challengeDescription"
              value={challengeDescription}
              onChange={(e) => setChallengeDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows="3"
              placeholder="Add a message to your challenge..."
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            className={`w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Sending Challenge...' : 'Send Challenge'}
          </button>
        </form>
      </div>
      
      {/* Challenges Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="flex border-b">
          <button 
            className={`flex-1 py-3 font-medium ${
              true ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
            }`}
          >
            Challenges Sent ({myChallenges.length})
          </button>
          <button 
            className={`flex-1 py-3 font-medium ${
              false ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
            }`}
          >
            Challenges Received ({challengesReceived.length})
          </button>
        </div>
        
        <div className="p-6">
          {/* Sent Challenges */}
          {myChallenges.length > 0 ? (
            <div className="space-y-4">
              {myChallenges.map(challenge => (
                <div key={challenge.id} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        <img src={challenge.challenged.avatar} alt={challenge.challenged.username} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold">{challengeType} Challenge to {challenge.challenged.username}</h3>
                        <p className="text-sm text-gray-600">{formatDate(challenge.date)} at {challenge.court.name}</p>
                        {challenge.status === 'pending' && (
                          <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded mt-1">Pending</span>
                        )}
                        {challenge.status === 'accepted' && (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded mt-1">Accepted</span>
                        )}
                        {challenge.status === 'declined' && (
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded mt-1">Declined</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <button 
                        onClick={() => handleViewChallenge(challenge)} 
                        className="px-4 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 py-4 text-center">You haven't sent any challenges yet.</p>
          )}
          
          {/* Received Challenges (hidden initially, would toggle with tab) */}
          <div className="hidden">
            {challengesReceived.length > 0 ? (
              <div className="space-y-4">
                {challengesReceived.map(challenge => (
                  <div key={challenge.id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                          <img src={challenge.challenger.avatar} alt={challenge.challenger.username} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-bold">{challenge.type} Challenge from {challenge.challenger.username}</h3>
                          <p className="text-sm text-gray-600">{formatDate(challenge.date)} at {challenge.court.name}</p>
                          {challenge.status === 'pending' && (
                            <div className="mt-2 flex space-x-2">
                              <button 
                                onClick={() => handleChallengeResponse(challenge.id, true)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleChallengeResponse(challenge.id, false)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          {challenge.status === 'accepted' && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded mt-1">Accepted</span>
                          )}
                          {challenge.status === 'declined' && (
                            <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded mt-1">Declined</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <button 
                          onClick={() => handleViewChallenge(challenge)} 
                          className="px-4 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-4 text-center">You don't have any incoming challenges.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Challenge Details Modal */}
      {challengeDetailsVisible && selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{selectedChallenge.type} Challenge Details</h2>
              <button 
                onClick={() => setChallengeDetailsVisible(false)} 
                className="text-gray-500 hover:text-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={selectedChallenge.challenger.avatar} 
                    alt={selectedChallenge.challenger.username}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="text-center mx-2">vs</div>
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={selectedChallenge.challenged.avatar} 
                    alt={selectedChallenge.challenged.username}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <p className="font-medium">{selectedChallenge.challenger.username} vs {selectedChallenge.challenged.username}</p>
                  <p className="text-sm text-gray-600">{selectedChallenge.type} Challenge</p>
                </div>
              </div>
              
              <div>
                <p className="font-medium">Court</p>
                <p>{selectedChallenge.court.name}</p>
              </div>
              
              <div>
                <p className="font-medium">Date & Time</p>
                <p>{formatDate(selectedChallenge.date)}</p>
              </div>
              
              <div>
                <p className="font-medium">Status</p>
                <div>
                  {selectedChallenge.status === 'pending' && (
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Pending</span>
                  )}
                  {selectedChallenge.status === 'accepted' && (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded">Accepted</span>
                  )}
                  {selectedChallenge.status === 'declined' && (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded">Declined</span>
                  )}
                </div>
              </div>
              
              {selectedChallenge.description && (
                <div>
                  <p className="font-medium">Message</p>
                  <p className="text-gray-700">{selectedChallenge.description}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t flex space-x-3">
              <button 
                className="flex-1 px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-100"
                onClick={() => setChallengeDetailsVisible(false)}
              >
                Close
              </button>
              <button 
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => {
                  alert('Challenge details shared to your calendar!');
                  setChallengeDetailsVisible(false);
                }}
              >
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeSystem;
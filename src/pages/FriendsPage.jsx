import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PremiumFeatureMessage from '../components/common/PremiumFeatureMessage';
import PremiumBadge from '../components/common/PremiumBadge'
import usePremiumStatus from '../hooks/usePremiumStatus';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const FriendsPage = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isPremium, daysRemaining } = usePremiumStatus();


  // Funktion zum Laden aller Daten je nach Tab
  const fetchData = async () => {
    if (!currentUser) return;
  
    const userId = currentUser.id; // ✅ HIER hinzufügen
  
    setLoading(true);
    setError(null);
  
    try {
      const [friendsRes, requestsRes, sentRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/api/friends`, {}, userId),
        authFetch(`${API_BASE_URL}/api/friends/requests`, {}, userId),
        authFetch(`${API_BASE_URL}/api/friends/requests/sent`, {}, userId),
      ]);
  
      if (!friendsRes.ok) throw new Error('Failed to fetch friends');
      if (!requestsRes.ok) throw new Error('Failed to fetch friend requests');
      if (!sentRes.ok) throw new Error('Failed to fetch sent requests');
  
      const friendsData = await friendsRes.json();
      const requestsData = await requestsRes.json();
      const sentData = await sentRes.json();
  
      setFriends(friendsData);
      setRequests(requestsData);
      setSentRequests(sentData);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  

  const authFetch = async (url, options = {}, userId) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'x-user-id': userId,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  };
  

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Handlers
  const handleAcceptRequest = async (requestId) => {
    if (!currentUser) return;
    try {
      const res = await authFetch(`${API_BASE_URL}/api/friends/requests/${requestId}/accept`, { method: 'POST' }, currentUser.id);
      if (!res.ok) throw new Error('Failed to accept request');
      await fetchData();
    } catch (err) {
      alert(err.message || 'Error accepting request');
    }
  };
  

  const handleDeclineRequest = async (requestId) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/friends/requests/${requestId}/decline`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to decline request');
      await fetchData();
    } catch (err) {
      alert(err.message || 'Error declining request');
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!currentUser) return;
    try {
      const res = await authFetch(
        `${API_BASE_URL}/api/friends/requests/sent/${requestId}`,
        { method: 'DELETE' },
        currentUser.id // ✅ wichtig!
      );
      if (!res.ok) throw new Error('Failed to cancel request');
      await fetchData();
    } catch (err) {
      alert(err.message || 'Error canceling request');
    }
  };
  

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;
    try {
      const res = await authFetch(`${API_BASE_URL}/api/friends/${friendId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to remove friend');
      await fetchData();
    } catch (err) {
      alert(err.message || 'Error removing friend');
    }
  };

  const formatLastActive = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);

    if (diffMinutes < 5) {
      return 'Online now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 24 * 60) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffMinutes / (60 * 24))}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Bitte loggen Sie sich ein, um Ihre Freunde zu sehen.</h2>
        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
          Login
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Friends</h1>
  
      {isPremium && (
        <div className="text-sm text-green-600">
          Du bist Premium-Mitglied ({daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tage'} verbleibend)
        </div>
      )}
  
      {!currentUser?.isPremium && (
        <PremiumFeatureMessage
          title="Für Premium-Mitglieder"
          message="Mit Premium kannst du unbegrenzt Freundschaftsanfragen senden und exklusive Funktionen nutzen."
        />
      )}
  


      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('friends')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'friends'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Friends {friends.length > 0 && `(${friends.length})`}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center`}
          >
            Requests
            {requests.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sent'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sent {sentRequests.length > 0 && `(${sentRequests.length})`}
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : (
        <>
          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div>
              {friends.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-600 mb-4">Du hast noch keine Freunde.</p>
                  <Link to="/community" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Find Players
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map(friend => (
                    <div key={friend.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="p-5">
                        <div className="flex space-x-4">
                          <div className="relative">
                            <img src={friend.avatar} alt={friend.displayName} className="h-16 w-16 rounded-full" />
                            <span
                              className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
                                formatLastActive(friend.lastActive) === 'Online now' ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            ></span>
                          </div>
                          <div className="flex-grow">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
  {friend.displayName}
  {friend.isPremium && (
    <PremiumBadge size="sm" showLabel className="ml-2" />
  )}
</h3>

                            <p className="text-sm text-gray-500">@{friend.username}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatLastActive(friend.lastActive)}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                          <Link
                            to={`/nachrichten/new/${friend.id}`}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded text-sm"
                          >
                            Message
                          </Link>
                          <button
                            onClick={() => handleRemoveFriend(friend.id)}
                            className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm border border-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              {requests.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-600">Du hast keine Freundschaftsanfragen.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map(request => (
                    <div key={request.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="p-5 flex items-center space-x-4">
                        <img src={request.avatar} alt={request.displayName} className="h-16 w-16 rounded-full" />
                        <div className="flex-grow">
                          <h3 className="text-lg font-bold text-gray-900">{request.displayName}</h3>
                          <p className="text-sm text-gray-500">@{request.username}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Position: {request.position} • Skill: {request.skillLevel}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="bg-green-600 text-white hover:bg-green-700 px-4 py-1 rounded text-sm"
                          >
                            Akzeptieren
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(request.id)}
                            className="border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-1 rounded text-sm"
                          >
                            Ablehnen
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sent Requests Tab */}
          {activeTab === 'sent' && (
            <div>
              {sentRequests.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-600 mb-4">Du hast keine Freundschaftsanfragen gesendet.</p>
                  <Link to="/community" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Finde Hooper in der Nähe
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map(request => (
                    <div key={request.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="p-5 flex items-center space-x-4">
                        <img src={request.avatar} alt={request.displayName} className="h-16 w-16 rounded-full" />
                        <div className="flex-grow">
                          <h3 className="text-lg font-bold text-gray-900">{request.displayName}</h3>
                          <p className="text-sm text-gray-500">@{request.username}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Gesendent am {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCancelRequest(request.id)}
                          className="border border-red-600 text-red-600 hover:bg-red-50 px-4 py-1 rounded text-sm"
                        >
                          Anfrage abbrechen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="mt-8 text-center">
        <Link to="/community#messages" className="text-blue-600 hover:underline">
        Finde mehr Basketball-Spieler, mit denen du dich verbinden kannst.
        </Link>
      </div>
    </div>
  );
};

export default FriendsPage;

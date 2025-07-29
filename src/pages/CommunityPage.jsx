import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadGoogleMapsAPI } from '../services/maps';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import PremiumFeatureMessage from '../components/common/PremiumFeatureMessage';
import usePremiumStatus from '../hooks/usePremiumStatus';
import Werbeanzeige from '../components/common/Werbeanzeige';
import PremiumBadge from '../components/common/PremiumBadge';
import { useSearchParams } from 'react-router-dom';



const API_BASE = import.meta.env.VITE_API_BASE_URL;

const CommunityPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('players');
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [selectedTournament, setSelectedTournament] = React.useState(null);
  const [editingTournamentId, setEditingTournamentId] = useState(null);
  const [filterSkillLevel, setFilterSkillLevel] = useState('all');
const [filterPosition, setFilterPosition] = useState('all');
const [loading, setLoading] = useState(false);
const currentUser = user; // oder const { user: currentUser } = useAuth();
const [unreadMessages, setUnreadMessages] = useState(0);

const [tournaments, setTournaments] = useState([]);
  const [formData, setFormData] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [nearbyCourts, setNearbyCourts] = useState([]);
  const [courts, setCourts] = useState([]);
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false);
const [teamForm, setTeamForm] = useState({
  name: '',
  location: '',
  logo: '',
});
const [searchUsername, setSearchUsername] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [selectedPlayers, setSelectedPlayers] = useState([]);

const [friends, setFriends] = useState([]);
const [sentRequests, setSentRequests] = useState([]);
const { isPremium, daysRemaining } = usePremiumStatus();

const [searchParams, setSearchParams] = useSearchParams();
const tabFromUrl = searchParams.get('tab');



const [allUsers, setAllUsers] = useState([]); // aus DB laden, z.B. beim Load
const fetchTeams = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/teams`);
    const data = await res.json();
    setTeams(data);
  } catch (error) {
    console.error('Fehler beim Laden der Teams:', error);
  }
};

const handleTabClick = (tabName) => {
  setActiveTab(tabName);
  setSearchParams({ tab: tabName });
};



function TournamentDetailsModal({ tournament, onClose }) {
  if (!tournament) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
          aria-label="Schließen"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4">{tournament.title}</h2>
        <p><strong>📅 Datum:</strong> {tournament.date ? new Date(tournament.date).toLocaleDateString() : 'Datum fehlt'}</p>
        <p><strong>📍 Ort:</strong> {tournament.location}</p>
        <p><strong>🔢 Format:</strong> {tournament.format}</p>
        <p><strong>💰 Teilnahmegebühr:</strong> {tournament.entryFee ? `${tournament.entryFee} €` : 'Keine'}</p>
        <p><strong>🏆 Preise:</strong> {tournament.prizes || 'Keine'}</p>
        <p><strong>Teilnehmer:</strong> {tournament.participants?.length ?? 0} / {tournament.maxParticipants ?? '-'}</p>
        
      </div>
    </div>
  );
}

useEffect(() => {
  if (!currentUser?.id) return; // Sicherheitscheck

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/messages/unread-count`, {
        headers: {
         'x-user-id': String(currentUser?.id ?? ''),
        },
        credentials: 'include',
      });

      const data = await res.json();
      setUnreadMessages(data.count || 0);
    } catch (err) {
      console.error('Fehler beim Laden ungelesener Nachrichten:', err);
    }
  };

  fetchUnreadCount();
}, [currentUser?.id]); // 👈 oder einfach nur [currentUser]




  useEffect(() => {
    const initMapAPI = async () => {
      try {
        await loadGoogleMapsAPI(); // 👈 ohne das ist google.maps undefined
        
      } catch (error) {
        console.error('Fehler beim Laden der Google Maps API', error);
      }
    };
  
    initMapAPI();
  }, []);

  // ✅ lässt fetchUsers zu, aber überschreibt nicht, wenn 'messages' aktiv ist
// ✅ lässt fetchUsers zu, aber überschreibt nicht, wenn 'messages' aktiv ist
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/users`);
      if (!response.ok) throw new Error('Fehler beim Laden der Spieler');
      const data = await response.json();
      setAllUsers(data);

      if (activeTab === 'players') {
        setPlayers(data);
      }
    } catch (error) {
      console.error('❌ Fehler beim Laden der Spieler:', error);
    }
  };

  if (activeTab === 'players') {
    fetchUsers();
  }
}, [activeTab]);



useEffect(() => {
  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`);
      if (!res.ok) throw new Error('Fehler beim Initial-User-Load');
      const data = await res.json();
      setAllUsers(data);

      // Nur beim Start laden – nur für Referenz (z. B. Friend-Finder etc.)
    } catch (error) {
      console.error('❌ Fehler beim Initial-User-Load:', error);
    }
  };

  fetchAllUsers();
}, []);

useEffect(() => {
  // Players-Tab bekommt allUsers
  if (activeTab === 'players') {
    setPlayers(allUsers);
  }
}, [activeTab, allUsers]);

useEffect(() => {
  const fetchMessagePlayers = async () => {
    if (!currentUser) return;
    try {
      const query = new URLSearchParams({
        userId: currentUser.id,
        search: searchQuery,
        skillLevel: filterSkillLevel,
        position: filterPosition,
      }).toString();

      const res = await fetch(`${API_BASE_URL}/api/players?${query}`);
      if (!res.ok) throw new Error('Fehler beim Laden der Spieler für Nachrichten');

      const json = await res.json(); // 👈 korrekt extrahieren
      setPlayers(json.players || []);  // <-- genau so!
    } catch (err) {
      console.error('❌ Fehler beim Laden der Spieler im Nachrichtentab:', err);
    }
  };

  if (activeTab === 'messages') {
    fetchMessagePlayers();
  }
}, [activeTab, currentUser, searchQuery, filterSkillLevel, filterPosition]);

useEffect(() => {
  if (activeTab === 'messages') {
    fetchPlayers();       // vermutlich schon vorhanden
    fetchFriends();       // neu
    fetchSentRequests();  // neu
  }
}, [activeTab]);
const fetchFriends = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/friends`, {
      headers: { 'x-user-id': currentUser.id },
    });
    const data = await res.json();
    setFriends(data);
  } catch (err) {
    console.error('Fehler beim Laden der Freunde:', err);
  }
};

const fetchSentRequests = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/friends/requests/sent`, {
      headers: { 'x-user-id': currentUser.id },
    });
    const data = await res.json();
    setSentRequests(data);
  } catch (err) {
    console.error('Fehler beim Laden gesendeter Anfragen:', err);
  }
};



  useEffect(() => {
    const applyFilters = () => {
      let filtered = players;
  
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.username.toLowerCase().includes(query) ||
            p.displayName?.toLowerCase().includes(query)
        );
      }
  
      if (filterSkillLevel !== 'all') {
        filtered = filtered.filter((p) => p.skillLevel === filterSkillLevel);
      }
  
      if (filterPosition !== 'all') {
        filtered = filtered.filter((p) => p.position === filterPosition);
      }
  
      setFilteredPlayers(filtered);
    };
  
    if (activeTab === 'messages' || activeTab === 'players') {
      applyFilters();
    }
  }, [players, searchQuery, filterSkillLevel, filterPosition, activeTab]);
  
  

 useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
     
      setUserLocation(coords);
    },
    () => console.warn('Standort nicht ermittelbar')
  );
  
  }, []);

  useEffect(() => {
    fetchData();

  }, [activeTab]);
  
    // 1. Lade ALLE Plätze nur EINMAL
    useEffect(() => {
      const fetchCourts = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/courts`);
          if (!res.ok) throw new Error('Fehler beim Laden der Plätze');
          const raw = await res.json();
      
          
      
          const data = Array.isArray(raw) ? raw : raw.courts || []; // <- falls raw ein Objekt mit courts ist
      
          const updatedCourts = await Promise.all(
            data.map(async (court) => {
              if (!court.latitude || !court.longitude) {
                const fullAddress = `${court.address}, ${court.city}`;
                const geo = await geocodeAddress(fullAddress);
                if (geo) {
                  return {
                    ...court,
                    latitude: geo.lat,
                    longitude: geo.lng,
                  };
                }
              }
              return court;
            })
          );
      
          setCourts(updatedCourts);
        } catch (error) {
          console.error('Court-Fetch-Fehler:', error);
        }
      };
      
    
      fetchCourts();
    }, []);
      


// 2. Filtere die Plätze NACHDEM userLocation UND courts verfügbar sind
useEffect(() => {


  if (userLocation && courts.length > 0) {
    const filtered = courts.filter(court => {
      const lat = parseFloat(court.latitude);
      const lng = parseFloat(court.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn("⚠️ Ungültiger Ort:", court.name, court.latitude, court.longitude);
        return false;
      }

      const dist = getDistance(userLocation.lat, userLocation.lng, lat, lng);

      if (dist <= 50) {
       
      } else {
        
      }

      return dist <= 50;
    });

    setNearbyCourts(filtered);
  }
}, [userLocation, courts]);
    

const fetchPlayers = async () => {

  try {

    const res = await fetch(`${API_BASE}/api/player?userId=${user.id}`);

    if (!res.ok) throw new Error('Fehler beim Laden der Spieler');

    const data = await res.json();

    setPlayers(data); // ersetzt alle Spieler inkl. aktualisierter Bewertung

  } catch (err) {

    console.error('❌ Spieler laden fehlgeschlagen:', err);

  }

}; 

const fetchData = async () => {
  if (activeTab !== 'players') return; // 👉 Verhindert Überschreiben in Nachrichten-Tab

  try {
    const [resPlayers, resTeams, resTournaments] = await Promise.all([
      fetch(`${API_BASE}/api/players`),
      fetch(`${API_BASE}/api/teams`),
      fetch(`${API_BASE}/api/tournaments`)
    ]);

    if (!resPlayers.ok) throw new Error(`/players: ${resPlayers.status}`);
    if (!resTeams.ok) throw new Error(`/teams: ${resTeams.status}`);
    if (!resTournaments.ok) throw new Error(`/tournaments: ${resTournaments.status}`);

    const [playersData, teamsData, tournamentsData] = await Promise.all([
      resPlayers.json(),
      resTeams.json(),
      resTournaments.json()
    ]);

    setPlayers(playersData || []);
    setFilteredPlayers(playersData || []);
    setTeams(teamsData || []);
    setTournaments(tournamentsData || []);
  } catch (error) {
    console.error('Fehler beim Laden der Daten:', error);
  }
};

   
const handleAddFriend = async (friendId) => {
  if (!currentUser) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/friends/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id, // 🔑 notwendig für Backend!
      },
      body: JSON.stringify({ addresseeId: friendId }),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Fehler beim Senden');

    alert('✅ Freundschaftsanfrage gesendet');
  } catch (err) {
    console.error('❌ Fehler beim Senden:', err.message);
    alert(err.message || 'Fehler beim Senden');
  }
};



  //GEO CODE ADRESSE
  const geocodeAddress = async (address) => {
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        console.warn("Geocoding fehlgeschlagen:", status, address);
        resolve(null);
      }
    });
  });
};

const handleEditTournament = (tournament) => {
  setFormData({
    title: tournament.title,
    organizer: tournament.organizer,
    date: tournament.date?.split('T')[0] || '',
    format: tournament.format,
    location: tournament.location,
    maxParticipants: tournament.maxParticipants,
    entryFee: tournament.entryFee,
    prizes: tournament.prizes,
  });
  setEditingTournamentId(tournament.id); // ⬅ für später beim Submit
  setShowCreateForm(true);
};


const handleJoinTournament = async (tournamentId) => {
  try {
    const res = await fetch(`${API_BASE}/api/tournaments/${tournamentId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.id }),
    });

    if (!res.ok) throw new Error('Beitritt fehlgeschlagen');

    // Nach erfolgreichem Beitritt neu laden:
    fetchData();
  } catch (err) {
    console.error('❌ Fehler beim Turnierbeitritt:', err);
    alert('Fehler beim Beitreten');
  }
};


const handlePlayerRating = async (playerId, score) => {
  try {
    const res = await fetch(`${API_BASE}/api/player`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        raterId: user.id,
        ratedId: playerId,
        score,
      }),
    });

    if (!res.ok) throw new Error('Fehler beim Bewerten');

    await fetchPlayers(); // Wichtig: Spielerliste aktualisieren, um neue Bewertung zu sehen
  } catch (err) {
    console.error('Rating fehlgeschlagen:', err);
  }
};
   
const handleRatingClick = async (teamId) => {
  try {
    const res = await fetch(`${API_BASE}/api/teams/${teamId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id })
    });

    if (!res.ok) throw new Error('Fehler beim Updaten des Ratings');

    const updatedTeam = await res.json();

    setTeams((prev) =>
      prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t))
    );

    if (selectedTeam?.id === updatedTeam.id) {
      setSelectedTeam(updatedTeam);
    }
  } catch (error) {
    console.error('❌ Fehler beim Rating:', error);
  }
};




  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  const renderPlayerCard = (player) => {
    const distance = userLocation && player?.location
      ? getDistance(
          userLocation.lat,
          userLocation.lng,
          player.location.latitude,
          player.location.longitude
        ).toFixed(1)
      : null;
    
    const averageRating = player.averageRating ?? 0;
    const userRating = player.latestRating ?? 0;
  
    const ratingColorClass =
      averageRating >= 4
        ? 'text-green-600'
        : averageRating >= 2.5
        ? 'text-yellow-600'
        : 'text-red-600';
  
    return (
      <div key={player.id} className="bg-white shadow p-4 rounded-xl mb-4">
        <h3 className="text-xl font-semibold text-blue-600 hover:underline">
  <Link to={`/profile/${player.username}`}>
    {player.username}
  </Link>
  {player.isPremium && (
    <PremiumBadge size="sm" showLabel className="ml-2" />
  )}
</h3>
        <p className="text-sm text-gray-600">Skill: {player.skillLevel}</p>
  
        {/* Sternebewertung */}
        <div className="flex items-center space-x-1 mt-2">
          {[1, 2, 3, 4, 5].map((s) => {
            const isFilled = s <= averageRating;
            const isUserRating = userRating > 0 && s === userRating;
  
            return (
              <span
                key={s}
                onClick={() => handlePlayerRating(player.id, s)}
                className="cursor-pointer text-xl"
                style={{
                  color: isFilled ? '#FBBF24' : '#D1D5DB',
                  fontWeight: isUserRating ? 'bold' : 'normal',
                }}
                title={
                  userRating > 0
                    ? s === userRating
                      ? `Deine Bewertung: ${userRating} Sterne`
                      : `Klicke, um ${s} Sterne zu geben`
                    : `Klicke, um ${s} Sterne zu geben`
                }
              >
                {isFilled ? '★' : '☆'}
              </span>
            );
          })}
        </div>
  
        {/* Durchschnittsbewertung mit Farbcodierung */}
        <p className={`text-sm mt-1 font-medium ${ratingColorClass}`}>
          Durchschnitt: {averageRating.toFixed(1)} ★
        </p>
  
        {/* Entfernung */}
        {distance && (
          <p className="text-sm text-green-600">~ {distance} km entfernt</p>
        )}
  
        {/* Erfolge */}
        <p className="text-xs text-gray-400 mt-2">
          🏅 {(player.achievements || []).join(', ')}
        </p>
      </div>
    );
  };
  
  
  

  const handleTournamentSubmit = async () => {
  try {
    const payload = {
      ...formData,
      date: new Date(formData.date).toISOString(),
      maxParticipants: parseInt(formData.maxParticipants),
      entryFee: formData.entryFee || null, // 🔁 nicht parseFloat
    };

    if (editingTournamentId) {
      delete payload.creatorId;
    } else {
      payload.creatorId = user.id;
    }

    const res = await fetch(
      editingTournamentId
        ? `${API_BASE}/api/tournaments/${editingTournamentId}`
        : `${API_BASE}/api/tournaments/`,
      {
        method: editingTournamentId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      throw new Error(editingTournamentId ? 'Fehler beim Bearbeiten des Turniers' : 'Fehler beim Erstellen des Turniers');
    }

    const updatedOrNewTournament = await res.json();

    if (editingTournamentId) {
      setTournaments((prev) =>
        prev.map((t) => (t.id === updatedOrNewTournament.id ? updatedOrNewTournament : t))
      );
    } else {
      setTournaments([...tournaments, updatedOrNewTournament]);
    }

    setShowCreateForm(false);
    setFormData({});
    setEditingTournamentId(null);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

  
  

  const handleLeaveTournament = async (tournamentId) => {
    try {
      const res = await fetch(`${API_BASE}/api/tournaments/${tournamentId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });
  
      if (!res.ok) throw new Error('Austritt fehlgeschlagen');
  
      fetchData(); // Daten neu laden
    } catch (err) {
      console.error('❌ Fehler beim Austritt:', err);
      alert('Fehler beim Austritt');
    }
  };

  
  const handleCreateTeamSubmit = async () => {
    const basePayload = {
      name: teamForm.name,
      location: teamForm.location,
      logo: teamForm.logo,
      playerIds: selectedPlayers.map((p) => p.id),
    };
  
    const payload = editingTeamId
      ? basePayload // kein creatorId beim Bearbeiten
      : { ...basePayload, creatorId: user.id }; // creatorId nur beim Erstellen
  
    try {
      if (editingTeamId) {
        const res = await fetch(`${API_BASE}/api/teams/${editingTeamId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
  
        if (!res.ok) throw new Error('Fehler beim Bearbeiten des Teams');
      } else {
        const res = await fetch(`${API_BASE_URL}/api/teams/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
  
        if (!res.ok) throw new Error('Fehler beim Erstellen des Teams');
      }
  
      setShowCreateTeamForm(false);
      setTeamForm({ name: '', location: '', logo: '' });
      setSelectedPlayers([]);
      setEditingTeamId(null);
      fetchTeams();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };
  
  
  

  const handleEditTeam = (team) => {
    setTeamForm({
      name: team.name,
      location: team.location,
      logo: team.logo || '',
    });
    setSelectedPlayers(
      (team.members || []).map((m) => ({
        id: m.user.id,
        username: m.user.username,
      }))
    );
    setEditingTeamId(team.id); // Merke ID zum späteren Speichern via PUT
    setShowCreateTeamForm(true);
  };
  
  

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🏀 Basketball Community</h1>


        <div className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm">
          <a href="/contact" target="_blank" rel="noopener noreferrer"> 🔁 Werbeplatz – jetzt buchen!</a>
        </div>
      </div>{!currentUser?.isPremium && (
  <PremiumFeatureMessage
    title="Nur für Premium-Mitglieder"
    message="Mit Premium kannst du ein eigenes Team erstellen, Turniere erstellen und exklusive Funktionen nutzen."
  />
)} 
{isPremium && (
  <div className="text-sm text-green-600">
    Du bist Premium-Mitglied ({daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tage'} verbleibend)
  </div>
)}


<div className="mb-4 overflow-x-auto">
  <div className="flex gap-2 sm:gap-4 whitespace-nowrap px-1">
    <button onClick={() => setActiveTab('players')} className={`py-2 px-4 rounded-lg ${activeTab === 'players' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
      Spieler
    </button>
    <button onClick={() => setActiveTab('teams')} className={`py-2 px-4 rounded-lg ${activeTab === 'teams' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
      Teams
    </button>
    <button onClick={() => setActiveTab('tournaments')} className={`py-2 px-4 rounded-lg ${activeTab === 'tournaments' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
      Turniere
    </button>
    <button onClick={() => setActiveTab('messages')} id="tab-messages" className={`py-2 px-4 rounded-lg ${activeTab === 'messages' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
      Connect
    </button>

    {/* Freunde-Icon-Link */}
    <Link
      to="/freunde"
      className="relative py-2 px-4 rounded-lg bg-gray-200 hover:bg-blue-600 hover:text-white transition"
      title="Freunde"
    >
      <img src="/public/icons/myfriends.png" alt="Freunde" className="h-6 w-6" />
      {unreadMessages > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center shadow-md">
          {unreadMessages}
        </div>
      )}
    </Link>
  </div>
</div>

      {activeTab === 'players' && (
        <div>
          <input
            type="text"
            placeholder="🔍 Spieler suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
          />
           {Array.isArray(filteredPlayers) && filteredPlayers.map(renderPlayerCard)}

        </div>

        )}
{activeTab === 'teams' && (
  <div>
    {user?.isPremium && !user.createdTeamId && (
      <div className="mb-4 text-right">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow"
          onClick={() => setShowCreateTeamForm(true)}
        >
          ➕ Team erstellen 
        </button>
      </div>
    )}

    {Array.isArray(teams) && teams.length === 0 ? (
      <p className="text-gray-500">Keine Teams verfügbar.</p>
    ) : (
      teams.map((team) => (
        <div key={team.id} className="bg-white shadow p-4 rounded-xl mb-4">
          <h3
            className="text-xl font-semibold cursor-pointer text-blue-600"
            onClick={() => setSelectedTeam(team)}
          >
            {team.name}
          </h3>
          <p className="text-sm text-gray-600">📍 {team.location}</p>
          <p className="text-sm">
            Rating:{' '}
            <span
              className="cursor-pointer text-yellow-500"
              onClick={() => handleRatingClick(team.id)}
            >
              ⭐ {team.rating}
            </span>
          </p>

          {user?.id === team.creatorId && (
  <button
    className="mt-2 bg-yellow-400 text-black px-3 py-1 rounded"
    onClick={() => handleEditTeam(team)}
  >
    🛠️ Team bearbeiten
  </button>
)}

        </div>
      ))
    )}

    {/* TEAM-POPUP */}
    {selectedTeam && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={() => setSelectedTeam(null)}
      >
        <div
          className="bg-white p-6 rounded-xl max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-2">{selectedTeam.name}</h2>
          <p>📍 Ort: {selectedTeam.location}</p>
          <p>⭐ Rating: {selectedTeam.rating}</p>
          <h3 className="mt-4 font-semibold">👥 Mitglieder:</h3>
          <ul className="list-disc list-inside">
          {(selectedTeam.members || []).map((m) => (
          <li key={m.id}>{m.user?.username}</li>
         ))}
           </ul>
          <button
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            onClick={() => setSelectedTeam(null)}
          >
            ✖
          </button>
        </div>
      </div>
    )}

    {showCreateTeamForm && (
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h2 className="text-lg font-bold mb-4">
  {editingTeamId ? '🛠️ Team bearbeiten' : '🏗️ Neues Team erstellen'}
</h2>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
           
            handleCreateTeamSubmit();
          }}
        >
          <input
            type="text"
            placeholder="🏷 Teamname"
            className="border border-gray-300 rounded px-3 py-2"
            value={teamForm.name}
            onChange={(e) =>
              setTeamForm({ ...teamForm, name: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="🌍 Ort (z.B. Berlin)"
            className="border border-gray-300 rounded px-3 py-2"
            value={teamForm.location}
            onChange={(e) =>
              setTeamForm({ ...teamForm, location: e.target.value })
            }
            required
          />

          <input
            type="file"
            accept="image/*"
            className="border border-gray-300 rounded px-3 py-2"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setTeamForm({ ...teamForm, logo: reader.result });
                };
                reader.readAsDataURL(file);
              }
            }}
          />

          <input
            type="text"
            placeholder="👥 Spieler per Username hinzufügen"
            className="border border-gray-300 rounded px-3 py-2 col-span-2"
            value={searchUsername}
            onChange={(e) => {
              const value = e.target.value;
              setSearchUsername(value);

              const matches = allUsers.filter(
                (u) =>
                  u.username.toLowerCase().includes(value.toLowerCase()) &&
                  !selectedPlayers.some((p) => p.id === u.id)
              );

              setSearchResults(matches.slice(0, 5));
            }}
          />

          {searchResults.length > 0 && (
            <div className="col-span-2 border rounded p-2">
              {searchResults.map((u, index) => (
          <div
           key={u.id || `search-${index}`}
           className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-sm"
                  onClick={() => {
                    if (selectedPlayers.length < 7) {
                      setSelectedPlayers([...selectedPlayers, u]);
                      setSearchUsername('');
                      setSearchResults([]);
                    }
                  }}
                >
                  ➕ {u.username}
                </div>
              ))}
            </div>
          )}

          {selectedPlayers.length > 0 && (
            <div className="col-span-2 text-sm">
              <p className="font-medium mb-1">✅ Ausgewählte Spieler:</p>
              <ul className="list-disc list-inside">
                {selectedPlayers.map((p) => (
                  <li key={p.id}>
                    {p.username}{' '}
                    <button
                      type="button"
                      className="ml-2 text-red-600 text-xs"
                      onClick={() =>
                        setSelectedPlayers(
                          selectedPlayers.filter((x) => x.id !== p.id)
                        )
                      }
                    >
                      ✖ Entfernen
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          

          <button
            type="submit"
            className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded mt-2"
          >
            ✅ Team speichern
          </button>
        </form>
      </div>
    )}
  </div>
)}





{activeTab === 'tournaments' && user?.isPremium && (
  <div className="mb-4 text-right">
    <button
      className="bg-green-600 text-white px-4 py-2 rounded-lg shadow"
      onClick={() => setShowCreateForm(true)}
    >
      ➕ Turnier erstellen
    </button>
  </div>
)}

{activeTab === 'tournaments' && (
  <div>
    {tournaments.length === 0 ? (
      <p className="text-gray-500">Keine Turniere eingetragen.</p>
    ) : (
      tournaments.map((tournament) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Heute 00:00 Uhr

        const tournamentDate = new Date(tournament.date);
        tournamentDate.setHours(0, 0, 0, 0); // Turnierdatum 00:00 Uhr

        return (
          <div key={tournament.id} className="bg-white shadow p-4 rounded-xl mb-4">
            <h3
              className="text-xl font-semibold cursor-pointer hover:text-blue-600"
              onClick={() => setSelectedTournament(tournament)}
            >
              {tournament.title}
            </h3>
            <p className="text-sm text-gray-600">📍 {tournament.location}</p>
            <p className="text-sm">
              📅 {tournament.date ? new Date(tournament.date).toLocaleDateString() : 'Datum fehlt'}
            </p>
            <p className="text-sm text-blue-700">🔓 {tournament.status}</p>
            <p className="text-sm mt-1">
              Teilnehmer: {tournament.participants?.length ?? 0} / {tournament.maxParticipants ?? '-'}
            </p>

            {user && tournament.participants?.some((p) => p.id === user.id) ? (
              <button
                className="mt-2 bg-red-600 text-white px-4 py-1 rounded"
                onClick={() => handleLeaveTournament(tournament.id)}
              >
                ❌ Teilnahme zurückziehen
              </button>
            ) : (
              <button
                className="mt-2 bg-green-600 text-white px-4 py-1 rounded disabled:opacity-50"
                disabled={tournament.participants?.length >= tournament.maxParticipants}
                onClick={() => handleJoinTournament(tournament.id)}
              >
                {tournament.participants?.length >= tournament.maxParticipants ? '⛔ Voll' : '🔗 Beitreten'}
              </button>
            )}

            {/* Bearbeiten-Button für Ersteller, solange Turnier noch nicht vorbei ist */}
            {user?.id === tournament.creatorId && tournamentDate >= today && (
              <button
                className="mt-2 bg-yellow-400 text-black px-3 py-1 rounded ml-2"
                onClick={() => handleEditTournament(tournament)}
              >
                🛠️ Turnier bearbeiten
              </button>
            )}
          </div>
        );
      }) 
    )}

    {showCreateForm && (
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h2 className="text-lg font-bold mb-2">Neues Turnier erstellen</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleTournamentSubmit();
          }}
        >
          <input
            type="text"
            placeholder="🏷 Titel"
            className="border border-gray-300 rounded px-3 py-2"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="👤 Veranstalter"
            className="border border-gray-300 rounded px-3 py-2"
            value={formData.organizer || ''}
            onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
            required
          />
          <input
            type="date"
            className="border border-gray-300 rounded px-3 py-2"
            value={formData.date || ''}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <select
            className="border border-gray-300 rounded px-3 py-2"
            value={formData.format || ''}
            onChange={(e) => setFormData({ ...formData, format: e.target.value })}
            required
          >
            <option value="">🔢 Format wählen</option>
            <option value="5v5">5v5</option>
            <option value="3v3">3v3</option>
            <option value="1v1">1v1</option>
            <option value="3Point Shootout">3Point Shootout</option>
            <option value="Dunk Contest">Dunk Contest</option>
          </select>
          <select
            className="border border-gray-300 rounded px-3 py-2"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          >
            {nearbyCourts.length === 0 ? (
              <option value="">❌ Keine Plätze in deiner Nähe gefunden</option>
            ) : (
              <>
                <option value="">📍 Ort wählen</option>
                {nearbyCourts.map((court) => (
                  <option key={court.id} value={court.name}>
                    {court.name} ({court.city})
                  </option>
                ))}
              </>
            )}
          </select>
          <input
            type="number"
            min="1"
            placeholder="👥 Maximale Teilnehmer"
            className="border border-gray-300 rounded px-3 py-2"
            value={formData.maxParticipants || ''}
            onChange={(e) =>
              setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })
            }
            required
          />
       <input
  type="text"
  inputMode="numeric"
  placeholder="💰 Teilnahmegebühr in €"
  className="border border-gray-300 rounded px-3 py-2"
  value={formData.entryFee !== '' ? `${formData.entryFee} €` : ''}
  onChange={(e) => {
    const raw = e.target.value.replace(/[^\d.]/g, ''); // erlaubt 10.5 oder 10
    setFormData({ ...formData, entryFee: raw });
  }}
/>

          <input
            type="text"
            placeholder="🏆 Preise (optional)"
            className="border border-gray-300 rounded px-3 py-2"
            value={formData.prizes || ''}
            onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
          />
          <button
            type="submit"
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Speichern
          </button>
        </form>
      </div>
    )}

    {selectedTournament && (
      <TournamentDetailsModal
        tournament={selectedTournament}
        onClose={() => setSelectedTournament(null)}
      />
    )} 
    
    
  </div>
)}
{/* Nachrichten-Tab */}
{activeTab === 'messages' && (
  <div className="mt-6">
    <h2 className="text-xl font-semibold mb-4">📬 Spieler entdecken & Nachrichten senden</h2>
    <p className="text-gray-700 mb-4">
      Finde passende Spieler und starte direkt eine Unterhaltung!
    </p>

    {/* 🔍 Filterleiste */}
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Suche nach Spielername oder @username"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
        <select
          value={filterSkillLevel}
          onChange={(e) => setFilterSkillLevel(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="all">Alle Skill-Level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Professional">Professional</option>
        </select>
        <select
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="all">Alle Positionen</option>
          <option value="Guard">Guard</option>
          <option value="Forward">Forward</option>
          <option value="Center">Center</option>
          <option value="Flexible">Flexible</option>
        </select>
      </div>
    </div>

        {/* Spieleranzeige */}
        {loading ? (
  <div className="flex justify-center p-8">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
) : filteredPlayers.length === 0 ? (
  <div className="bg-white p-8 rounded-lg shadow text-center">
    <p className="text-gray-600">⚠️ Keine passenden Spieler gefunden.</p>
    <p className="text-sm text-gray-500 mt-2">Gesamt geladen: {players.length}</p>
    <p className="text-sm text-gray-500">Suchbegriff: "{searchQuery}"</p>
    <p className="text-sm text-gray-500">Skill: {filterSkillLevel}, Position: {filterPosition}</p>
  </div>
) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map((player) =>
              player.id !== user?.id ? (
                <div key={player.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-5">
                    <div className="flex space-x-4 items-center">
                      <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold">{player.username}{player.isPremium && (
    <PremiumBadge size="sm" showLabel className="ml-2" />)}</h3>
                        <p className="text-sm text-gray-600">
                          🏀 {player.position || 'Unbekannt'} · Level {player.skillLevel || 'Unbekannt'}
                        </p>
                        <p className="text-xs text-gray-400">
                          ⏳ Seit {new Date(player.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
  <Link
    to={`/nachrichten/new/${player.id}`}
    className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm border border-blue-600 transition"
  >
    Nachricht
  </Link>

  <button
    disabled={
      sentRequests.some(req => req.userId === player.id) ||
      friends.some(f => f.id === player.id)
    }
    onClick={() => handleAddFriend(player.id)}
    className={`px-3 py-1 rounded text-sm transition
      ${
        friends.some(f => f.id === player.id)
          ? 'bg-green-500 text-white cursor-default border border-green-600'
          : sentRequests.some(req => req.userId === player.id)
          ? 'bg-gray-400 text-white cursor-default opacity-60 border border-gray-400'
          : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-700'
      }
    `}
  >
    {friends.some(f => f.id === player.id)
      ? '✅ Befreundet'
      : sentRequests.some(req => req.userId === player.id)
      ? '⏳Warte'
      : '🤝ADD'}
  </button>

  <Link
    to={`/profile/${player.username}`}
    className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded text-sm border border-gray-300 transition"
  >
    Profil
  </Link>
</div>

                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    )}
      

      {/* 🔸 Werbebanner Platzhalter */}
      {!isPremium && <Werbeanzeige />}


      {/* 🔸 Spieler in deiner Nähe */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h2 className="text-md font-semibold text-blue-800 mb-2">📍 Spieler in deiner Nähe</h2>
        {userLocation && players.length > 0 ? (
          players
            .filter((p) => {
              if (!p.location || !p.location.latitude) return false;
              const dist = getDistance(
                userLocation.lat,
                userLocation.lng,
                p.location.latitude,
                p.location.longitude
              );
              return dist <= 50;
            })
            .map((p) => (
              <div key={p.id} className="text-sm text-gray-700 mb-1">
                {p.name} ({p.location?.city || 'Unbekannt'})
              </div>
            ))
        ) : (
          <p className="text-sm text-gray-500">Keine Standortdaten oder Spieler in der Nähe.</p>
        )}
      </div>

      </div> 
      
  );
};

export default CommunityPage;



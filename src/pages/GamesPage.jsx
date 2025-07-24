import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';


const GamesPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGameModal, setShowGameModal] = useState(false);
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [score, setScore] = useState([0, 0]); // [Team A Punkte, Team B Punkte]

  const [playerStats, setPlayerStats] = useState({});
  const [result, setResult] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultReadOnly, setResultReadOnly] = useState(false);
  const [userTeams, setUserTeams] = useState([]);
  const [selectedTeamAId, setSelectedTeamAId] = useState(null);
  const [selectedTeamBId, setSelectedTeamBId] = useState(null);
  const [opponentTeams, setOpponentTeams] = useState([]);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [unassignedPlayers, setUnassignedPlayers] = useState([]);




  // ✅ Modal State & Handler
  const [selectedGame, setSelectedGame] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    
     
     

    
  const openDetailsModal = async (game) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/games/${game.id}`);
      if (!res.ok) throw new Error('Spiel konnte nicht geladen werden');
  
      const data = await res.json();
      const fullGame = data.game;
  
      setSelectedGame(fullGame);
      setIsDetailsModalOpen(true);
  
      // Sicherstellen, dass der Score gesetzt wird
      const scoreValid = Array.isArray(fullGame.score) && fullGame.score.length === 2;
      setScore(scoreValid ? fullGame.score : [0, 0]);
  
    } catch (error) {
      console.error('❌ Fehler beim Laden des Spiels für Details:', error.message);
      alert('Details konnten nicht geladen werden.');
    }
  };
  

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedGame(null);
  };


  const openResultModal = async (game, readOnly = false) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/games/${game.id}`);
      if (!res.ok) throw new Error('Spiel konnte nicht geladen werden');
  
      const data = await res.json();
      const fullGame = data.game;
  
      // Lade verfügbare Teams für den Nutzer
      const teamsRes = await fetch(`${API_BASE_URL}/api/games/${user.id}/teams`);
      const teamData = await teamsRes.json();
      setUserTeams(teamData.myTeams || []);
      setOpponentTeams(teamData.opponentTeams || []);
  
      // Teilnehmer vorbereiten
      let participants = fullGame.participants?.filter(p => p.user) ?? [];
  
      const organizer = fullGame.organizer;
      const organizerId = organizer?.id;
  
      const organizerAlreadyIncluded = participants.some(p => p.user.id === organizerId);
  
      // Falls Organizer nicht unter participants: hinzufügen als unassigned
      if (organizerId && !organizerAlreadyIncluded) {
        participants.push({
          user: organizer,
          team: null
        });
      }
  
      // Team-Zuordnung aus participants extrahieren
      let teamAPlayers = fullGame.teamAPlayers ?? [];
let teamBPlayers = fullGame.teamBPlayers ?? [];
  
const unassignedPlayers = participants
.filter(p => !p.team)
.map(p => p.user);

// Falls keine Teams gesetzt wurden, automatisch verteilen
if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
const assignedIds = new Set([...teamAPlayers, ...teamBPlayers].map(p => p.id));
const remaining = unassignedPlayers.filter(p => !assignedIds.has(p.id));

const half = Math.ceil(remaining.length / 2);
teamAPlayers = [...teamAPlayers, ...remaining.slice(0, half)];
teamBPlayers = [...teamBPlayers, ...remaining.slice(half)];
}

      
  
      // ✅ Organizer doppelt absichern: nicht in A oder B? Dann zu A hinzufügen
      const allAssignedIds = [...teamAPlayers, ...teamBPlayers].map(p => p.id);
      if (organizer && !allAssignedIds.includes(organizer.id)) {
        teamAPlayers.push(organizer);
      }
  
      // Spielerstatistiken initialisieren
      const allPlayers = [...teamAPlayers, ...teamBPlayers];
      const initialStats = {};
      allPlayers.forEach(player => {
        const stat = fullGame.stats?.find(s => s.player?.id === player.id);
        initialStats[player.id] = {
          points: stat?.points ?? '',
          rebounds: stat?.rebounds ?? ''
        };
      });
  
      // States setzen
      setSelectedGame(fullGame);
      setTeamA(teamAPlayers);
      setTeamB(teamBPlayers);
      setPlayerStats(initialStats);
      setUnassignedPlayers(unassignedPlayers);

      // ⏳ Kleiner Timeout sorgt für sauberes Setzen, nachdem die Lists gerendert wurden

      setSelectedTeamAId(fullGame.teamAId ?? fullGame.teamA?.id ?? null);
      setSelectedTeamBId(fullGame.teamBId ?? fullGame.teamB?.id ?? null);
  

      
      setResult(fullGame.result ?? '');
  
      const scoreValid = Array.isArray(fullGame.score) && fullGame.score.length === 2;
      setScore(scoreValid ? fullGame.score : [0, 0]);
      
      setShowResultModal(true);
      setResultReadOnly(readOnly);
  
      // Debug (optional)
      console.log('📊 Team A:', teamAPlayers.map(p => p.username));
      console.log('📊 Team B:', teamBPlayers.map(p => p.username));
    } catch (error) {
      console.error('❌ Fehler beim Laden des Spiels oder Teams:', error.message);
      alert('Fehler beim Laden des Spiels oder der Teams.');
    }
  };
  
  
  
  // Effekt, der reagiert, sobald ein Spiel ausgewählt wurde
useEffect(() => {
  if (!selectedGame) return;

  // Setze Team-IDs aus Game-Daten
  //const teamAId = selectedGame.teamAId ?? selectedGame.teamA?.id ?? null;
  //const teamBId = selectedGame.teamBId ?? selectedGame.teamB?.id ?? null;

 //setSelectedTeamAId(teamAId);
  //setSelectedTeamBId(teamBId);
}, [selectedGame]);


  
  
  
const movePlayer = (player, targetTeam) => {
  if (targetTeam === 'A') {
    setTeamB(prev => prev.filter(p => p.id !== player.id));
    setUnassignedPlayers(prev => prev.filter(p => p.id !== player.id));
    setTeamA(prev => [...prev, player]);
  } else if (targetTeam === 'B') {
    setTeamA(prev => prev.filter(p => p.id !== player.id));
    setUnassignedPlayers(prev => prev.filter(p => p.id !== player.id));
    setTeamB(prev => [...prev, player]);
  }

  setPlayerStats(prev => ({
    ...prev,
    [player.id]: prev[player.id] || { points: '', rebounds: '' }
  }));
};

  const updatePlayerStat = (playerId, stat, value) => {
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [stat]: value,
      },
    }));
  };
  


  const saveGameResult = async () => {
    if (!selectedGame) return;
  
    const formattedScore = Array.isArray(score) && score.length === 2
      ? [parseInt(score[0]) || 0, parseInt(score[1]) || 0]
      : [0, 0];
  
    // Organizer sicherstellen
    const organizerId = selectedGame.organizer?.id;
    const allPlayerIds = [...teamA, ...teamB].map(p => p.id);
    const organizer = selectedGame.organizer;
  
    if (organizerId && !allPlayerIds.includes(organizerId)) {
      teamA.push(organizer); // Oder teamB je nach Logik
    }
  
    const body = {
      result: result || null,
      score: formattedScore,
      teamA: teamA.map(player => player.id),
      teamB: teamB.map(player => player.id),
      stats: playerStats,
      teamAId: selectedTeamAId,
      teamBId: selectedTeamBId
    };
  
    try {
      const res = await fetch(`${API_BASE_URL}/api/games/${selectedGame.id}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      if (!res.ok) {
        const errText = await res.text();
        console.error('❌ Fehler beim Speichern (Backend-Antwort):', errText);
        throw new Error('Fehler beim Speichern des Spielergebnisses.');
      }
  
      // Spiel nach dem Update erneut laden
      const updatedRes = await fetch(`${API_BASE_URL}/api/games/${selectedGame.id}`);
  
      if (!updatedRes.ok || !updatedRes.headers.get('content-type')?.includes('application/json')) {
        const fallback = await updatedRes.text();
        console.error('⚠️ Unerwartete Antwort vom Server:', fallback);
        throw new Error('Ungültige Antwort beim Nachladen des Spiels.');
      }
  
      const updatedData = await updatedRes.json();
      const updatedGame = updatedData.game || updatedData;
  
      const parsedScore = Array.isArray(updatedGame.score) ? updatedGame.score : [0, 0];
  
      setScore(parsedScore);
      setGames(prev => prev.map(g => g.id === updatedGame.id ? updatedGame : g));
      setSelectedGame(updatedGame);
      // Lösung: Modal erneut mit aktualisierten Daten öffnen
await openResultModal(updatedGame, resultReadOnly); // Oder true/false je nach Kontext
      setSelectedGame(null);
    } catch (error) {
      console.error('❌ Fehler beim Speichern:', error.message);
      alert('Fehler beim Speichern des Ergebnisses. Bitte versuche es erneut.');
    }
  };
  
  
  
  
  
  

  
  

  const leaveGame = async (gameId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/${gameId}/leave/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        console.error('❌ Fehler beim Austreten vom Spiel');
        return;
      }
  
      // 🔄 Spiel nach dem Austritt erneut aus dem Backend abrufen
      const updatedRes = await fetch(`${API_BASE_URL}/api/games/${gameId}`);
      const updatedData = await updatedRes.json();
  
      // ✅ Stelle sicher, dass die Antwortstruktur korrekt ist
      const updatedGame = updatedData.game;
  
      // 🧠 Lokale Liste ersetzen – keine Felder überschreiben
      setGames(prevGames =>
        prevGames.map(game =>
          game.id === updatedGame.id ? updatedGame : game
        )
      );
  
    } catch (error) {
      console.error('❌ Netzwerkfehler beim Austreten:', error);
    }
  };

 
  

  // Form state for creating a new game
  const [newGame, setNewGame] = useState({
    title: '',
    date: '',
    time: '',
    courtId: '',
    maxPlayers: 10,
    skillLevel: 'All Levels',
    description: '',
    isPublic: true
  });

  const [courts, setCourts] = useState([]);

  
  

   // 🏀 globales Fetch für Spiele

   const fetchGames = async () => {
    setLoading(true);
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/games?tab=${activeTab}&userId=${user.id}`);
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.message || 'Fehler beim Laden der Spiele');
  
      // 🎯 KEINE Überschreibung von game.players oder anderen Feldern
      const mappedGames = data.games.map(game => {
        const scoreString = game.scoreDisplay
          ? Array.isArray(game.scoreDisplay)
            ? `${game.score[0]} : ${game.scoreDisplay[1]}`
            : typeof game.score === 'object' && game.scoreDisplay.teamA !== undefined && game.scoreDisplay.teamB !== undefined
            ? `${game.scoreDisplay.teamA} : ${game.scoreDisplay.teamB}`
            : typeof game.scoreDisplay === 'string'
            ? game.scoreDisplay
            : null
          : null;

          
      
        return {
          ...game,
          scoreFormatted: scoreString ?? '–', // 👈 Eigene Anzeigehilfe fürs UI
          playerSummary: {
            joined: Array.isArray(game.players) ? game.players.length : 0,
            max: game.maxPlayers,
            names: Array.isArray(game.players) ? game.players.map(p => p.username) : []
          }
        };
      });
      
  
      setGames(mappedGames); // ✅ Nur zusätzliche Info, kein Überschreiben!
    } catch (error) {
      console.error('❌ Spiele-Fehler:', error);
      setGames([]);
     
    }
  
    setLoading(false);
  };
  
    // 📦 Spiele neu laden, wenn activeTab sich ändert
      useEffect(() => {
      fetchGames();
      fetchCourts();    // ⬅️ das fehlt eventuell
      setIsDetailsModalOpen(false);
      setShowResultModal(false);
      setSelectedGame(null);
      setTeamA([]);
      setTeamB([]);
      setPlayerStats({});
      setResult('');
       }, [activeTab]);
  
  const handleCreateGame = async (e) => {
    e.preventDefault();
  
    if (!user?.id) {
      alert('Du musst eingeloggt sein, um ein Spiel zu erstellen.');
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newGame.title,
          date: newGame.date,
          time: newGame.time,
          courtId: Number(newGame.courtId),
          maxPlayers: Number(newGame.maxPlayers),
          skillLevel: newGame.skillLevel,
          description: newGame.description,
          isPublic: newGame.isPublic,
          organizerId: Number(user.id) // ✅ Jetzt garantiert gültig
        })
      });
  
      if (!response.ok) throw new Error('Spiel konnte nicht erstellt werden');
  
      await fetchGames(); // 💡 Sicherstellen, dass diese Funktion global verfügbar ist
  
      setNewGame({
        title: '',
        date: '',
        time: '',
        courtId: '',
        maxPlayers: 10,
        skillLevel: 'All Levels',
        description: '',
        isPublic: true
      });
  
      setShowGameModal(false);
    } catch (error) {
      console.error('❌ Fehler beim Erstellen des Spiels:', error);
      alert('Fehler beim Erstellen des Spiels');
    }
  };
  

  const fetchCourts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courts`);
      const data = await res.json();
      setCourts(data.courts ?? []);
    } catch (err) {
      console.error('❌ Fehler beim Laden der Courts:', err);
      setCourts([]);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewGame(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const joinGame = async (gameId) => {
    if (!user?.id) {
      alert('Bitte melde dich an, um einem Spiel beizutreten.');
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/${gameId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id }) // falls dein Backend das erwartet
      });
  
      if (!response.ok) throw new Error('Beitritt fehlgeschlagen');
  
      await fetchGames(); // Aktualisiere die Game-Liste
    } catch (error) {
      console.error('❌ Fehler beim Beitreten:', error);
      alert('Beitritt nicht möglich');
    }
  };
  
  
  const cancelGame = async (gameId) => {
    if (!user?.id) {
      alert('Bitte melde dich an, um Spiele zu verwalten.');
      return;
    }
  
    const confirmed = window.confirm('Willst du dieses Spiel wirklich absagen?');
    if (!confirmed) return;
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/${gameId}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) throw new Error('Spiel konnte nicht gelöscht werden');
  
      await fetchGames(); // Aktualisieren nach Absage
    } catch (error) {
      console.error('❌ Fehler beim Löschen:', error);
      alert('Absage fehlgeschlagen');
    }
  };
  


  
  

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Basketball Games</h1>
        <button
          onClick={() => setShowGameModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Organize Game
        </button>
      </div>
      
      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === 'upcoming'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming Games
          </button>
          <button
            onClick={() => setActiveTab('my-games')}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === 'my-games'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Games
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === 'past'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Past Games
          </button>
        </nav>
      </div>
      
      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
{/* Upcoming & My Games Tabs */}
{(activeTab === 'upcoming' || activeTab === 'my-games') && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {games
      .filter(game => {
        if (activeTab === 'my-games') {
          return game.organizer?.id === user?.id;
        }
        return true; // zeige alle bei "upcoming"
      })
      .map(game => {
        
        return (
          <div key={game.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="p-5">
            <h3
  className="font-bold text-lg mb-1 cursor-pointer hover:text-blue-600"
  onClick={() => setSelectedGame(game)}
>
  {game.title}
</h3>

              <p className="text-xs text-gray-500 italic mt-1">
                {game.players?.names?.length > 0
                  ? `Spieler: ${game.players.names.join(', ')}`
                  : 'Noch keine Teilnehmer'}
              </p>

              <p className="text-gray-500 text-sm">
                Organized by: {game.organizer?.username}
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">{formatDate(game.date)} um {game.time}</span>
                </div>

                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <button
  onClick={() => {
    setSelectedCourt(game.court);
    setShowMapModal(true);
  }}
  className="text-blue-600 underline hover:text-blue-800 text-sm"
>
  {game.court?.name || 'Unbekannter Court'}
</button>

                </div>

                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  </svg>
                  <span className="text-gray-600">
                    {game.players?.joined ?? 0} / {game.maxPlayers ?? 0} Spieler
                  </span>
                </div>

                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  </svg>
                  <span className="text-gray-600">{game.skillLevel}</span>
                </div>
              </div>
              {selectedGame && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
      <button
        onClick={() => setSelectedGame(null)}
        className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
      >
        ✖
      </button>
      <h2 className="text-xl font-bold mb-2">{selectedGame.title}</h2>
      <p className="text-sm text-gray-500 mb-1">
        📅 {formatDate(selectedGame.date)} um {selectedGame.time}
      </p>
      <p className="text-sm text-gray-500 mb-1">
        📍 Court: {selectedGame.court?.name || 'Unbekannter Court'}
      </p>
      <p className="text-sm text-gray-500 mb-1">
        🏠 Adresse: {selectedGame.court?.address || 'Keine Adresse hinterlegt'} in {selectedGame.court?.city}
      </p>
      <p className="text-sm text-gray-500 mb-1">
        👤 Organisiert von: {selectedGame.organizer?.username}
      </p>
      <p className="text-sm text-gray-500 mb-1">
        🎯 Skill Level: {selectedGame.skillLevel}
      </p>
      <p className="text-sm text-gray-500">
        👥 Teilnehmer: {selectedGame.players?.joined ?? 0} / {selectedGame.maxPlayers ?? 0}
      </p>
    </div>
  </div>
)}


              <div className="mt-6">
              {activeTab === 'upcoming' ? (
  game.joined ? (
    <button
      onClick={() => leaveGame(game.id)}
      className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
    >
      Teilnahme zurückziehen
    </button>
  ) : (
    <button
      onClick={() => joinGame(game.id)}
      disabled={game.isFull}
      className={`w-full py-2 px-4 rounded transition ${
        game.isFull
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {game.isFull ? 'Spiel ist voll' : 'Join Game'}
    </button>
  )
) : game.isOrganizer ? (

                  <div className="flex space-x-2">
                    <Link
                      to={`/games/${game.id}/manage`}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700 transition"
                    >
                      Manage
                    </Link>
                    <button
                      onClick={() => cancelGame(game.id)}
                      className="flex-1 border border-red-600 text-red-600 py-2 px-4 rounded hover:bg-red-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : typeof game.joined === 'boolean' ? (
                  game.joined ? (
                    <button disabled className="w-full bg-gray-300 text-gray-600 py-2 px-4 rounded cursor-not-allowed">
                      Bereits beigetreten
                    </button>
                  ) : (
                    <button
                      onClick={() => joinGame(game.id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                    >
                      Join Game
                    </button>
                  )
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
  </div>
)}




          
{/* Past Games Tab */}
{activeTab === 'past' && (
  <div className="overflow-x-auto bg-white rounded-lg shadow">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
      {games
  .filter(g => new Date(g.date) < new Date())
  .sort((a, b) => new Date(b.date) - new Date(a.date)) // 🔽 Neueste Spiele zuerst
  .map((game) => {
            const hasResult = !!game.result;
            const scoreArray = Array.isArray(game.score) && game.score.length === 2 ? game.score : null;
            const scoreDisplay = scoreArray ? `${scoreArray[0]} : ${scoreArray[1]}` : null;

            

            return (
              <tr key={game.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(game.date).toLocaleDateString()}<br />
                  <span className="text-xs">{game.time}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{game.title}</div>
                  <div className="text-sm text-gray-500">by {game.organizer?.username || 'Unbekannt'}</div>
                </td>
                <td className="px-6 py-4 text-sm">
  <button
    onClick={() => {
      setSelectedCourt(game.court);
      setShowMapModal(true);
    }}
    className="text-blue-600 underline hover:text-blue-800"
  >
    {game.court?.name || 'Unbekannter Court'}
  </button>
</td>

                <td className="px-6 py-4 text-sm">
                  {hasResult ? (
                    <>
                      <span className="text-gray-800 font-medium">{game.result}</span>
                      {scoreDisplay && (
                        <span className="text-gray-500"> ({scoreDisplay})</span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">Noch kein Ergebnis</span>
                  )}
                </td>
                <td className="px-6 py-4 space-x-2 text-sm">
                  {user?.id === game.organizer?.id && !hasResult ? (
                    <button
                      onClick={() => openResultModal(game)}
                      className="text-blue-600 hover:text-red-900 underline"
                    >
                     <b> Ergebnis eintragen</b>
                    </button>
                  ) : hasResult ? (
                    <button
                      onClick={() => openResultModal(game, true)}
                      className="text-blue-600 hover:text-blue-900 underline"
                    >
                      Statisiken ansehen
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs italic">Kein Zugriff</span>
                  )}

                  <button
                    onClick={() => openDetailsModal(game)}
                    className="text-green-600 hover:text-green-900 underline"
                  >
                    Hoop Detail
                  </button>
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  </div>
)}

{showMapModal && selectedCourt && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-xl relative">
      <button
        onClick={() => setShowMapModal(false)}
        className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
      >
        ✖
      </button>
      <h2 className="text-lg font-bold mb-2">{selectedCourt.name}</h2>
      <p className="text-sm text-gray-500 mb-3">{selectedCourt.address}</p>
      
      <iframe
        width="100%"
        height="300"
        frameBorder="0"
        style={{ border: 0 }}
        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCltQmhBLGhklgrdMaiIm4Om-zOFQDMfXI&q=${encodeURIComponent(selectedCourt.address || '')}`}
        allowFullScreen
      ></iframe>
    </div>
  </div>
)}



{/* Ergebnis Modal */}
{showResultModal && selectedGame && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
      <button onClick={() => setShowResultModal(false)} className="absolute top-2 right-2 text-gray-600 hover:text-red-500">✖</button>

      <h2 className="text-xl font-bold mb-4">Ergebnis für {selectedGame.title}</h2>

      <div className="grid grid-cols-2 gap-6 mb-4">
  {/* Team A */}
  <div>
    <h3 className="font-semibold mb-2">Team A</h3>
    <ul className="space-y-1">
    {teamA.map(player => (
  <li key={player.id + '-A'} className="flex justify-between items-center text-sm bg-gray-100 px-2 py-1 rounded">
    {player.username}
    {!resultReadOnly && (
      <button onClick={() => movePlayer(player, 'B')} className="text-blue-500 text-xs">→ Team B</button>
    )}
  </li>
))}

    </ul>
  </div>

  {/* Team B */}
  <div>
    <h3 className="font-semibold mb-2">Team B</h3>
    <ul className="space-y-1">
    {teamB.map(player => (
  <li key={player.id + '-B'} className="flex justify-between items-center text-sm bg-gray-100 px-2 py-1 rounded">
    {player.username}
    {!resultReadOnly && (
      <button onClick={() => movePlayer(player, 'A')} className="text-blue-500 text-xs">← Team A</button>
    )}
  </li>
))}

    </ul>
  </div>
</div> 
{/* Unassigned Players */}
{!resultReadOnly && unassignedPlayers.length > 0 && (
  <div className="mb-4">
    <h3 className="font-semibold mb-2">Unzugewiesene Spieler</h3>
    <ul className="space-y-1">
      {unassignedPlayers.map(player => (
        <li
          key={player.id + '-unassigned'}
          className="flex justify-between items-center text-sm bg-yellow-50 px-2 py-1 rounded"
        >
          {player.username}
          <div className="space-x-2">
            <button
              onClick={() => movePlayer(player, 'A')}
              className="text-blue-600 text-xs"
            >
              Zu Team A
            </button>
            <button
              onClick={() => movePlayer(player, 'B')}
              className="text-green-600 text-xs"
            >
              Zu Team B
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
)}

<div className="mb-4">
  <label className="block text-sm font-medium mb-1">Team A auswählen</label>
  <select
    value={selectedTeamAId ?? ''}
    onChange={(e) => {
      const teamId = parseInt(e.target.value);
      setSelectedTeamAId(teamId);

      const selectedTeam = userTeams.find(t => t.id === teamId);
      const selectedPlayers = selectedTeam?.players ?? [];

      const newIds = selectedPlayers.map(p => p.id);
      const organizerId = selectedGame.organizer?.id;
      const organizer = selectedGame.organizer;

      // Spieler behalten, die nicht ersetzt werden oder der Organizer sind
      const retainedPlayers = teamA.filter(
        p => !userTeams.some(t => t.players.some(tp => tp.id === p.id)) || p.id === organizerId
      );
      

      // Neue Spieler hinzufügen (nicht doppelt)
      const currentIds = [...teamA, ...teamB].map(p => p.id);
      const filteredNew = selectedPlayers.filter(p => !currentIds.includes(p.id));

      let nextTeamA = [...retainedPlayers, ...filteredNew];

      // Organizer hinzufügen, falls noch nicht enthalten
      if (organizer && !nextTeamA.some(p => p.id === organizer.id)) {
        nextTeamA.push(organizer);
      }

      setTeamA(nextTeamA);
    }}
    disabled={resultReadOnly}
    className="w-full border rounded px-3 py-2 text-sm"
  >
    <option value="">– Team auswählen –</option>
    {userTeams.map(team => (
      <option key={team.id} value={team.id}>
        {team.name}
      </option>
    ))}
  </select>
</div>



<div className="mb-4">
  <label className="block text-sm font-medium mb-1">Team B auswählen</label>
  <select
    value={selectedTeamBId ?? ''}
    onChange={(e) => {
      const teamId = parseInt(e.target.value);
      setSelectedTeamBId(teamId);

      const selectedTeam = opponentTeams.find(t => t.id === teamId);
      const selectedPlayers = selectedTeam?.players ?? [];

      const newIds = selectedPlayers.map(p => p.id);
      const organizerId = selectedGame.organizer?.id;
      const organizer = selectedGame.organizer;

      // Spieler behalten, die nicht ersetzt werden oder Organizer sind
      const retainedPlayers = teamB.filter(
        p => !newIds.includes(p.id) || p.id === organizerId
      );

      // Neue Spieler hinzufügen (nicht doppelt)
      const currentIds = [...teamA, ...teamB].map(p => p.id);
      const filteredNew = selectedPlayers.filter(p => !currentIds.includes(p.id));

      let nextTeamB = [...retainedPlayers, ...filteredNew];

      // Organizer hinzufügen, falls nötig (nur falls er mal zu Team B zugewiesen wurde)
      if (organizer && !nextTeamB.some(p => p.id === organizer.id)) {
        const organizerWasInB = selectedGame.participants?.some(
          p => p.user?.id === organizer.id && p.team === 'B'
        );
        if (organizerWasInB) {
          nextTeamB.push(organizer);
        }
      }

      setTeamB(nextTeamB);
    }}
    disabled={resultReadOnly}
    className="w-full border rounded px-3 py-2 text-sm"
  >
    <option value="">– Team auswählen –</option>
    {opponentTeams.map(team => (
      <option key={team.id} value={team.id}>
        {team.name}
      </option>
    ))}
  </select>
</div>




<div className="mb-3">
  <label className="block text-sm font-medium mb-1">Ergebnis (Team A : Team B)</label>
  <div className="flex gap-2">
    <input
      type="number"
      value={score[0]}
      onChange={(e) => {
        const updated = [...score];
        updated[0] = parseInt(e.target.value || 0);
        setScore(updated);
      }}
      disabled={resultReadOnly}
      className="w-full border rounded px-3 py-2 text-sm"
      placeholder="Team A"
    />
    <span className="self-center">:</span>
    <input
      type="number"
      value={score[1]}
      onChange={(e) => {
        const updated = [...score];
        updated[1] = parseInt(e.target.value || 0);
        setScore(updated);
      }}
      disabled={resultReadOnly}
      className="w-full border rounded px-3 py-2 text-sm"
      placeholder="Team B"
    />
  </div>
</div>

<div className="mb-4">
  <label className="block text-sm font-medium mb-1">Spielausgang</label>
  <select
    value={result}
    onChange={(e) => setResult(e.target.value)}
    disabled={resultReadOnly}
    className="w-full border rounded px-3 py-2 text-sm"
  >
    <option value="">Wähle...</option>
    <option value="Team A gewinnt">Team A gewinnt</option>
    <option value="Team B gewinnt">Team B gewinnt</option>
    <option value="Unentschieden">Unentschieden</option>
  </select>
</div>

{/* Spielerstatistiken */}
<div className="mb-4">
  <label className="block text-sm font-medium mb-1">Spielerstatistiken (optional)</label>
  {teamA.concat(teamB).map(player => (
    <div key={player.id} className="mb-2 flex gap-2 items-center text-sm">
      <span className="w-24">{player.username}</span>
      <input
        type="number"
        placeholder="Punkte"
        value={playerStats[player.id]?.points ?? ''}
        onChange={e => updatePlayerStat(player.id, 'points', e.target.value)}
        disabled={resultReadOnly}
        className="border px-2 py-1 rounded w-24"
      />
      <input
        type="number"
        placeholder="Rebounds"
        value={playerStats[player.id]?.rebounds || ''}
        onChange={e => updatePlayerStat(player.id, 'rebounds', e.target.value)}
        disabled={resultReadOnly}
        className="border px-2 py-1 rounded w-24"
      />
    </div>
  ))}
</div>

{!resultReadOnly && (
  <div className="flex justify-end">
    <button
      onClick={saveGameResult}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Ergebnis speichern
    </button>
  </div>
)}

    </div>
  </div>
)}

{isDetailsModalOpen && selectedGame && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl relative">
      <button
        onClick={closeDetailsModal}
        className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
      >
        ✖
      </button>
      <h2 className="text-xl font-bold mb-4">Details zu {selectedGame.title}</h2>
      <p><b>Ort:</b> {selectedGame.court?.name}</p>
      <p>
      <b>Ergebnis:</b> {selectedGame.result 
    ? (() => {
        const s = selectedGame.score;
        if (Array.isArray(s) && s.length === 2) {
          return `${selectedGame.result} (${s[0]} : ${s[1]})`;
        }
        return selectedGame.result;
      })()
    : 'Noch kein Ergebnis'}
</p>
 {/* Weitere Inhalte hier */}
      {selectedGame.teamA && (
  <div className="mb-4">
    <h3 className="font-semibold text-lg mb-1">🏅 Team A: {selectedGame.teamA.name}</h3>
    <ul className="list-disc list-inside text-sm mt-2">
      {(selectedGame.teamA.players ?? []).map(player => (
        <li key={player.id}>{player.username}</li>
      ))}
    </ul>
  </div>
)}

{selectedGame.teamB && (
  <div className="mb-4">
    <h3 className="font-semibold text-lg mb-1">🏅 Team B: {selectedGame.teamB.name}</h3>
    <ul className="list-disc list-inside text-sm mt-2">
      {(selectedGame.teamB.players ?? []).map(player => (
        <li key={player.id}>{player.username}</li>
      ))}
    </ul>
  </div>
)}
    </div>
  </div>
)}



          
          {/* Empty State */}
          {games.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No games found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'upcoming' 
                  ? "There are no upcoming games scheduled at this moment." 
                  : activeTab === 'my-games' 
                    ? "You haven't joined any games yet." 
                    : "You haven't played any games yet."}
              </p>
              {activeTab === 'upcoming' && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowGameModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create a Game
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      
      
      {/* Create Game Modal */}
      {showGameModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Create New Game</h3>
                <button 
                  onClick={() => setShowGameModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateGame} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Game Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newGame.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={newGame.date}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={newGame.time}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="courtId" className="block text-sm font-medium text-gray-700">Court</label>
                  <select
                    id="courtId"
                    name="courtId"
                    value={newGame.courtId}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a court</option>
                    {courts.map(court => (
                      <option key={court.id} value={court.id}>{court.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700">Maximum Players</label>
                    <input
                      type="number"
                      id="maxPlayers"
                      name="maxPlayers"
                      min="2"
                      max="30"
                      value={newGame.maxPlayers}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700">Skill Level</label>
                    <select
                      id="skillLevel"
                      name="skillLevel"
                      value={newGame.skillLevel}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="All Levels">All Levels</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={newGame.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any additional information about the game..."
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={newGame.isPublic}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                    Make this game public (visible to everyone)
                  </label>
                </div>
                
                <div className="flex justify-end mt-6 space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowGameModal(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Game
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  ); 
};

export default GamesPage;
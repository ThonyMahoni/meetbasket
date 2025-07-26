import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { FaFutbol, FaStar, FaUserPlus,FaBasketballBall,  FaLock, FaUsers, FaCheck, FaPuzzlePiece } from 'react-icons/fa';
import PremiumFeatureMessage from '../components/common/PremiumFeatureMessage';
import PremiumBadge from '../components/common/PremiumBadge';
import usePremiumStatus from '../hooks/usePremiumStatus';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // Basis-URL deines Backends


const Home = () => {
  const { user } = useAuth();
  const {
    userLocation,
    setUserLocation,
    locationPermissionGranted,
    requestLocationPermission,
    calculateDistance,
  } = useLocation();

  const [upcomingGames, setUpcomingGames] = useState([]);
  const [nearbyCourts, setNearbyCourts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
 const { isPremium, daysRemaining } = usePremiumStatus();
 const [badges, setBadges] = useState([]);

  // Standort abrufen und korrekt setzen
  useEffect(() => {
    if (locationPermissionGranted) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (error) => {
          console.error('Fehler beim Abrufen des Standorts', error);
        }
      );
    }
  }, [locationPermissionGranted, setUserLocation]);
  


  
  // Daten neu laden wenn User oder Location sich ändern
  useEffect(() => {
    fetchHomeData();
  }, [user, userLocation]);

  // Initiale Berechtigungen anfragen
  useEffect(() => {
    const initialize = async () => {
      try {
        if (!locationPermissionGranted) {
          await requestLocationPermission();
        }
      } catch (err) {
        console.error('Initialisierungsfehler:', err);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [locationPermissionGranted, requestLocationPermission]);

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetch(`${API_BASE_URL}/api/profile/${user.id}`)
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(console.error);
    }
  }, [user?.id]);
  

  // Backend-Daten holen und Courts nach Entfernung filtern
  const fetchHomeData = async () => {
    setLoading(true);
    try {
      // Spiele laden
      const gameRes = await fetch(`${API_BASE_URL}/api/games/basic`);
      if (!gameRes.ok) throw new Error('Spiele konnten nicht geladen werden');
      const gameJson = await gameRes.json();
      const allGames = Array.isArray(gameJson) ? gameJson : gameJson.games;
      if (!Array.isArray(allGames)) throw new Error('Games-Response ist kein Array');

      const userId = user?.id;
      const allGamesWithStatus = allGames.map((game) => {
        const joined = game.participants?.some((p) => p.user?.id === userId) || false;
        const isFull = (game.participants?.length || 0) >= (game.maxParticipants || 10);
        return { ...game, joined, isFull };
      });

      const futureGames = allGamesWithStatus.filter(
        (g) => new Date(g.date) > new Date()
      );
      const selectedGames = futureGames.sort(() => 0.5 - Math.random()).slice(0, 3);
      setUpcomingGames(selectedGames);

      // Courts laden
      const courtRes = await fetch(`${API_BASE_URL}/api/courts`);
      if (!courtRes.ok) throw new Error('Courts konnten nicht geladen werden');
      const courtJson = await courtRes.json();
      const courts = Array.isArray(courtJson) ? courtJson : courtJson.courts;

      let courtsWithDistance = courts;

      if (
        userLocation &&
        typeof userLocation.latitude === 'number' &&
        typeof userLocation.longitude === 'number'
      ) {
        courtsWithDistance = courts
          .filter(
            (court) =>
              typeof court.latitude === 'number' &&
              typeof court.longitude === 'number' &&
              !(court.latitude === 0 && court.longitude === 0)
          )
          .map((court) => {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              court.latitude,
              court.longitude
            );
           
            return { ...court, distance };
          })
          .sort((a, b) => a.distance - b.distance);
      }

      // Nur die 3 nächsten Courts anzeigen
      setNearbyCourts(courtsWithDistance.slice(0, 3));

      // Aktivität laden
      const activityUrl = user?.id
  ? `${API_BASE_URL}/api/activity/home?currentUserId=${user.id}`
  : `${API_BASE_URL}/api/activity/home`;

const activityRes = await fetch(activityUrl);

      if (!activityRes.ok) throw new Error('Recent Activity konnte nicht geladen werden');
      const activityJson = await activityRes.json();
     

      if (Array.isArray(activityJson.recentActivity)) {
        setRecentActivity(activityJson.recentActivity.slice(0, 5));
      } else {
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Home-Daten:', error);
      setUpcomingGames([]);
      setNearbyCourts([]);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };
  

  const joinGame = async (gameId) => {
    try {
      if (!user || !user.id) throw new Error('Benutzer nicht eingeloggt');

      const res = await fetch(`${API_BASE_URL}/api/games/basic/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) throw new Error('Fehler beim Beitreten');

      const updatedGame = await res.json();

      setUpcomingGames((prevGames) =>
        prevGames.map((game) => (game.id === updatedGame.id ? updatedGame : game))
      );

      alert('Du hast dem Spiel erfolgreich beigetreten.');
    } catch (error) {
      console.error('Fehler beim Beitreten:', error);
      alert(error.message || 'Fehler beim Beitreten des Spiels.');
    }
  };

  const leaveGame = async (gameId) => {
    try {
      if (!user || !user.id) throw new Error('Benutzer nicht eingeloggt');

      const res = await fetch(`${API_BASE_URL}/api/games/basic/${gameId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) throw new Error('Fehler beim Austreten');

      const updatedGame = await res.json();

      setUpcomingGames((prevGames) =>
        prevGames.map((game) => (game.id === updatedGame.id ? updatedGame : game))
      );

      alert('Du hast die Teilnahme zurückgezogen.');
    } catch (error) {
      console.error('Fehler beim Austreten:', error);
      alert(error.message || 'Fehler beim Austreten.');
    }
  };
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
  
    if (diffMin < 1) return 'Gerade eben';
    if (diffMin < 60) return `${diffMin} Min.`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} Std.`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD} Tag(e)`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Kein Datum';
    
    const date = new Date(dateString);
    if (isNaN(date)) return 'Ungültiges Datum';
  
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }


  return (
    <div className="pb-8">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-md p-6 mb-8 text-white">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
    {/* Linke Seite: Begrüßung */}
    <div>
      <h1 className="text-2xl font-bold mb-2">
        Willkommen zurück, {profile?.name || 'Player'}!{profile?.isPremium && (
            <PremiumBadge size="sm" showLabel className="ml-2" />
          )}
      </h1>
      <p className="text-blue-100 mb-4">
        {locationPermissionGranted
          ? `Basierend auf deinem Standort gibt es ${nearbyCourts.length} Plätze und ${upcomingGames.length} Spiele in deiner Nähe.`
          : 'Aktiviere den Standort, um Plätze und Spiele in deiner Nähe zu finden.'}
      </p>
   
      
      {!locationPermissionGranted && (
  <>
    <button
      className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50"
      onClick={requestLocationPermission}
    >
      Standort aktivieren
    </button>
    <p className="text-sm text-white mt-2">
      Falls du die Standortanfrage zuvor abgelehnt hast, aktiviere den Zugriff manuell in deinem Browser.
    </p>
  </>
)}


    </div>

    {/* Rechte Seite: Profilinfos */}
<div className="mt-4 md:mt-0 flex flex-col md:items-end items-start">
  <div className="flex items-center mb-2">
    {/* Profilbild */}
    {profile?.imageUrl ? (
      <img
        src={`${BACKEND_URL}${profile.avatarUrl}`}  // Wichtig: Vollständiger Pfad zum Bild
        alt="Profilbild"
        className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-white"
      />
    ) : (
      <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-lg mr-3">
        {profile?.name?.charAt(0).toUpperCase() || 'P'}
      </div>
    )}

    {/* Level und Position */}
    <div>
      <p className="text-sm">Level: {profile?.skillLevel || 'Unbekannt'}</p>
      <p className="text-sm">Position: {profile?.position || 'Keine Angabe'}</p>
    </div>
  </div>

  <Link
    to="/profile"
    className="text-sm text-blue-200 hover:text-white transition"
  >
    Profil anzeigen →
  </Link>
</div>

  </div>
</section>
{!isPremium && (
  <div className="mt-4">
    <PremiumFeatureMessage
      title="Nur für Premium-Mitglieder"
      message="Mit Premium kannst du unbegrenzt Freundschaftsanfragen senden und exklusive Funktionen nutzen."
    />
  </div>
)}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Games */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold">Bevorstehendes Spiels</h2>
              <Link
                to="/games"
                className="text-blue-600 text-sm hover:text-blue-800 transition"
              >
                Alle anzeigen →
              </Link>
            </div>
            <div className="p-4">
              {upcomingGames.length > 0 ? (
                <div className="grid gap-4">
                  {upcomingGames.map((game) => (
                    <div
                      key={game.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{game.title}</h3>
                          <p className="text-gray-600 text-sm">
                            {game.court?.name || 'Unknown court'}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {formatDate(game.date)} um {game.time}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              ></svg>
                              {game.players?.joined ?? 0} / {game.maxPlayers ?? 0} Spieler
                            </span>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {game.skillLevel}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 md:mt-0">
  {game.isOrganizer ? (
    <div className="flex space-x-2">
      <Link
        to={`/games/${game.id}/manage`}
        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700 transition"
      >
       Verwalten
      </Link>
      <button
        onClick={() => cancelGame(game.id)}
        className="flex-1 border border-red-600 text-red-600 py-2 px-4 rounded hover:bg-red-50 transition"
      >
        Abbrechen
      </button>
    </div>
  ) : typeof game.joined === 'boolean' ? (
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
  ) : null}
</div>


                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">Keine kommenden Spiele gefunden.</p>
                  <Link
                    to="/games"
                    className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                  >
                    Spiel Organisieren
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-8">
          {/* Nearby Courts */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold">Courts in der Nähe</h2>
              <Link
                to="/courts"
                className="text-blue-600 text-sm hover:text-blue-800 transition"
              >
                Alle anzeigen →
              </Link>
            </div>
            <div className="p-4">
              {nearbyCourts.length > 0 ? (
                <div className="space-y-4">
                  {nearbyCourts.map((court) => (
                    <div
                      key={court.id}
                      className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <h3 className="font-medium text-sm">{court.name}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500 flex items-center mr-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                            </svg>
                            {typeof court.distance === 'number'
  ? `${(court.distance * 1000).toFixed(1)} km`
  : '–'}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center mr-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 mr-1 text-yellow-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {court.rating || '–'}
                          </span>
                          {court.activeGames > 0 && (
                            <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                              {court.activeGames} active
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/courts?id=${court.id}`}
                        className="text-blue-600 hover:text-blue-800 transition text-sm"
                      >
                        Ansehen →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">Keine Courts in der Nähe gefunden</p>
              )}
            </div>
          </div>

{/* Recent Activity */}
<div className="bg-white rounded-lg shadow-md overflow-hidden">
  <div className="flex justify-between items-center p-4 border-b border-gray-100">
    <h2 className="text-lg font-bold">Aktuelle Aktivitäten</h2>
  </div>
  <div className="p-4">
    {recentActivity.length > 0 ? (
      <div className="space-y-4">
        {recentActivity.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            {/* Icon je nach Aktivitätstyp */}
            <div
  className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
    activity.type === 'game'
      ? 'bg-green-500'
      : activity.type === 'rating'
      ? 'bg-yellow-500'
      : activity.type === 'joined_game'
      ? 'bg-blue-500'
      : activity.type === 'created_team'
      ? 'bg-purple-500'
      : activity.type === 'joined_team'
      ? 'bg-pink-500'
      : activity.type === 'checkin'
      ? 'bg-indigo-500'
      : activity.type === 'friendRequest'
      ? 'bg-red-500'
      : 'bg-gray-400'
  }`}
>
  {activity.type === 'game' && <FaBasketballBall className="w-4 h-4" />}
  {activity.type === 'rating' && <FaStar className="w-4 h-4" />}
  {activity.type === 'joined_game' && <FaLock className="w-4 h-4" />} {/* gleiche Icon wie Spiel */}
  {activity.type === 'created_team' && <FaUsers className="w-4 h-4" />}
  {activity.type === 'joined_team' && <FaUsers className="w-4 h-4" />}
  {activity.type === 'checkin' && <FaCheck className="w-4 h-4" />}
  {activity.type === 'friendRequest' && <FaUserPlus className="w-4 h-4" />}
  {![
    'game',
    'rating',
    'joined_game',
    'created_team',
    'joined_team',
    'checkin',
    'friendRequest',
  ].includes(activity.type) && <FaPuzzlePiece className="w-4 h-4" />}
</div>


            {/* Aktivitätsbeschreibung */}
            <div>
            <div className="text-sm font-medium text-gray-800">
  {activity.type === 'game' && `Spiel: ${activity.game?.title || 'Unbekannt'}`}
  {activity.type === 'rating' && `Bewertung: ${activity.rating?.value} Sterne`}
  {activity.type === 'joined_game' && `Beigetreten zu Spiel: ${activity.game?.title || 'Unbekannt'}`}
  {activity.type === 'created_team' && `Team erstellt: ${activity.team?.name || 'Unbekanntes Team'}`}
  {activity.type === 'joined_team' && `Beigetreten zu Team: ${activity.team?.name || 'Unbekanntes Team'}`}
  {activity.type === 'checkin' && `Eingecheckt bei: ${activity.checkin?.court?.name || 'Unbekannter Court'}`}
  {activity.type === 'friendRequest' && `Neue Freundschaftsanfrage von ${activity.friendRequest?.requester?.username || 'Unbekannt'}`}
  {/* fallback */}
  {activity.type !== 'game' &&
    activity.type !== 'rating' &&
    activity.type !== 'joined_game' &&
    activity.type !== 'created_team' &&
    activity.type !== 'joined_team' &&
    activity.type !== 'checkin' &&
    activity.type !== 'friendRequest' &&
    'Aktivität'}
</div>

              <div className="text-sm text-gray-600">
                {activity.createdAt
                  ? new Date(activity.createdAt).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Kein Datum'}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-gray-500 text-sm">Keine Aktivitäten vorhanden.</div>
    )}
  </div>
</div>




       {/* Quick Actions */}
       <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold">Quick Actions</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <Link to="/games/" className="bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-md transition">
                  Spiel erstellen
                </Link>
                <Link to="/basketballplatz-finder/" className="bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-md transition">
                  Platz suchen
                </Link>
                <Link to="/community/" className="bg-purple-600 hover:bg-purple-700 text-white text-center py-3 rounded-md transition">
                  Spieler suchen
                </Link>
                <Link to="/nachrichten/" className="bg-orange-600 hover:bg-orange-700 text-white text-center py-3 rounded-md transition">
                Nachrichten
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

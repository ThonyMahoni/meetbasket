import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import PremiumFeatureMessage from '../components/common/PremiumFeatureMessage';
import PremiumBadge from '../components/common/PremiumBadge'
import usePremiumStatus from '../hooks/usePremiumStatus';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const SKILL_LEVEL_LABELS = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
};

const PublicProfilePage = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const { isPremium, daysRemaining } = usePremiumStatus();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/by-username/${username}`);
        const data = await res.json();

        setProfileData(data);
        setBadges(data.achievements || []);
        setRecentGames(data.recentGames || []);

        const statsRes = await fetch(`${API_BASE_URL}/api/profile/${data.id}/stats`);
        const statsData = await statsRes.json();
        setPlayerStats(statsData);
      } catch (err) {
        console.error('Fehler beim Laden des Profils:', err);
      }
    };



    loadProfile();
  }, [username]);

  if (!profileData || !playerStats) {
    return <div className="text-center mt-10 text-gray-500">⏳ Profil wird geladen…</div>;
  }

  const statsFromRecentGames = recentGames.reduce(
    (acc, game) => {
      if (game.won) acc.wins++;
      else acc.losses++;
      acc.gamesPlayed++;
      return acc;
    },
    { wins: 0, losses: 0, gamesPlayed: 0 }
  );

  statsFromRecentGames.winRate = statsFromRecentGames.gamesPlayed
    ? ((statsFromRecentGames.wins / statsFromRecentGames.gamesPlayed) * 100).toFixed(1) + '%'
    : '0%';

  const sortedRecentGames = [...recentGames].sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split('.').map(Number);
    const [dayB, monthB, yearB] = b.date.split('.').map(Number);
    return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
  });

  return (
    <div className="max-w-4xl mx-auto mt-10">
      {/* 🔹 Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-blue-600 h-32 relative"></div>
        <div className="px-6 py-4 flex flex-col md:flex-row">
          <div className="flex-shrink-0 -mt-16">
            <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
              {profileData.profile?.imageUrl ? (
                <img
                  src={`${API_BASE_URL}${profileData.profile.imageUrl}`}
                  alt="Profilbild"
                  className="object-cover h-full w-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full text-gray-600 text-4xl font-bold">
                  {profileData.name?.charAt(0)}
                </div>
              )}
            </div>
          </div>
          <div className="md:ml-6 mt-6 md:mt-0 flex-grow">
            
          <h1 className="text-2xl font-bold flex items-center">
  {profileData.name}
  {profileData.isPremium && (
    <PremiumBadge size="sm" showLabel className="ml-2" />
  )}
</h1>
            <p className="text-gray-500">@{profileData.username}</p>
            <p className="text-gray-600 mt-2">{profileData.profile?.bio}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {profileData.position && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {profileData.position}
                </span>
              )}
              {profileData.profile?.height && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {profileData.profile.height} cm
                </span>
              )}
              {profileData.skillLevel && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {SKILL_LEVEL_LABELS[profileData.skillLevel]  ?? 'Unbekanntes Level'}

                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🗂 Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b">
          <nav className="flex">
            {['stats', 'badges', 'games'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'stats' ? 'Stats' : tab === 'badges' ? 'Badges' : 'Recent Games'}
              </button>
            ))}
          </nav>
        </div>
        {isPremium && (
  <div className="text-sm text-green-600 mt-2">
    Du bist Premium-Mitglied ({daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tage'} verbleibend)
  </div>
)}

{!isPremium && (
  <div className="mt-4">
    <PremiumFeatureMessage
      title="Nur für Premium-Mitglieder"
      message="Mit Premium kannst du unbegrenzt Freundschaftsanfragen senden und exklusive Funktionen nutzen."
    />
  </div>
)}

        {/* 📊 Stats Tab */}
        {activeTab === 'stats' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
              <StatBox label="Games" value={statsFromRecentGames.gamesPlayed} color="blue" />
              <StatBox label="Wins" value={statsFromRecentGames.wins} color="green" />
              <StatBox label="Losses" value={statsFromRecentGames.losses} color="red" />
              <StatBox label="Win Rate" value={statsFromRecentGames.winRate} color="gray" />
            </div>

            <div className="px-6 pb-6">
              <h3 className="text-lg font-semibold mb-4">Performance Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <ProgressStat label="Points Per Game" value={playerStats.pointsPerGame} max={30} />
                <ProgressStat label="Rebounds Per Game" value={playerStats.reboundsPerGame} max={15} />
              </div>
            </div>
          </div>
        )}

        {/* 🏅 Badges Tab */}
        {activeTab === 'badges' && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map(badge => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border ${
                    badge.achieved ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="text-3xl mr-3">{badge.icon}</div>
                    <div>
                      <h4 className={`font-semibold ${badge.achieved ? 'text-green-700' : 'text-gray-700'}`}>
                        {badge.name}
                      </h4>
                      <p className="text-sm text-gray-500">{badge.description}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        badge.achieved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {badge.achieved ? 'Abgeschlossen' : 'Locked'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
                          <Link to="/games" className="text-green-600 hover:text-blue-800 text-sm font-medium">
                          Verdiene eigene Badges →
                          </Link>
            </div>
          </div>
        )}

        {/* 🕹️ Games Tab */}
        {activeTab === 'games' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Court
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRecentGames.map(game => (
                    <tr key={game.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{game.court}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            game.won ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {game.won ? 'Win' : 'Loss'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.score}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.stats || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 text-center">
              <Link to="/games" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Full Game History →
              </Link>
            </div>
          </div>
        )}
      </div>
      
      
      <div className="mt-6 text-center">
              <Link to="/community" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Entdecke weitere Spieler in deiner Nähe →
              </Link>
            </div>
    </div>
  );
};

// ✅ Hilfs-Komponenten
const StatBox = ({ label, value, color }) => (
  <div className={`bg-${color}-50 p-4 rounded-lg text-center`}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
  </div>
);

const ProgressStat = ({ label, value, max }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between mb-1 text-sm text-gray-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default PublicProfilePage;

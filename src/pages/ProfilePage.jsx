// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import PremiumFeatureMessage from '../components/common/PremiumFeatureMessage';
import PremiumBadge from '../components/common/PremiumBadge';
import usePremiumStatus from '../hooks/usePremiumStatus';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const { isPremium, daysRemaining } = usePremiumStatus();



  const statsFromRecentGames = recentGames.reduce(
    (acc, game) => {
      if (game.won) acc.wins++;
      else acc.losses++;
      acc.gamesPlayed++;
      return acc;
    },
    { wins: 0, losses: 0, gamesPlayed: 0 }
  );
  
  statsFromRecentGames.winRate = statsFromRecentGames.gamesPlayed > 0
    ? ((statsFromRecentGames.wins / statsFromRecentGames.gamesPlayed) * 100).toFixed(1) + '%'
    : '0%';

    
  // 📍 Hilfsfunktion: Adresse in Koordinaten umwandeln (OpenStreetMap / Nominatim)
  const geocodeLocation = async (locationName) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`;
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        return {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding fehlgeschlagen:', error);
      return null;
    }
  };

  //Anzeige absteigend sortieren
  const sortedRecentGames = [...recentGames].sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split('.').map(Number);
    const [dayB, monthB, yearB] = b.date.split('.').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateB - dateA; // 🡅 Neueste zuerst
  });
  

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, []);

  const normalizeValue = (val, fallback = 'Unbekannt') =>
    val && val.trim() !== '' ? val : fallback;

  const [previewUrl, setPreviewUrl] = useState(null);

  // Bild hochladen
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    if (file.size > 200 * 1024) {
      alert('Bild darf maximal 200 KB groß sein');
      return;
    }
  
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview); // Vorschau aktivieren
  
    const formData = new FormData();
    formData.append('avatar', file);
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile/${profile.id}/avatar`, {
        method: 'POST',
        body: formData,
      });
      
  
      if (!res.ok) throw new Error('Upload fehlgeschlagen');
  
      const data = await res.json();
      setProfile((prev) => ({ ...prev, imageUrl: data.avatarUrl }));
      setPreviewUrl(null); // Vorschau wieder entfernen
    } catch (error) {
      console.error('Upload-Fehler:', error);
      alert('Fehler beim Hochladen des Bildes');
    }
  };
  
  


  const loadProfile = async () => {
    try {
      // 📥 Profilinformationen laden
      const res = await fetch(`${API_BASE_URL}/api/profile/${user.id}`);
      const data = await res.json();
  
      setProfile({
        id: data.id,
        userId: data.id,
        name: data.name || data.username,
        username: data.username,
        bio: data.profile?.bio || '',
        imageUrl: data.profile?.imageUrl || null,
        position: data.position,
        height: data.profile?.height != null ? `${data.profile.height} cm` : '-',
        skillLevel: data.skillLevel,
        email: data.email,
        phone: data.profile?.phone || '-',
        location: normalizeValue(data.location),
      });
  
      setEditedProfile({
        id: data.id,
        name: data.name || data.username,
        username: data.username,
        bio: data.profile?.bio || '',
        position: data.position,
        height: data.profile?.height?.toString() || '',
        skillLevel: data.skillLevel,
        email: data.email,
        phone: data.profile?.phone || '',
        location: normalizeValue(data.location),
      });
  
      setBadges(data.achievements || []);
      setRecentGames(data.recentGames || []);
  
      // 📈 Spielerstatistik separat laden
      const statsRes = await fetch(`${API_BASE_URL}/api/profile/${user.id}/stats`);
      const statsData = await statsRes.json();
  
      setPlayerStats({
        gamesPlayed: statsData.gamesPlayed || 0,
        wins: statsData.wins || 0,
        losses: statsData.losses || 0,
        pointsPerGame: statsData.pointsPerGame || 0,
        reboundsPerGame: statsData.reboundsPerGame || 0,
        winRate: statsData.winRate || '0%',
      });
    } catch (err) {
      console.error('Fehler beim Laden des Profils oder der Statistik:', err);
    }
  };
  

  // 💬 SkillLevel-Labels
  const SKILL_LEVEL_LABELS = {
    1: 'Beginner',
    2: 'Intermediate',
    3: 'Advanced',
  };

  // ✅ Diese Funktion wurde vorher vergessen!
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const sanitize = (val) =>
        val === '' || val === undefined || val === '-' ? null : val;

      // 📍 Adresse in Koordinaten umwandeln
      let coords = null;
      if (editedProfile.location) {
        coords = await geocodeLocation(editedProfile.location);
        if (!coords) {
          alert('Ort konnte nicht gefunden werden. Bitte gib einen gültigen Ortsnamen ein.');
          return;
        }
      }

      const payload = {
        ...editedProfile,
        height:
          editedProfile.height && /^\d+$/.test(editedProfile.height)
            ? parseInt(editedProfile.height, 10)
            : null,
        email: editedProfile.email,
        phone: sanitize(editedProfile.phone),
        skillLevel: sanitize(editedProfile.skillLevel),
        location: editedProfile.location?.trim(), // Text für Anzeige
        latitude: coords?.latitude || null,
        longitude: coords?.longitude || null,
      };

      console.log('🔼 Sende Profil:', payload);

      const response = await fetch(`${API_BASE_URL}/api/profile/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern des Profils');
      }

      setIsEditing(false);
      await loadProfile(); // 🔁 Reload des Profils nach Speichern
    } catch (error) {
      console.error('Fehler beim Profil-Update:', error);
      alert('Profil konnte nicht gespeichert werden.');
    }
  };
  
  
  
  

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">⏳ Lade Profil...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 🔷 Profile Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-blue-600 h-32 relative"></div>
        <div className="px-6 py-4 flex flex-col md:flex-row">
          <div className="flex-shrink-0 -mt-16">
          <div className="relative group h-32 w-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
  {previewUrl ? (
    <img src={previewUrl} alt="Vorschau" className="object-cover h-full w-full" />
  ) : profile?.imageUrl ? (
    <img
      src={`${import.meta.env.VITE_API_BASE_URL}${profile.imageUrl}`}
      alt="Profilbild"
      className="object-cover h-full w-full"
    />
  ) : (
    <div className="flex items-center justify-center h-full w-full text-gray-600 text-4xl font-bold">
      {profile?.name?.charAt(0)}
    </div>
  )}

  {isEditing && (
    <label className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 cursor-pointer">
      Bild ändern
      <input
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleImageUpload}
        className="hidden"
      />
    </label>
  )}
</div>


          </div>
          <div className="md:ml-6 mt-6 md:mt-0 flex-grow">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">  {profile.name}
  {profile.isPremium && (
    <PremiumBadge size="sm" showLabel className="ml-2" />
  )}</h1>
                <p className="text-gray-500">@{profile.username}</p>
              </div>
              <div className="mt-4 md:mt-0">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Profil bearbeiten
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                    >
                      Speichern
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedProfile({ ...profile });
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition"
                    >
                      Abbrechen
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-600 mt-2">{profile.bio}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{profile.position}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{profile.height}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
  {SKILL_LEVEL_LABELS[profile.skillLevel] || profile.skillLevel}
</span>

            </div>
          </div>
        </div>
      </div>
      {/* 🔧 Bearbeitungsformular */}
{isEditing && editedProfile && (
  <div className="bg-white rounded-lg shadow-md mb-6 p-6">
    <h2 className="text-xl font-bold mb-4">Profil bearbeiten</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { label: 'Name', name: 'name', type: 'text' },
        { label: 'Username', name: 'username', type: 'text' },
        { label: 'Bio', name: 'bio', type: 'textarea', span: true },
        { label: 'Position', name: 'position', type: 'select', options: ['Guard','Forward', 'Center', 'Flexible'] },
        { label: 'Größe in cm', name: 'height', type: 'text' },
        { label: 'Skill Level', name: 'skillLevel', type: 'select', options: ['Beginner', 'Erfahren', 'Fortgeschritten'] },
        { label: 'Deine Stadt', name: 'location', type: 'text' },
        { label: 'Email', name: 'email', type: 'email' },
        { label: 'Phone', name: 'phone', type: 'tel' }
      ].map((field, idx) => (
        <div key={idx} className={field.span ? 'md:col-span-2' : ''}>
          <label className="block text-gray-700 mb-2">{field.label}</label>

          {field.name === 'height' ? (
            <div>
              <input
                type="number"
                name="height"
                value={editedProfile.height}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setEditedProfile(prev => ({ ...prev, height: value }));
                  }
                }}
                placeholder="z.B. 180"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {editedProfile.height && (
                <p className="text-sm text-gray-500 mt-1">
                  {editedProfile.height} cm | {(editedProfile.height / 30.48).toFixed(2)} ft
                </p>
              )}
            </div>
          ) : field.type === 'textarea' ? (
            <textarea
              name={field.name}
              value={editedProfile[field.name]}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : field.type === 'select' ? (
            <select
              name={field.name}
              value={editedProfile[field.name]}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {field.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              name={field.name}
              value={editedProfile[field.name]}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      ))}
    </div>
  </div>
)}
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
        {/* 📊 Stats Tab */}
        {activeTab === 'stats' && playerStats && (
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
                {[
                  { label: 'Points Per Game', value: playerStats.pointsPerGame, max: 30 },
                  { label: 'Rebounds Per Game', value: playerStats.reboundsPerGame, max: 15 },
                ].map((stat, i) => (
                  <ProgressStat key={i} label={stat.label} value={stat.value} max={stat.max} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 🏅 Badges Tab */}
        {activeTab === 'badges' && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map(badge => (
                <div key={badge.id} className={`p-4 rounded-lg border ${badge.achieved ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center">
                    <div className="text-3xl mr-3">{badge.icon}</div>
                    <div>
                      <h4 className={`font-semibold ${badge.achieved ? 'text-green-700' : 'text-gray-700'}`}>{badge.name}</h4>
                      <p className="text-sm text-gray-500">{badge.description}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.achieved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
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

        {/* 🕹️ Recent Games Tab */}
        {activeTab === 'games' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRecentGames.map(game => (
                    <tr key={game.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{game.court}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${game.won ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
    </div>
  );
};

// ✅ Helfer-Komponenten
function StatBox({ label, value, color = '#E5E7EB' }) {
  // Vordefinierte Farben wie in Tailwind
  const tailwindColors = {
    blue: { bg: '#DBEAFE', text: '#2563EB' },
    green: { bg: '#DCFCE7', text: '#15803D' },
    red: { bg: '#FECACA', text: '#DC2626' },
    purple: { bg: '#E9D5FF', text: '#7E22CE' },
    gray: { bg: '#F3F4F6', text: '#4B5563' },
  };

  const isHex = color.startsWith('#');
  const bgColor = isHex ? color : tailwindColors[color]?.bg || '#F3F4F6';
  const textColor = isHex ? '#000' : tailwindColors[color]?.text || '#000';

  return (
    <div
      className="p-4 rounded-lg text-center"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}


function ProgressStat({ label, value, max }) {
  const width = Math.min((value / max) * 100, 100);
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${width}%` }}></div>
        </div>
        <span className="font-medium">{value}{typeof value === 'number' && label.includes('%') ? '%' : ''}</span>
      </div>
    </div>
  );
}

export default ProfilePage;

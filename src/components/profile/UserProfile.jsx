import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
  const { currentUser, updateProfile, isPremium, upgradeToPremium } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    skillLevel: 3,
    position: 'guard',
    bio: '',
    avatar: ''
  });

  // Avatar options (basic for free users, more for premium)
  const avatarOptions = [
    '/assets/avatars/default1.png',
    '/assets/avatars/default2.png',
    '/assets/avatars/default3.png',
  ];

  const premiumAvatarOptions = [
    '/assets/avatars/premium1.png',
    '/assets/avatars/premium2.png',
    '/assets/avatars/premium3.png',
    '/assets/avatars/premium4.png',
    '/assets/avatars/premium5.png',
  ];

  // Mock achievements/badges
  const badges = [
    { name: 'Rookie', description: 'Played your first game', earned: true },
    { name: 'Sharp Shooter', description: 'Won 5 challenges', earned: false },
    { name: 'Team Player', description: 'Organized 3 games', earned: true },
  ];

  // Mock statistics
  const stats = {
    gamesPlayed: 12,
    gamesWon: 8,
    challengesWon: 5,
    challengesLost: 3,
    averageRating: 4.2
  };

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        skillLevel: currentUser.skillLevel || 3,
        position: currentUser.position || 'guard',
        bio: currentUser.bio || '',
        avatar: currentUser.avatar || avatarOptions[0]
      });
    } else {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (avatar) => {
    setFormData(prev => ({ ...prev, avatar }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await updateProfile({
        ...currentUser,
        ...formData
      });
      
      if (success) {
        setEditing(false);
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderSkillLevel = (level) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg 
          key={i}
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 ${i <= level ? 'text-yellow-500' : 'text-gray-300'}`} 
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
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {error && <div className="bg-red-100 text-red-700 p-4">{error}</div>}
      
      <div className="md:flex">
        {/* Left column - Avatar and basic info */}
        <div className="w-full md:w-1/3 bg-blue-600 p-6 text-center">
          <div className="relative mb-6 mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-white">
            {editing ? (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white text-sm">Change Avatar</span>
              </div>
            ) : null}
            <img 
              src={formData.avatar || '/assets/avatars/default1.png'} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>

          {editing && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {avatarOptions.map((avatar) => (
                <div 
                  key={avatar} 
                  className={`w-12 h-12 rounded-full overflow-hidden cursor-pointer ${formData.avatar === avatar ? 'border-2 border-white' : ''}`}
                  onClick={() => handleAvatarChange(avatar)}
                >
                  <img src={avatar} alt="Avatar option" className="w-full h-full object-cover" />
                </div>
              ))}
              
              {isPremium && premiumAvatarOptions.map((avatar) => (
                <div 
                  key={avatar} 
                  className={`w-12 h-12 rounded-full overflow-hidden cursor-pointer ${formData.avatar === avatar ? 'border-2 border-white' : ''}`}
                  onClick={() => handleAvatarChange(avatar)}
                >
                  <img src={avatar} alt="Premium avatar option" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <h2 className="text-xl font-bold text-white mb-2">{formData.username}</h2>
          <p className="text-blue-200 mb-4">{formData.position}</p>
          
          {!editing && (
            <>
              <div className="mb-4 flex justify-center">
                {renderSkillLevel(formData.skillLevel)}
              </div>
              <p className="text-blue-200 text-sm mb-4">
                Rank: #{currentUser?.rank || 342} in {currentUser?.city || 'Your City'}
              </p>
              <button 
                onClick={() => setEditing(true)}
                className="bg-white text-blue-600 px-4 py-2 rounded-full font-bold hover:bg-blue-100 transition"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
        
        {/* Right column - Profile details */}
        <div className="w-full md:w-2/3 p-6">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-bold text-gray-700 mb-4">Edit Your Profile</h3>
              
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="username">Username</label>
                <input 
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="email">Email</label>
                <input 
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="skillLevel">Skill Level (1-5)</label>
                <input 
                  type="range"
                  id="skillLevel"
                  name="skillLevel"
                  value={formData.skillLevel}
                  onChange={handleChange}
                  min="1"
                  max="5"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Advanced</span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="position">Preferred Position</label>
                <select 
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="guard">Guard</option>
                  <option value="forward">Forward</option>
                  <option value="center">Center</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="bio">Bio</label>
                <textarea 
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div className="flex space-x-4">
                <button 
                  type="submit" 
                  className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button"
                  onClick={() => setEditing(false)}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-700 mb-4">Statistics</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Games Played</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.gamesPlayed}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Games Won</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.gamesWon}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Win Rate</p>
                  <p className="text-2xl font-bold text-gray-800">{Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.averageRating}/5</p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-700 mb-4">Achievements</h3>
              <div className="space-y-3 mb-6">
                {badges.map((badge, index) => (
                  <div key={index} className={`flex items-center p-3 rounded-lg ${badge.earned ? 'bg-yellow-50' : 'bg-gray-50 opacity-50'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badge.earned ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-200 text-gray-500'}`}>
                      {badge.earned ? '✓' : '?'}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold">{badge.name}</p>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {!isPremium && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-2">Unlock Premium Features</h4>
                  <p className="mb-3">Get access to detailed stats, exclusive avatars, and more!</p>
                  <button 
                    onClick={upgradeToPremium}
                    className="bg-white text-blue-600 px-4 py-2 rounded-full font-bold hover:bg-blue-50 transition"
                  >
                    Upgrade to Premium
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
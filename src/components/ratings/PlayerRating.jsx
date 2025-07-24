import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const PlayerRating = ({ playerId, initialRating = 0, readonly = false }) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  // Skills that can be rated
  const skills = [
    { id: 'shooting', name: 'Shooting' },
    { id: 'passing', name: 'Passing' },
    { id: 'dribbling', name: 'Dribbling' },
    { id: 'defense', name: 'Defense' },
    { id: 'teamwork', name: 'Teamwork' }
  ];

  const [skillRatings, setSkillRatings] = useState(
    skills.reduce((acc, skill) => {
      acc[skill.id] = { rating: 0, hover: 0 };
      return acc;
    }, {})
  );

  useEffect(() => {
    if (playerId) {
      fetchRatings();
    }
  }, [playerId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      
      // This would be replaced with actual API call when backend is implemented
      // Mock data for now
      setTimeout(() => {
        const mockRatings = [
          { id: 1, userId: 'user1', rating: 4, skillRatings: { shooting: 4, passing: 3, dribbling: 5, defense: 4, teamwork: 5 } },
          { id: 2, userId: 'user2', rating: 5, skillRatings: { shooting: 5, passing: 4, dribbling: 4, defense: 3, teamwork: 5 } },
          { id: 3, userId: 'user3', rating: 3, skillRatings: { shooting: 3, passing: 3, dribbling: 2, defense: 4, teamwork: 3 } }
        ];
        
        setRatings(mockRatings);
        
        // If current user has already rated this player, get their rating
        if (currentUser) {
          const existingRating = mockRatings.find(r => r.userId === currentUser.id);
          if (existingRating) {
            setUserRating(existingRating);
            setRating(existingRating.rating);
            
            // Set individual skill ratings if they exist
            if (existingRating.skillRatings) {
              const newSkillRatings = {...skillRatings};
              for (const [skill, value] of Object.entries(existingRating.skillRatings)) {
                if (newSkillRatings[skill]) {
                  newSkillRatings[skill] = { ...newSkillRatings[skill], rating: value };
                }
              }
              setSkillRatings(newSkillRatings);
            }
          }
        }
        
        // Calculate average rating
        const avgRating = mockRatings.reduce((sum, r) => sum + r.rating, 0) / mockRatings.length;
        setRating(avgRating);
        
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      setLoading(false);
    }
  };

  const handleRatingChange = async (newRating) => {
    if (readonly || !currentUser) return;

    try {
      // This would be replaced with actual API call when backend is implemented
      console.log(`Submitting rating of ${newRating} for player ${playerId}`);
      
      // Update local state
      setRating(newRating);
      setUserRating({ ...userRating, rating: newRating });

      // In a real implementation, we would save to the database
      // await api.submitRating(playerId, newRating, skillRatings);
      
      // Refetch ratings to update the average
      fetchRatings();
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const handleSkillRatingChange = (skillId, value) => {
    if (readonly || !currentUser) return;

    setSkillRatings(prev => ({
      ...prev,
      [skillId]: { ...prev[skillId], rating: value }
    }));
  };

  // Calculate average of all skill ratings
  const calculateOverallSkillRating = () => {
    const skillValues = Object.values(skillRatings).map(s => s.rating);
    const validRatings = skillValues.filter(r => r > 0);
    return validRatings.length > 0
      ? validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
      : 0;
  };

  const renderStars = (currentRating, hoverRating, onRatingChange, onHoverChange) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`text-2xl ${
          star <= (hoverRating || currentRating)
            ? 'text-yellow-400'
            : 'text-gray-300'
        } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={() => !readonly && onRatingChange(star)}
        onMouseEnter={() => !readonly && onHoverChange(star)}
        onMouseLeave={() => !readonly && onHoverChange(0)}
        disabled={readonly}
      >
        ★
      </button>
    ));
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading ratings...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Player Rating</h2>
      
      {/* Overall Rating Display */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Overall Rating</h3>
        <div className="flex items-center">
          <div className="flex mr-2">
            {renderStars(
              rating,
              hover,
              handleRatingChange,
              setHover
            )}
          </div>
          <span className="text-lg font-semibold">
            {rating.toFixed(1)}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Based on {ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}
        </div>
      </div>

      {/* Individual Skill Ratings */}
      {!readonly && currentUser && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Rate Individual Skills</h3>
          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill.id} className="flex flex-col sm:flex-row sm:items-center">
                <label className="mb-1 sm:mb-0 sm:w-24 font-medium">
                  {skill.name}:
                </label>
                <div className="flex items-center">
                  <div className="flex">
                    {renderStars(
                      skillRatings[skill.id].rating,
                      skillRatings[skill.id].hover,
                      (value) => handleSkillRatingChange(skill.id, value),
                      (value) =>
                        setSkillRatings((prev) => ({
                          ...prev,
                          [skill.id]: { ...prev[skill.id], hover: value },
                        }))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => {
                const overallRating = calculateOverallSkillRating();
                handleRatingChange(overallRating);
              }}
            >
              Submit Ratings
            </button>
          </div>
        </div>
      )}

      {/* Rating Breakdown - show detailed stats for the player */}
      {ratings.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Rating Breakdown</h3>
          <div className="grid grid-cols-2 gap-2">
            {skills.map((skill) => {
              // Calculate average for each skill
              const skillTotal = ratings.reduce((sum, r) => {
                return sum + (r.skillRatings?.[skill.id] || 0);
              }, 0);
              const skillAvg = ratings.length ? skillTotal / ratings.length : 0;
              
              return (
                <div key={skill.id} className="flex items-center">
                  <span className="w-20 text-sm">{skill.name}:</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: `${(skillAvg / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">{skillAvg.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!currentUser && !readonly && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md text-gray-600">
          Please log in to rate this player
        </div>
      )}
    </div>
  );
};

export default PlayerRating;
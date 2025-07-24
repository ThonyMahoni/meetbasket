import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PremiumBadge from '../common/PremiumBadge';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingFriendRequests, setPendingFriendRequests] = useState(0);
  const { currentUser, logout, isPremium } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch notification counts
    if (currentUser) {
      // Mock API calls
      setTimeout(() => {
        setUnreadMessages(2); // Mock unread message count
        setPendingFriendRequests(1); // Mock pending friend requests
      }, 1000);
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo and App Name */}
          <Link to="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-xl text-white">BasketballConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-blue-200 px-3 py-2 rounded-md">Home</Link>
            <Link to="/map" className="text-white hover:text-blue-200 px-3 py-2 rounded-md">Courts</Link>
            <Link to="/games" className="text-white hover:text-blue-200 px-3 py-2 rounded-md">Games</Link>
            <Link to="/community" className="text-white hover:text-blue-200 px-3 py-2 rounded-md">Community</Link>
            
            {currentUser ? (
              <>
                <Link to="/messages" className="text-white hover:text-blue-200 px-3 py-2 rounded-md flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                  Messages
                  {unreadMessages > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
                
                <Link to="/friends" className="text-white hover:text-blue-200 px-3 py-2 rounded-md flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Friends
                  {pendingFriendRequests > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingFriendRequests}
                    </span>
                  )}
                </Link>
                
                {isPremium ? (
                  <div className="flex items-center mr-2 bg-blue-700 px-3 py-1 rounded-full">
                    <PremiumBadge size="sm" showLabel={true} />
                  </div>
                ) : (
                  <Link 
                    to="/premium" 
                    className="mr-2 px-3 py-1 rounded-full bg-yellow-500 text-blue-800 text-sm font-semibold hover:bg-yellow-400 transition-colors"
                  >
                    Upgrade
                  </Link>
                )}
                <Link to="/profile" className="text-white hover:text-blue-200 px-3 py-2 rounded-md flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-300 mr-2 flex items-center justify-center text-xs text-blue-900 font-bold">
                    {currentUser.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  Profile
                </Link>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="bg-white text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md">Login</Link>
                <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">Register</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-2">
            <Link to="/" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md">Home</Link>
            <Link to="/map" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md">Courts</Link>
            <Link to="/games" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md">Games</Link>
            <Link to="/community" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md">Community</Link>
            
            {currentUser ? (
              <>
                <Link to="/messages" className="flex items-center text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                  Messages
                  {unreadMessages > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
                
                <Link to="/friends" className="flex items-center text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Friends
                  {pendingFriendRequests > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingFriendRequests}
                    </span>
                  )}
                </Link>
              
                {isPremium ? (
                  <div className="flex items-center px-3 py-2">
                    <PremiumBadge size="sm" showLabel={true} />
                    <span className="ml-2 text-xs text-gray-200">Premium Active</span>
                  </div>
                ) : (
                  <Link
                    to="/premium"
                    className="block px-3 py-2 rounded-md bg-yellow-500 text-blue-800 font-medium text-center"
                  >
                    Upgrade to Premium
                  </Link>
                )}
                <Link to="/profile" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md">Profile</Link>
                <button onClick={handleLogout} className="block w-full text-left text-white hover:bg-red-700 bg-red-600 px-3 py-2 rounded-md my-1">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-blue-700 bg-white hover:bg-blue-100 px-3 py-2 rounded-md my-1">Login</Link>
                <Link to="/register" className="block text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md my-1">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
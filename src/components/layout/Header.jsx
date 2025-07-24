import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
const toggleUserMenu = () => setIsUserMenuOpen((prev) => !prev);
const closeUserMenu = () => setIsUserMenuOpen(false);


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
  <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
    <img
      src="/public/assets/logo.png" // 🔁 Passe Pfad an
      alt="MeetBasket Logo"
      className="h-8 w-8 object-contain"
    />
  </div>
  <span className="text-xl font-bold">MeetBasket</span>
</Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/home" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/home')}`}>Home</Link>
              <Link to="/courts" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/courts')}`}>Courts</Link>
              <Link to="/games" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/games')}`}>Games</Link>
              <Link to="/community" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/community')}`}>Community</Link>
              
              {/* User Profile Menu */}
              <div className="relative">
  <button 
    onClick={toggleUserMenu}
    className="flex items-center space-x-1 px-3 py-2 rounded hover:bg-blue-700"
  >
    <span>{user?.name || 'User'}</span>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {isUserMenuOpen && (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
      <Link to="/profile" onClick={closeUserMenu} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
      <Link to="/settings" onClick={closeUserMenu} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
      <button 
        onClick={() => {
          logout();
          closeUserMenu();
        }}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Log Out
      </button>
    </div>
  )}
</div>

            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 rounded hover:bg-blue-700">Log In</Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden text-white focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-600 pb-4 px-4">
          {isAuthenticated ? (
            <>
              <Link 
                to="/home" 
                onClick={closeMenu}
                className={`block px-3 py-2 rounded ${isActive('/home')} hover:bg-blue-700`}
              >
                Home
              </Link>
              <Link 
                to="/courts" 
                onClick={closeMenu}
                className={`block px-3 py-2 rounded ${isActive('/courts')} hover:bg-blue-700`}
              >
                Courts
              </Link>
              <Link 
                to="/games" 
                onClick={closeMenu}
                className={`block px-3 py-2 rounded ${isActive('/games')} hover:bg-blue-700`}
              >
                Games
              </Link>
              <Link 
                to="/community" 
                onClick={closeMenu}
                className={`block px-3 py-2 rounded ${isActive('/community')} hover:bg-blue-700`}
              >
                Community
              </Link>
              <Link 
                to="/profile" 
                onClick={closeMenu}
                className={`block px-3 py-2 rounded ${isActive('/profile')} hover:bg-blue-700`}
              >
                My Profile
              </Link>
              <Link 
                to="/settings" 
                onClick={closeMenu}
                className={`block px-3 py-2 rounded ${isActive('/settings')} hover:bg-blue-700`}
              >
                Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded hover:bg-blue-700"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                onClick={closeMenu}
                className="block px-3 py-2 rounded hover:bg-blue-700"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                onClick={closeMenu}
                className="block px-3 py-2 rounded hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
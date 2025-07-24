import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hoopconnect_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('❌ Ungültige gespeicherte Daten:', err);
        localStorage.removeItem('hoopconnect_user');
      }
    }
    setLoading(false);
  }, []);
  // Save user data to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('hoopconnect_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hoopconnect_user');
    }
  }, [user]);
  
// Login function
const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier: email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed');
    }

    const userData = await response.json(); // z.B. { user, token }

    // ✅ Token speichern
    if (userData.token) {
      localStorage.setItem('authToken', userData.token);
    } else {
      console.warn('⚠️ Kein Token im Login-Response enthalten!');
    }

    setUser(userData.user);
    setIsAuthenticated(true);
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};


// Google Login function
// Google Login starten: OAuth Flow per Browser-Weiterleitung
const loginWithGoogle = () => {
  window.location.href = `${API_BASE_URL}/api/auth/google-login`;
};

// Nach erfolgreichem Login: Token aus URL holen und User setzen
const handleGoogleAuthSuccess = async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    console.error('❌ Kein Token in der URL gefunden');
    return false;
  }

  try {
    // 1. Token speichern
    localStorage.setItem('authToken', token);

    // 2. Mit dem Token User-Daten vom Backend abrufen
    const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
      headers: {
        Authorization: `Bearer ${token}`, // JWT Auth-Header
      },
    });

    if (!response.ok) {
      throw new Error('❌ Fehler beim Laden des Benutzerprofils');
    }

    const userData = await response.json();

    // 3. User im Kontext setzen
    setUser(userData);
    setIsAuthenticated(true);

    // 4. Optional: User auch lokal speichern
    localStorage.setItem('hoopconnect_user', JSON.stringify(userData));

    return true;
  } catch (error) {
    console.error('❌ Fehler bei Google Auth Success:', error);
    return false;
  }
};




// Register function
const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json(); // Nur EINMAL lesen!
    console.log("📦 Registration Response:", data); // 👈 Das wird uns sagen, was wirklich kommt

    if (!response.ok) {
      throw new Error(data.message || 'Fehler beim Registrieren');
    }
    if (!data.user) {
      throw new Error('Benutzerdaten fehlen in der Antwort.');
    }

    setUser(data.user); // Hier sicherstellen, dass `user` in `res.json()` enthalten ist
    setIsAuthenticated(true);
    return true;
  } catch (error) {
    console.error('❌ Registrierung fehlgeschlagen:', error);
    return false;
  }
};


  

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('hoopconnect_user'); // 🔁 hinzufügen
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      // This is a mock implementation
      console.log('Profile update:', updates);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update user data
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'An error occurred while updating profile' };
    }
  };

  // Check if authenticated
  const checkAuthentication = () => {
    return isAuthenticated && user !== null;
  };

  // Value to be provided to consuming components
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    loginWithGoogle,
    handleGoogleAuthSuccess,
    register,
    logout,
    updateProfile,
    checkAuthentication,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
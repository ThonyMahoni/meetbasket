// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  // Lade DarkMode vom Server
  useEffect(() => {
    const fetchTheme = async () => {
      if (!currentUser) return;
      try {
        const res = await fetch(`/api/settings/${currentUser.id}`);
        const data = await res.json();
        setDarkMode(data?.appearance?.darkMode ?? false);
      } catch (err) {
        console.error('Fehler beim Laden des DarkMode:', err);
      }
    };

    fetchTheme();
  }, [currentUser]);

  // Anwenden des Themes auf body
  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  // Funktion zum Umschalten und Speichern
  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    // Speicher im Backend
    try {
      await fetch(`/api/settings/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appearance: { darkMode: newMode },
        }),
      });
    } catch (err) {
      console.error('Fehler beim Speichern des DarkMode:', err);
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

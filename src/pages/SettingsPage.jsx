import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    notifications: {
      gameInvites: true,
      courtUpdates: true,
      friendRequests: true,
      appUpdates: false
    },
    privacy: {
      showProfile: 'everyone',
      showStats: 'everyone',
      locationSharing: 'while_using'
    },
    appearance: {
      darkMode: false,
      language: 'deutsch'
    }
  });

  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAccountInput, setDeleteAccountInput] = useState('');
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
        const token = localStorage.getItem('authToken'); // ✅ richtiger Key

      if (!user || !user.id || !token) {
        console.warn('Kein Benutzer oder Token vorhanden');
        return;
      }
  
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Einstellungen konnten nicht geladen werden');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Fehler beim Laden der Einstellungen:', err);
      }
    };
  
    fetchSettings();
  }, [user]); // jetzt abhängig von vollständigem user-Objekt
  
  useEffect(() => {
    const html = document.documentElement;
    if (settings.appearance.darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [settings.appearance.darkMode]);
  
  
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');
  
  const handleChangePassword = async () => {
    setPasswordChangeError('');
    setPasswordChangeSuccess(false);
  
    const { oldPassword, newPassword, confirmPassword } = passwords;
  
    if (!oldPassword || !newPassword || !confirmPassword) {
      return setPasswordChangeError('Bitte fülle alle Felder aus.');
    }
  
    if (newPassword !== confirmPassword) {
      return setPasswordChangeError('Die neuen Passwörter stimmen nicht überein.');
    }
  
    try {
      const token = localStorage.getItem('authToken');
  
      const res = await fetch(`${API_BASE_URL}/api/settings/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
  
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Fehler beim Ändern des Passworts');
      }
  
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordChangeSuccess(true);
    } catch (error) {
      console.error('Passwortänderung fehlgeschlagen:', error);
      setPasswordChangeError(error.message || 'Unbekannter Fehler');
    }
  };
  

  const handleSettingsChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setSuccess(false);
  
      const token = localStorage.getItem('authToken')

      if (!token) {
        console.error('Kein Token gefunden');
        return;
      }
  
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
  
      if (!res.ok) throw new Error('Fehler beim Speichern der Einstellungen');
  
      setSuccess(true);
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 3000);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    } finally {
      setSaving(false);
    }
  };
  
  

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    try {
      const confirmed = window.confirm("Bist du sicher, dass du deinen Account löschen möchtest?");
      if (!confirmed) return;

      const res = await fetch(`${API_BASE_URL}/api/settings/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error("Fehler beim Löschen des Accounts");

      logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert("Account konnte nicht gelöscht werden.");
    }
  };


  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Einstellungen</h1>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Settings */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Profil</h2>
          <p className="text-gray-600 mb-4">
            Verwalte deine persönlichen Daten und Profilinformationen.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Profil bearbeiten
          </button>
        </div>
        {/* Notifications */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Benachrichtigungen</h2>
          <p className="text-gray-600 mb-4">Steuere, welche Benachrichtigungen du erhalten möchtest.</p>
          <div className="space-y-2">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={e => handleSettingsChange('notifications', key, e.target.checked)}
                  className="mr-2"
                  id={`notif-${key}`}
                />
                <label htmlFor={`notif-${key}`} className="text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Datenschutz</h2>
          <p className="text-gray-600 mb-4">Bestimme, wer welche Informationen über dich sehen darf.</p>
          <div className="space-y-4">
            {Object.entries(settings.privacy).map(([key, value]) => (
              <div key={key}>
                <label className="block text-gray-700 font-medium capitalize mb-1">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <select
                  value={value}
                  onChange={e => handleSettingsChange('privacy', key, e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                >
                  <option value="everyone">Jeder</option>
                  <option value="friends">Nur Freunde</option>
                  <option value="nobody">Niemand</option>
                  <option value="while_using">Nur während der Nutzung</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Darstellung</h2>
  <p className="text-gray-600 dark:text-gray-300 mb-4">Passe das Aussehen der App an deine Vorlieben an.</p>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.appearance.darkMode}
                onChange={e => handleSettingsChange('appearance', 'darkMode', e.target.checked)}
                className="mr-2"
                id="darkMode"
              />
              <label htmlFor="darkMode" className="text-gray-700">Dark Mode aktivieren</label>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Sprache</label>
              <select
                value={settings.appearance.language}
                onChange={e => handleSettingsChange('appearance', 'language', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              >
                <option value="english">Deutsch</option>
                <option value="german">Englisch</option>
                <option value="turkish">Türkisch</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Passwort ändern */}
<div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
  <h2 className="text-xl font-semibold text-gray-800 mb-2">Passwort ändern</h2>
  <p className="text-gray-600 mb-4">
    Ändere dein aktuelles Passwort. Du wirst beim nächsten Login das neue Passwort benötigen.
  </p>

  <div className="space-y-4">
    <div>
      <label className="block text-gray-700 font-medium mb-1">Aktuelles Passwort</label>
      <input
        type="password"
        className="border border-gray-300 rounded-md px-3 py-2 w-full"
        value={passwords.oldPassword}
        onChange={(e) => setPasswords(prev => ({ ...prev, oldPassword: e.target.value }))}
      />
    </div>
    <div>
      <label className="block text-gray-700 font-medium mb-1">Neues Passwort</label>
      <input
        type="password"
        className="border border-gray-300 rounded-md px-3 py-2 w-full"
        value={passwords.newPassword}
        onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
      />
    </div>
    <div>
      <label className="block text-gray-700 font-medium mb-1">Neues Passwort bestätigen</label>
      <input
        type="password"
        className="border border-gray-300 rounded-md px-3 py-2 w-full"
        value={passwords.confirmPassword}
        onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
      />
    </div>
  </div>

  <button
    onClick={handleChangePassword}
    className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
  >
    Passwort ändern
  </button>

  {passwordChangeSuccess && (
    <p className="mt-2 text-green-600 font-medium">✅ Passwort wurde geändert!</p>
  )}
  {passwordChangeError && (
    <p className="mt-2 text-red-600 font-medium">❌ {passwordChangeError}</p>
  )}
</div>


        {/* Account Deletion */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-red-200">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Account löschen</h2>
          <p className="text-gray-700 mb-4">
            Wenn du deinen Account löschst, werden alle deine Daten dauerhaft entfernt.
            Dies kann nicht rückgängig gemacht werden.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md"
          >
            Account löschen
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSaveSettings}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md"
            disabled={saving}
          >
            {saving ? 'Speichern...' : 'Einstellungen speichern'}
          </button>
        </div>

        {/* Erfolgsmeldung */}
        {success && (
          <div className="mt-6 text-green-600 font-medium">
            Einstellungen erfolgreich gespeichert!
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;

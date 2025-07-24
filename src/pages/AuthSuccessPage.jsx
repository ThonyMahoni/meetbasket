import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthSuccessPage = () => {
  const { handleGoogleAuthSuccess } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth = async () => {
      const success = await handleGoogleAuthSuccess();
      if (success) {
        navigate('/profile'); // Oder: zu deiner Zielseite nach Login
      } else {
        navigate('/login'); // Fallback
      }
    };

    processAuth();
  }, [handleGoogleAuthSuccess, navigate]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Authentifizierung läuft...</h2>
    </div>
  );
};

export default AuthSuccessPage;

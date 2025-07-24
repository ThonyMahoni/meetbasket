import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const input = typeof identifier === 'string' ? identifier.trim() : '';
    const cleanedIdentifier = input.toLowerCase();

    try {
      if (!cleanedIdentifier || !password) {
        throw new Error('Bitte E-Mail oder Benutzername und Passwort eingeben');
      }

      const success = await login(cleanedIdentifier, password);
      if (success) {
        navigate('/');
      } else {
        setError('E-Mail/Benutzername oder Passwort ist ungültig');
      }
    } catch (err) {
      setError(err.message || 'Beim Login ist ein Fehler aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google-login`;
  };
  

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 mt-10">
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-8">
        Login zu BasketballConnect
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="identifier">
            E-Mail oder Benutzername
          </label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="z. B. hooper42 oder name@email.de"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Passwort
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm text-gray-700">
            <input type="checkbox" className="h-4 w-4 text-blue-600 mr-2" />
            Eingeloggt bleiben
          </label>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Passwort vergessen?
          </a>
        </div>

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Einloggen …' : 'Login'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-4 text-gray-500">oder</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      {/* Google Login Button */}
      <button
        onClick={handleGoogleLogin}
        className="w-full border border-gray-300 rounded-lg flex items-center justify-center py-2 px-4 hover:bg-gray-100 transition"
        disabled={isLoading}
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google Logo"
          className="w-5 h-5 mr-2"
        />
        <span className="text-gray-700 font-medium">
          Mit Google einloggen
        </span>
      </button>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Noch keinen Account?
          <Link to="/register" className="text-blue-600 hover:underline ml-1">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

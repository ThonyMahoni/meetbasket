import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    skillLevel: '3', // Default middle skill level
    position: 'guard',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password) => {
    if (password.length < 8) return 'Passwort muss mindestens 8 Zeichen lang sein';
  
    // Regex-Prüfung: Groß, Klein, Zahl
    if (!/[A-Z]/.test(password))
      return 'Passwort muss mindestens einen Großbuchstaben enthalten';
    if (!/[a-z]/.test(password))
      return 'Passwort muss mindestens einen Kleinbuchstaben enthalten';
    if (!/[0-9]/.test(password))
      return 'Passwort muss mindestens eine Zahl enthalten';
  
    // Optional: Sonderzeichen prüfen
    // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    //   return 'Passwort sollte mindestens ein Sonderzeichen enthalten';
  
    // Blacklist einfacher Passwörter
    const blacklist = ['123test', 'password', '123456', 'qwertz', 'abc123'];
    if (blacklist.includes(password.toLowerCase()))
      return 'Dieses Passwort ist zu einfach. Bitte wähle ein anderes.';
  
    return null; // Alles okay
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Alle Felder sind erforderlich');
      return false;
    }
  
    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return false;
    }
  
    const pwdError = validatePassword(formData.password);
    if (pwdError) {
      setError(pwdError);
      return false;
    }
  
    return true;
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const success = await loginWithGoogle();
      if (success) {
        navigate('/');
      } else {
       
      }
    } catch (err) {
      console.error('Google Login Fehler:', err);
      setError('Beim Google-Login ist ein Fehler aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        skillLevel: formData.skillLevel,
        position: formData.position,
        isPremium: false
      };
      
      const success = await register(userData);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 mt-10 mb-10">
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-8">Tritt MeetBasket bei</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="username">Username</label>
          <input 
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Choose a username"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
          <input 
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="deine@email.com"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="password">Passwort</label>
          <input 
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">Passwort bestätigen</label>
          <input 
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="skillLevel">Skill Level (1-5)</label>
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
          <label className="block text-gray-700 mb-2" htmlFor="position">Bevorzugte Position</label>
          <select 
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="guard">Guard</option>
            <option value="forward">Forward</option>
            <option value="center">Center</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          className={`w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
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
          Du hast bereits ein Konto? 
          <Link to="/login" className="text-blue-600 hover:underline ml-1">Jetzt anmelden</Link>
        </p>
      </div> 
    </div>
  );
};

export default Register;
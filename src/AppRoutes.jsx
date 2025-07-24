import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import { ThemeProvider } from './contexts/ThemeContext'; // ✅ DarkMode Context

// Pages
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import GamesPage from './pages/GamesPage';
import ProfilePage from './pages/ProfilePage';
import CommunityPage from './pages/CommunityPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import MessagesPage from './pages/MessagesPage';
import FriendsPage from './pages/FriendsPage';
import PremiumPage from './pages/PremiumPage';
import PublicProfilePage from './pages/PublicProfilePage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import InstallAppPage from './pages/InstallAppPage';
import AuthSuccessPage from './pages/AuthSuccessPage';
import SettingsPage from './pages/SettingsPage';
import RateCourtsPage from './pages/RateCourtsPage';
import ImpressumPage from './pages/ImpressumPage';




const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Meet Basket - Finde Basketballspiele in deiner Nähe
            </h1>
            <p className="text-xl mb-8">
            Finde Plätze, nimm an Spielen teil und baue dein Basketball-Netzwerk mit MeetBasket auf.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="bg-white text-blue-800 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition"
              >
                Jetzt registrieren
              </Link>
              <Link
                to="/login"
                className="bg-transparent border border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white hover:text-blue-800 transition"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Wie MeetBasket funkioniert</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Finde Courts</h3>
              <p className="text-gray-600">
              Entdecken beliebte Basketballplätze in deiner Nähe mit detaillierten Informationen, Bewertungen und Verfügbarkeiten.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h6M8 8h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Join Games</h3>
              <p className="text-gray-600">
              Nehmen an bestehenden PickUp Spielen teil oder organisiere ganz einfach eigene Spiele und lade  echte Hooper mit ähnlichem Fähigkeitsniveau ein.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Baue dir dein Basketball Netzwerk auf</h3>
              <p className="text-gray-600">
              Verbinde dich mit Spielern, gründe deine Teams und nimm an Community-Turnieren und Veranstaltungen teil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <ThemeProvider> {/* ✅ Umhüllt die komplette App für Dark Mode Support */}
      <Routes>
        {/* Public */}
        <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth-success" element={<AuthSuccessPage />} />

        {/* Protected + Layout */}
        <Route path="/home" element={<ProtectedRoute><MainLayout><Home /></MainLayout></ProtectedRoute>} />
        <Route path="/courts" element={<ProtectedRoute><MainLayout><MapPage /></MainLayout></ProtectedRoute>} />
        <Route path="/games" element={<ProtectedRoute><MainLayout><GamesPage /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><MainLayout><SettingsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><MainLayout><CommunityPage /></MainLayout></ProtectedRoute>} />
        <Route path="/nachrichten" element={<ProtectedRoute><MainLayout><MessagesPage /></MainLayout></ProtectedRoute>} />
        <Route path="/nachrichten/new/:conversationId" element={<ProtectedRoute><MainLayout><MessagesPage /></MainLayout></ProtectedRoute>} />
        <Route path="/freunde" element={<ProtectedRoute><MainLayout><FriendsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/premium" element={<ProtectedRoute><MainLayout><PremiumPage /></MainLayout></ProtectedRoute>} />
        <Route path="/profile/:username" element={<ProtectedRoute><MainLayout><PublicProfilePage /></MainLayout></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><MainLayout><ContactPage /></MainLayout></ProtectedRoute>} />
        <Route path="/faq" element={<ProtectedRoute><MainLayout><FAQPage /></MainLayout></ProtectedRoute>} />
        <Route path="/terms" element={<ProtectedRoute><MainLayout><TermsOfUsePage /></MainLayout></ProtectedRoute>} />
        <Route path="/privacy" element={<ProtectedRoute><MainLayout><PrivacyPolicyPage /></MainLayout></ProtectedRoute>} />
        <Route path="/app" element={<ProtectedRoute><MainLayout><InstallAppPage /></MainLayout></ProtectedRoute>} />
        <Route path="/basketballplatz-finder" element={<ProtectedRoute><MainLayout><RateCourtsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/impressum" element={<MainLayout><ImpressumPage /></MainLayout>} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
};

export default AppRoutes;

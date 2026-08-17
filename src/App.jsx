import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/Layout/DashboardLayout';

import LanguageSelection from './pages/LanguageSelection';
import Auth from './pages/Auth';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import MyFarm from './pages/MyFarm';
import CropIntelligence from './pages/CropIntelligence';
import SeasonAdvisor from './pages/SeasonAdvisor';
import Weather from './pages/Weather';
import DiseaseDetection from './pages/DiseaseDetection';
import SoilAnalysis from './pages/SoilAnalysis';
import MarketPrices from './pages/MarketPrices';
import FarmAI from './pages/FarmAI';
import Schemes from './pages/Schemes';
import YieldPrediction from './pages/YieldPrediction';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import './styles.css';

// Guard for protected routes (wrapped in layout)
const ProtectedRoute = ({ children }) => {
  const { user, profile } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  if (!profile) return <Navigate to="/profile-setup" />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

// Guard for profile setup
const ProfileRoute = ({ children }) => {
  const { user, profile } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  if (profile) return <Navigate to="/dashboard" />;
  return children;
};

// Guard for auth page (if already logged in, redirect)
const AuthRoute = ({ children }) => {
  const { user, profile } = useAuth();
  if (user && profile) return <Navigate to="/dashboard" />;
  if (user && !profile) return <Navigate to="/profile-setup" />;
  return children;
};

const AppContent = () => {
  const { language } = useLanguage();
  
  if (!language) {
    return <LanguageSelection />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
        <Route path="/profile-setup" element={<ProfileRoute><ProfileSetup /></ProfileRoute>} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/my-farm" element={<ProtectedRoute><MyFarm /></ProtectedRoute>} />
        <Route path="/crop-intelligence" element={<ProtectedRoute><CropIntelligence /></ProtectedRoute>} />
        <Route path="/season-advisor" element={<ProtectedRoute><SeasonAdvisor /></ProtectedRoute>} />
        <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
        <Route path="/disease-detection" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
        <Route path="/soil-analysis" element={<ProtectedRoute><SoilAnalysis /></ProtectedRoute>} />
        <Route path="/market-prices" element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />
        <Route path="/farmai" element={<ProtectedRoute><FarmAI /></ProtectedRoute>} />
        <Route path="/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
        <Route path="/yield-prediction" element={<ProtectedRoute><YieldPrediction /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

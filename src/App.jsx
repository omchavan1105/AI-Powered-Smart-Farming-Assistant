import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import OfflineBanner from './components/OfflineBanner';
import { Loader2 } from 'lucide-react';
import './styles.css';

// Critical initial routes
import LanguageSelection from './pages/LanguageSelection';
import Auth from './pages/Auth';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';

// Lazy-loaded routes for optimized bundle splitting & mobile performance
const MyFarm = lazy(() => import('./pages/MyFarm'));
const CropIntelligence = lazy(() => import('./pages/CropIntelligence'));
const SeasonAdvisor = lazy(() => import('./pages/SeasonAdvisor'));
const Weather = lazy(() => import('./pages/Weather'));
const DiseaseDetection = lazy(() => import('./pages/DiseaseDetection'));
const SoilAnalysis = lazy(() => import('./pages/SoilAnalysis'));
const MarketPrices = lazy(() => import('./pages/MarketPrices'));
const FarmAI = lazy(() => import('./pages/FarmAI'));
const Schemes = lazy(() => import('./pages/Schemes'));
const YieldPrediction = lazy(() => import('./pages/YieldPrediction'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading Fallback
const PageLoading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '10px', color: '#166534' }}>
    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
    <span style={{ fontSize: '14px', fontWeight: 600 }}>Loading module...</span>
  </div>
);

// Guard for protected routes (wrapped in layout)
const ProtectedRoute = ({ children }) => {
  const { user, profile } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  if (!profile) return <Navigate to="/profile-setup" />;
  return <DashboardLayout><Suspense fallback={<PageLoading />}>{children}</Suspense></DashboardLayout>;
};

// Guard for profile setup
const ProfileRoute = ({ children }) => {
  const { user, profile } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  if (profile) return <Navigate to="/dashboard" />;
  return <Suspense fallback={<PageLoading />}>{children}</Suspense>;
};

// Guard for auth page (if already logged in, redirect)
const AuthRoute = ({ children }) => {
  const { user, profile } = useAuth();
  if (user && profile) return <Navigate to="/dashboard" />;
  if (user && !profile) return <Navigate to="/profile-setup" />;
  return <Suspense fallback={<PageLoading />}>{children}</Suspense>;
};

const AppContent = () => {
  const { language } = useLanguage();
  
  if (!language) {
    return <LanguageSelection />;
  }

  return (
    <Router>
      <OfflineBanner />
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

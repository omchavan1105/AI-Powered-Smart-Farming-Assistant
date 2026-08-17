import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Home, 
  Map, 
  Sprout, 
  CalendarDays, 
  CloudSun, 
  ScanSearch, 
  TestTube, 
  TrendingUp, 
  Bot, 
  Landmark, 
  LineChart, 
  Bell, 
  User, 
  Settings,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  
  const navItems = [
    { to: "/dashboard", icon: <Home size={20} />, labelKey: "sidebar.dashboard" },
    { to: "/my-farm", icon: <Map size={20} />, labelKey: "sidebar.myFarm" },
    { to: "/crop-intelligence", icon: <Sprout size={20} />, labelKey: "sidebar.cropIntelligence" },
    { to: "/season-advisor", icon: <CalendarDays size={20} />, labelKey: "sidebar.seasonAdvisor" },
    { to: "/weather", icon: <CloudSun size={20} />, labelKey: "sidebar.weather" },
    { to: "/disease-detection", icon: <ScanSearch size={20} />, labelKey: "sidebar.diseaseDetection" },
    { to: "/soil-analysis", icon: <TestTube size={20} />, labelKey: "sidebar.soilAnalysis" },
    { to: "/market-prices", icon: <TrendingUp size={20} />, labelKey: "sidebar.marketPrices" },
    { to: "/farmai", icon: <Bot size={20} />, labelKey: "sidebar.farmAI" },
    { to: "/schemes", icon: <Landmark size={20} />, labelKey: "sidebar.schemes" },
    { to: "/yield-prediction", icon: <LineChart size={20} />, labelKey: "sidebar.yieldPrediction" },
    { to: "/alerts", icon: <Bell size={20} />, labelKey: "sidebar.alerts" },
    { to: "/profile", icon: <User size={20} />, labelKey: "sidebar.profile" },
    { to: "/settings", icon: <Settings size={20} />, labelKey: "sidebar.settings" }
  ];

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      background: '#0c4221',
      color: 'white',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      overflowY: 'auto',
      zIndex: 100,
      transition: 'transform 0.3s ease'
    }} className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div style={{ padding: '0 20px', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', background: '#15803d', borderRadius: '10px', display: 'grid', placeItems: 'center', fontSize: '20px' }}>🌿</div>
          <h2 style={{ margin: 0, fontSize: '20px', fontFamily: 'Manrope, sans-serif' }}>KrishiSetu</h2>
        </div>
        {/* Close button for mobile */}
        <button 
          className="sidebar-close-btn"
          onClick={onClose}
          style={{ 
            display: 'none', 
            background: 'rgba(255,255,255,0.1)', 
            border: 'none', 
            color: 'white', 
            borderRadius: '8px', 
            padding: '6px',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 15px' }}>
        {navItems.map((item, idx) => (
          <NavLink 
            key={idx} 
            to={item.to}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 15px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? 'white' : '#b9d7c0',
              background: isActive ? '#15803d' : 'transparent',
              fontWeight: isActive ? 'bold' : 'normal',
              transition: 'all 0.2s'
            })}
          >
            {item.icon}
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

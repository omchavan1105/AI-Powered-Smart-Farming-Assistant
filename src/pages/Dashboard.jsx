import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { weatherService } from '../services/weatherService';
import { cropService } from '../services/cropService';
import { soilService } from '../services/soilService';
import { marketService } from '../services/marketService';
import { CloudSun, Sprout, Droplets, TrendingUp, Bot, MapPin, AlertCircle } from 'lucide-react';

const DashboardCard = ({ icon, iconBg, iconColor, title, value, subtitle, subtitleColor, isLoading, isUnavailable, unavailableText, onClick }) => (
  <div 
    onClick={onClick}
    style={{ 
      background: 'white', 
      padding: '24px', 
      borderRadius: '16px', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
      border: '1px solid #e5eee7',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { if (onClick) e.currentTarget.style.transform = 'none'; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
      <div style={{ background: iconBg, padding: '10px', borderRadius: '10px', color: iconColor }}>{icon}</div>
      <h3 style={{ margin: 0, color: '#506158', fontSize: '15px' }}>{title}</h3>
    </div>
    {isLoading ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ height: '28px', width: '70%', background: '#f0f4f1', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '16px', width: '50%', background: '#f0f4f1', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    ) : isUnavailable ? (
      <div>
        <p style={{ margin: 0, fontSize: '15px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={16} /> {unavailableText}
        </p>
      </div>
    ) : (
      <>
        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#17351f' }}>{value}</p>
        {subtitle && <span style={{ fontSize: '13px', color: subtitleColor || '#166534', fontWeight: '600' }}>{subtitle}</span>}
      </>
    )}
  </div>
);

const Dashboard = () => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [crops, setCrops] = useState([]);
  const [soil, setSoil] = useState(null);
  const [marketPrice, setMarketPrice] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setWeatherLoading(true);
      try {
        const location = profile?.village || profile?.district || 'Pune';
        const weatherData = await weatherService.getCurrentWeather(location);
        setWeather(weatherData);

        if (user) {
          // Fetch farmer crops
          const userCrops = await cropService.getFarmerCrops(user.id);
          setCrops(userCrops);

          // Fetch latest soil record
          const latestSoil = await soilService.getLatestSoilRecord(user.id);
          setSoil(latestSoil);

          // Fetch market prices for farmer's active crop
          const cropName = (userCrops && userCrops.length > 0) ? userCrops[0].crop_name : (profile?.current_crop || 'Tomato');
          const prices = await marketService.getMarketPrices(cropName);
          if (prices && prices.length > 0) {
            setMarketPrice(prices[0]);
          }
        }
      } catch (err) {
        console.error('Dashboard data load error:', err);
      } finally {
        setWeatherLoading(false);
      }
    };
    loadDashboardData();
  }, [user, profile]);

  const activeCropName = (crops && crops.length > 0) ? crops[0].crop_name : profile?.current_crop;
  const activeCropSeason = (crops && crops.length > 0) ? `${crops[0].season || 'Active'} Season` : profile?.crop_stage;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ color: '#166534', margin: '0 0 8px 0', fontFamily: 'Manrope, sans-serif' }}>
            {t('dashboard.welcome')}, {profile?.full_name || 'Farmer'} 👋
          </h1>
          <p style={{ color: '#627168', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={16} /> {profile?.village || '—'}, {profile?.district || '—'}
          </p>
        </div>
      </header>
      
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        {/* Crop Card */}
        <DashboardCard
          icon={<Sprout size={24} />}
          iconBg="#e7f5e9"
          iconColor="#166534"
          title={t('dashboard.myCrop')}
          value={activeCropName || t('dashboard.noCrop')}
          subtitle={activeCropName ? (activeCropSeason || 'Active') : t('dashboard.setupCrop')}
          subtitleColor={activeCropName ? '#166534' : '#9ca3af'}
          onClick={() => navigate('/my-farm')}
        />

        {/* Weather Card */}
        <DashboardCard
          icon={<CloudSun size={24} />}
          iconBg="#e0f2fe"
          iconColor="#0369a1"
          title={t('dashboard.weather')}
          value={weather ? `${weather.temp}°C` : null}
          subtitle={weather?.condition || ''}
          subtitleColor="#0369a1"
          isLoading={weatherLoading}
          isUnavailable={!weatherLoading && !weather}
          unavailableText={t('dashboard.dataUnavailable')}
          onClick={() => navigate('/weather')}
        />

        {/* Soil Moisture Card */}
        <DashboardCard
          icon={<Droplets size={24} />}
          iconBg="#fdf4ff"
          iconColor="#86198f"
          title={t('dashboard.soilHealth')}
          value={soil ? `pH ${soil.ph_level}` : null}
          subtitle={soil ? `Moisture: ${soil.moisture_level}%` : null}
          subtitleColor="#86198f"
          isUnavailable={!soil}
          unavailableText={t('dashboard.dataUnavailable')}
          onClick={() => navigate('/soil-analysis')}
        />

        {/* Mandi Price Card */}
        <DashboardCard
          icon={<TrendingUp size={24} />}
          iconBg="#fffbeb"
          iconColor="#b45309"
          title={t('dashboard.mandiPrice')}
          value={marketPrice ? `₹${marketPrice.currentPrice}/Q` : null}
          subtitle={marketPrice ? `${marketPrice.market} (${marketPrice.crop})` : null}
          subtitleColor="#b45309"
          isUnavailable={!marketPrice}
          unavailableText={t('dashboard.dataUnavailable')}
          onClick={() => navigate('/market-prices')}
        />
      </div>

      {/* AI Advice Section */}
      <section style={{ background: 'linear-gradient(145deg, #166534, #0c4221)', borderRadius: '20px', padding: '30px', color: 'white', boxShadow: '0 10px 30px rgba(22, 101, 52, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '12px' }}><Bot size={28} /></div>
          <h2 style={{ margin: 0, fontFamily: 'Manrope', fontSize: '22px' }}>{t('dashboard.todayAdvice')}</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px' }}>
            <span style={{ fontSize: '22px' }}>🌧️</span>
            <p style={{ margin: 0, lineHeight: 1.5, color: '#d8f3df' }}>
              {weather?.rainProb > 40 
                ? `${t('dashboard.weather')}: ${weather.rainProb}% ${t('dashboard.rainProb')}. Plan field activities accordingly.`
                : weather ? `${weather.condition} in ${profile?.village || 'your area'}. Normal farming conditions.` : t('dashboard.dataUnavailable')
              }
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px' }}>
            <span style={{ fontSize: '22px' }}>🌱</span>
            <p style={{ margin: 0, lineHeight: 1.5, color: '#d8f3df' }}>
              {soil 
                ? `Latest soil record logged: pH ${soil.ph_level}. Soil moisture is ${soil.moisture_level}%.` 
                : `${t('soil.subtitle')} — ${t('dashboard.dataUnavailable')}`}
            </p>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#a3cba9', textAlign: 'right' }}>
          <em>{t('common.demoData')} — AI {t('dashboard.aiAdvice')}</em>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

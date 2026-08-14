import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { weatherService } from '../services/weatherService';
import { CloudSun, Wind, Droplets, CloudRain, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

const Weather = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const location = profile?.village || profile?.district || 'Pune';
      const cur = await weatherService.getCurrentWeather(location);
      const forc = await weatherService.getForecast(location);
      setCurrent(cur);
      setForecast(forc);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '10px', color: '#166534' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        {t('common.loading')}
      </div>
    );
  }

  if (error || !current) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
        <div style={{ background: '#fef2f2', padding: '40px', borderRadius: '16px', border: '1px solid #fecaca' }}>
          <AlertTriangle size={48} style={{ color: '#b91c1c', marginBottom: '15px' }} />
          <h2 style={{ color: '#991b1b', margin: '0 0 10px 0' }}>{t('weather.errorLoading')}</h2>
          <p style={{ color: '#b91c1c', margin: '0 0 20px 0' }}>{t('common.error')}</p>
          <button onClick={fetchData} className="primary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} /> {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#166534', margin: '0 0 10px 0', fontFamily: 'Manrope, sans-serif' }}>{t('weather.title')}</h1>
        <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{t('common.demoData')}</span>
      </header>

      {/* Main Weather Card */}
      <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', borderRadius: '24px', padding: '40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(3,105,161,0.2)', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'normal' }}>{current.location}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
            <CloudSun size={64} />
            <h1 style={{ fontSize: '64px', margin: 0, fontFamily: 'Manrope' }}>{current.temp}°</h1>
          </div>
          <p style={{ margin: '5px 0 0 0', fontSize: '18px' }}>{current.condition} • {t('weather.feelsLike')} {current.feelsLike}°</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px', minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Droplets size={18}/> {t('weather.humidity')}</span>
            <strong>{current.humidity}%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Wind size={18}/> {t('weather.wind')}</span>
            <strong>{current.windSpeed} km/h</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CloudRain size={18}/> {t('weather.rain')}</span>
            <strong>{current.rainProb}%</strong>
          </div>
        </div>
      </div>

      {/* 7 Day Forecast */}
      {forecast.length > 0 && (
        <>
          <h2 style={{ color: '#166534', margin: '0 0 20px 0', fontFamily: 'Manrope' }}>{t('weather.forecast')}</h2>
          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '20px' }}>
            {forecast.map((day, idx) => (
              <div key={idx} style={{ minWidth: '120px', background: 'white', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e5eee7', flex: '0 0 auto' }}>
                <p style={{ margin: '0 0 10px 0', color: '#627168', fontWeight: 'bold' }}>{day.day}</p>
                <div style={{ color: '#0369a1', margin: '15px 0' }}>
                  {day.condition === 'Rain' ? <CloudRain size={32} style={{margin: 'auto'}}/> : <CloudSun size={32} style={{margin: 'auto'}}/>}
                </div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '22px' }}>{day.temp}°</h3>
                <span style={{ color: '#0ea5e9', fontSize: '12px', display: 'block' }}>{day.rainProb}% {t('weather.rain')}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Farming Impact Alerts */}
      <h2 style={{ color: '#166534', margin: '20px 0', fontFamily: 'Manrope' }}>{t('weather.farmingImpact')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px' }}>
          <div style={{ color: '#b45309', flexShrink: 0 }}><AlertTriangle size={24} /></div>
          <div>
            <h4 style={{ margin: '0 0 5px 0', color: '#92400e', fontSize: '16px' }}>{t('weather.sprayingTitle')}</h4>
            <p style={{ margin: 0, color: '#b45309', fontSize: '14px', lineHeight: 1.5 }}>
              {t('common.demoData')} — {t('dashboard.dataUnavailable')}
            </p>
          </div>
        </div>
        
        <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px' }}>
          <div style={{ color: '#1d4ed8', flexShrink: 0 }}><Droplets size={24} /></div>
          <div>
            <h4 style={{ margin: '0 0 5px 0', color: '#1e40af', fontSize: '16px' }}>{t('weather.irrigationTitle')}</h4>
            <p style={{ margin: 0, color: '#2563eb', fontSize: '14px', lineHeight: 1.5 }}>
              {t('common.demoData')} — {t('dashboard.dataUnavailable')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
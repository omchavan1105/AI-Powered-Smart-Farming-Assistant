import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { alertService } from '../services/alertService';
import { weatherService } from '../services/weatherService';
import { soilService } from '../services/soilService';
import { marketService } from '../services/marketService';
import { whatsappService } from '../services/whatsappService';
import { Bell, AlertTriangle, CloudRain, TrendingUp, Droplets, Bug, Loader2, CheckCircle2, ShieldAlert, Share2 } from 'lucide-react';

const Alerts = () => {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        let dbAlerts = [];
        if (user) {
          dbAlerts = await alertService.getFarmerAlerts(user.id);
        }

        // Fetch live contextual data to generate real-time alerts
        const location = profile?.village || profile?.district || 'Pune';
        const [weatherData, marketData, soilData] = await Promise.all([
          weatherService.getCurrentWeather(location),
          marketService.getMarketPrices(profile?.current_crop || ''),
          user ? soilService.getLatestSoilRecord(user.id) : null
        ]);

        const dynamicAlerts = alertService.generateLiveAlerts({
          weatherData,
          marketData,
          soilData,
          cropName: profile?.current_crop || 'Farm Crop'
        });

        // Merge DB alerts and dynamic alerts (deduplicating by message/title)
        const combined = [...dbAlerts];
        dynamicAlerts.forEach(dyn => {
          const exists = combined.some(a => a.message === dyn.message || a.title === dyn.title);
          if (!exists) {
            combined.push(dyn);
          }
        });

        setAlerts(combined);
      } catch (err) {
        console.error("Error fetching alerts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [user, profile]);

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => (a.priority || '').toLowerCase() === filter.toLowerCase());

  const getAlertIcon = (type) => {
    switch (type) {
      case 'weather':
        return <CloudRain size={20} />;
      case 'market':
        return <TrendingUp size={20} />;
      case 'soil':
        return <Droplets size={20} />;
      case 'pest':
      case 'disease':
        return <Bug size={20} />;
      default:
        return <AlertTriangle size={20} />;
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '25px' }}>
        <h1 style={{ color: '#166534', margin: '0 0 8px 0', fontFamily: 'Manrope, sans-serif' }}>{t('alerts.title')}</h1>
        <p style={{ color: '#627168', margin: 0 }}>
          Real-time agro-climatic advisories, pest/disease warnings, and mandi fluctuations tailored to your farm.
        </p>
      </header>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'high', 'medium', 'low'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filter === f ? '1px solid #166534' : '1px solid #d8e5da',
              background: filter === f ? '#166534' : 'white',
              color: filter === f ? 'white' : '#506158',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {f === 'all' ? `All Alerts (${alerts.length})` : `${f} Priority`}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gap: '8px', color: '#166534' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          {t('common.loading')}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div style={{ background: 'white', padding: '50px 20px', textAlign: 'center', borderRadius: '16px', border: '1px solid #e5eee7' }}>
          <CheckCircle2 size={48} style={{ color: '#166534', marginBottom: '12px' }} />
          <h3 style={{ color: '#17351f', margin: '0 0 6px 0' }}>All Clear! No Active Alerts</h3>
          <p style={{ color: '#627168', margin: 0, fontSize: '14px' }}>
            Weather, market prices, and soil parameters are within normal safe ranges for your farm.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredAlerts.map((item, idx) => {
            const isHigh = item.priority === 'High';
            const isMedium = item.priority === 'Medium';
            
            return (
              <div 
                key={item.id || idx} 
                style={{ 
                  background: 'white', 
                  padding: '20px 24px', 
                  borderRadius: '16px', 
                  border: '1px solid #e5eee7',
                  borderLeft: `5px solid ${isHigh ? '#dc2626' : isMedium ? '#d97706' : '#2563eb'}`,
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ 
                  background: isHigh ? '#fef2f2' : isMedium ? '#fffbeb' : '#eff6ff', 
                  color: isHigh ? '#dc2626' : isMedium ? '#d97706' : '#2563eb',
                  padding: '10px', 
                  borderRadius: '10px',
                  flexShrink: 0 
                }}>
                  {getAlertIcon(item.alert_type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0, color: '#17351f', fontSize: '16px' }}>{item.title || 'Farm Advisory'}</h3>
                    <span style={{ 
                      background: isHigh ? '#fef2f2' : isMedium ? '#fffbeb' : '#eff6ff',
                      color: isHigh ? '#b91c1c' : isMedium ? '#b45309' : '#1d4ed8',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {item.priority} Priority
                    </span>
                  </div>
                  
                  <p style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '14px', lineHeight: 1.5 }}>
                    {item.message}
                  </p>

                  {item.reason && (
                    <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                      <strong>Trigger Reason:</strong> {item.reason}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ color: '#9ca3af', fontSize: '11px' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleString() : 'Live Stream'}
                    </span>
                    <button
                      onClick={() => {
                        const msg = whatsappService.formatWeatherAlertMessage(item.message, language);
                        whatsappService.shareToWhatsApp(msg);
                      }}
                      style={{
                        backgroundColor: '#25D366',
                        color: '#ffffff',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Share2 size={13} /> WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Alerts;
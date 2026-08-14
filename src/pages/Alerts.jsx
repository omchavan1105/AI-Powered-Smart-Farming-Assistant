import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Bell, AlertTriangle, CloudRain, TrendingUp, Info, CheckCircle2 } from 'lucide-react';

const Alerts = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');

  const alerts = [
    {
      id: 1,
      type: 'weather',
      title: 'Heavy Rainfall Advisory',
      message: 'Moderate to heavy rain predicted in your district within the next 48 hours. Ensure proper drainage in fields.',
      priority: 'High',
      date: 'Today, 08:30 AM',
      icon: <CloudRain size={20} />
    },
    {
      id: 2,
      type: 'pest',
      title: 'Pest Alert: Tomato Early Blight',
      message: 'Humid conditions are favorable for early blight in tomato crops in nearby blocks. Monitor lower leaves closely.',
      priority: 'Medium',
      date: 'Yesterday',
      icon: <AlertTriangle size={20} />
    },
    {
      id: 3,
      type: 'market',
      title: 'Mandi Price Rise',
      message: 'Onion prices in Lasalgaon APMC increased by ₹150/Q today due to lower arrivals.',
      priority: 'Low',
      date: '2 days ago',
      icon: <TrendingUp size={20} />
    }
  ];

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.priority.toLowerCase() === filter.toLowerCase());

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#166534', margin: '0 0 10px 0', fontFamily: 'Manrope, sans-serif' }}>{t('alerts.title')}</h1>
        <p style={{ color: '#627168', margin: 0 }}>{t('alerts.subtitle')}</p>
        <div style={{ marginTop: '10px' }}>
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            {t('common.demoData')}
          </span>
        </div>
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
            {f === 'all' ? 'All Alerts' : f}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredAlerts.map((item) => {
          const isHigh = item.priority === 'High';
          const isMedium = item.priority === 'Medium';
          
          return (
            <div 
              key={item.id} 
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
                {item.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, color: '#17351f', fontSize: '17px' }}>{item.title}</h3>
                  <span style={{ 
                    background: isHigh ? '#fef2f2' : isMedium ? '#fffbeb' : '#eff6ff',
                    color: isHigh ? '#b91c1c' : isMedium ? '#b45309' : '#1d4ed8',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {t('alerts.priority')}: {item.priority}
                  </span>
                </div>
                
                <p style={{ margin: '0 0 8px 0', color: '#506158', fontSize: '14px', lineHeight: 1.5 }}>
                  {item.message}
                </p>

                <span style={{ color: '#9ca3af', fontSize: '12px' }}>{item.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Alerts;
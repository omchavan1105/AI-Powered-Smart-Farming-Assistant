import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Languages, Check } from 'lucide-react';

const Settings = () => {
  const { t, language, setLanguage } = useLanguage();

  const langOptions = [
    { code: 'en', label: 'English', sub: 'English' },
    { code: 'hi', label: 'हिंदी', sub: 'Hindi' },
    { code: 'mr', label: 'मराठी', sub: 'Marathi' }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#166534', margin: '0 0 10px 0', fontFamily: 'Manrope, sans-serif' }}>{t('sidebar.settings')}</h1>
        <p style={{ color: '#627168', margin: 0 }}>{t('settings.subtitle')}</p>
      </header>

      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e5eee7', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: '#e7f5e9', padding: '8px', borderRadius: '8px', color: '#166534' }}>
            <Languages size={20} />
          </div>
          <h2 style={{ color: '#17351f', margin: 0, fontSize: '18px' }}>{t('settings.language')}</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {langOptions.map((opt) => {
            const isSelected = language === opt.code;
            return (
              <button 
                key={opt.code}
                onClick={() => setLanguage(opt.code)}
                style={{ 
                  padding: '16px 20px', 
                  borderRadius: '12px', 
                  border: isSelected ? '2px solid #166534' : '1px solid #d8e5da', 
                  background: isSelected ? '#f0fdf4' : 'white', 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <strong style={{ display: 'block', color: isSelected ? '#166534' : '#17351f', fontSize: '16px' }}>{opt.label}</strong>
                  <span style={{ color: '#718278', fontSize: '12px' }}>{opt.sub}</span>
                </div>
                {isSelected && (
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#166534', color: 'white', display: 'grid', placeItems: 'center' }}>
                    <Check size={14} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Settings;
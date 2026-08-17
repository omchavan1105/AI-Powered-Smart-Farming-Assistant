import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelection = () => {
  const { setLanguage, t } = useLanguage();

  const handleSelect = (lang) => {
    setLanguage(lang);
  };

  const languages = [
    { code: 'mr', name: 'मराठी', sub: 'Marathi' },
    { code: 'hi', name: 'हिंदी', sub: 'Hindi' },
    { code: 'en', name: 'English', sub: 'English' }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at 50% 30%, #e6f5e8 0%, #f7fbf7 70%)',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '40px 30px', 
        borderRadius: '24px', 
        boxShadow: '0 10px 40px rgba(22, 101, 52, 0.08)',
        border: '1px solid #e5eee7',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center'
      }}>
        <div style={{ width: '60px', height: '60px', background: '#e7f5e9', borderRadius: '16px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', marginBottom: '16px' }}>
          🌿
        </div>

        <h1 style={{ color: '#166534', margin: '0 0 8px 0', fontFamily: 'Manrope, sans-serif', fontSize: '26px' }}>
          KrishiSetu
        </h1>
        <p style={{ color: '#627168', margin: '0 0 30px 0', fontSize: '15px' }}>
          {t('lang.choose')}
        </p>
        
        <div style={{ display: 'flex', gap: '14px', flexDirection: 'column', width: '100%' }}>
          {languages.map((l) => (
            <button 
              key={l.code}
              className="primary-btn" 
              onClick={() => handleSelect(l.code)} 
              style={{ 
                padding: '16px 20px', 
                fontSize: '17px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '12px'
              }}
            >
              <span>{l.name}</span>
              <span style={{ fontSize: '13px', opacity: 0.8, fontWeight: 'normal' }}>{l.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;

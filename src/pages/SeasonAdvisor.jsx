import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CalendarDays, Sun, CloudRain, Sparkles, Sprout, Droplets, CheckCircle2 } from 'lucide-react';

const SeasonAdvisor = () => {
  const { t } = useLanguage();
  const [selectedSeason, setSelectedSeason] = useState('kharif');

  const seasons = [
    {
      id: 'kharif',
      name: 'Kharif Season (Monsoon)',
      months: 'June – October',
      climate: 'Warm and high rainfall',
      icon: <CloudRain size={24} />,
      recommendedCrops: [
        { name: 'Soybean', duration: '90-100 days', water: 'Moderate', profit: 'High' },
        { name: 'Cotton', duration: '150-180 days', water: 'High', profit: 'Very High' },
        { name: 'Rice / Paddy', duration: '120-140 days', water: 'Very High', profit: 'Moderate' },
        { name: 'Maize', duration: '85-95 days', water: 'Low-Moderate', profit: 'Moderate' }
      ],
      advisory: 'Prepare drainage channels before heavy rains. Use certified treated seeds to avoid root rot.'
    },
    {
      id: 'rabi',
      name: 'Rabi Season (Winter)',
      months: 'October – March',
      climate: 'Cool and dry weather',
      icon: <Sun size={24} />,
      recommendedCrops: [
        { name: 'Wheat', duration: '110-125 days', water: 'Moderate', profit: 'High' },
        { name: 'Gram / Chickpea', duration: '90-110 days', water: 'Low', profit: 'High' },
        { name: 'Mustard', duration: '100-115 days', water: 'Low', profit: 'Very High' },
        { name: 'Onion (Late Kharif/Rabi)', duration: '110-130 days', water: 'Moderate', profit: 'Very High' }
      ],
      advisory: 'Ensure pre-sowing irrigation. Protect seedlings from sudden temperature drops in December-January.'
    },
    {
      id: 'zaid',
      name: 'Zaid Season (Summer)',
      months: 'March – June',
      climate: 'Warm and dry with irrigation required',
      icon: <Sparkles size={24} />,
      recommendedCrops: [
        { name: 'Watermelon / Muskmelon', duration: '75-90 days', water: 'Moderate', profit: 'High' },
        { name: 'Cucumber & Gourds', duration: '60-80 days', water: 'Moderate', profit: 'Moderate' },
        { name: 'Moong (Green Gram)', duration: '60-70 days', water: 'Low', profit: 'High' },
        { name: 'Fodder Crops', duration: '50-65 days', water: 'Low', profit: 'Moderate' }
      ],
      advisory: 'Use drip irrigation or mulching to conserve moisture under high heat. Focus on short-duration crops.'
    }
  ];

  const currentSeasonData = seasons.find(s => s.id === selectedSeason) || seasons[0];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#166534', margin: '0 0 10px 0', fontFamily: 'Manrope, sans-serif' }}>{t('season.title')}</h1>
        <p style={{ color: '#627168', margin: 0 }}>{t('season.subtitle')}</p>
        <div style={{ marginTop: '10px' }}>
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            {t('common.demoData')}
          </span>
        </div>
      </header>

      {/* Season Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }} className="season-tabs-grid">
        {seasons.map((s) => {
          const isSelected = s.id === selectedSeason;
          return (
            <div
              key={s.id}
              onClick={() => setSelectedSeason(s.id)}
              style={{
                background: isSelected ? '#166534' : 'white',
                color: isSelected ? 'white' : '#17351f',
                padding: '20px',
                borderRadius: '16px',
                border: isSelected ? '1px solid #166534' : '1px solid #e5eee7',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 8px 20px rgba(22,101,52,0.15)' : 'none'
              }}
            >
              <div style={{ color: isSelected ? '#dcfce7' : '#166534', marginBottom: '10px' }}>
                {s.icon}
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{s.name}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: isSelected ? '#b9d7c0' : '#627168' }}>{s.months}</p>
            </div>
          );
        })}
      </div>

      {/* Active Season Details */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e5eee7', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', color: '#17351f', fontSize: '22px' }}>{currentSeasonData.name}</h2>
            <span style={{ color: '#627168', fontSize: '14px' }}>{currentSeasonData.climate} • {currentSeasonData.months}</span>
          </div>
        </div>

        {/* Advisory Box */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px 20px', borderRadius: '12px', marginBottom: '25px' }}>
          <h4 style={{ margin: '0 0 6px 0', color: '#166534', fontSize: '15px' }}>🌱 Seasonal Advisory</h4>
          <p style={{ margin: 0, color: '#14532d', fontSize: '14px', lineHeight: 1.5 }}>{currentSeasonData.advisory}</p>
        </div>

        {/* Recommended Crops Table */}
        <h3 style={{ margin: '0 0 15px 0', color: '#166534', fontSize: '18px' }}>Recommended Crops</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
            <thead style={{ background: '#f8fcf8', color: '#506158', borderBottom: '1px solid #e5eee7' }}>
              <tr>
                <th style={{ padding: '12px 16px', fontSize: '13px' }}>Crop</th>
                <th style={{ padding: '12px 16px', fontSize: '13px' }}>Duration</th>
                <th style={{ padding: '12px 16px', fontSize: '13px' }}>Water Requirement</th>
                <th style={{ padding: '12px 16px', fontSize: '13px' }}>Profit Potential</th>
              </tr>
            </thead>
            <tbody>
              {currentSeasonData.recommendedCrops.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f4f1' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#17351f' }}>{c.name}</td>
                  <td style={{ padding: '14px 16px', color: '#627168', fontSize: '14px' }}>{c.duration}</td>
                  <td style={{ padding: '14px 16px', color: '#627168', fontSize: '14px' }}>{c.water}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                      {c.profit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .season-tabs-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SeasonAdvisor;
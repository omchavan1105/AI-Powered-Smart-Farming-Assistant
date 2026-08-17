import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { soilService } from '../services/soilService';
import { TestTube, Loader2, CheckCircle, AlertTriangle, ShieldAlert, Droplets, Sparkles, Sprout } from 'lucide-react';

const SoilAnalysis = () => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  
  const [ph, setPh] = useState('');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');
  const [moisture, setMoisture] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [latestRecord, setLatestRecord] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    const loadLatestSoil = async () => {
      if (user) {
        const record = await soilService.getLatestSoilRecord(user.id);
        if (record) {
          setLatestRecord(record);
          const rec = soilService.getSoilRecommendation(record, profile?.current_crop || 'Your Crop');
          setRecommendation(rec);
        }
      }
    };
    loadLatestSoil();
  }, [user, profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const savedData = await soilService.saveSoilRecord({
        farmerId: user.id,
        ph,
        nitrogen,
        phosphorus,
        potassium,
        moisture
      });

      setLatestRecord(savedData);
      const rec = soilService.getSoilRecommendation(savedData, profile?.current_crop || 'Your Crop');
      setRecommendation(rec);

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
      
      // Reset form
      setPh(''); setNitrogen(''); setPhosphorus(''); setPotassium(''); setMoisture('');
    } catch (err) {
      console.error('Soil save error:', err);
      setError(t('soil.errorSaving'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#166534', margin: '0 0 10px 0', fontFamily: 'Manrope, sans-serif' }}>{t('soil.title')}</h1>
        <p style={{ color: '#627168', margin: 0 }}>{t('soil.subtitle')}</p>
      </header>

      {/* Success/Error Messages */}
      {saved && (
        <div style={{ color: '#166534', marginBottom: '20px', fontSize: '14px', padding: '12px 15px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> {t('soil.savedSuccess')}
        </div>
      )}
      {error && (
        <div style={{ color: '#991b1b', marginBottom: '20px', fontSize: '14px', padding: '12px 15px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="soil-grid">
        {/* Input Form */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e5eee7' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#17351f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TestTube size={20} /> {t('soil.recordNew')}
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>
                {t('soil.ph')} (Optimal 6.0 - 7.5)
              </label>
              <input 
                type="number" 
                step="0.1" 
                min="0" 
                max="14" 
                value={ph} 
                placeholder="e.g. 6.8"
                onChange={e => setPh(e.target.value)} 
                required 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none' }} 
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }} className="npk-grid">
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '13px', fontWeight: '500' }}>
                  {t('soil.nitrogen')} (mg/kg)
                </label>
                <input 
                  type="number" 
                  value={nitrogen} 
                  placeholder="e.g. 210"
                  onChange={e => setNitrogen(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '13px', fontWeight: '500' }}>
                  {t('soil.phosphorus')} (mg/kg)
                </label>
                <input 
                  type="number" 
                  value={phosphorus} 
                  placeholder="e.g. 18"
                  onChange={e => setPhosphorus(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '13px', fontWeight: '500' }}>
                  {t('soil.potassium')} (mg/kg)
                </label>
                <input 
                  type="number" 
                  value={potassium} 
                  placeholder="e.g. 220"
                  onChange={e => setPotassium(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none' }} 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>
                {t('soil.moisture')} (Optimal 45% - 70%)
              </label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={moisture} 
                placeholder="e.g. 55"
                onChange={e => setMoisture(e.target.value)} 
                required 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none' }} 
              />
            </div>
            
            <button 
              type="submit" 
              className="primary-btn" 
              disabled={saving} 
              style={{ marginTop: '10px', opacity: saving ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {saving && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
              {saving ? t('soil.savingRecord') : t('soil.saveRecord')}
            </button>
          </form>
        </div>

        {/* Real-time Health Score Card */}
        <div style={{ background: '#f0fdf4', padding: '30px', borderRadius: '16px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ color: '#166534', margin: '0 0 15px 0', fontSize: '18px' }}>{t('soil.healthScore')}</h3>
          
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'white',
            border: `10px solid ${recommendation ? (recommendation.healthScore >= 75 ? '#15803d' : recommendation.healthScore >= 50 ? '#d97706' : '#dc2626') : '#d8e5da'}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'Manrope'
          }}>
            <span style={{ fontSize: '42px', fontWeight: 'bold', color: recommendation ? (recommendation.healthScore >= 75 ? '#15803d' : recommendation.healthScore >= 50 ? '#d97706' : '#dc2626') : '#9ca3af', lineHeight: 1 }}>
              {recommendation ? recommendation.healthScore : '—'}
            </span>
            <span style={{ fontSize: '12px', color: '#627168', marginTop: '4px' }}>
              {recommendation ? recommendation.rating : 'No Test'}
            </span>
          </div>

          <p style={{ color: '#166534', marginTop: '15px', lineHeight: 1.5, fontSize: '14px' }}>
            {recommendation ? recommendation.summary : 'Log your soil test parameters to calculate health score & agronomic advice.'}
          </p>

          {/* Fertilizer Guidance Accordion/Card */}
          {recommendation && (
            <div style={{ marginTop: '20px', width: '100%', background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #dcfce7', textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sprout size={16} /> Fertilizer & Nutrient Guidance
              </h4>
              <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px', color: '#506158', fontSize: '13px', lineHeight: 1.5 }}>
                {recommendation.fertilizerGuidance.map((guide, gIdx) => (
                  <li key={gIdx} style={{ marginBottom: '4px' }}>{guide}</li>
                ))}
              </ul>

              <h4 style={{ margin: '0 0 8px 0', color: '#0369a1', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Droplets size={16} /> Irrigation Recommendation
              </h4>
              <p style={{ margin: 0, color: '#0284c7', fontSize: '13px', lineHeight: 1.4 }}>
                {recommendation.irrigationAdvice[0]}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .soil-grid {
            grid-template-columns: 1fr !important;
          }
          .npk-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SoilAnalysis;
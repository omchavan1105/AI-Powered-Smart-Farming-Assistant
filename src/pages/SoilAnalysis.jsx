import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { TestTube, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const SoilAnalysis = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [ph, setPh] = useState('');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');
  const [moisture, setMoisture] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const { error: dbError } = await supabase.from('soil_records').insert({
        farmer_id: user.id,
        ph_level: ph,
        nitrogen: nitrogen,
        phosphorus: phosphorus,
        potassium: potassium,
        moisture_level: moisture
      });

      if (dbError) throw dbError;

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
              <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>{t('soil.ph')} (0-14)</label>
              <input type="number" step="0.1" min="0" max="14" value={ph} onChange={e => setPh(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }} className="npk-grid">
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>{t('soil.nitrogen')} (mg/kg)</label>
                <input type="number" value={nitrogen} onChange={e => setNitrogen(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>{t('soil.phosphorus')} (mg/kg)</label>
                <input type="number" value={phosphorus} onChange={e => setPhosphorus(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>{t('soil.potassium')} (mg/kg)</label>
                <input type="number" value={potassium} onChange={e => setPotassium(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>{t('soil.moisture')} (%)</label>
              <input type="number" min="0" max="100" value={moisture} onChange={e => setMoisture(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none' }} />
            </div>
            
            <button type="submit" className="primary-btn" disabled={saving} style={{ marginTop: '10px', opacity: saving ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {saving && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
              {saving ? t('soil.savingRecord') : saved ? t('soil.savedSuccess') : t('soil.saveRecord')}
            </button>
          </form>
        </div>

        {/* Health Score Card — marked as demo */}
        <div style={{ background: '#f0fdf4', padding: '30px', borderRadius: '16px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ color: '#166534', margin: '0 0 20px 0', fontSize: '18px' }}>{t('soil.healthScore')}</h3>
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'white', border: '10px solid #15803d', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '48px', fontWeight: 'bold', color: '#15803d', fontFamily: 'Manrope' }}>
            —
          </div>
          <p style={{ color: '#166534', marginTop: '20px', lineHeight: 1.5 }}>
            {t('dashboard.dataUnavailable')}
          </p>
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginTop: '10px' }}>
            {t('soil.demoScore')}
          </span>

          {/* Fertilizer Recommendation placeholder */}
          <div style={{ marginTop: '25px', width: '100%', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #dcfce7', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '15px' }}>{t('soil.fertilizerTitle')}</h4>
            <p style={{ margin: 0, color: '#627168', fontSize: '14px', lineHeight: 1.5 }}>
              {t('dashboard.dataUnavailable')} — {t('common.demoData')}
            </p>
          </div>
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
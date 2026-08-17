import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { yieldService } from '../services/yieldService';
import { LineChart, DollarSign, Activity, Loader2 } from 'lucide-react';

const YieldPrediction = () => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  
  const [crop, setCrop] = useState('Tomato');
  const [farmSize, setFarmSize] = useState(profile?.farm_size_acres || '2');
  const [cropStage, setCropStage] = useState('Flowering');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await yieldService.predictYield({
        crop,
        farmSize: parseFloat(farmSize) || 1,
        cropStage
      }, user?.id);
      setResult(data);
    } catch (err) {
      console.error("Error predicting yield:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#166534', margin: '0 0 10px 0', fontFamily: 'Manrope, sans-serif' }}>{t('yield.title')}</h1>
        <p style={{ color: '#627168', margin: 0 }}>{t('yield.subtitle')}</p>
        <div style={{ marginTop: '10px' }}>
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            {t('yield.demoMode')}
          </span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="yield-grid">
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e5eee7', alignSelf: 'start' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#17351f' }}>{t('yield.enterData')}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>{t('yield.cropLabel')}</label>
              <select value={crop} onChange={e => setCrop(e.target.value)} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none', background: 'white' }}>
                <option value="Tomato">Tomato</option>
                <option value="Onion">Onion</option>
                <option value="Soybean">Soybean</option>
                <option value="Cotton">Cotton</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>{t('yield.farmSizeLabel')}</label>
              <input type="number" step="0.1" value={farmSize} onChange={e => setFarmSize(e.target.value)} required style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>{t('yield.cropStage')}</label>
              <select value={cropStage} onChange={e => setCropStage(e.target.value)} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none', background: 'white' }}>
                <option value="Vegetative">Vegetative</option>
                <option value="Flowering">Flowering</option>
                <option value="Fruiting">Fruiting</option>
                <option value="Maturity">Maturity</option>
              </select>
            </div>
            <button type="submit" className="primary-btn" disabled={loading} style={{ marginTop: '10px', opacity: loading ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? t('yield.calculating') : t('yield.predict')}
            </button>
          </form>
        </div>

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'linear-gradient(135deg, #166534, #14532d)', padding: '25px', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '14px', borderRadius: '12px' }}>
                <LineChart size={32} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', fontWeight: 'normal', color: '#dcfce7' }}>{t('yield.expectedYield')}</h3>
                <h2 style={{ margin: 0, fontSize: '32px', fontFamily: 'Manrope, sans-serif' }}>{result.expectedYieldKg?.toLocaleString()} kg</h2>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', padding: '25px', borderRadius: '16px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: '#dcfce7', padding: '14px', borderRadius: '12px', color: '#166534' }}>
                <DollarSign size={32} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', fontWeight: 'normal', color: '#166534' }}>{t('yield.expectedIncome')}</h3>
                <h2 style={{ margin: 0, fontSize: '32px', fontFamily: 'Manrope, sans-serif', color: '#14532d' }}>₹{result.expectedIncome?.toLocaleString()}</h2>
              </div>
            </div>

            <div style={{ background: '#fffbeb', padding: '20px', borderRadius: '16px', border: '1px solid #fef3c7', display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
              <Activity size={24} style={{ color: '#b45309', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#92400e' }}>{t('yield.riskLevel')}: {result.riskLevel}</h3>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#b45309', fontSize: '14px', lineHeight: 1.5 }}>
                  {result.mainFactors.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .yield-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default YieldPrediction;
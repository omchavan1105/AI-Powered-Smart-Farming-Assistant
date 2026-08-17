import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const ProfileSetup = () => {
  const { user, fetchProfile } = useAuth();
  const { t } = useLanguage();
  
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [soilType, setSoilType] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) { setError(t('auth.errorNameRequired')); return; }
    if (!village.trim()) { setError(t('profile.village') + ' is required'); return; }
    if (!district.trim()) { setError(t('profile.district') + ' is required'); return; }
    if (!state.trim()) { setError(t('profile.state') + ' is required'); return; }

    setLoading(true);

    try {
      const { error: dbError } = await supabase.from('farmer_profiles').insert({
        id: user.id,
        full_name: fullName,
        village,
        district,
        state,
        farm_size_acres: parseFloat(farmSize) || null,
        soil_type: soilType,
      });

      if (dbError) throw dbError;

      // Profile created successfully, fetch it so the context updates and redirects
      await fetchProfile(user.id);
    } catch (err) {
      setError(err.message || t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fcf8', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '500px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{ width: '50px', height: '50px', background: '#e7f5e9', borderRadius: '14px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontSize: '26px', marginBottom: '12px' }}>🌾</div>
        </div>
        
        <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#166534', fontFamily: 'Manrope, sans-serif' }}>{t('profile.setup')}</h2>
        
        {error && (
          <div style={{ color: '#991b1b', marginBottom: '15px', textAlign: 'center', fontSize: '14px', padding: '12px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>{t('profile.fullName')} *</label>
            <input type="text" placeholder={t('profile.fullName')} value={fullName} onChange={e => setFullName(e.target.value)} required style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>{t('profile.village')} *</label>
            <input type="text" placeholder={t('profile.village')} value={village} onChange={e => setVillage(e.target.value)} required style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>{t('profile.district')} *</label>
              <input type="text" placeholder={t('profile.district')} value={district} onChange={e => setDistrict(e.target.value)} required style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>{t('profile.state')} *</label>
              <input type="text" placeholder={t('profile.state')} value={state} onChange={e => setState(e.target.value)} required style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>{t('profile.farmSize')}</label>
            <input type="number" step="0.01" placeholder={t('profile.farmSize')} value={farmSize} onChange={e => setFarmSize(e.target.value)} style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '14px', fontWeight: '500' }}>{t('profile.soilType')}</label>
            <select value={soilType} onChange={e => setSoilType(e.target.value)} style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #d8e5da', fontSize: '15px', background: 'white' }}>
              <option value="">{t('profile.selectSoil')}</option>
              <option value="Black Soil">Black Soil</option>
              <option value="Red Soil">Red Soil</option>
              <option value="Alluvial Soil">Alluvial Soil</option>
              <option value="Laterite Soil">Laterite Soil</option>
              <option value="Sandy Soil">Sandy Soil</option>
              <option value="Clay Soil">Clay Soil</option>
            </select>
          </div>
          
          <button type="submit" className="primary-btn" disabled={loading} style={{ marginTop: '10px', opacity: loading ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '14px' }}>
            {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? t('profile.saving') : t('profile.completeSetup')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;

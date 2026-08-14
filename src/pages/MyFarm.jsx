import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Map, Sprout, MapPin, Edit3 } from 'lucide-react';

const MyFarm = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!profile) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#166534' }}>
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ color: '#166534', margin: 0, fontFamily: 'Manrope, sans-serif' }}>{t('sidebar.myFarm')}</h1>
        <button 
          onClick={() => navigate('/profile')} 
          className="secondary-btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Edit3 size={16} /> {t('profile.editProfile')}
        </button>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="farm-details-grid">
        {/* Farm Details Card */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e5eee7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
            <div style={{ background: '#e7f5e9', padding: '12px', borderRadius: '12px', color: '#166534' }}>
              <Map size={28} />
            </div>
            <h2 style={{ margin: 0, color: '#17351f', fontSize: '20px' }}>{t('farm.overview')}</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f1', paddingBottom: '10px' }}>
              <span style={{ color: '#627168' }}>{t('farm.farmSize')}</span>
              <strong style={{ color: '#17351f' }}>{profile.farm_size_acres ? `${profile.farm_size_acres} Acres` : 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f1', paddingBottom: '10px' }}>
              <span style={{ color: '#627168' }}>{t('farm.soilType')}</span>
              <strong style={{ color: '#17351f' }}>{profile.soil_type || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f1', paddingBottom: '10px' }}>
              <span style={{ color: '#627168' }}>{t('farm.irrigation')}</span>
              <strong style={{ color: '#17351f' }}>{profile.irrigation_type || 'N/A'}</strong>
            </div>
          </div>
        </div>

        {/* Location Details Card */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e5eee7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
            <div style={{ background: '#e0f2fe', padding: '12px', borderRadius: '12px', color: '#0369a1' }}>
              <MapPin size={28} />
            </div>
            <h2 style={{ margin: 0, color: '#17351f', fontSize: '20px' }}>{t('farm.location')}</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f1', paddingBottom: '10px' }}>
              <span style={{ color: '#627168' }}>{t('farm.village')}</span>
              <strong style={{ color: '#17351f' }}>{profile.village || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f1', paddingBottom: '10px' }}>
              <span style={{ color: '#627168' }}>{t('farm.district')}</span>
              <strong style={{ color: '#17351f' }}>{profile.district || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f1', paddingBottom: '10px' }}>
              <span style={{ color: '#627168' }}>{t('farm.state')}</span>
              <strong style={{ color: '#17351f' }}>{profile.state || 'N/A'}</strong>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ color: '#166534', margin: '40px 0 20px', fontFamily: 'Manrope, sans-serif' }}>{t('farm.activeCrops')}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {profile.current_crop ? (
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e5eee7', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '12px', color: '#b45309' }}>
              <Sprout size={32} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#17351f', fontSize: '20px' }}>{profile.current_crop}</h3>
              <p style={{ margin: 0, color: '#627168', fontSize: '14px', marginBottom: '10px' }}>{profile.crop_stage || 'Active'}</p>
              <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{t('dashboard.myCrop')}</span>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px dashed #d8e5da', textAlign: 'center', gridColumn: '1 / -1' }}>
            <Sprout size={40} style={{ color: '#9ca3af', marginBottom: '10px' }} />
            <h3 style={{ margin: '0 0 5px 0', color: '#506158', fontSize: '17px' }}>{t('dashboard.noCrop')}</h3>
            <p style={{ margin: '0 0 15px 0', color: '#718278', fontSize: '14px' }}>{t('dashboard.setupCrop')}</p>
            <button onClick={() => navigate('/profile')} className="secondary-btn" style={{ fontSize: '13px', padding: '8px 16px' }}>
              {t('profile.editProfile')}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .farm-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MyFarm;
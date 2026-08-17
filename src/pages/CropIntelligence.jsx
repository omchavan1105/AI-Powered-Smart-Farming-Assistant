import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { cropService } from '../services/cropService';
import { Search, Sprout, Map, Thermometer, Droplets, Clock, Bot, Loader2 } from 'lucide-react';

const CropIntelligence = () => {
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState([]);
  const [cropDetail, setCropDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('Tomato');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const recs = await cropService.getRecommendations({});
        const detail = await cropService.getCropDetails("Tomato");
        setRecommendations(recs);
        setCropDetail(detail);
      } catch (err) {
        console.error("Error fetching crop info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const handleSelectCrop = async (cropName) => {
    setSearchTerm(cropName);
    setLoading(true);
    try {
      const detail = await cropService.getCropDetails(cropName);
      setCropDetail(detail);
    } catch (err) {
      console.error("Error fetching crop detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      handleSelectCrop(searchTerm.trim());
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#166534', margin: '0 0 10px 0', fontFamily: 'Manrope, sans-serif' }}>{t('crop.title')}</h1>
        <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
          {t('common.demoData')}
        </span>
      </header>

      {/* Search & AI Recommendation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', marginBottom: '40px' }} className="crop-intelligence-grid">
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e5eee7' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={20} style={{ position: 'absolute', left: '15px', top: '15px', color: '#627168' }} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('crop.searchPlaceholder')} 
              style={{ width: '100%', padding: '14px 15px 14px 45px', borderRadius: '12px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none' }}
            />
          </form>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gap: '8px', color: '#166534' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              {t('common.loading')}
            </div>
          ) : cropDetail ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid #f0f4f1', paddingBottom: '20px' }}>
                <div style={{ background: '#e7f5e9', padding: '15px', borderRadius: '12px', color: '#166534' }}>
                  <Sprout size={32} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', color: '#17351f' }}>{cropDetail.name}</h2>
                  <span style={{ color: '#627168', fontStyle: 'italic', fontSize: '14px' }}>{cropDetail.scientificName}</span>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="crop-details-subgrid">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Map size={20} style={{ color: '#166534', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#627168', marginBottom: '2px' }}>{t('crop.soil')}</strong>
                    <span style={{ color: '#17351f', fontSize: '15px' }}>{cropDetail.soilType}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Droplets size={20} style={{ color: '#0369a1', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#627168', marginBottom: '2px' }}>{t('crop.water')}</strong>
                    <span style={{ color: '#17351f', fontSize: '15px' }}>{cropDetail.waterRequirement}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Thermometer size={20} style={{ color: '#b45309', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#627168', marginBottom: '2px' }}>pH Range</strong>
                    <span style={{ color: '#17351f', fontSize: '15px' }}>{cropDetail.phRange}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Clock size={20} style={{ color: '#6d28d9', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#627168', marginBottom: '2px' }}>{t('crop.duration')}</strong>
                    <span style={{ color: '#17351f', fontSize: '15px' }}>{cropDetail.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#627168', textAlign: 'center', padding: '30px' }}>{t('common.noData')}</p>
          )}
        </div>
        
        {/* Recommendation Widget */}
        <div style={{ background: '#f0fdf4', padding: '30px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#166534', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
            <Bot size={20} /> {t('crop.whichCrop')}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recommendations.map((rec, idx) => (
              <div 
                key={idx} 
                onClick={() => handleSelectCrop(rec.crop)}
                style={{ 
                  background: 'white', 
                  padding: '14px 16px', 
                  borderRadius: '12px', 
                  border: '1px solid #dcfce7',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#15803d'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#dcfce7'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ color: '#17351f', fontSize: '15px' }}>{rec.crop}</strong>
                  <span style={{ background: '#166534', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                    {rec.score}% Match
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#627168', lineHeight: 1.4 }}>{rec.reason}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#166534', textAlign: 'center', marginTop: '15px', marginBottom: 0 }}>
            {t('crop.basedOnProfile')}
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .crop-intelligence-grid {
            grid-template-columns: 1fr !important;
          }
          .crop-details-subgrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CropIntelligence;
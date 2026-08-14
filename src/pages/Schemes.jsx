import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { schemeService } from '../services/schemeService';
import { Landmark, ExternalLink, Loader2 } from 'lucide-react';

const Schemes = () => {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const data = await schemeService.getGovernmentSchemes();
        setSchemes(data);
      } catch (err) {
        console.error("Error loading schemes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#166534', margin: '0 0 10px 0', fontFamily: 'Manrope, sans-serif' }}>{t('scheme.title')}</h1>
        <p style={{ color: '#627168', margin: 0 }}>{t('scheme.subtitle')}</p>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gap: '8px', color: '#166534' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          {t('common.loading')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {schemes.map((scheme, idx) => (
            <div key={scheme.id || idx} style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e5eee7', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: '#fef3c7', color: '#b45309', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                  <Landmark size={24} />
                </div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#17351f' }}>{scheme.name}</h2>
              </div>
              
              <p style={{ margin: 0, color: '#627168', lineHeight: 1.6, fontSize: '15px' }}>{scheme.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#f8fcf8', padding: '15px', borderRadius: '12px' }} className="scheme-details-grid">
                <div>
                  <strong style={{ display: 'block', fontSize: '13px', color: '#166534', marginBottom: '4px' }}>{t('scheme.eligibility')}</strong>
                  <span style={{ color: '#506158', fontSize: '14px' }}>{scheme.eligibility}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '13px', color: '#166534', marginBottom: '4px' }}>{t('scheme.benefits')}</strong>
                  <span style={{ color: '#506158', fontSize: '14px' }}>{scheme.benefits}</span>
                </div>
              </div>
              
              <div style={{ marginTop: '5px' }}>
                <a 
                  href={scheme.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="secondary-btn" 
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                >
                  {t('scheme.viewWebsite')} <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .scheme-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Schemes;
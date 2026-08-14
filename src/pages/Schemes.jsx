import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Landmark, ExternalLink } from 'lucide-react';

const Schemes = () => {
  const { t } = useLanguage();

  const schemes = [
    {
      name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
      description: "Direct income support of ₹6,000 per year in three equal 4-monthly installments to all landholding farmer families.",
      eligibility: "Small and marginal farmers with cultivable land",
      benefits: "₹6,000 / year direct transfer",
      link: "https://pmkisan.gov.in/"
    },
    {
      name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
      description: "Comprehensive crop insurance scheme providing financial support and risk cover to farmers suffering crop loss or damage due to natural calamities.",
      eligibility: "All farmers growing notified crops in notified areas",
      benefits: "Low premium (1.5% - 2%) with full sum insured coverage",
      link: "https://pmfby.gov.in/"
    },
    {
      name: "KCC (Kisan Credit Card Scheme)",
      description: "Timely and affordable credit to farmers for their agricultural and other needs like purchase of seeds, fertilizers, and machinery.",
      eligibility: "Individual / Joint farmers, tenant farmers, SHGs",
      benefits: "Low-interest loans up to ₹3 Lakhs @ 4% subsidized interest",
      link: "https://myscheme.gov.in/"
    },
    {
      name: "Soil Health Card Scheme",
      description: "Provides soil health cards to farmers every 2 years with crop-wise nutrient and fertilizer recommendations.",
      eligibility: "All farmers across India",
      benefits: "Free soil testing and customized fertilizer advisory",
      link: "https://soilhealth.dac.gov.in/"
    }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#166534', margin: '0 0 10px 0', fontFamily: 'Manrope, sans-serif' }}>{t('scheme.title')}</h1>
        <p style={{ color: '#627168', margin: 0 }}>{t('scheme.subtitle')}</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {schemes.map((scheme, idx) => (
          <div key={idx} style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e5eee7', display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
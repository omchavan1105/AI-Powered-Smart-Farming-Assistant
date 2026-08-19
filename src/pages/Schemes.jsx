import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { schemeService } from '../services/schemeService';
import { Landmark, ExternalLink, Loader2, Filter, ShieldCheck, MapPin, Tag } from 'lucide-react';

const Schemes = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = schemeService.getAvailableCategories();
  const states = ['All', 'Maharashtra', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Karnataka', 'Gujarat', 'Uttar Pradesh'];

  useEffect(() => {
    if (profile?.state) {
      setSelectedState(profile.state);
    }
  }, [profile]);

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const data = await schemeService.getGovernmentSchemes(selectedState, selectedCategory);
        setSchemes(data);
      } catch (err) {
        console.error("Error loading schemes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [selectedState, selectedCategory]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#166534', margin: '0 0 8px 0', fontFamily: 'Manrope, sans-serif' }}>{t('scheme.title')}</h1>
        <p style={{ color: '#627168', margin: 0 }}>
          Direct verified central & state welfare programs, credit subsidies, and crop insurance schemes with official government portals.
        </p>
      </header>

      {/* Filters Bar */}
      <div style={{ background: 'white', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e5eee7', marginBottom: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
          <MapPin size={18} style={{ color: '#166534' }} />
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#506158' }}>State:</label>
          <select 
            value={selectedState} 
            onChange={e => setSelectedState(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none', background: 'white', fontSize: '13px' }}
          >
            {states.map(st => (
              <option key={st} value={st}>{st === 'All' ? 'All India (Central + All)' : st}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <Tag size={18} style={{ color: '#166534' }} />
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#506158' }}>Category:</label>
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none', background: 'white', fontSize: '13px' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {(selectedState !== 'All' || selectedCategory !== 'All') && (
          <button 
            onClick={() => { setSelectedState('All'); setSelectedCategory('All'); }}
            style={{ background: 'none', border: 'none', color: '#b91c1c', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gap: '8px', color: '#166534' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          {t('common.loading')}
        </div>
      ) : schemes.length === 0 ? (
        <div style={{ background: 'white', padding: '50px 20px', textAlign: 'center', borderRadius: '16px', border: '1px solid #e5eee7' }}>
          <Landmark size={48} style={{ color: '#9ca3af', marginBottom: '12px' }} />
          <h3 style={{ color: '#17351f', margin: '0 0 6px 0' }}>No matching schemes found</h3>
          <p style={{ color: '#627168', margin: 0, fontSize: '14px' }}>Try switching the state or category filter to view all government programs.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {schemes.map((scheme, idx) => (
            <div key={scheme.id || idx} style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5eee7', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#fef3c7', color: '#b45309', padding: '10px', borderRadius: '10px', flexShrink: 0 }}>
                    <Landmark size={22} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', color: '#17351f' }}>{scheme.name}</h2>
                    <span style={{ fontSize: '12px', color: '#627168', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <span style={{ background: '#e7f5e9', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>{scheme.category}</span>
                      <span>•</span>
                      <span>{scheme.state}</span>
                    </span>
                  </div>
                </div>

                <a 
                  href={scheme.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="secondary-btn" 
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px', borderRadius: '8px' }}
                >
                  <ShieldCheck size={14} style={{ color: '#166534' }} />
                  Official Portal <ExternalLink size={14} />
                </a>
              </div>
              
              <p style={{ margin: 0, color: '#506158', lineHeight: 1.6, fontSize: '14px' }}>{scheme.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#f8fcf8', padding: '14px', borderRadius: '12px' }} className="scheme-details-grid">
                <div>
                  <strong style={{ display: 'block', fontSize: '12px', color: '#166534', marginBottom: '3px', textTransform: 'uppercase' }}>
                    {t('scheme.eligibility')}
                  </strong>
                  <span style={{ color: '#374151', fontSize: '13px', lineHeight: 1.4 }}>{scheme.eligibility}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '12px', color: '#166534', marginBottom: '3px', textTransform: 'uppercase' }}>
                    {t('scheme.benefits')}
                  </strong>
                  <span style={{ color: '#374151', fontSize: '13px', lineHeight: 1.4 }}>{scheme.benefits}</span>
                </div>
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
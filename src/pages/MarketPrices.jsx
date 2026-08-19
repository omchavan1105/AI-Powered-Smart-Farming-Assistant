import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { marketService } from '../services/marketService';
import { TrendingUp, TrendingDown, Minus, Search, RefreshCw, AlertTriangle, Loader2, CheckCircle, Info, ShieldCheck, HelpCircle } from 'lucide-react';

const MarketPrices = () => {
  const { t } = useLanguage();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);

  const fetchPrices = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await marketService.getMarketPrices();
      setPrices(data);
      if (data.length > 0 && !selectedCrop) {
        setSelectedCrop(data[0]);
      }
    } catch (err) {
      console.error('Market prices fetch error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const filteredPrices = prices.filter(item => 
    item.crop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.market?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAnyDemo = prices.some(p => p.isDemo);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '10px', color: '#166534' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        {t('common.loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
        <div style={{ background: '#fef2f2', padding: '40px', borderRadius: '16px', border: '1px solid #fecaca' }}>
          <AlertTriangle size={48} style={{ color: '#b91c1c', marginBottom: '15px' }} />
          <h2 style={{ color: '#991b1b', margin: '0 0 10px 0' }}>{t('market.errorLoading')}</h2>
          <button onClick={fetchPrices} className="primary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} /> {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#166534', margin: '0 0 6px 0', fontFamily: 'Manrope, sans-serif' }}>{t('market.title')}</h1>
          <p style={{ margin: 0, color: '#627168', fontSize: '14px' }}>Daily APMC mandi modal rates with data-driven sell/hold insights</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAnyDemo ? (
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Info size={12} /> {t('common.demoData')}
            </span>
          ) : (
            <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={12} /> Live Mandi Rates
            </span>
          )}
          <button onClick={fetchPrices} style={{ background: 'none', border: '1px solid #d8e5da', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#627168', fontSize: '13px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={20} style={{ position: 'absolute', left: '15px', top: '14px', color: '#627168' }} />
        <input 
          type="text"
          placeholder="Search by crop, market name, or state (e.g., Tomato, Pune, Maharashtra)..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '14px 15px 14px 45px', borderRadius: '12px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none', background: 'white' }}
        />
      </div>

      {/* Market Prices Table */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5eee7', overflow: 'hidden', marginBottom: '30px' }}>
        {filteredPrices.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <Search size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '16px' }}>{t('market.noResults')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead style={{ background: '#f0fdf4', color: '#166534', borderBottom: '1px solid #dcfce7' }}>
                <tr>
                  <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px' }}>{t('market.crop')}</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px' }}>{t('market.market')}</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px' }}>Modal Price</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px' }}>Range (Min - Max)</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px' }}>Trend (% Change)</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px' }}>Mandi Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.map((item) => {
                  const isSelected = selectedCrop?.id === item.id;
                  const isUp = item.trend === 'up';
                  const isDown = item.trend === 'down';
                  const isSell = item.recommendation === 'Sell';

                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedCrop(item)}
                      style={{ 
                        borderBottom: '1px solid #e5eee7', 
                        cursor: 'pointer',
                        background: isSelected ? '#f8fdf9' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#17351f' }}>
                        {item.crop}
                        {item.state && <span style={{ display: 'block', fontSize: '11px', color: '#829588', fontWeight: 'normal' }}>{item.state}</span>}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#627168' }}>{item.market}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 'bold', fontSize: '17px', color: '#166534' }}>
                        ₹{item.currentPrice?.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#627168' }}>/Q</span>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#506158', fontSize: '14px' }}>
                        {item.minPrice && item.maxPrice ? `₹${item.minPrice.toLocaleString()} - ₹${item.maxPrice.toLocaleString()}` : '—'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isUp && <span style={{ color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600', fontSize: '13px' }}><TrendingUp size={16} /> +{item.percentChange}%</span>}
                          {isDown && <span style={{ color: '#b91c1c', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600', fontSize: '13px' }}><TrendingDown size={16} /> {item.percentChange}%</span>}
                          {!isUp && !isDown && <span style={{ color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600', fontSize: '13px' }}><Minus size={16} /> Stable (0%)</span>}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: isSell ? '#ecfdf5' : '#eff6ff',
                          color: isSell ? '#047857' : '#1d4ed8',
                          border: `1px solid ${isSell ? '#a7f3d0' : '#bfdbfe'}`
                        }}>
                          {isSell ? 'Sell Indicator' : 'Hold Indicator'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Selected Crop Explainable Insight Card */}
      {selectedCrop && (
        <div style={{ background: '#f0fdf4', padding: '24px', borderRadius: '16px', border: '1px solid #bbf7d0', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: '#166534', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} />
              Mandi Action Advisory for {selectedCrop.crop} ({selectedCrop.market})
            </h3>
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 'bold',
              background: selectedCrop.recommendation === 'Sell' ? '#15803d' : '#2563eb',
              color: 'white'
            }}>
              Signal: {selectedCrop.recommendation.toUpperCase()} ({selectedCrop.recommendationConfidence} Confidence)
            </span>
          </div>

          <p style={{ margin: '0 0 16px 0', color: '#14532d', fontSize: '15px', lineHeight: 1.6 }}>
            {selectedCrop.recommendationExplanation}
          </p>

          {selectedCrop.recommendationFactors && selectedCrop.recommendationFactors.length > 0 && (
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #dcfce7' }}>
              <strong style={{ display: 'block', fontSize: '13px', color: '#166534', marginBottom: '8px' }}>Key Price Factors Analyzed:</strong>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#506158', fontSize: '14px', lineHeight: 1.5 }}>
                {selectedCrop.recommendationFactors.map((factor, fIdx) => (
                  <li key={fIdx}>{factor}</li>
                ))}
              </ul>
            </div>
          )}

          <p style={{ margin: '14px 0 0 0', fontSize: '12px', color: '#829588', fontStyle: 'italic' }}>
            * Disclaimer: Market signals are calculated strictly from prevailing mandi trends and APMC arrival price ranges for guidance purposes only.
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketPrices;
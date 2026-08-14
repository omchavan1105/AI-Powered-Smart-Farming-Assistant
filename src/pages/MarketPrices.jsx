import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { marketService } from '../services/marketService';
import { TrendingUp, TrendingDown, Minus, Search, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';

const MarketPrices = () => {
  const { t } = useLanguage();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPrices = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await marketService.getMarketPrices();
      setPrices(data);
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
    item.market?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#166534', margin: '0 0 10px 0', fontFamily: 'Manrope, sans-serif' }}>{t('market.title')}</h1>
        <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{t('common.demoData')}</span>
      </header>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={20} style={{ position: 'absolute', left: '15px', top: '14px', color: '#627168' }} />
        <input 
          type="text"
          placeholder={t('market.searchPlaceholder')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '14px 15px 14px 45px', borderRadius: '12px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none', background: 'white' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5eee7', overflow: 'hidden' }}>
        {filteredPrices.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <Search size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '16px' }}>{t('market.noResults')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead style={{ background: '#f0fdf4', color: '#166534', borderBottom: '1px solid #dcfce7' }}>
                <tr>
                  <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px' }}>{t('market.crop')}</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px' }}>{t('market.market')}</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px' }}>{t('market.currentPrice')} (₹/Q)</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px' }}>{t('market.previousPrice')} (₹/Q)</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px' }}>{t('market.change')}</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px' }}>{t('market.trend')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.map((item, idx) => {
                  const change = item.currentPrice - item.previousPrice;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5eee7' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#17351f' }}>{item.crop}</td>
                      <td style={{ padding: '16px 20px', color: '#627168' }}>{item.market}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 'bold', fontSize: '17px' }}>₹{item.currentPrice?.toLocaleString()}</td>
                      <td style={{ padding: '16px 20px', color: '#627168' }}>₹{item.previousPrice?.toLocaleString()}</td>
                      <td style={{ padding: '16px 20px', fontWeight: '600', color: change > 0 ? '#15803d' : change < 0 ? '#b91c1c' : '#b45309' }}>
                        {change > 0 ? '+' : ''}{change !== 0 ? `₹${change.toLocaleString()}` : '—'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {item.trend === 'up' && <span style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}><TrendingUp size={18} /> {t('market.trendUp')}</span>}
                        {item.trend === 'down' && <span style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}><TrendingDown size={18} /> {t('market.trendDown')}</span>}
                        {item.trend === 'stable' && <span style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}><Minus size={18} /> {t('market.trendStable')}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* AI Market Insight — marked as demo */}
      <div style={{ marginTop: '20px', background: '#e0f2fe', padding: '20px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {t('market.aiInsight')}
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{t('common.demoData')}</span>
        </h3>
        <p style={{ margin: 0, color: '#075985', lineHeight: 1.5, fontSize: '14px' }}>{t('market.aiInsightDemo')}</p>
      </div>
    </div>
  );
};

export default MarketPrices;
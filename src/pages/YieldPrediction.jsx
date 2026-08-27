import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { yieldService } from '../services/yieldService';
import { LineChart, DollarSign, Activity, Loader2, TrendingUp, Receipt, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, Badge, SectionHeading, DataBadge } from '../components/ui';

const YieldPrediction = () => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  
  const [crop, setCrop] = useState(profile?.current_crop || 'Tomato');
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
      <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <SectionHeading
            title={t('yield.title')}
            subtitle="Regional ICAR yield estimation and seasonal crop profitability calculator."
            style={{ marginBottom: 0 }}
          />
        </div>
        <DataBadge type="rule-based" customLabel="ICAR Benchmark Model" />
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="yield-grid">
        <Card white resting style={{ alignSelf: 'start', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#17351f', fontFamily: "'Manrope', sans-serif" }}>{t('yield.enterData')}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '13px', fontWeight: '600' }}>{t('yield.cropLabel')}</label>
              <select value={crop} onChange={e => setCrop(e.target.value)} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none', background: 'white', fontSize: '14px' }}>
                <option value="Tomato">Tomato (टोमॅटो)</option>
                <option value="Onion">Onion (कांदा)</option>
                <option value="Potato">Potato (बटाटा)</option>
                <option value="Corn">Corn / Maize (मका)</option>
                <option value="Soybean">Soybean (सोयाबीन)</option>
                <option value="Cotton">Cotton (कापूस)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '13px', fontWeight: '600' }}>{t('yield.farmSizeLabel')} (Acres)</label>
              <input type="number" step="0.1" value={farmSize} onChange={e => setFarmSize(e.target.value)} required style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#627168', fontSize: '13px', fontWeight: '600' }}>{t('yield.cropStage')}</label>
              <select value={cropStage} onChange={e => setCropStage(e.target.value)} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none', background: 'white', fontSize: '14px' }}>
                <option value="Vegetative">Vegetative (वाढ अवस्था)</option>
                <option value="Flowering">Flowering (फुलोरा अवस्था)</option>
                <option value="Fruiting">Fruiting / Pod Formation (फळधारणा)</option>
                <option value="Maturity">Maturity / Harvest (पक्वता)</option>
              </select>
            </div>
            <button type="submit" className="primary-btn" disabled={loading} style={{ marginTop: '6px', opacity: loading ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', minHeight: '44px' }}>
              {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? t('yield.calculating') : 'Calculate Yield & Profit'}
            </button>
          </form>
        </Card>

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Top Yield Card */}
            <div style={{ background: 'linear-gradient(135deg, #166534, #14532d)', padding: '20px', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
                <LineChart size={28} />
              </div>
              <div>
                <span style={{ fontSize: '13px', color: '#dcfce7', fontWeight: 600 }}>Estimated Total Harvest</span>
                <h2 style={{ margin: 0, fontSize: '28px', fontFamily: "'Manrope', sans-serif" }}>{result.expectedYieldKg?.toLocaleString()} kg</h2>
              </div>
            </div>

            {/* Financial Ledger Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Gross Revenue */}
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>Gross Expected Revenue</span>
                <h3 style={{ margin: '4px 0 0', fontSize: '20px', color: '#14532d', fontFamily: "'Manrope', sans-serif" }}>₹{result.expectedIncome?.toLocaleString()}</h3>
                <span style={{ fontSize: '11px', color: '#627168' }}>@ ₹{result.pricePerKg}/kg modal rate</span>
              </div>

              {/* Total Input Cost */}
              <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                <span style={{ fontSize: '12px', color: '#92400e', fontWeight: 600 }}>Est. Production Cost</span>
                <h3 style={{ margin: '4px 0 0', fontSize: '20px', color: '#78350f', fontFamily: "'Manrope', sans-serif" }}>₹{result.estimatedTotalCost?.toLocaleString()}</h3>
                <span style={{ fontSize: '11px', color: '#627168' }}>Seeds, nutrients & labor</span>
              </div>
            </div>

            {/* Net Estimated Profit */}
            <div style={{
              background: result.estimatedNetProfit >= 0 ? '#f0fdf4' : '#fef2f2',
              padding: '16px 20px',
              borderRadius: '12px',
              border: `1px solid ${result.estimatedNetProfit >= 0 ? '#86efac' : '#fecaca'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '12px', color: result.estimatedNetProfit >= 0 ? '#166534' : '#991b1b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Est. Net Farm Profit
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '22px', color: result.estimatedNetProfit >= 0 ? '#15803d' : '#dc2626', fontFamily: "'Manrope', sans-serif" }}>
                  ₹{result.estimatedNetProfit?.toLocaleString()}
                </h3>
              </div>
              <Badge variant={result.estimatedNetProfit >= 0 ? 'success' : 'danger'}>
                {result.estimatedNetProfit >= 0 ? 'Profitable Yield' : 'High Input Deficit'}
              </Badge>
            </div>

            {/* Factors */}
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e5eee7' }}>
              <strong style={{ fontSize: '13px', color: '#17351f', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <ShieldCheck size={16} color="#166534" /> Calculation Rationale
              </strong>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#506158', fontSize: '12.5px', lineHeight: 1.5 }}>
                {result.mainFactors.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
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
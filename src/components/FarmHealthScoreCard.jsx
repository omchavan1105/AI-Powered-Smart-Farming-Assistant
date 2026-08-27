import React from 'react';
import { Card, Badge, DataBadge, LoadingSkeleton } from './ui';
import { ShieldCheck, AlertCircle, Info, Activity, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * FarmHealthScoreCard — Displays transparent farm health status with data coverage breakdown.
 */
const FarmHealthScoreCard = ({ healthScoreData, loading = false }) => {
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSkeleton variant="card" />;
  }

  if (!healthScoreData) return null;

  const {
    hasSufficientData,
    score,
    rating,
    dataCoveragePct,
    components = [],
    missingInputs = [],
    explanation
  } = healthScoreData;

  const scoreColor = score >= 75 ? '#15803d' : score >= 50 ? '#d97706' : '#dc2626';

  return (
    <Card white resting style={{ marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#16803d', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
            TRANSPARENT METRICS
          </span>
          <h2 style={{ margin: '4px 0 0', fontSize: '20px', color: '#17351f', fontFamily: "'Manrope', sans-serif" }}>
            Farm Health Score
          </h2>
        </div>
        <DataBadge
          type={hasSufficientData ? 'rule-based' : 'missing'}
          customLabel={`${dataCoveragePct}% Data Coverage`}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '25px', alignItems: 'center' }} className="health-score-grid">
        {/* Score Circle */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: '#f8fcf8',
            border: `8px solid ${hasSufficientData ? scoreColor : '#d8e5da'}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '38px', fontWeight: 800, color: hasSufficientData ? scoreColor : '#9ca3af', fontFamily: "'Manrope', sans-serif", lineHeight: 1 }}>
              {hasSufficientData ? score : '—'}
            </span>
            <span style={{ fontSize: '12px', color: '#627168', marginTop: '4px', fontWeight: 600 }}>
              {rating}
            </span>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#829588' }}>
            Out of 100 benchmark
          </p>
        </div>

        {/* Breakdown Breakdown */}
        <div>
          <p style={{ margin: '0 0 14px 0', fontSize: '13.5px', color: '#506158', lineHeight: 1.5 }}>
            {explanation}
          </p>

          {/* Component Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {components.map((comp, idx) => (
              <div key={idx} style={{ background: '#f8fcf8', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5eee7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '13px', color: '#17351f' }}>{comp.name}</strong>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>{comp.score}/100 ({comp.status})</span>
                </div>
                <span style={{ fontSize: '11.5px', color: '#627168' }}>{comp.detail}</span>
              </div>
            ))}
          </div>

          {/* Missing Inputs Action Prompt */}
          {missingInputs.length > 0 && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#92400e' }}>
                <strong>Add {missingInputs[0]}</strong> to increase accuracy.
              </span>
              <button
                onClick={() => navigate(missingInputs[0].includes('Soil') ? '/soil-analysis' : '/disease-detection')}
                style={{ background: 'none', border: 'none', color: '#b45309', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px', padding: 0 }}
              >
                Log Data <ArrowUpRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .health-score-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Card>
  );
};

export default FarmHealthScoreCard;

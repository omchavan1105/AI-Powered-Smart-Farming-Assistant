import React from 'react';
import { Card, Badge, DataBadge, EmptyState } from './ui';
import { TrendingUp, TrendingDown, Minus, Activity, Calendar, ShieldCheck, History } from 'lucide-react';

/**
 * DiseaseProgressTracker — Evaluates longitudinal crop disease records from Supabase.
 *
 * Trajectory states:
 * - 'Improving': Recent severity is lower than previous (or transitioning to Healthy)
 * - 'Worsening': Severity increasing (Low -> Moderate -> High) or confidence increasing on severe disease
 * - 'Stable': Same severity & disease across consecutive scans
 * - 'Insufficient Data': Fewer than 2 records for the crop
 */
export function calculateDiseaseTrend(history = []) {
  if (!history || history.length < 2) {
    return {
      trend: 'insufficient',
      label: 'Not enough observations to determine a trend',
      detail: history.length === 1 ? '1 scan recorded. Log subsequent scans to track health trajectory.' : 'No scans recorded yet.',
      variant: 'muted'
    };
  }

  const latest = history[0];
  const previous = history[1];

  const severityRank = {
    'Healthy': 0,
    'Low': 1,
    'Moderate': 2,
    'High': 3,
    'Unknown': 1
  };

  const latestIsHealthy = (latest.detected_disease || '').toLowerCase().includes('healthy');
  const prevIsHealthy = (previous.detected_disease || '').toLowerCase().includes('healthy');

  const latestRank = latestIsHealthy ? 0 : (severityRank[latest.severity] || 2);
  const prevRank = prevIsHealthy ? 0 : (severityRank[previous.severity] || 2);

  if (latestRank < prevRank) {
    return {
      trend: 'improving',
      label: 'Improving Trajectory',
      detail: `Severity reduced from ${previous.severity || 'previous scan'} to ${latest.severity || 'current scan'}.`,
      variant: 'success'
    };
  } else if (latestRank > prevRank) {
    return {
      trend: 'worsening',
      label: 'Worsening Trajectory',
      detail: `Severity increased from ${previous.severity || 'previous scan'} to ${latest.severity || 'current scan'}. Immediate corrective spray advised.`,
      variant: 'danger'
    };
  } else {
    return {
      trend: 'stable',
      label: 'Stable Trajectory',
      detail: `Disease condition has remained steady across consecutive scans.`,
      variant: 'warning'
    };
  }
}

const DiseaseProgressTracker = ({ history = [] }) => {
  const trendAnalysis = calculateDiseaseTrend(history);

  if (!history || history.length === 0) {
    return (
      <Card white resting style={{ marginBottom: '25px' }}>
        <EmptyState
          icon={<History size={36} />}
          title="No Historical Scans Recorded"
          description="Uploaded leaf scans will automatically populate this longitudinal progress tracker to monitor disease recovery over time."
        />
      </Card>
    );
  }

  return (
    <Card white resting style={{ marginBottom: '25px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#16803d', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
            LONGITUDINAL MONITORING
          </span>
          <h3 style={{ margin: '4px 0 0', fontSize: '18px', color: '#17351f', fontFamily: "'Manrope', sans-serif" }}>
            Crop Health Progress Tracker
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DataBadge type="farmer" customLabel={`${history.length} Real Scan(s)`} />
          <Badge variant={trendAnalysis.variant}>
            {trendAnalysis.label}
          </Badge>
        </div>
      </div>

      {/* Trajectory Summary Box */}
      <div style={{
        background: trendAnalysis.variant === 'success' ? '#f0fdf4' : trendAnalysis.variant === 'danger' ? '#fef2f2' : '#f8fcf8',
        border: `1px solid ${trendAnalysis.variant === 'success' ? '#bbf7d0' : trendAnalysis.variant === 'danger' ? '#fecaca' : '#e5eee7'}`,
        padding: '12px 16px',
        borderRadius: '12px',
        marginBottom: '18px',
        fontSize: '13.5px',
        color: '#374151',
        lineHeight: 1.5
      }}>
        <strong>Status:</strong> {trendAnalysis.detail}
      </div>

      {/* Timeline of Observations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
        {history.map((record, i) => {
          const isHealthy = (record.detected_disease || '').toLowerCase().includes('healthy');
          const isHigh = record.severity === 'High';

          return (
            <div
              key={record.id || i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e5eee7',
                fontSize: '13px',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: isHealthy ? '#15803d' : isHigh ? '#dc2626' : '#d97706'
                }} />
                <div>
                  <strong style={{ color: '#17351f', fontSize: '14px' }}>{record.detected_disease}</strong>
                  <span style={{ color: '#627168', marginLeft: '8px' }}>
                    Severity: {record.severity || 'Normal'} • Confidence: {record.confidence_score}%
                  </span>
                </div>
              </div>

              <span style={{ color: '#829588', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} /> {new Date(record.detected_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default DiseaseProgressTracker;

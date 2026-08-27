import React, { useCallback } from 'react';
import { Card, Badge, SectionHeading, DataBadge } from './ui';
import { Bot, Volume2, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, MapPin, Database } from 'lucide-react';

/**
 * FarmCopilotCard — Primary hero card on Dashboard answering "What should I do today?"
 */
const FarmCopilotCard = ({ copilotData, onNavigate, language = 'en' }) => {
  if (!copilotData) return null;

  const {
    riskLevel,
    primaryAction,
    reason,
    cropName,
    dataUsed = [],
    missingData = [],
    hasSufficientData
  } = copilotData;

  const riskVariant = {
    High: 'danger',
    Moderate: 'warning',
    Low: 'success'
  }[riskLevel] || 'info';

  const handleSpeak = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const textToRead = `Today's Farm Action for ${cropName}: ${primaryAction}. ${reason}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);

    const langMap = {
      en: ['en-IN', 'en-US', 'en'],
      hi: ['hi-IN', 'hi'],
      mr: ['mr-IN', 'mr']
    };
    const candidates = langMap[language] || langMap.en;
    const voices = window.speechSynthesis.getVoices();
    let matchedVoice = voices.find(v => candidates.some(c => v.lang.startsWith(c.split('-')[0])));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      utterance.lang = candidates[0];
    }

    try {
      window.speechSynthesis.speak(utterance);
    } catch {}
  }, [cropName, primaryAction, reason, language]);

  return (
    <Card white resting style={{ marginBottom: '30px', border: '1px solid #bbf7d0', background: 'linear-gradient(180deg, #ffffff 0%, #f7fbf8 100%)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#16803d', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              DAILY FARM COPILOT
            </span>
            <DataBadge type="rule-based" customLabel="Telemetry Synthesized" />
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#17351f', fontFamily: "'Manrope', sans-serif" }}>
            Today's Priority for {cropName}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant={riskVariant}>
            {riskLevel} Farm Risk
          </Badge>
          <button
            onClick={handleSpeak}
            title="Listen to daily farm advice"
            aria-label="Listen to daily farm advice"
            style={{
              background: '#e7f5e9',
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              color: '#166534',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              minWidth: '44px',
              minHeight: '44px'
            }}
          >
            <Volume2 size={20} />
          </button>
        </div>
      </div>

      {/* Main Action Box */}
      <div style={{
        background: riskLevel === 'High' ? '#fef2f2' : riskLevel === 'Moderate' ? '#fffbeb' : '#f0fdf4',
        border: `1px solid ${riskLevel === 'High' ? '#fecaca' : riskLevel === 'Moderate' ? '#fde68a' : '#bbf7d0'}`,
        padding: '18px 20px',
        borderRadius: '14px',
        marginBottom: '18px'
      }}>
        <h3 style={{
          margin: '0 0 6px 0',
          fontSize: '16px',
          color: riskLevel === 'High' ? '#991b1b' : riskLevel === 'Moderate' ? '#92400e' : '#166534',
          fontWeight: 700
        }}>
          {primaryAction}
        </h3>
        <p style={{
          margin: 0,
          color: riskLevel === 'High' ? '#b91c1c' : riskLevel === 'Moderate' ? '#b45309' : '#15803d',
          fontSize: '14px',
          lineHeight: 1.5
        }}>
          <strong>Why:</strong> {reason}
        </p>
      </div>

      {/* Data Provenance & Missing Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="copilot-meta-grid">
        <div style={{ background: 'white', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5eee7' }}>
          <strong style={{ display: 'block', fontSize: '12px', color: '#166534', marginBottom: '6px' }}>
            Data Streams Used ({dataUsed.length}):
          </strong>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#506158', lineHeight: 1.5 }}>
            {dataUsed.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>

        <div style={{ background: 'white', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5eee7' }}>
          <strong style={{ display: 'block', fontSize: '12px', color: missingData.length > 0 ? '#b45309' : '#166534', marginBottom: '6px' }}>
            {missingData.length > 0 ? `Missing Inputs (${missingData.length}):` : 'All Data Streams Active'}
          </strong>
          {missingData.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#78350f', lineHeight: 1.5 }}>
              {missingData.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          ) : (
            <span style={{ fontSize: '12.5px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Full telemetry available
            </span>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .copilot-meta-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Card>
  );
};

export default FarmCopilotCard;

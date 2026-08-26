import React, { useCallback } from 'react';
import { Card, Badge, SectionHeading } from './ui';
import treatmentOptions from '../data/treatmentOptions';
import { Volume2, Zap, ShieldAlert, Leaf, Tag } from 'lucide-react';

/**
 * FusionAdvisoryCard — displays the unified advisory combining
 * disease, weather, and market data. Built with Card, Badge, and
 * SectionHeading from the UI component library.
 *
 * @param {Object} props
 * @param {Object} props.advisory - From generateFusionAdvisory()
 *   { headline, reasoning[], action, urgency }
 * @param {Object} [props.diseaseResult] - Original disease detection result
 *   { disease, severity, confidence, ... }
 * @param {string} [props.language] - Current app language (en/hi/mr)
 */
const FusionAdvisoryCard = ({ advisory, diseaseResult, language = 'en' }) => {
  if (!advisory) return null;

  const { headline, reasoning, action, urgency } = advisory;

  // ── Urgency → Badge variant mapping ──────────────────────────────
  const urgencyVariant = {
    high: 'danger',
    medium: 'warning',
    low: 'success',
    info: 'info'
  }[urgency] || 'muted';

  const urgencyLabel = {
    high: 'Urgent',
    medium: 'Attention Needed',
    low: 'All Good',
    info: 'Info'
  }[urgency] || urgency;

  // ── Treatment tiers lookup ───────────────────────────────────────
  const diseaseName = diseaseResult?.disease || '';
  const treatments = treatmentOptions[diseaseName] || null;

  // ── TTS: Voice Output (Task 6) ───────────────────────────────────
  const handleSpeak = useCallback(() => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const textToRead = `${headline}. ${action}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);

    // Map app language to speechSynthesis lang codes
    const langMap = {
      en: ['en-IN', 'en-US', 'en-GB', 'en'],
      hi: ['hi-IN', 'hi'],
      mr: ['mr-IN', 'mr']
    };

    const candidates = langMap[language] || langMap.en;

    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    let matchedVoice = null;

    for (const langCode of candidates) {
      matchedVoice = voices.find(v => v.lang === langCode || v.lang.startsWith(langCode.split('-')[0]));
      if (matchedVoice) break;
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      // Fallback: set lang attribute, let browser pick
      utterance.lang = candidates[0] || 'en-IN';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1;

    // Fail silently — no error shown to user
    utterance.onerror = () => {};

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      // Silently ignore if speech synthesis fails
    }
  }, [headline, action, language]);

  return (
    <Card white resting style={{ marginTop: '25px' }}>
      {/* Header: Eyebrow + Headline + Speaker Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
        <SectionHeading
          eyebrow="FUSION ADVISORY"
          title={headline}
          style={{ marginBottom: 0, flex: 1 }}
        />
        <button
          onClick={handleSpeak}
          title="Read advisory aloud"
          aria-label="Read advisory aloud"
          style={{
            background: '#e7f5e9',
            border: 'none',
            borderRadius: '10px',
            padding: '10px',
            color: '#166534',
            cursor: 'pointer',
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
          onMouseLeave={e => e.currentTarget.style.background = '#e7f5e9'}
        >
          <Volume2 size={20} />
        </button>
      </div>

      {/* Urgency Badge */}
      <div style={{ marginBottom: '16px' }}>
        <Badge
          variant={urgencyVariant}
          icon={urgency === 'high' ? <Zap size={13} /> : urgency === 'medium' ? <ShieldAlert size={13} /> : <Leaf size={13} />}
        >
          {urgencyLabel}
        </Badge>
      </div>

      {/* Reasoning Bullets */}
      {reasoning && reasoning.length > 0 && (
        <ul style={{
          paddingLeft: '20px',
          color: '#627168',
          lineHeight: 1.7,
          margin: '0 0 20px 0',
          fontSize: '14px'
        }}>
          {reasoning.map((r, i) => (
            <li key={i} style={{ marginBottom: '6px' }}>{r}</li>
          ))}
        </ul>
      )}

      {/* Action */}
      {action && (
        <div style={{
          background: urgency === 'high' ? '#fef2f2' : urgency === 'medium' ? '#fef3c7' : '#f0fdf4',
          border: `1px solid ${urgency === 'high' ? '#fecaca' : urgency === 'medium' ? '#fde68a' : '#bbf7d0'}`,
          padding: '14px 18px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <p style={{
            margin: 0,
            color: urgency === 'high' ? '#991b1b' : urgency === 'medium' ? '#92400e' : '#166534',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: 1.6
          }}>
            <strong>Recommended Action:</strong> {action}
          </p>
        </div>
      )}

      {/* Treatment Tiers */}
      {treatments && (
        <div>
          <h3 style={{
            fontSize: '15px',
            color: '#17351f',
            margin: '0 0 12px 0',
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Tag size={16} /> Treatment Options (Cost Tiers)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* Branded */}
            <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e5eee7', background: '#fbfefb' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#16803d', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Branded
              </span>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#17351f', fontWeight: 600 }}>
                {treatments.branded.name}
              </p>
              <span style={{ fontSize: '13px', color: '#627168' }}>{treatments.branded.approxCost}</span>
            </div>
            {/* Generic */}
            <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e5eee7', background: '#fbfefb' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Generic
              </span>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#17351f', fontWeight: 600 }}>
                {treatments.generic.name}
              </p>
              <span style={{ fontSize: '13px', color: '#627168' }}>{treatments.generic.approxCost}</span>
            </div>
            {/* Home Remedy */}
            <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e5eee7', background: '#fbfefb' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#92400e', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Home Remedy
              </span>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#17351f', fontWeight: 600 }}>
                {treatments.homeRemedy.name}
              </p>
              <span style={{ fontSize: '13px', color: '#627168' }}>{treatments.homeRemedy.approxCost}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FusionAdvisoryCard;

import React, { useState } from 'react';
import { Card, Badge, DataBadge } from './ui';
import { CalendarDays, CloudSun, CloudRain, CheckCircle2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

/**
 * ActionPlan7Day — 7-day personalized action schedule.
 */
const ActionPlan7Day = ({ plan = [] }) => {
  const [expandedDay, setExpandedDay] = useState(0); // Default expand Day 1 (Today)

  if (!plan || plan.length === 0) return null;

  return (
    <Card white resting style={{ marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#16803d', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
            AGRO-CLIMATIC SCHEDULE
          </span>
          <h2 style={{ margin: '4px 0 0', fontSize: '20px', color: '#17351f', fontFamily: "'Manrope', sans-serif" }}>
            7-Day Farm Action Plan
          </h2>
        </div>
        <DataBadge type="rule-based" customLabel="Weather & Soil Aligned" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {plan.map((item, idx) => {
          const isExpanded = expandedDay === idx;
          const isToday = idx === 0;

          return (
            <div
              key={idx}
              style={{
                borderRadius: '12px',
                border: isToday ? '1px solid #bbf7d0' : '1px solid #e5eee7',
                background: isToday ? '#fbfefb' : 'white',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Header bar */}
              <div
                onClick={() => setExpandedDay(isExpanded ? null : idx)}
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  gap: '12px',
                  background: isExpanded ? '#f8fdf9' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    background: isToday ? '#166534' : '#e7f5e9',
                    color: isToday ? 'white' : '#166534',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12px',
                    textAlign: 'center',
                    minWidth: '60px'
                  }}>
                    {isToday ? 'TODAY' : item.dayName}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#17351f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.activity}
                    </p>
                    <span style={{ fontSize: '12px', color: '#627168' }}>
                      {item.dateFormatted} • {item.weather.temp}°C, {item.weather.rainProb}% Rain
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {item.priority === 'High' && (
                    <Badge variant="danger" small>High Priority</Badge>
                  )}
                  {isExpanded ? <ChevronUp size={18} color="#627168" /> : <ChevronDown size={18} color="#627168" />}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div style={{ padding: '0 18px 16px', borderTop: '1px solid #f0f4f1', marginTop: '6px' }}>
                  <div style={{ marginTop: '12px', fontSize: '13.5px', color: '#506158', lineHeight: 1.5 }}>
                    <p style={{ margin: '0 0 8px' }}>
                      <strong>Agronomic Reason:</strong> {item.reason}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '11.5px', color: '#829588' }}>
                        Data basis: {item.dataSource}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ActionPlan7Day;

import React from 'react';
import { Activity, Database, UserCheck, Cpu, Bot, AlertCircle, HelpCircle, ShieldCheck } from 'lucide-react';
import Badge from './Badge';

/**
 * DataBadge — displays transparent data provenance to strictly comply with the Real-Data Policy.
 *
 * Types:
 * - 'live': Real-time API or telemetry (e.g. live weather, active camera)
 * - 'cached': Stored forecast or recent network snapshot
 * - 'farmer': Logged directly by the farmer (e.g. soil test, farm size)
 * - 'rule-based': Deterministic agronomic logic engine (ICAR, weather thresholds)
 * - 'ai': Trained AI/ML model inference (e.g. MobileNetV2 disease model)
 * - 'sample': Fallback / reference demonstration data
 * - 'missing': Data not recorded or unavailable
 *
 * @param {Object} props
 * @param {'live'|'cached'|'farmer'|'rule-based'|'ai'|'sample'|'missing'} props.type
 * @param {string} [props.customLabel]
 * @param {boolean} [props.small=true]
 */
const DataBadge = ({ type = 'rule-based', customLabel, small = true, className = '', ...rest }) => {
  const configs = {
    live: {
      variant: 'success',
      icon: <Activity size={12} />,
      label: 'Live Telemetry'
    },
    cached: {
      variant: 'info',
      icon: <Database size={12} />,
      label: 'Cached Snapshot'
    },
    farmer: {
      variant: 'success',
      icon: <UserCheck size={12} />,
      label: 'Farmer Logged'
    },
    'rule-based': {
      variant: 'info',
      icon: <Cpu size={12} />,
      label: 'Rule-Based Guidance'
    },
    ai: {
      variant: 'success',
      icon: <Bot size={12} />,
      label: 'AI Inference (Real ML)'
    },
    sample: {
      variant: 'warning',
      icon: <HelpCircle size={12} />,
      label: 'Sample / Baseline Data'
    },
    missing: {
      variant: 'muted',
      icon: <AlertCircle size={12} />,
      label: 'Missing Input'
    }
  };

  const config = configs[type] || configs['rule-based'];

  return (
    <Badge
      variant={config.variant}
      icon={config.icon}
      small={small}
      className={`ui-data-badge ${className}`}
      {...rest}
    >
      {customLabel || config.label}
    </Badge>
  );
};

export default DataBadge;

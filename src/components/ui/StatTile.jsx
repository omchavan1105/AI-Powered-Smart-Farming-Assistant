import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * StatTile — label + big number tile with optional icon.
 * Matches the .stats pattern from the landing page hero
 * and the DashboardCard pattern from Dashboard.jsx.
 *
 * @param {Object} props
 * @param {string} props.label - Tile label/title text
 * @param {React.ReactNode} [props.value] - Big value display
 * @param {string} [props.subtitle] - Subtitle text below value
 * @param {string} [props.subtitleColor] - CSS color for subtitle
 * @param {React.ReactNode} [props.icon] - Icon element
 * @param {string} [props.iconBg] - Background color for icon container
 * @param {string} [props.iconColor] - Color for icon
 * @param {Function} [props.onClick] - Click handler
 * @param {boolean} [props.isLoading] - Show skeleton loading state
 * @param {boolean} [props.isUnavailable] - Show unavailable state
 * @param {string} [props.unavailableText] - Text for unavailable state
 * @param {string} [props.className] - Additional CSS classes
 */
const StatTile = ({
  label,
  value,
  subtitle,
  subtitleColor,
  icon,
  iconBg,
  iconColor,
  onClick,
  isLoading,
  isUnavailable,
  unavailableText,
  className = '',
  ...rest
}) => {
  const classes = [
    'ui-stat-tile',
    onClick && 'ui-stat-tile--clickable',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      {...rest}
    >
      {/* Header: icon + label */}
      {(icon || label) && (
        <div className="ui-stat-tile__header">
          {icon && (
            <div
              className="ui-stat-tile__icon"
              style={{ background: iconBg, color: iconColor }}
            >
              {icon}
            </div>
          )}
          {label && <h3 className="ui-stat-tile__label">{label}</h3>}
        </div>
      )}

      {/* Content: loading / unavailable / value */}
      {isLoading ? (
        <div className="ui-stat-tile__skeleton">
          <div className="ui-stat-tile__skeleton-line ui-stat-tile__skeleton-line--lg" />
          <div className="ui-stat-tile__skeleton-line ui-stat-tile__skeleton-line--sm" />
        </div>
      ) : isUnavailable ? (
        <p style={{ margin: 0, fontSize: '15px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={16} /> {unavailableText || 'Data unavailable'}
        </p>
      ) : (
        <>
          {value != null && <p className="ui-stat-tile__value">{value}</p>}
          {subtitle && (
            <span
              className="ui-stat-tile__subtitle"
              style={{ color: subtitleColor || '#166534' }}
            >
              {subtitle}
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default StatTile;

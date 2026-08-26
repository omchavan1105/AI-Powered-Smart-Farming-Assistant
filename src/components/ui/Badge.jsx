import React from 'react';

/**
 * Badge — colored status pill.
 * Matches the severity/confidence color logic from DiseaseDetection.jsx.
 *
 * @param {Object} props
 * @param {'success'|'warning'|'danger'|'info'|'muted'} [props.variant='muted'] - Color variant
 * @param {React.ReactNode} [props.icon] - Optional leading icon
 * @param {boolean} [props.small] - Use smaller size variant
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Badge text content
 */
const Badge = ({ variant = 'muted', icon, small, className = '', children, ...rest }) => {
  const classes = [
    'ui-badge',
    `ui-badge--${variant}`,
    small && 'ui-badge--sm',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...rest}>
      {icon && icon}
      {children}
    </span>
  );
};

export default Badge;

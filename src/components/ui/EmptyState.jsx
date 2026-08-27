import React from 'react';

/**
 * EmptyState — accessible zero-data / empty-state card.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.icon] - Leading icon element
 * @param {string} props.title - Empty state title
 * @param {string} [props.description] - Descriptive help text
 * @param {React.ReactNode} [props.action] - Action button or link
 * @param {string} [props.className] - Additional CSS class names
 * @param {Object} [props.style] - Custom inline styles
 */
const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
  style,
  ...rest
}) => {
  return (
    <div
      className={`ui-empty-state ${className}`}
      style={style}
      role="status"
      aria-label={title}
      {...rest}
    >
      {icon && <div className="ui-empty-state__icon">{icon}</div>}
      <h3 className="ui-empty-state__title">{title}</h3>
      {description && <p className="ui-empty-state__description">{description}</p>}
      {action && <div className="ui-empty-state__action">{action}</div>}
    </div>
  );
};

export default EmptyState;

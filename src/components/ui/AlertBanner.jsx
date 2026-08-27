import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

/**
 * AlertBanner — accessible notification and advisory banner.
 *
 * @param {Object} props
 * @param {'danger'|'warning'|'success'|'info'} [props.variant='info']
 * @param {React.ReactNode} [props.icon]
 * @param {string} [props.title]
 * @param {React.ReactNode} props.children
 * @param {Function} [props.onClose]
 * @param {React.ReactNode} [props.action]
 * @param {string} [props.className]
 */
const AlertBanner = ({
  variant = 'info',
  icon,
  title,
  children,
  onClose,
  action,
  className = '',
  style,
  ...rest
}) => {
  const defaultIcons = {
    danger: <AlertCircle size={20} className="ui-alert-banner__default-icon" />,
    warning: <AlertTriangle size={20} className="ui-alert-banner__default-icon" />,
    success: <CheckCircle size={20} className="ui-alert-banner__default-icon" />,
    info: <Info size={20} className="ui-alert-banner__default-icon" />
  };

  return (
    <div
      className={`ui-alert-banner ui-alert-banner--${variant} ${className}`}
      role="alert"
      style={style}
      {...rest}
    >
      <div className="ui-alert-banner__icon-wrap">
        {icon || defaultIcons[variant]}
      </div>
      <div className="ui-alert-banner__content">
        {title && <h4 className="ui-alert-banner__title">{title}</h4>}
        <div className="ui-alert-banner__body">{children}</div>
      </div>
      {action && <div className="ui-alert-banner__action">{action}</div>}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ui-alert-banner__close-btn"
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;

import React from 'react';

/**
 * Card — generic bordered/shadowed container.
 * Matches .feature-grid article style from the landing page.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onClick] - Click handler (adds hoverable behavior)
 * @param {boolean} [props.hoverable] - Enable hover lift effect
 * @param {boolean} [props.white] - Use white background instead of #fbfefb
 * @param {boolean} [props.resting] - Add resting box-shadow
 * @param {boolean} [props.flush] - Remove padding
 * @param {Object} [props.style] - Inline style overrides
 */
const Card = ({ children, className = '', onClick, hoverable, white, resting, flush, style, ...rest }) => {
  const classes = [
    'ui-card',
    (hoverable || onClick) && 'ui-card--hoverable',
    white && 'ui-card--white',
    resting && 'ui-card--resting',
    flush && 'ui-card--flush',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} style={style} {...rest}>
      {children}
    </div>
  );
};

export default Card;

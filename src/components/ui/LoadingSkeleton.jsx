import React from 'react';

/**
 * LoadingSkeleton — accessible placeholder lines/blocks during data fetching.
 *
 * @param {Object} props
 * @param {'line'|'rect'|'circle'|'card'} [props.variant='line']
 * @param {string|number} [props.width]
 * @param {string|number} [props.height]
 * @param {number} [props.count=1]
 * @param {string} [props.className]
 */
const LoadingSkeleton = ({
  variant = 'line',
  width,
  height,
  count = 1,
  className = '',
  style,
  ...rest
}) => {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={`ui-skeleton ui-skeleton--card ${className}`} style={style} {...rest}>
        <div className="ui-skeleton__line" style={{ width: '40%', height: '24px', marginBottom: '16px' }} />
        <div className="ui-skeleton__line" style={{ width: '100%', height: '16px', marginBottom: '8px' }} />
        <div className="ui-skeleton__line" style={{ width: '80%', height: '16px', marginBottom: '8px' }} />
        <div className="ui-skeleton__line" style={{ width: '60%', height: '16px' }} />
      </div>
    );
  }

  return (
    <div className={`ui-skeleton-group ${className}`} style={style} {...rest}>
      {items.map((_, i) => (
        <div
          key={i}
          className={`ui-skeleton ui-skeleton--${variant}`}
          style={{
            width: width || (variant === 'circle' ? '40px' : '100%'),
            height: height || (variant === 'circle' ? '40px' : variant === 'rect' ? '120px' : '18px'),
            marginBottom: i < count - 1 ? '8px' : 0
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;

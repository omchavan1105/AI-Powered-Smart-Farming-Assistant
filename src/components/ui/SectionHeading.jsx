import React from 'react';

/**
 * SectionHeading — eyebrow + title + subtitle block.
 * Matches .section-heading from the landing page.
 *
 * @param {Object} props
 * @param {string} [props.eyebrow] - Small uppercase label above title
 * @param {React.ReactNode} props.title - Main heading text
 * @param {string} [props.subtitle] - Description text below title
 * @param {boolean} [props.center] - Center-align the heading block
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.children] - Optional extra content (e.g. action buttons)
 */
const SectionHeading = ({ eyebrow, title, subtitle, center, className = '', children, ...rest }) => {
  const classes = [
    'ui-section-heading',
    center && 'ui-section-heading--center',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {eyebrow && <p className="ui-section-heading__eyebrow">{eyebrow}</p>}
      {title && <h1 className="ui-section-heading__title">{title}</h1>}
      {subtitle && <p className="ui-section-heading__subtitle">{subtitle}</p>}
      {children}
    </div>
  );
};

export default SectionHeading;

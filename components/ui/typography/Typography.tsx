/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type TextVariant = 
  | 'title'       // Managed by .ui-title in index.css
  | 'heading'     // Managed by .ui-heading in index.css
  | 'subheading'  // Managed by .ui-subheading in index.css
  | 'category'    // Managed by .ui-category in index.css
  | 'body'        // Managed by .ui-body in index.css
  | 'description' // Managed by .ui-description in index.css
  | 'caption'     // Managed by .ui-caption in index.css
  | 'label'       // Managed by .ui-label in index.css
  | 'overline'    // Managed by .ui-overline in index.css
  | 'mono';       // Managed by .ui-mono in index.css

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<TextVariant, string> = {
  title: 'ui-title',
  heading: 'ui-heading',
  subheading: 'ui-subheading',
  category: 'ui-category',
  body: 'ui-body',
  description: 'ui-description',
  caption: 'ui-caption',
  label: 'ui-label',
  overline: 'ui-overline',
  mono: 'ui-mono',
};

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  as,
  className = '',
  children,
  ...props
}) => {
  const Component = as || (
    variant === 'title' ? 'h2' :
    variant === 'heading' ? 'h3' :
    variant === 'subheading' ? 'h4' :
    variant === 'category' || variant === 'caption' || variant === 'overline' || variant === 'mono' || variant === 'label' ? 'span' : 'p'
  );

  return (
    <Component
      className={`${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

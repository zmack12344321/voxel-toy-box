/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type CardVariant = 'default' | 'glass' | 'flat' | 'interactive';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-slate-200/80 shadow-md rounded-2xl p-4',
  glass: 'bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-3xl p-4',
  flat: 'bg-slate-50/80 border border-slate-100 rounded-xl p-3',
  interactive: 'bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 shadow-xs rounded-xl p-3 transition-all cursor-pointer',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

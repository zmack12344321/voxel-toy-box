/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type BadgeVariant = 'indigo' | 'slate' | 'emerald' | 'amber' | 'sky' | 'rose' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  pill?: boolean;
  mono?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  slate: 'bg-slate-100 text-slate-600 border-slate-200/80',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
  sky: 'bg-sky-50 text-sky-700 border-sky-200/80',
  rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'slate',
  pill = false,
  mono = false,
  className = '',
  children,
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 border shrink-0
        ${pill ? 'rounded-full' : 'rounded-md'}
        ${mono ? 'font-mono' : ''}
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

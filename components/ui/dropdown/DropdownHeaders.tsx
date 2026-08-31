/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { THEME_SURFACES } from '../../../theme/system';

export const DropdownSectionHeader: React.FC<{
  title: string;
  subtitle?: string;
}> = ({ title, subtitle }) => (
  <div className={THEME_SURFACES.sectionHeader}>
    <span className={THEME_SURFACES.sectionTitle}>{title}</span>
    {subtitle && <span className={THEME_SURFACES.sectionSubtitle}>{subtitle}</span>}
  </div>
);

export const DropdownSubHeading: React.FC<{
  label: string;
}> = ({ label }) => (
  <div className={THEME_SURFACES.subHeading}>
    {label}
  </div>
);

export const DropdownDivider: React.FC = () => (
  <div className={THEME_SURFACES.divider} />
);

export const DropdownGuideItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  hint?: string;
  highlight?: boolean;
}> = ({ icon, title, description, hint, highlight }) => {
  return (
    <div className={`
      w-full flex items-start justify-between gap-2.5 px-3 py-2 rounded-xl text-left transition-all
      ${highlight 
        ? 'bg-gradient-to-r from-sky-50 to-blue-50/60 border border-sky-200/80' 
        : 'hover:bg-slate-50'}
    `}>
      <div className="flex items-start gap-2.5 min-w-0">
        <div className={`shrink-0 mt-0.5 ${highlight ? 'text-sky-600' : 'text-slate-500'}`}>
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-sm font-bold leading-tight ${highlight ? 'text-sky-900' : 'text-slate-800'}`}>
            {title}
          </span>
          <span className="text-xs font-medium text-slate-500 leading-normal mt-0.5">
            {description}
          </span>
        </div>
      </div>
      {hint && (
        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 shrink-0 whitespace-nowrap mt-0.5">
          {hint}
        </span>
      )}
    </div>
  );
};

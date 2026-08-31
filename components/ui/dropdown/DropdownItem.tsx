/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check } from 'lucide-react';
import { PaletteSwatches } from '../palette/PaletteSwatches';

export interface DropdownItemProps { 
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  highlight?: boolean;
  active?: boolean;
  truncate?: boolean;
  badge?: string;
  palettePreview?: string[];
  colorSwatch?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({ 
  onClick, 
  icon, 
  label, 
  sublabel, 
  highlight, 
  active, 
  truncate, 
  badge, 
  palettePreview, 
  colorSwatch 
}) => {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer
        ${highlight 
          ? 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 hover:from-sky-100 hover:to-blue-100 border border-sky-200' 
          : active 
            ? 'bg-indigo-50 text-indigo-900 border border-indigo-200/80 hover:bg-indigo-100/70' 
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}
      `}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`shrink-0 ${highlight ? 'text-sky-600' : active ? 'text-indigo-600' : 'text-slate-500'}`}>
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={truncate ? "truncate" : "leading-tight"}>{label}</span>
          {sublabel && (
            <span className="text-xs font-medium text-slate-500 leading-normal truncate mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {colorSwatch && (
          <span 
            className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs shrink-0" 
            style={{ backgroundColor: colorSwatch }}
          />
        )}

        <PaletteSwatches colors={palettePreview} max={4} size="xs" />

        {badge && (
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60">
            {badge}
          </span>
        )}

        {active && (
          <Check size={14} strokeWidth={3} className="text-indigo-600 shrink-0" />
        )}
      </div>
    </button>
  );
};

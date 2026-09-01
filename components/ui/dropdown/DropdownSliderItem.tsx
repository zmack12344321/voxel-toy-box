/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface DropdownSliderItemProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  valueDisplay?: string;
  plainValue?: boolean;
  accentColor?: string;
  onChange: (val: number) => void;
}

export const DropdownSliderItem: React.FC<DropdownSliderItemProps> = ({ 
  icon, 
  label, 
  sublabel, 
  value, 
  min, 
  max, 
  step = 1, 
  valueDisplay, 
  plainValue = false,
  accentColor = 'accent-indigo-600',
  onChange 
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 px-2 py-1.5 rounded-lg">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="shrink-0 text-indigo-600">{icon}</div>
          <div className="flex flex-col min-w-0">
            <span className="leading-tight text-sm font-bold text-slate-700">{label}</span>
            {sublabel && <span className="text-xs text-slate-400 font-medium leading-tight truncate">{sublabel}</span>}
          </div>
        </div>
        {plainValue ? (
          <span className="text-xs font-mono font-bold text-slate-600 shrink-0">
            {valueDisplay ?? value}
          </span>
        ) : (
          <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md shrink-0">
            {valueDisplay ?? value}
          </span>
        )}
      </div>

      <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer ${accentColor} focus:outline-hidden`}
      />
    </div>
  );
};

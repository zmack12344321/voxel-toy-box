/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface DropdownToggleItemProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: () => void;
}

export const DropdownToggleItem: React.FC<DropdownToggleItemProps> = ({ icon, label, sublabel, checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`
        w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer
        ${checked 
          ? 'text-slate-900 bg-slate-50/80 hover:bg-slate-100 hover:text-slate-950' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}
      `}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`shrink-0 transition-colors ${checked ? 'text-indigo-600' : 'text-slate-400'}`}>
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`leading-tight text-sm font-bold ${checked ? 'text-slate-900' : 'text-slate-700'}`}>{label}</span>
          {sublabel && <span className="text-xs text-slate-500 font-medium leading-normal mt-0.5">{sublabel}</span>}
        </div>
      </div>
      
      {/* Tactile status switch */}
      <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors duration-200 shrink-0 ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}>
        <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-xs transform transition-transform duration-200 ${checked ? 'translate-x-3.5' : 'translate-x-0'}`} />
      </div>
    </button>
  );
};

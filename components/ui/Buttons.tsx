/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ThemeButtonColor, THEME_BUTTON_COLORS } from '../../theme/system';

interface TactileButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  color: ThemeButtonColor;
  compact?: boolean;
}

export const TactileButton: React.FC<TactileButtonProps> = ({ onClick, disabled, icon, label, color, compact }) => {
  const colorConfig = THEME_BUTTON_COLORS[color] || THEME_BUTTON_COLORS.slate;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative flex items-center justify-center gap-2 rounded-2xl font-bold text-sm transition-all duration-100 cursor-pointer
        border-b-[4px] active:border-b-0 active:translate-y-[4px]
        ${compact ? 'p-3' : 'px-4 py-3'}
        ${disabled
          ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed shadow-none'
          : `${colorConfig.bg}`}
      `}
    >
      {icon}
      {!compact && <span>{label}</span>}
    </button>
  );
};

export const BigActionButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string; color: 'rose' }> = ({ onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center px-8 py-5 rounded-3xl bg-rose-500 hover:bg-rose-600 text-white shadow-2xl shadow-rose-900/30 border-b-[6px] border-rose-800 active:border-b-0 active:translate-y-[6px] transition-all duration-150 cursor-pointer"
    >
      <div className="mb-1.5">{icon}</div>
      <div className="text-sm font-black tracking-wider">{label}</div>
    </button>
  );
};

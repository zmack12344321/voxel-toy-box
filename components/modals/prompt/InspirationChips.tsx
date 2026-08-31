/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface InspirationChipsProps {
  suggestions: string[];
  disabled?: boolean;
  onSelect: (suggestion: string) => void;
}

export const InspirationChips: React.FC<InspirationChipsProps> = ({
  suggestions,
  disabled,
  onSelect,
}) => {
  return (
    <div className="mt-3">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
        Quick Ideas:
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(s)}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

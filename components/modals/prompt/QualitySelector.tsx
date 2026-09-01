/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, Sparkles } from 'lucide-react';

export type DetailLevel = 'masterpiece' | 'detailed' | 'classic';

interface QualitySelectorProps {
  value: DetailLevel;
  disabled?: boolean;
  onChange: (level: DetailLevel) => void;
}

export const QualitySelector: React.FC<QualitySelectorProps> = ({
  value,
  disabled,
  onChange,
}) => {
  const options: DetailLevel[] = ['masterpiece', 'detailed', 'classic'];
  return (
    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
        <Sparkles size={13} className="text-amber-500" />
        <span>Voxel Resolution:</span>
      </div>
      <div className="flex items-center gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
              value === opt
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

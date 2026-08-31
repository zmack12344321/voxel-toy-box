/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { IconRenderer } from '../ui/IconRenderer';
import { Text } from '../ui/typography/Typography';
import { PaletteSwatches } from '../ui/palette/PaletteSwatches';

interface ModelCardItemProps {
  name: string;
  iconName?: string;
  palettePreview?: string[];
  isCurrent: boolean;
  onClick: () => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: () => void;
}

export const ModelCardItem: React.FC<ModelCardItemProps> = ({
  name,
  iconName,
  palettePreview,
  isCurrent,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
        isCurrent
          ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-xs'
          : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-800'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/80'
        }`}>
          <IconRenderer name={iconName || 'Sparkles'} size={16} />
        </div>
        <div className="min-w-0">
          <Text variant="subheading" className="truncate group-hover:text-indigo-600 transition-colors">
            {name}
          </Text>
          {/* Palette Swatches */}
          <PaletteSwatches colors={palettePreview} max={5} size="xs" className="mt-1" />
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {isCurrent ? (
          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
            <Check size={12} strokeWidth={3} />
          </div>
        ) : (
          <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
    </button>
  );
};

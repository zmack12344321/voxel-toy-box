/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type SwatchSize = 'xs' | 'sm' | 'md';

interface PaletteSwatchesProps {
  colors?: string[];
  max?: number;
  size?: SwatchSize;
  className?: string;
}

const sizeStyles: Record<SwatchSize, string> = {
  xs: 'w-2 h-2',
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
};

export const PaletteSwatches: React.FC<PaletteSwatchesProps> = ({
  colors,
  max = 6,
  size = 'sm',
  className = '',
}) => {
  if (!colors || colors.length === 0) return null;

  return (
    <div className={`flex items-center gap-1 shrink-0 ${className}`}>
      {colors.slice(0, max).map((color, i) => (
        <span
          key={i}
          className={`${sizeStyles[size]} rounded-full border border-black/15 shadow-2xs shrink-0 transition-transform hover:scale-125`}
          style={{ backgroundColor: color }}
          title={`Color #${color}`}
        />
      ))}
    </div>
  );
};

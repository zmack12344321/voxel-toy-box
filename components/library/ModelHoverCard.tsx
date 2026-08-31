/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Palette } from 'lucide-react';
import { IconRenderer } from '../ui/IconRenderer';
import { Text, Badge, Card, PaletteSwatches } from '../ui';

export interface HoveredModelInfo {
  id?: string;
  name: string;
  iconName?: string;
  description?: string;
  palettePreview?: string[];
  category?: string;
  tags?: string[];
  voxelCount?: number;
  thumbnailUrl?: string;
  topPos: number;
}

interface ModelHoverCardProps {
  model: HoveredModelInfo;
}

export const ModelHoverCard: React.FC<ModelHoverCardProps> = ({ model }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [formatIndex, setFormatIndex] = useState(0);

  const formats = ['.png', '.svg'];
  const currentExt = formats[formatIndex] || '.png';
  const thumbnailPath = model.thumbnailUrl || (model.id ? `/thumbnails/${model.id}${currentExt}` : null);

  const handleImgError = () => {
    if (formatIndex < formats.length - 1) {
      setFormatIndex(prev => prev + 1);
    } else {
      setImgFailed(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: -12 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.96, x: -8 }}
      transition={{ type: 'spring', damping: 26, stiffness: 350 }}
      className="fixed left-[390px] top-1/2 -translate-y-1/2 w-80 z-50 pointer-events-none font-sans"
    >
      <Card variant="glass" className="flex flex-col gap-3">
        {/* 3D Model Thumbnail Image Preview Container */}
        <div className="w-full h-48 bg-gradient-to-br from-indigo-50/80 via-slate-50 to-indigo-100/60 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:14px_14px] opacity-15" />
          
          {thumbnailPath && !imgFailed ? (
            <img
              src={thumbnailPath}
              alt={model.name}
              onError={handleImgError}
              className="w-full h-full object-contain relative z-10 p-2 transform hover:scale-105 transition-transform drop-shadow-xl"
            />
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-white/90 shadow-lg flex items-center justify-center text-indigo-600 relative z-10">
                <IconRenderer name={model.iconName || 'Sparkles'} size={28} />
              </div>
              <Badge variant="indigo" pill className="mt-2 relative z-10">
                3D Sculpture Preview
              </Badge>
            </>
          )}
        </div>

        {/* Model Name & Category Header */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div>
            <Text variant="heading">{model.name}</Text>
            {model.category && (
              <Text variant="category">
                {model.category.replace('_', ' ')}
              </Text>
            )}
          </div>
          {typeof model.voxelCount === 'number' && (
            <Badge variant="slate" mono>
              {model.voxelCount.toLocaleString()} voxels
            </Badge>
          )}
        </div>

        {/* Description Block using Global Flat Card & Description Variant */}
        <Card variant="flat" className="p-2.5">
          <Text variant="description">
            {model.description || 'Custom AI-sculpted 3D voxel model.'}
          </Text>
        </Card>

        {/* Palette Preview Swatches */}
        {model.palettePreview && model.palettePreview.length > 0 && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Palette size={13} className="text-indigo-500" />
              <Text variant="label">Palette:</Text>
            </div>
            <PaletteSwatches colors={model.palettePreview} max={6} size="sm" />
          </div>
        )}

        {/* Tag Badges */}
        {model.tags && model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {model.tags.map((tag, idx) => (
              <Badge key={idx} variant="slate">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};

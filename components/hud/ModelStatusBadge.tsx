/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { THEME_SURFACES } from '../../theme/system';
import { RenderMode, MeshStats } from '../../types';
import { Text } from '../ui/typography/Typography';
import { Badge } from '../ui/badge/Badge';

interface ModelStatusBadgeProps {
  baseModel: string;
  voxelCount: number;
  meshStats?: MeshStats | { totalTriangles?: number; triangleCount?: number } | null;
  renderMode?: RenderMode;
}

export const ModelStatusBadge: React.FC<ModelStatusBadgeProps> = ({
  baseModel,
  voxelCount,
  meshStats,
  renderMode,
}) => {
  return (
    <div className={`flex items-center gap-2 px-3.5 py-3 ${THEME_SURFACES.tactilePill}`}>
      <Text variant="label" className="text-slate-500">Model:</Text>
      <Text variant="subheading" className="text-slate-900 font-semibold max-w-[140px] truncate">
        {baseModel}
      </Text>

      <Badge variant="slate" className="bg-white/80 border-black/5 text-slate-700 font-medium">
        {(voxelCount ?? 0).toLocaleString()} voxels
      </Badge>

      {(() => {
        const triCount = meshStats ? ('totalTriangles' in meshStats && typeof meshStats.totalTriangles === 'number' ? meshStats.totalTriangles : ('triangleCount' in meshStats && typeof meshStats.triangleCount === 'number' ? meshStats.triangleCount : undefined)) : undefined;
        if (triCount === undefined) return null;
        return (
          <Badge
            variant={
              renderMode === RenderMode.MERGED_VOXEL ? 'emerald' :
              renderMode === RenderMode.SMOOTH_MARCHING ? 'sky' : 'amber'
            }
            className="font-medium"
          >
            {triCount.toLocaleString()} tris
          </Badge>
        );
      })()}
    </div>
  );
};

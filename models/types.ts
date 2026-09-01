/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../types';

export type ModelCategory = 'creatures' | 'scifi_mech' | 'architecture' | 'objects';

export interface ModelPreset {
  id: string;
  name: string;
  category: ModelCategory;
  description: string;
  author?: string;
  tags: string[];
  iconName: 'Bird' | 'Cat' | 'Rabbit' | 'Users' | 'Castle' | 'Bot' | 'Rocket' | 'Sparkles' | 'TreePine' | 'Shield';
  palettePreview: string[];
  voxelCount?: number;
  generate: () => VoxelData[];
}

export interface BoxVolume {
  min: [number, number, number]; // [x1, y1, z1]
  max: [number, number, number]; // [x2, y2, z2]
  color: string | number;
}

export interface DetailedVoxelModelPayload {
  name?: string;
  description?: string;
  boxes?: Array<{
    min: [number, number, number];
    max: [number, number, number];
    color: string | number;
    symmetricX?: boolean;
  }>;
  cylinders?: Array<{
    cx: number;
    y1: number;
    y2: number;
    cz: number;
    radius: number;
    color: string | number;
    symmetricX?: boolean;
  }>;
  spheres?: Array<{
    cx: number;
    cy: number;
    cz: number;
    radius: number;
    color: string | number;
    symmetricX?: boolean;
  }>;
  voxels?: Array<{
    x: number;
    y: number;
    z: number;
    color: string | number;
  }>;
}

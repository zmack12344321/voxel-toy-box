/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Reusable Modular Micro-Asset Library for Voxel Sculpting & Scatter Engine.
 * Each asset defines declarative shape commands for building high-detail sub-models.
 */

import { DeclarativeShapeCommand } from '../declarativeTypes';

export interface MicroAssetDefinition {
  id: string;
  name: string;
  category: 'coral' | 'vegetation' | 'marine' | 'structure';
  commands: DeclarativeShapeCommand[];
}

export const ASSET_LIBRARY: Record<string, MicroAssetDefinition> = {
  brain_coral: {
    id: 'brain_coral',
    name: 'Brain Coral Dome',
    category: 'coral',
    commands: [
      { op: 'sphere', at: [0, 0, 0], radius: 3.2, color: '#F43F5E' },
      { op: 'sphere', at: [0.6, 0.8, 0.4], radius: 2.4, color: '#E11D48' },
      { op: 'sphere', at: [-0.5, 0.6, -0.5], radius: 2.2, color: '#A855F7' },
      { op: 'accents', voxels: [
        { at: [1, 2, 0], color: '#F43F5E' },
        { at: [-1, 2, 1], color: '#E11D48' },
        { at: [0, 2.5, -1], color: '#FB923C' }
      ]}
    ]
  },
  staghorn_coral: {
    id: 'staghorn_coral',
    name: 'Staghorn Coral Branch',
    category: 'coral',
    commands: [
      { op: 'cylinder', at: [0, 0, 0], radius: 0.8, height: 2.5, axis: 'y', color: '#FB923C' },
      { op: 'cylinder', at: [1.0, 1.8, 0.4], radius: 0.6, height: 2.2, axis: 'y', color: '#FB923C' },
      { op: 'cylinder', at: [-1.0, 1.5, -0.4], radius: 0.6, height: 2.0, axis: 'y', color: '#E11D48' },
      { op: 'sphere', at: [1.0, 3.2, 0.4], radius: 0.7, color: '#06B6D4' },
      { op: 'sphere', at: [-1.0, 2.8, -0.4], radius: 0.7, color: '#06B6D4' },
      { op: 'sphere', at: [0, 3.8, 0], radius: 0.8, color: '#06B6D4' }
    ]
  },
  fan_coral: {
    id: 'fan_coral',
    name: 'Fan Coral Lattice',
    category: 'coral',
    commands: [
      { op: 'cylinder', at: [0, 0, 0], radius: 0.5, height: 1.5, axis: 'y', color: '#78350F' },
      { op: 'dome', at: [0, 1.2, 0], radius: 2.4, color: '#06B6D4' },
      { op: 'accents', voxels: [
        { at: [-1.5, 2.4, 0], color: '#FACC15' },
        { at: [0, 2.8, 0], color: '#FACC15' },
        { at: [1.5, 2.4, 0], color: '#FACC15' }
      ]}
    ]
  },
  sea_anemone: {
    id: 'sea_anemone',
    name: 'Sea Anemone Cluster',
    category: 'coral',
    commands: [
      { op: 'dome', at: [0, 0, 0], radius: 1.8, color: '#A855F7' },
      { op: 'repeat', count: 6, step: [0, 0, 0], command: { op: 'cylinder', at: [0, 1.0, 0], radius: 0.3, height: 1.6, color: '#EC4899' } }
    ]
  },
  palm_tree: {
    id: 'palm_tree',
    name: 'Tropical Palm Tree',
    category: 'vegetation',
    commands: [
      { op: 'tree', at: [0, 0, 0], trunkHeight: 8, canopyRadius: 6, trunkColor: '#78350F', foliageColor: '#15803D', foliageStyle: 'palm' },
      { op: 'accents', voxels: [
        { at: [0, 6.5, 1], color: '#78350F' },
        { at: [1, 6.5, 0], color: '#78350F' },
        { at: [-1, 6.5, 0], color: '#78350F' }
      ]}
    ]
  }
};

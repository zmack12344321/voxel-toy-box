/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VoxelData } from '../../types';
import { ModelPreset } from '../types';
import { compileSceneSpec } from '../../services/rasterizer/index';
import { SceneSpec } from '../declarativeTypes';

const tropicalIslandScene: SceneSpec = {
  model: {
    palette: {
      deepOcean: '#0F172A',
      wetSand: '#CA8A04',
      shallowSand: '#EAB308',
      beachSand: '#FDE047',
      warmDune: '#FEF08A',
      sandRock: '#64748B',
      slateGrey: '#475569',
      palmTrunk: '#78350F',
      palmFoliage: '#15803D',
      jungleGreen: '#166534',
      wood: '#92400E',
      coralPink: '#F43F5E',
      coralMagenta: '#E11D48',
      coralPurple: '#A855F7',
      coralOrange: '#FB923C',
      coralCyan: '#06B6D4',
      coralYellow: '#FACC15',
      seaweedGreen: '#10B981',
      fishYellow: { color: '#FACC15', emissive: true },
      fishBlue: { color: '#38BDF8', emissive: true },
      fishRed: { color: '#F87171', emissive: true },
      seagullWhite: '#F8FAFC',
      seagullWing: '#64748B',
      seagullBeak: '#F59E0B'
    },
    commands: [],
    animatedEntities: [
      {
        id: 'seagull_flock_high', speed: 0.06,
        waypoints: [[0, 28, 30], [32, 30, 0], [0, 29, -32], [-32, 31, 0]],
        commands: [
          { op: 'wing', from: [0, 0, 0], span: [4.5, 1.6, -2.2], rootChord: 2.2, tipChord: 0.8, color: 'seagullWhite', mirror: 'x' },
          { op: 'capsule', from: [0, 0, 0], to: [0, 0.4, 2.0], radiusStart: 0.8, radiusEnd: 0.4, color: 'seagullWhite' },
          { op: 'accents', voxels: [{ at: [0, 0.5, 2.2], color: 'seagullBeak' }, { at: [2.2, 0.5, -0.6], color: 'seagullWing', mirror: 'x' }] }
        ]
      },
      {
        id: 'tropical_fish_school_1', speed: 0.09,
        waypoints: [[28, 3.5, 12], [0, 3.2, 32], [-32, 3.5, 8], [-12, 3.2, -30], [24, 3.5, -16]],
        commands: [{ op: 'accents', voxels: [
          { at: [0, 0, 0], color: 'fishYellow' }, { at: [1, 0, 0], color: 'fishYellow' }, { at: [0.5, 0.6, 0], color: 'fishYellow' },
          { at: [-4, 0.5, 3], color: 'fishBlue' }, { at: [-5, 0.5, 3], color: 'fishBlue' }, { at: [-4.5, 1.0, 3], color: 'fishBlue' },
          { at: [4, 0.2, -4], color: 'fishRed' }, { at: [5, 0.2, -4], color: 'fishRed' },
        ] }]
      },
    ],
  },
  sceneCommands: [
    { op: 'tropical_island', at: [0, 0, 0], size: [240, 48, 240], palmCount: 48 },
    { op: 'coral_reef_bed', center: [0, 2, 0], innerRadius: 65, outerRadius: 110 }
  ],
};

export const TropicalIslandPreset: ModelPreset = {
  id: 'tropical_coral_island',
  name: 'Tropical Coral Island',
  category: 'objects',
  description: 'Expansive 80-unit tropical island archipelago featuring gradual sloping sand dunes, wooden pier, rich palm canopy, underwater barrier coral reef, swimming fish, and soaring seagulls',
  author: 'Voxel Architect',
  tags: ['island', 'coral', 'reef', 'tropical', 'seagull', 'fish', 'water', 'palm', 'ocean'],
  iconName: 'Sparkles',
  palettePreview: ['#FDE047', '#0284c7', '#F43F5E', '#15803D', '#A855F7'],
  sceneSpec: tropicalIslandScene,
  generate: (): VoxelData[] => {
    return compileSceneSpec(tropicalIslandScene).voxels;
  }
};

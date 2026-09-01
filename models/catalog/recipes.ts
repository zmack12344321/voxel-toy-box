/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CatalogAssetRecipe } from './types';

export const CATALOG_RECIPES: CatalogAssetRecipe[] = [
  // 1. Structure Packs (Architecture)
  {
    id: 'stone_fortress_wall',
    name: 'Stone Fortress Wall',
    category: 'architecture',
    tags: ['castle', 'wall', 'stone', 'fortress', 'battlement', 'architecture', 'building'],
    description: 'Fortified stone wall with crenellations, arch doorway, and wooden gate trim',
    palette: {
      stone: '#6B7280',
      mortar: '#4B5563',
      wood: '#78350F',
      trim: '#374151',
      iron: '#1F2937'
    },
    commands: [
      { op: 'box', at: [0, 4, 0], size: [20, 8, 4], color: 'stone' },
      { op: 'arch', at: [0, 4, 0], width: 6, height: 7, depth: 5, style: 'roman', color: 'wood' },
      { op: 'repeat', count: 5, step: [4, 0, 0], command: { op: 'box', at: [-8, 9, 0], size: [2, 2, 4], color: 'trim' } },
      { op: 'accents', voxels: [
        { at: [-2, 3, 2], color: 'iron', mirror: 'x' },
        { at: [-2, 5, 2], color: 'iron', mirror: 'x' }
      ]}
    ]
  },
  {
    id: 'medieval_watchtower',
    name: 'Medieval Watchtower',
    category: 'architecture',
    tags: ['tower', 'castle', 'watchtower', 'roof', 'building', 'architecture'],
    description: 'Round stone watchtower with conical roof, spiral stairs, and arched windows',
    palette: {
      stone: '#9CA3AF',
      roof: '#991B1B',
      wood: '#92400E',
      glow: { color: '#F59E0B', emissive: true }
    },
    commands: [
      { op: 'cylinder', at: [0, 10, 0], radius: 5, height: 20, axis: 'y', color: 'stone' },
      { op: 'cone', at: [0, 20, 0], baseRadius: 6, height: 8, color: 'roof' },
      { op: 'carve_cylinder', at: [0, 14, 4], radius: 1.5, height: 3, axis: 'z' },
      { op: 'spiral_stairs', at: [0, 0, 0], radius: 4, totalHeight: 18, steps: 16, color: 'wood' },
      { op: 'accents', voxels: [{ at: [0, 14, 2], color: 'glow' }] }
    ]
  },

  // 2. Nature & Terrain
  {
    id: 'pine_tree_cluster',
    name: 'Pine Tree Cluster',
    category: 'nature',
    tags: ['tree', 'pine', 'nature', 'forest', 'wood', 'foliage', 'plant'],
    description: 'Layered evergreen pine trees with rich green canopy and wood trunk',
    palette: {
      trunk: '#543826',
      pine: '#15803D',
      darkPine: '#166534'
    },
    commands: [
      { op: 'tree', at: [0, 0, 0], trunkHeight: 6, trunkRadius: 1.2, canopyRadius: 4, trunkColor: 'trunk', foliageColor: 'pine', foliageStyle: 'pine' },
      { op: 'tree', at: [6, 0, -4], trunkHeight: 4, trunkRadius: 0.9, canopyRadius: 3, trunkColor: 'trunk', foliageColor: 'darkPine', foliageStyle: 'pine' }
    ]
  },
  {
    id: 'winding_river_valley',
    name: 'Winding River Valley',
    category: 'nature',
    tags: ['river', 'water', 'valley', 'terrain', 'spline', 'nature', 'landscape'],
    description: 'Winding river bed with smooth spline pipe water curve and grassy terrain',
    palette: {
      grass: '#4ADE80',
      dirt: '#854D0E',
      waterCol: '#38BDF8'
    },
    commands: [
      { op: 'terrain', at: [0, 0, 0], size: [30, 4, 30], roughness: 0.3, color: 'grass', underColor: 'dirt' },
      { op: 'spline_pipe', points: [[-12, 1, -12], [-4, 1, -4], [4, 1, 4], [12, 1, 12]], thickness: 3, color: 'waterCol' },
      { op: 'water', at: [0, 1, 0], size: [30, 30], color: '#38BDF8', opacity: 0.85 }
    ]
  },

  // 3. Furniture & Interior
  {
    id: 'cozy_fireplace_lounge',
    name: 'Fireplace & Lounge',
    category: 'furniture',
    tags: ['fireplace', 'furniture', 'chair', 'table', 'interior', 'home', 'cozy', 'fire'],
    description: 'Stone fireplace with burning hearth glow, wooden armchairs, and coffee table',
    palette: {
      stone: '#475569',
      hearth: { color: '#EF4444', emissive: true },
      ember: { color: '#F59E0B', emissive: true },
      wood: '#78350F',
      cushion: '#DC2626'
    },
    commands: [
      { op: 'box', at: [0, 5, 0], size: [8, 10, 4], color: 'stone' },
      { op: 'carve_box', at: [0, 3, 1], size: [4, 4, 3] },
      { op: 'accents', voxels: [
        { at: [0, 1, 1], color: 'hearth' },
        { at: [1, 1, 1], color: 'ember' }
      ]},
      { op: 'box', at: [-6, 2, 4], size: [4, 3, 4], color: 'cushion', mirror: 'x' }
    ]
  },

  // 4. Weapons & Equipment
  {
    id: 'excalibur_broadsword',
    name: 'Runic Broadsword',
    category: 'gear',
    tags: ['sword', 'weapon', 'blade', 'rune', 'gold', 'gear', 'equipment'],
    description: 'Ornate broadsword with golden hilt, steel blade, and glowing rune accents',
    palette: {
      steel: '#E2E8F0',
      gold: '#F59E0B',
      ruby: '#DC2626',
      rune: { color: '#06B6D4', emissive: true }
    },
    commands: [
      { op: 'box', at: [0, 14, 0], size: [2, 20, 0.8], color: 'steel' },
      { op: 'wedge', at: [0, 25, 0], size: [2, 4, 0.8], direction: '+y', color: 'steel' },
      { op: 'box', at: [0, 3, 0], size: [6, 1.2, 1.2], color: 'gold' },
      { op: 'cylinder', at: [0, 0, 0], radius: 0.6, height: 5, axis: 'y', color: 'gold' },
      { op: 'accents', voxels: [
        { at: [0, 3, 0.7], color: 'ruby' },
        { at: [0, 12, 0.5], color: 'rune' },
        { at: [0, 16, 0.5], color: 'rune' }
      ]}
    ]
  },

  // 5. Vehicles & Ships
  {
    id: 'voxel_hovercraft',
    name: 'Voxel Hovercraft',
    category: 'vehicles',
    tags: ['vehicle', 'hovercraft', 'ship', 'thruster', 'scifi', 'speeder'],
    description: 'Futuristic hovercraft with angled wings, dual thrusters, and glass canopy',
    palette: {
      hull: '#2563EB',
      trim: '#F8FAFC',
      glass: '#38BDF8',
      plasma: { color: '#A855F7', emissive: true }
    },
    commands: [
      { op: 'box', at: [0, 3, 0], size: [8, 4, 16], color: 'hull', rotation: [-5, 0, 0] },
      { op: 'wing', from: [4, 3, -2], span: [8, 0, -6], rootChord: 6, tipChord: 2, color: 'hull', mirror: 'x' },
      { op: 'dome', at: [0, 5, 2], radius: 3, axis: '+y', color: 'glass' },
      { op: 'cylinder', at: [3, 3, -8], radius: 1.8, height: 5, axis: 'z', color: 'hull', mirror: 'x' },
      { op: 'accents', voxels: [{ at: [3, 3, -11], color: 'plasma', mirror: 'x' }] }
    ]
  },

  // 6. Sci-Fi & Mech
  {
    id: 'cyber_titan_mech',
    name: 'Cyber Titan Mech',
    category: 'scifi_mech',
    tags: ['mech', 'robot', 'scifi', 'titan', 'cannon', 'core', 'futuristic'],
    description: 'Armored combat mech with shoulder cannons, glowing energy core, and articulated limbs',
    palette: {
      armor: '#334155',
      accent: '#0EA5E9',
      joint: '#1E293B',
      core: { color: '#10B981', emissive: true }
    },
    commands: [
      { op: 'box', at: [0, 14, 0], size: [10, 8, 8], color: 'armor' },
      { op: 'capsule', from: [6, 15, 0], to: [12, 10, 4], radiusStart: 2, radiusEnd: 1.5, color: 'armor', mirror: 'x' },
      { op: 'cylinder', at: [4, 6, 0], radius: 1.8, height: 10, axis: 'y', color: 'joint', mirror: 'x' },
      { op: 'accents', voxels: [{ at: [0, 14, 4.2], color: 'core' }] }
    ]
  },

  // 7. Creatures
  {
    id: 'phoenix_bird',
    name: 'Fire Phoenix',
    category: 'creatures',
    tags: ['creature', 'phoenix', 'bird', 'fire', 'wings', 'beast', 'fantasy'],
    description: 'Majestic firebird with expansive glowing wings, crown feathers, and tail plumage',
    palette: {
      body: '#EF4444',
      wingTip: '#F59E0B',
      flame: { color: '#FACC15', emissive: true },
      beak: '#F97316'
    },
    commands: [
      { op: 'ellipsoid', at: [0, 8, 0], radii: [3, 5, 3], color: 'body' },
      { op: 'wing', from: [3, 9, 0], span: [12, 4, -4], rootChord: 6, tipChord: 2, color: 'wingTip', mirror: 'x' },
      { op: 'cone', at: [0, 14, 3], baseRadius: 1, height: 3, color: 'beak' },
      { op: 'accents', voxels: [
        { at: [1, 13, 2], color: 'flame', mirror: 'x' },
        { at: [0, 3, -5], color: 'flame' }
      ]}
    ]
  },

  // 8. Essential Props & Biomes
  {
    id: 'desert_oasis_biome',
    name: 'Desert Oasis Biome',
    category: 'biome',
    tags: ['desert', 'oasis', 'palm', 'dune', 'water', 'sand', 'biome', 'prop'],
    description: 'Sand dunes with palm tree shade, water pool, and desert rocks',
    palette: {
      sand: '#FDE047',
      tan: '#D97706',
      gold: '#B45309',
      waterCol: '#06B6D4',
      palmFoliage: '#15803D',
      wood: '#78350F'
    },
    commands: [
      { op: 'desert', at: [0, 0, 0], size: [24, 4, 24], roughness: 0.35, color: 'sand', underColor: 'tan', accentColor: 'gold' },
      { op: 'water', at: [0, 1, 0], size: [12, 12], color: '#06B6D4', opacity: 0.9 },
      { op: 'tree', at: [6, 1, 4], trunkHeight: 7, canopyRadius: 4, trunkColor: 'wood', foliageColor: 'palmFoliage', foliageStyle: 'palm' }
    ]
  }
];

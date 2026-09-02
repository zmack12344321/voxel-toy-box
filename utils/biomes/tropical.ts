/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeclarativeShapeCommand, MirrorAxis } from '../../models/declarativeTypes';
import { BIOME_PRESETS } from './types';

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Water surface — metadata only (no voxels rendered). Engine renders real Three.js Water. */
export function waterSurface(
  at: [number, number, number],
  size: [number, number],
  biomeColor?: string,
  opacity?: number
): DeclarativeShapeCommand[] {
  return [
    {
      op: 'water',
      at,
      size,
      color: biomeColor || BIOME_PRESETS.water.surface,
      opacity: opacity ?? 0.88,
    },
  ];
}

/** Tropical Island: 16-Step Micro-Gradual Seabed Slope + 100% Uniform Ivory Sand (#FFFBEB) + Outer Coral Reef */
export function tropicalIslandTerrain(
  at: [number, number, number],
  size: [number, number, number],
  palmCount = 48,
  mirror?: MirrorAxis,
  seed?: number,
): DeclarativeShapeCommand[] {
  const [cx, cy, cz] = at;
  const random = seededRandom(seed ?? (
    Math.imul(cx, 73856093) ^ Math.imul(cy, 19349663) ^ Math.imul(cz, 83492791) ^ palmCount
  ));

  const commands: DeclarativeShapeCommand[] = [];

  // 16 Micro-Gradual Height Steps (1.0 voxel height increments) from deep seabed y=0 up to shoreline y=14
  const steps: Array<[number, number]> = [
    [0.0, 115],
    [1.0, 110],
    [2.0, 105],
    [3.0, 100],
    [4.0, 95],
    [5.0, 90],
    [6.0, 85],
    [7.0, 80],
    [8.0, 75],
    [9.0, 70],
    [10.0, 65],
    [11.0, 60],
    [12.0, 55],
    [13.0, 50],
    [14.0, 45], // Shoreline beach level
    [16.0, 35], // Sand dune level
  ];

  // All seabed and dune steps use 100% UNIFORM NATURAL IVORY SAND (#FFFBEB)
  for (const [stepY, r] of steps) {
    commands.push({
      op: 'cylinder',
      at: [cx, cy + stepY, cz],
      radius: r,
      height: 1.0,
      axis: 'y',
      color: '#FFFBEB',
      mirror
    });
  }

  // Central jungle grass bed
  commands.push({
    op: 'cylinder',
    at: [cx, cy + 20.0, cz],
    radius: 22,
    height: 4.0,
    axis: 'y',
    color: '#15803D',
    mirror
  });

  // Official Drei / Three.js Endless Ocean Water Plane (at y = 13.5, lapping at shoreline, submerging corals)
  commands.push({
    op: 'water',
    at: [cx, cy + 13.5, cz],
    size: [3500, 3500],
    color: BIOME_PRESETS.water.surface,
    opacity: 0.65
  });

  // 48 Authentic Coconut Palm Trees covering the central grass plateau
  const colors = ['#047857', '#15803D', '#166534'];

  for (let i = 0; i < palmCount; i++) {
    const angle = (i / palmCount) * Math.PI * 2 + Math.sin(i * 3.1) * 0.4;
    const r = Math.sqrt(random()) * 20;
    const px = Math.round(Math.cos(angle) * r);
    const pz = Math.round(Math.sin(angle) * r);

    const trunkH = 14 + Math.floor(random() * 12);
    const canopyR = 8 + Math.floor(random() * 4);

    commands.push({
      op: 'tree',
      at: [cx + px, cy + 24, cz + pz],
      trunkHeight: trunkH,
      canopyRadius: canopyR,
      trunkColor: '#78350F',
      foliageColor: colors[i % colors.length],
      foliageStyle: 'palm',
      mirror,
    });
  }

  return commands;
}

/** Coral Reef Shelf: Submerged Outer Reef Bed (innerRadius = 65, outerRadius = 110) */
export function coralReefBed(
  center: [number, number, number],
  innerRadius = 65,
  outerRadius = 110,
  mirror?: MirrorAxis
): DeclarativeShapeCommand[] {
  return [
    // 90 Submerged Micro-Asset Corals scattered further out across deep lagoon bed
    {
      op: 'scatter',
      asset: ['brain_coral', 'staghorn_coral', 'fan_coral', 'sea_anemone'],
      area: { type: 'ring', center, innerRadius, outerRadius },
      count: 90,
      scaleVariance: [0.8, 1.5],
      rotationVariance: true,
      snapToSurface: true,
      mirror,
    },
    // Outer Seaweed Splines
    { op: 'spline_pipe', points: [[center[0] - 70, center[1] + 1, center[2] - 45], [center[0] - 55, center[1] + 3, center[2] - 60], [center[0] - 40, center[1] + 2, center[2] - 70]], thickness: 2.4, color: '#10B981' },
    { op: 'spline_pipe', points: [[center[0] + 55, center[1] + 1, center[2] + 50], [center[0] + 70, center[1] + 3, center[2] + 65], [center[0] + 80, center[1] + 2, center[2] + 45]], thickness: 2.4, color: '#10B981' },
  ];
}

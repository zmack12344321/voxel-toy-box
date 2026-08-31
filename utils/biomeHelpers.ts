/**
 * Biome surface helpers — high-level terrain builders that expand into
 * declarative commands (terrain, dome, tree, accents) for use by the AI.
 *
 * Each function returns DeclarativeShapeCommand[] which the rasterizer
 * expands recursively via executeCommand. Water ops are metadata-only
 * (no voxels) — the engine renders a real Three.js Water plane.
 */

import { DeclarativeShapeCommand, MirrorAxis } from '../models/declarativeTypes';

export interface BiomeConfig {
  surface: string;
  under: string;
  accent: string;
}

export const BIOME_PRESETS: Record<string, BiomeConfig> = {
  desert: {
    surface: '#E8C99B',
    under: '#C4A56E',
    accent: '#D4A547',
  },
  snow: {
    surface: '#F0F4F8',
    under: '#B8C9D6',
    accent: '#FFFFFF',
  },
  forest_floor: {
    surface: '#4A6741',
    under: '#5C4033',
    accent: '#2E5E2E',
  },
  water: {
    surface: '#3AA0C6',
    under: '#1E6E8C',
    accent: '#7DC8E7',
  },
};

/** Desert: sand terrain + dune bumps + ripple accents */
export function desertTerrain(
  at: [number, number, number],
  size: [number, number, number],
  biomeColor?: string,
  underColor?: string,
  accentColor?: string,
  mirror?: MirrorAxis,
  roughness?: number
): DeclarativeShapeCommand[] {
  const surf = biomeColor || BIOME_PRESETS.desert.surface;
  const under = underColor || BIOME_PRESETS.desert.under;
  const accent = accentColor || BIOME_PRESETS.desert.accent;

  const commands: DeclarativeShapeCommand[] = [
    {
      op: 'terrain',
      at,
      size,
      roughness: roughness ?? 0.3,
      color: surf,
      underColor: under,
      mirror,
    },
  ];

  // Scatter dune dome bumps
  const [cx, cy, cz] = at;
  const [w, , d] = size;
  const duneCount = Math.max(2, Math.floor((w + d) / 8));

  for (let i = 0; i < duneCount; i++) {
    const t = i / Math.max(1, duneCount - 1);
    const dx = Math.round(cx + (t - 0.5) * w * 0.6);
    const dz = Math.round(cz + (Math.sin(i * 2.7) * 0.5) * d * 0.5);
    const duneR = 2 + (i % 3);

    commands.push({
      op: 'dome',
      at: [dx, cy + 1, dz],
      radius: duneR,
      color: i % 2 === 0 ? surf : accent,
      mirror,
    });
  }

  // Sand ripple accents (thin line voxels across the surface)
  for (let i = 0; i < 5; i++) {
    const rx = Math.round(cx + (Math.sin(i * 1.3) * 0.5) * w * 0.7);
    const rz = Math.round(cz + (i - 2) * d * 0.15);
    commands.push({
      op: 'accents',
      voxels: [
        { at: [rx, cy + 1, rz], color: accent, mirror },
        { at: [rx + 1, cy + 1, rz], color: accent },
        { at: [rx + 2, cy + 1, rz], color: accent },
      ],
    });
  }

  return commands;
}

/** Snow: flat white terrain + snow drifts + ice boulder accents */
export function snowTerrain(
  at: [number, number, number],
  size: [number, number, number],
  biomeColor?: string,
  underColor?: string,
  accentColor?: string,
  mirror?: MirrorAxis,
  roughness?: number
): DeclarativeShapeCommand[] {
  const surf = biomeColor || BIOME_PRESETS.snow.surface;
  const under = underColor || BIOME_PRESETS.snow.under;
  const accent = accentColor || BIOME_PRESETS.snow.accent;

  const commands: DeclarativeShapeCommand[] = [
    {
      op: 'terrain',
      at,
      size,
      roughness: roughness ?? 0.15,
      color: surf,
      underColor: under,
      mirror,
    },
  ];

  const [cx, cy, cz] = at;
  const [w, , d] = size;

  // Snow drifts (low domes)
  for (let i = 0; i < 3; i++) {
    const dx = Math.round(cx + (Math.sin(i * 3.14) * 0.4) * w * 0.5);
    const dz = Math.round(cz + (Math.cos(i * 2.1) * 0.4) * d * 0.5);
    commands.push({
      op: 'dome',
      at: [dx, cy, dz],
      radius: 2 + (i % 2),
      color: accent,
      mirror,
    });
  }

  // Ice boulders (small spheres scattered)
  for (let i = 0; i < 4; i++) {
    const bx = Math.round(cx + (Math.cos(i * 1.8) * 0.3) * w * 0.6);
    const bz = Math.round(cz + (Math.sin(i * 2.3) * 0.3) * d * 0.6);
    commands.push({
      op: 'sphere',
      at: [bx, cy + 1, bz],
      radius: 1,
      color: under,
      mirror,
    });
  }

  return commands;
}

/** Forest floor: green terrain + scattered trees + moss accents */
export function forestFloor(
  at: [number, number, number],
  size: [number, number, number],
  biomeColor?: string,
  underColor?: string,
  accentColor?: string,
  mirror?: MirrorAxis,
  roughness?: number
): DeclarativeShapeCommand[] {
  const surf = biomeColor || BIOME_PRESETS.forest_floor.surface;
  const under = underColor || BIOME_PRESETS.forest_floor.under;
  const accent = accentColor || BIOME_PRESETS.forest_floor.accent;

  const commands: DeclarativeShapeCommand[] = [
    {
      op: 'terrain',
      at,
      size,
      roughness: roughness ?? 0.25,
      color: surf,
      underColor: under,
      mirror,
    },
  ];

  const [cx, cy, cz] = at;
  const [w, , d] = size;
  const treeCount = Math.max(2, Math.floor((w * d) / 16));

  for (let i = 0; i < treeCount; i++) {
    const t = i / Math.max(1, treeCount - 1);
    const tx = Math.round(cx + (t - 0.5) * w * 0.7);
    const tz = Math.round(cz + (Math.sin(i * 2.7) * 0.5) * d * 0.6);
    const style: 'sphere' | 'pine' | 'cloud' = i % 3 === 0 ? 'sphere' : i % 3 === 1 ? 'pine' : 'cloud';

    commands.push({
      op: 'tree',
      at: [tx, cy, tz],
      trunkHeight: 2 + (i % 3),
      trunkRadius: 1,
      canopyRadius: 1.5 + (i % 2),
      trunkColor: under,
      foliageColor: i % 2 === 0 ? surf : accent,
      foliageStyle: style,
      mirror,
    });
  }

  return commands;
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

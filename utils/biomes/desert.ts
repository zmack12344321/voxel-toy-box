/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeclarativeShapeCommand, MirrorAxis } from '../../models/declarativeTypes';
import { BIOME_PRESETS } from './types';

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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeclarativeShapeCommand, MirrorAxis } from '../../models/declarativeTypes';
import { BIOME_PRESETS } from './types';

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

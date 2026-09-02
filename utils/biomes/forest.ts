/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeclarativeShapeCommand, MirrorAxis } from '../../models/declarativeTypes';
import { BIOME_PRESETS } from './types';

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

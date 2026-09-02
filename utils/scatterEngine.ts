/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Organic Scatter Engine — expands op: 'scatter' commands into naturally distributed,
 * surface-snapped, scale-varied, and rotation-jittered shape commands.
 */

import { DeclarativeShapeCommand } from '../models/declarativeTypes';
import type { ScatterCommand } from '../models/commands/placement';
import { ASSET_LIBRARY } from '../models/catalog/assetLibrary';
import { getSurfaceHeight, RasterizerState } from '../services/rasterizer/helpers';

export type ScatterCommandOptions = ScatterCommand;

export function executeScatter(state: RasterizerState, cmd: ScatterCommandOptions, waterLevel?: number): DeclarativeShapeCommand[] {
  const resultCommands: DeclarativeShapeCommand[] = [];
  const { asset, area, count, seed = 0, scaleVariance = [0.8, 1.2], rotationVariance = false, snapToSurface = true, requireSurface = false, maxSlope, mirror } = cmd;
  const random = seededRandom(seed);
  const [cx, cy, cz] = area.center;

  const assetsList = Array.isArray(asset) ? asset : [asset];
  const placed: Array<[number, number]> = [];

  for (let i = 0; i < count; i++) {
    // Pick random asset from list
    const assetId = assetsList[i % assetsList.length];
    const assetDef = ASSET_LIBRARY[assetId];

    let px = cx;
    let pz = cz;

    let attempts = 0;
    do {
    if (area.type === 'ring') {
      const inner = area.innerRadius ?? 10;
      const outer = area.outerRadius ?? 20;
      const angle = (i / count) * Math.PI * 2 + (Math.sin(i * 3.7) * 0.4);
      const r = inner + random() * (outer - inner);
      px = Math.round(cx + Math.cos(angle) * r);
      pz = Math.round(cz + Math.sin(angle) * r);
    } else if (area.type === 'circle') {
      const radius = area.radius ?? 15;
      const angle = random() * Math.PI * 2;
      const r = Math.sqrt(random()) * radius;
      px = Math.round(cx + Math.cos(angle) * r);
      pz = Math.round(cz + Math.sin(angle) * r);
    } else if (area.type === 'box') {
      const [w, d] = area.size ?? [20, 20];
      px = Math.round(cx + (random() - 0.5) * w);
      pz = Math.round(cz + (random() - 0.5) * d);
    }
    attempts++;
    } while (cmd.minDistance && attempts < 20 && placed.some(([x, z]) => Math.hypot(px - x, pz - z) < cmd.minDistance!));
    if (cmd.minDistance && placed.some(([x, z]) => Math.hypot(px - x, pz - z) < cmd.minDistance)) continue;
    const surface = getSurfaceHeight(state, px, pz, 1);
    if (requireSurface && surface === null) continue;
    if (cmd.avoidWater && waterLevel !== undefined && surface !== null && surface <= waterLevel) continue;
    if (maxSlope !== undefined && surface !== null) {
      const neighborHeights = [[px - 1, pz], [px + 1, pz], [px, pz - 1], [px, pz + 1]]
        .map(([x, z]) => getSurfaceHeight(state, x, z, 1))
        .filter((height): height is number => height !== null);
      if (neighborHeights.some(height => Math.abs(height - surface) > maxSlope)) continue;
    }
    placed.push([px, pz]);

    // Query surface height at (px, pz)
    let py = cy;
    if (snapToSurface) {
      const surfY = getSurfaceHeight(state, px, pz, 1);
      if (surfY !== null) {
        py = surfY + 1;
      }
    }

    // Generate commands for asset
    if (assetDef) {
      for (const baseCmd of assetDef.commands) {
        const cloned = JSON.parse(JSON.stringify(baseCmd)) as DeclarativeShapeCommand;
        if ('at' in cloned && Array.isArray(cloned.at)) {
          cloned.at[0] += px;
          cloned.at[1] += py;
          cloned.at[2] += pz;
        }
        if ('rotation' in cloned && rotationVariance) {
          cloned.rotation = [0, random() * 360, 0];
        }
        if ('radius' in cloned && typeof cloned.radius === 'number') {
          cloned.radius *= scaleVariance[0] + random() * (scaleVariance[1] - scaleVariance[0]);
        }
        if ('mirror' in cloned) cloned.mirror = mirror ?? cloned.mirror;
        resultCommands.push(cloned);
      }
    } else {
      // Fallback: procedural sphere/cone
      resultCommands.push({
        op: 'sphere',
        at: [px, py, pz],
        radius: 2 + (i % 2),
        color: i % 2 === 0 ? '#F43F5E' : '#A855F7',
        mirror
      });
    }
  }

  return resultCommands;
}

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

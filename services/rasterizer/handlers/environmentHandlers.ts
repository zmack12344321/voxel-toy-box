/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeclarativeShapeCommand } from '../../../models/declarativeTypes';
import { desertTerrain, snowTerrain, forestFloor } from '../../../utils/biomeHelpers';
import { RasterizerState, resolveColor, getMirroredPositions } from '../helpers';
import { rasterizeTree, rasterizeTerrain, rasterizeFence } from '../shapes';

export function handleEnvironmentCommand(
  state: RasterizerState,
  cmd: DeclarativeShapeCommand,
  waterRef: { value: { level: number; extent: [number, number]; color: number; opacity: number } | null },
  self: { executeCommand: (cmd: DeclarativeShapeCommand) => void }
): { handled: boolean; water?: { level: number; extent: [number, number]; color: number; opacity: number } | null } {
  switch (cmd.op) {
    case 'tree':
    case 'foliage': {
      const trunkCol = resolveColor(state, cmd.trunkColor);
      const folCol = resolveColor(state, cmd.foliageColor);
      rasterizeTree(state, cmd.at, cmd.trunkHeight, cmd.trunkRadius ?? 1, cmd.canopyRadius, trunkCol, folCol, cmd.foliageStyle ?? 'sphere', cmd.mirror);
      return { handled: true };
    }
    case 'terrain':
    case 'noise_patch': {
      const surfCol = resolveColor(state, cmd.color);
      const undCol = cmd.underColor ? resolveColor(state, cmd.underColor) : surfCol;
      rasterizeTerrain(state, cmd.at, cmd.size, cmd.roughness ?? 0.5, surfCol, undCol, cmd.mirror);
      return { handled: true };
    }
    case 'fence':
    case 'railing': {
      const color = resolveColor(state, cmd.color);
      rasterizeFence(state, cmd.from, cmd.to, cmd.height, cmd.postSpacing ?? 4, color, cmd.mirror);
      return { handled: true };
    }
    case 'accents': {
      if (cmd.voxels && Array.isArray(cmd.voxels)) {
        for (const v of cmd.voxels) {
          if (v.at && v.color) {
            const col = resolveColor(state, v.color);
            const mirrored = getMirroredPositions(v.at[0], v.at[1], v.at[2], v.mirror);
            for (const [mx, my, mz] of mirrored) {
              state.map.set(`${mx},${my},${mz}`, { x: mx, y: my, z: mz, color: col });
            }
          }
        }
      }
      return { handled: true };
    }
    case 'desert': {
      const sub = desertTerrain(cmd.at, cmd.size, cmd.color, cmd.underColor, cmd.accentColor, cmd.mirror, cmd.roughness);
      for (const c of sub) self.executeCommand(c);
      return { handled: true };
    }
    case 'snow': {
      const sub = snowTerrain(cmd.at, cmd.size, cmd.color, cmd.underColor, cmd.accentColor, cmd.mirror, cmd.roughness);
      for (const c of sub) self.executeCommand(c);
      return { handled: true };
    }
    case 'forest_floor': {
      const sub = forestFloor(cmd.at, cmd.size, cmd.color, cmd.underColor, cmd.accentColor, cmd.mirror, cmd.roughness);
      for (const c of sub) self.executeCommand(c);
      return { handled: true };
    }
    case 'water':
    case 'water_surface': {
      const waterColor = resolveColor(state, cmd.color);
      waterRef.value = {
        level: cmd.at[1],
        extent: cmd.size,
        color: waterColor,
        opacity: cmd.opacity ?? 0.88,
      };
      return { handled: true, water: waterRef.value };
    }
    default:
      return { handled: false };
  }
}

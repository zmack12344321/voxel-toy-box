/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Command dispatcher — routes DeclarativeShapeCommand to the correct rasterizer.
 */

import { DeclarativeShapeCommand } from '../../models/declarativeTypes';
import { desertTerrain, snowTerrain, forestFloor } from '../../utils/biomeHelpers';
import { RasterizerState, resolveColor, getMirroredPositions } from './helpers';
import { rasterizeBox, rasterizeSphere, rasterizeCylinder, rasterizeCone, rasterizeWedge, rasterizeCapsule } from './primitives';
import {
  rasterizeStairs,
  rasterizeDome,
  rasterizeArch,
  rasterizeRing,
  rasterizePolygonPrism,
  rasterizeWing,
  rasterizeSpiralStairs,
  rasterizeTerrain,
  rasterizeFence,
  rasterizeTrim,
  rasterizeTree,
} from './shapes';
import { carveBox, carveSphere } from './csg';

export function executeCommand(
  state: RasterizerState,
  cmd: DeclarativeShapeCommand,
  waterRef: { value: { level: number; extent: [number, number]; color: number; opacity: number } | null },
  self: { executeCommand: (cmd: DeclarativeShapeCommand) => void }
): { water: { level: number; extent: [number, number]; color: number; opacity: number } | null } {
  switch (cmd.op) {
    case 'box': {
      const color = resolveColor(state, cmd.color);
      rasterizeBox(state, cmd.at, cmd.size, color, cmd.hollow, cmd.wallThickness ?? 1, cmd.mirror);
      break;
    }
    case 'cylinder': {
      const color = resolveColor(state, cmd.color);
      rasterizeCylinder(state, cmd.at, cmd.radius, cmd.height, cmd.axis ?? 'y', color, cmd.hollow, cmd.mirror);
      break;
    }
    case 'sphere':
    case 'ellipsoid': {
      const color = resolveColor(state, cmd.color);
      const radii = cmd.radii ? cmd.radii : [cmd.radius ?? 2, cmd.radius ?? 2, cmd.radius ?? 2];
      rasterizeSphere(state, cmd.at, radii as [number, number, number], color, cmd.hollow, cmd.mirror);
      break;
    }
    case 'cone':
    case 'pyramid': {
      const color = resolveColor(state, cmd.color);
      const r = cmd.baseRadius ?? (cmd.baseSize ? Math.max(...cmd.baseSize) / 2 : 3);
      rasterizeCone(state, cmd.at, r, cmd.height, color, cmd.mirror);
      break;
    }
    case 'wedge':
    case 'ramp': {
      const color = resolveColor(state, cmd.color);
      rasterizeWedge(state, cmd.at, cmd.size, cmd.direction ?? '+z', color, cmd.mirror);
      break;
    }
    case 'capsule':
    case 'limb': {
      const color = resolveColor(state, cmd.color);
      const r1 = cmd.radiusStart ?? cmd.radius ?? 2;
      const r2 = cmd.radiusEnd ?? cmd.radius ?? 2;
      rasterizeCapsule(state, cmd.from, cmd.to, r1, r2, color, cmd.mirror);
      break;
    }
    case 'stairs': {
      const color = resolveColor(state, cmd.color);
      rasterizeStairs(state, cmd.at, cmd.width, cmd.steps, cmd.stepRise ?? 1, cmd.stepRun ?? 1, cmd.direction ?? '+z', color, cmd.mirror);
      break;
    }
    case 'tree':
    case 'foliage': {
      const trunkCol = resolveColor(state, cmd.trunkColor);
      const folCol = resolveColor(state, cmd.foliageColor);
      rasterizeTree(state, cmd.at, cmd.trunkHeight, cmd.trunkRadius ?? 1, cmd.canopyRadius, trunkCol, folCol, cmd.foliageStyle ?? 'sphere', cmd.mirror);
      break;
    }
    case 'line':
    case 'pipe': {
      const color = resolveColor(state, cmd.color);
      const r = cmd.thickness ? Math.max(0.5, cmd.thickness / 2) : 0.8;
      rasterizeCapsule(state, cmd.from, cmd.to, r, r, color, cmd.mirror);
      break;
    }
    case 'dome':
    case 'hemisphere': {
      const color = resolveColor(state, cmd.color);
      rasterizeDome(state, cmd.at, cmd.radius, cmd.axis ?? '+y', color, cmd.hollow, cmd.mirror);
      break;
    }
    case 'arch':
    case 'doorway': {
      const color = resolveColor(state, cmd.color);
      rasterizeArch(state, cmd.at, cmd.width, cmd.height, cmd.depth, cmd.wallThickness ?? 1, cmd.style ?? 'roman', color, cmd.mirror);
      break;
    }
    case 'ring':
    case 'wheel':
    case 'torus': {
      const color = resolveColor(state, cmd.color);
      rasterizeRing(state, cmd.at, cmd.radius, cmd.thickness ?? 1, cmd.axis ?? 'y', cmd.spokes ?? 0, cmd.spokeThickness ?? 1, color, cmd.mirror);
      break;
    }
    case 'poly_prism':
    case 'polygon_extrude': {
      const color = resolveColor(state, cmd.color);
      rasterizePolygonPrism(state, cmd.at, cmd.radius, cmd.height, cmd.sides ?? 6, cmd.axis ?? 'y', color, cmd.mirror);
      break;
    }
    case 'wing':
    case 'fin': {
      const color = resolveColor(state, cmd.color);
      rasterizeWing(state, cmd.from, cmd.span, cmd.rootChord, cmd.tipChord, cmd.thickness ?? 1, color, cmd.mirror);
      break;
    }
    case 'spiral_stairs': {
      const stepCol = resolveColor(state, cmd.color);
      const pilCol = cmd.pillarColor ? resolveColor(state, cmd.pillarColor) : stepCol;
      rasterizeSpiralStairs(state, cmd.at, cmd.radius, cmd.totalHeight, cmd.steps, cmd.stepThickness ?? 1, cmd.centralPillarRadius ?? 1, pilCol, stepCol, cmd.mirror);
      break;
    }
    case 'terrain':
    case 'noise_patch': {
      const surfCol = resolveColor(state, cmd.color);
      const undCol = cmd.underColor ? resolveColor(state, cmd.underColor) : surfCol;
      rasterizeTerrain(state, cmd.at, cmd.size, cmd.roughness ?? 0.5, surfCol, undCol, cmd.mirror);
      break;
    }
    case 'fence':
    case 'railing': {
      const color = resolveColor(state, cmd.color);
      rasterizeFence(state, cmd.from, cmd.to, cmd.height, cmd.postSpacing ?? 4, color, cmd.mirror);
      break;
    }
    case 'trim':
    case 'bevel_edges': {
      const color = resolveColor(state, cmd.color);
      rasterizeTrim(state, cmd.at, cmd.size, cmd.thickness ?? 1, color, cmd.mirror);
      break;
    }
    case 'carve_box': {
      carveBox(state, cmd.at, cmd.size, cmd.mirror);
      break;
    }
    case 'carve_sphere': {
      carveSphere(state, cmd.at, cmd.radius, cmd.mirror);
      break;
    }
    case 'carve_cylinder': {
      const r = cmd.radius;
      const h = cmd.height;
      const steps = Math.max(2, Math.ceil(h));
      for (let i = 0; i <= steps; i++) {
        const cy = (cmd.at[1] - h / 2) + (h * (i / steps));
        carveSphere(state, [cmd.at[0], cy, cmd.at[2]], r, cmd.mirror);
      }
      break;
    }
    case 'repeat': {
      const count = Math.max(1, cmd.count);
      const [sx, sy, sz] = cmd.step;
      for (let i = 0; i < count; i++) {
        const cloned = JSON.parse(JSON.stringify(cmd.command)) as DeclarativeShapeCommand;
        if ('at' in cloned && Array.isArray(cloned.at)) {
          cloned.at = [cloned.at[0] + sx * i, cloned.at[1] + sy * i, cloned.at[2] + sz * i];
        } else if ('from' in cloned && 'to' in cloned) {
          cloned.from = [cloned.from[0] + sx * i, cloned.from[1] + sy * i, cloned.from[2] + sz * i];
          cloned.to = [cloned.to[0] + sx * i, cloned.to[1] + sy * i, cloned.to[2] + sz * i];
        }
        self.executeCommand(cloned);
      }
      break;
    }
    case 'radialRepeat': {
      const count = Math.max(2, cmd.count);
      const r = cmd.radius;
      const [cx, cy, cz] = cmd.center ?? [0, 0, 0];
      const axis = cmd.axis ?? 'y';

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const cloned = JSON.parse(JSON.stringify(cmd.command)) as DeclarativeShapeCommand;
        let ox = 0, oy = 0, oz = 0;
        if (axis === 'y') {
          ox = cx + Math.cos(angle) * r;
          oz = cz + Math.sin(angle) * r;
          oy = cy;
        } else if (axis === 'z') {
          ox = cx + Math.cos(angle) * r;
          oy = cy + Math.sin(angle) * r;
          oz = cz;
        }

        if ('at' in cloned && Array.isArray(cloned.at)) {
          cloned.at = [cloned.at[0] + ox, cloned.at[1] + oy, cloned.at[2] + oz];
        }
        self.executeCommand(cloned);
      }
      break;
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
      break;
    }
    case 'desert': {
      const sub = desertTerrain(cmd.at, cmd.size, cmd.color, cmd.underColor, cmd.accentColor, cmd.mirror, cmd.roughness);
      for (const c of sub) self.executeCommand(c);
      break;
    }
    case 'snow': {
      const sub = snowTerrain(cmd.at, cmd.size, cmd.color, cmd.underColor, cmd.accentColor, cmd.mirror, cmd.roughness);
      for (const c of sub) self.executeCommand(c);
      break;
    }
    case 'forest_floor': {
      const sub = forestFloor(cmd.at, cmd.size, cmd.color, cmd.underColor, cmd.accentColor, cmd.mirror, cmd.roughness);
      for (const c of sub) self.executeCommand(c);
      break;
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
      return { water: waterRef.value };
    }
  }
  return { water: null };
}

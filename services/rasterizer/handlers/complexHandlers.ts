/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeclarativeShapeCommand } from '../../../models/declarativeTypes';
import { RasterizerState, resolveColor } from '../helpers';
import {
  rasterizeStairs,
  rasterizeDome,
  rasterizeArch,
  rasterizeRing,
  rasterizePolygonPrism,
  rasterizeWing,
  rasterizeSpiralStairs,
  rasterizeTrim,
  rasterizeSplinePipe,
} from '../shapes';
import { carveBox, carveSphere } from '../csg';

export function handleComplexCommand(
  state: RasterizerState,
  cmd: DeclarativeShapeCommand,
  self: { executeCommand: (cmd: DeclarativeShapeCommand) => void }
): boolean {
  switch (cmd.op) {
    case 'stairs': {
      const color = resolveColor(state, cmd.color);
      rasterizeStairs(state, cmd.at, cmd.width, cmd.steps, cmd.stepRise ?? 1, cmd.stepRun ?? 1, cmd.direction ?? '+z', color, cmd.mirror);
      return true;
    }
    case 'spline_pipe':
    case 'curve': {
      const color = resolveColor(state, cmd.color);
      rasterizeSplinePipe(state, cmd.points, cmd.thickness ?? 1.6, color, cmd.mirror);
      return true;
    }
    case 'dome':
    case 'hemisphere': {
      const color = resolveColor(state, cmd.color);
      rasterizeDome(state, cmd.at, cmd.radius, cmd.axis ?? '+y', color, cmd.hollow, cmd.mirror);
      return true;
    }
    case 'arch':
    case 'doorway': {
      const color = resolveColor(state, cmd.color);
      rasterizeArch(state, cmd.at, cmd.width, cmd.height, cmd.depth, cmd.wallThickness ?? 1, cmd.style ?? 'roman', color, cmd.mirror);
      return true;
    }
    case 'ring':
    case 'wheel':
    case 'torus': {
      const color = resolveColor(state, cmd.color);
      rasterizeRing(state, cmd.at, cmd.radius, cmd.thickness ?? 1, cmd.axis ?? 'y', cmd.spokes ?? 0, cmd.spokeThickness ?? 1, color, cmd.mirror);
      return true;
    }
    case 'poly_prism':
    case 'polygon_extrude': {
      const color = resolveColor(state, cmd.color);
      rasterizePolygonPrism(state, cmd.at, cmd.radius, cmd.height, cmd.sides ?? 6, cmd.axis ?? 'y', color, cmd.mirror);
      return true;
    }
    case 'wing':
    case 'fin': {
      const color = resolveColor(state, cmd.color);
      rasterizeWing(state, cmd.from, cmd.span, cmd.rootChord, cmd.tipChord, cmd.thickness ?? 1, color, cmd.mirror);
      return true;
    }
    case 'spiral_stairs': {
      const stepCol = resolveColor(state, cmd.color);
      const pilCol = cmd.pillarColor ? resolveColor(state, cmd.pillarColor) : stepCol;
      rasterizeSpiralStairs(state, cmd.at, cmd.radius, cmd.totalHeight, cmd.steps, cmd.stepThickness ?? 1, cmd.centralPillarRadius ?? 1, pilCol, stepCol, cmd.mirror);
      return true;
    }
    case 'trim':
    case 'bevel_edges': {
      const color = resolveColor(state, cmd.color);
      rasterizeTrim(state, cmd.at, cmd.size, cmd.thickness ?? 1, color, cmd.mirror);
      return true;
    }
    case 'carve_box': {
      carveBox(state, cmd.at, cmd.size, cmd.mirror);
      return true;
    }
    case 'carve_sphere': {
      carveSphere(state, cmd.at, cmd.radius, cmd.mirror);
      return true;
    }
    case 'carve_cylinder': {
      const r = cmd.radius;
      const h = cmd.height;
      const steps = Math.max(2, Math.ceil(h));
      for (let i = 0; i <= steps; i++) {
        const cy = (cmd.at[1] - h / 2) + (h * (i / steps));
        carveSphere(state, [cmd.at[0], cy, cmd.at[2]], r, cmd.mirror);
      }
      return true;
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
      return true;
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
      return true;
    }
    default:
      return false;
  }
}

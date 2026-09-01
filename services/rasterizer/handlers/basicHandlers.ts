/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeclarativeShapeCommand } from '../../../models/declarativeTypes';
import { RasterizerState, resolveColor } from '../helpers';
import { rasterizeBox, rasterizeSphere, rasterizeCylinder, rasterizeCone, rasterizeWedge, rasterizeCapsule } from '../primitives';

export function handleBasicCommand(state: RasterizerState, cmd: DeclarativeShapeCommand): boolean {
  switch (cmd.op) {
    case 'box': {
      const color = resolveColor(state, cmd.color);
      rasterizeBox(state, cmd.at, cmd.size, color, cmd.hollow, cmd.wallThickness ?? 1, cmd.mirror, cmd.rotation);
      return true;
    }
    case 'cylinder': {
      const color = resolveColor(state, cmd.color);
      rasterizeCylinder(state, cmd.at, cmd.radius, cmd.height, cmd.axis ?? 'y', color, cmd.hollow, cmd.mirror, cmd.rotation);
      return true;
    }
    case 'sphere':
    case 'ellipsoid': {
      const color = resolveColor(state, cmd.color);
      const radii = cmd.radii ? cmd.radii : [cmd.radius ?? 2, cmd.radius ?? 2, cmd.radius ?? 2];
      rasterizeSphere(state, cmd.at, radii as [number, number, number], color, cmd.hollow, cmd.mirror, cmd.rotation);
      return true;
    }
    case 'cone':
    case 'pyramid': {
      const color = resolveColor(state, cmd.color);
      const r = cmd.baseRadius ?? (cmd.baseSize ? Math.max(...cmd.baseSize) / 2 : 3);
      rasterizeCone(state, cmd.at, r, cmd.height, color, cmd.mirror, cmd.rotation);
      return true;
    }
    case 'wedge':
    case 'ramp': {
      const color = resolveColor(state, cmd.color);
      rasterizeWedge(state, cmd.at, cmd.size, cmd.direction ?? '+z', color, cmd.mirror, cmd.rotation);
      return true;
    }
    case 'capsule':
    case 'limb': {
      const color = resolveColor(state, cmd.color);
      const r1 = cmd.radiusStart ?? cmd.radius ?? 2;
      const r2 = cmd.radiusEnd ?? cmd.radius ?? 2;
      rasterizeCapsule(state, cmd.from, cmd.to, r1, r2, color, cmd.mirror);
      return true;
    }
    case 'line':
    case 'pipe': {
      const color = resolveColor(state, cmd.color);
      const r = cmd.thickness ? Math.max(0.5, cmd.thickness / 2) : 0.8;
      rasterizeCapsule(state, cmd.from, cmd.to, r, r, color, cmd.mirror);
      return true;
    }
    default:
      return false;
  }
}

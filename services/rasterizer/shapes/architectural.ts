/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MirrorAxis } from '../../../models/declarativeTypes';
import { RasterizerState, getMirroredPositions } from '../helpers';
import { rasterizeBox, rasterizeSphere, rasterizeCapsule } from '../primitives';

export function rasterizeStairs(
  state: RasterizerState,
  at: [number, number, number],
  width: number,
  steps: number,
  stepRise = 1,
  stepRun = 1,
  direction = '+z',
  color: number,
  mirror: MirrorAxis = 'none'
): void {
  const [cx, cy, cz] = at;
  const totalSteps = Math.max(1, steps);
  const hw = Math.max(0.5, width / 2);

  for (let s = 0; s < totalSteps; s++) {
    const currentY = cy + s * stepRise;
    let stepMinZ = cz;
    let stepMaxZ = cz;
    let stepMinX = cx - hw;
    let stepMaxX = cx + hw;

    if (direction === '+z') {
      stepMinZ = cz + s * stepRun;
      stepMaxZ = cz + (s + 1) * stepRun - 1;
    } else if (direction === '-z') {
      stepMinZ = cz - (s + 1) * stepRun + 1;
      stepMaxZ = cz - s * stepRun;
    } else if (direction === '+x') {
      stepMinX = cx + s * stepRun;
      stepMaxX = cx + (s + 1) * stepRun - 1;
      stepMinZ = cz - hw;
      stepMaxZ = cz + hw;
    } else if (direction === '-x') {
      stepMinX = cx - (s + 1) * stepRun + 1;
      stepMaxX = cx - s * stepRun;
      stepMinZ = cz - hw;
      stepMaxZ = cz + hw;
    }

    for (let y = cy; y <= currentY + stepRise - 1; y++) {
      for (let x = Math.round(stepMinX); x <= Math.round(stepMaxX); x++) {
        for (let z = Math.round(stepMinZ); z <= Math.round(stepMaxZ); z++) {
          const mirrored = getMirroredPositions(x, y, z, mirror);
          for (const [mx, my, mz] of mirrored) {
            state.map.set(`${mx},${my},${mz}`, { x: mx, y: my, z: mz, color });
          }
        }
      }
    }
  }
}

export function rasterizeDome(
  state: RasterizerState,
  at: [number, number, number],
  radius: number,
  axis = '+y',
  color: number,
  hollow = false,
  mirror: MirrorAxis = 'none'
): void {
  const [cx, cy, cz] = at;
  const r = Math.max(0.5, radius);
  const minX = Math.round(cx - r);
  const maxX = Math.round(cx + r);
  const minY = Math.round(cy - r);
  const maxY = Math.round(cy + r);
  const minZ = Math.round(cz - r);
  const maxZ = Math.round(cz + r);
  const rSq = r * r;

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        let keepHemisphere = false;
        if (axis === '+y') keepHemisphere = y >= cy;
        else if (axis === '-y') keepHemisphere = y <= cy;
        else if (axis === '+z') keepHemisphere = z >= cz;
        else if (axis === '-z') keepHemisphere = z <= cz;
        else if (axis === '+x') keepHemisphere = x >= cx;
        else if (axis === '-x') keepHemisphere = x <= cx;

        if (!keepHemisphere) continue;

        const dSq = (x - cx) * (x - cx) + (y - cy) * (y - cy) + (z - cz) * (z - cz);
        if (dSq <= rSq) {
          if (hollow && dSq < (r - 1) * (r - 1)) continue;
          const mirrored = getMirroredPositions(x, y, z, mirror);
          for (const [mx, my, mz] of mirrored) {
            state.map.set(`${mx},${my},${mz}`, { x: mx, y: my, z: mz, color });
          }
        }
      }
    }
  }
}

export function rasterizeArch(
  state: RasterizerState,
  at: [number, number, number],
  width: number,
  height: number,
  depth: number,
  wallThickness = 1,
  style = 'roman',
  color: number,
  mirror: MirrorAxis = 'none'
): void {
  const [cx, cy, cz] = at;
  const hw = Math.max(1, width / 2);
  const hd = Math.max(0.5, depth / 2);
  const pillarW = Math.max(1, wallThickness);

  rasterizeBox(state, [cx - hw + pillarW / 2, cy + height / 2, cz], [pillarW, height, depth], color, false, 1, mirror);
  rasterizeBox(state, [cx + hw - pillarW / 2, cy + height / 2, cz], [pillarW, height, depth], color, false, 1, mirror);

  if (style === 'roman') {
    const archRadius = hw;
    const archCenterY = cy + height;
    const minX = Math.round(cx - archRadius);
    const maxX = Math.round(cx + archRadius);
    const minZ = Math.round(cz - hd);
    const maxZ = Math.round(cz + hd);
    const innerRadius = Math.max(0, archRadius - pillarW);

    for (let x = minX; x <= maxX; x++) {
      for (let y = Math.round(archCenterY); y <= Math.round(archCenterY + archRadius); y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const dSq = (x - cx) * (x - cx) + (y - archCenterY) * (y - archCenterY);
          if (dSq <= archRadius * archRadius && dSq >= innerRadius * innerRadius) {
            const mirrored = getMirroredPositions(x, y, z, mirror);
            for (const [mx, my, mz] of mirrored) {
              state.map.set(`${mx},${my},${mz}`, { x: mx, y: my, z: mz, color });
            }
          }
        }
      }
    }
  } else {
    rasterizeBox(state, [cx, cy + height + pillarW / 2, cz], [width, pillarW, depth], color, false, 1, mirror);
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MirrorAxis } from '../../../models/declarativeTypes';
import { RasterizerState, getMirroredPositions } from '../helpers';
import { rasterizeBox, rasterizeSphere, rasterizeCylinder, rasterizeCone, rasterizeCapsule } from '../primitives';

export function rasterizeRing(
  state: RasterizerState,
  at: [number, number, number],
  radius: number,
  thickness = 1,
  axis = 'y',
  spokes = 0,
  spokeThickness = 1,
  color: number,
  mirror: MirrorAxis = 'none'
): void {
  const [cx, cy, cz] = at;
  const r = Math.max(1, radius);
  const t = Math.max(0.5, thickness);
  const innerR = Math.max(0, r - t);
  const innerRSq = innerR * innerR;
  const outerRSq = r * r;
  const halfT = Math.max(0.5, t / 2);

  if (axis === 'y') {
    for (let x = Math.round(cx - r); x <= Math.round(cx + r); x++) {
      for (let z = Math.round(cz - r); z <= Math.round(cz + r); z++) {
        const dSq = (x - cx) * (x - cx) + (z - cz) * (z - cz);
        if (dSq <= outerRSq && dSq >= innerRSq) {
          for (let y = Math.round(cy - halfT); y <= Math.round(cy + halfT); y++) {
            const mirrored = getMirroredPositions(x, y, z, mirror);
            for (const [mx, my, mz] of mirrored) {
              state.map.set(`${mx},${my},${mz}`, { x: mx, y: my, z: mz, color });
            }
          }
        }
      }
    }
    if (spokes > 0) {
      for (let s = 0; s < spokes; s++) {
        const angle = (s / spokes) * Math.PI;
        const endX1 = cx + Math.cos(angle) * r;
        const endZ1 = cz + Math.sin(angle) * r;
        const endX2 = cx - Math.cos(angle) * r;
        const endZ2 = cz - Math.sin(angle) * r;
        rasterizeCapsule(state, [endX1, cy, endZ1], [endX2, cy, endZ2], spokeThickness / 2, spokeThickness / 2, color, mirror);
      }
    }
  } else {
    for (let x = Math.round(cx - r); x <= Math.round(cx + r); x++) {
      for (let y = Math.round(cy - r); y <= Math.round(cy + r); y++) {
        const dSq = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        if (dSq <= outerRSq && dSq >= innerRSq) {
          for (let z = Math.round(cz - halfT); z <= Math.round(cz + halfT); z++) {
            const mirrored = getMirroredPositions(x, y, z, mirror);
            for (const [mx, my, mz] of mirrored) {
              state.map.set(`${mx},${my},${mz}`, { x: mx, y: my, z: mz, color });
            }
          }
        }
      }
    }
  }
}

export function rasterizePolygonPrism(
  state: RasterizerState,
  at: [number, number, number],
  radius: number,
  height: number,
  sides = 6,
  axis = 'y',
  color: number,
  mirror: MirrorAxis = 'none'
): void {
  const [cx, cy, cz] = at;
  const r = Math.max(1, radius);
  const halfH = Math.max(0.5, height / 2);
  const n = Math.max(3, sides);

  const poly: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    poly.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
  }

  const minX = Math.round(cx - r);
  const maxX = Math.round(cx + r);
  const minZ = Math.round(cz - r);
  const maxZ = Math.round(cz + r);
  const minY = Math.round(cy - halfH);
  const maxY = Math.round(cy + halfH);

  const pointInPoly = (px: number, pz: number) => {
    let inside = false;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = poly[i][0], zi = poly[i][1];
      const xj = poly[j][0], zj = poly[j][1];
      const intersect = ((zi > pz) !== (zj > pz)) && (px < (xj - xi) * (pz - zi) / (zj - zi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      if (pointInPoly(x, z)) {
        for (let y = minY; y <= maxY; y++) {
          const mirrored = getMirroredPositions(x, y, z, mirror);
          for (const [mx, my, mz] of mirrored) {
            state.map.set(`${mx},${my},${mz}`, { x: mx, y: my, z: mz, color });
          }
        }
      }
    }
  }
}

export function rasterizeWing(
  state: RasterizerState,
  from: [number, number, number],
  span: [number, number, number],
  rootChord: number,
  tipChord: number,
  thickness = 1,
  color: number,
  mirror: MirrorAxis = 'none'
): void {
  const [x1, y1, z1] = from;
  const [sx, sy, sz] = span;
  const steps = Math.max(3, Math.ceil(Math.hypot(sx, sy, sz)));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const curX = x1 + sx * t;
    const curY = y1 + sy * t;
    const curZ = z1 + sz * t;
    const curChord = rootChord + (tipChord - rootChord) * t;
    const curThickness = Math.max(0.5, thickness * (1 - t * 0.4));

    rasterizeBox(state, [curX, curY, curZ], [Math.max(1, curChord), Math.max(1, curThickness), 2], color, false, 1, mirror);
  }
}

export function rasterizeTree(
  state: RasterizerState,
  at: [number, number, number],
  trunkHeight: number,
  trunkRadius = 1,
  canopyRadius: number,
  trunkColor: number,
  foliageColor: number,
  style: 'sphere' | 'pine' | 'cloud' | 'palm' | 'willow' = 'sphere',
  mirror: MirrorAxis = 'none'
): void {
  const [cx, cy, cz] = at;
  rasterizeCylinder(state, [cx, cy + trunkHeight / 2, cz], trunkRadius, trunkHeight, 'y', trunkColor, false, mirror);

  const canopyBaseY = cy + trunkHeight;
  if (style === 'pine') {
    const layers = 3;
    for (let l = 0; l < layers; l++) {
      const layerY = canopyBaseY + l * (canopyRadius * 0.7);
      const layerR = canopyRadius * (1 - l * 0.25);
      rasterizeCone(state, [cx, layerY, cz], layerR, canopyRadius * 0.8, foliageColor, mirror);
    }
  } else if (style === 'cloud') {
    rasterizeSphere(state, [cx, canopyBaseY + canopyRadius * 0.6, cz], [canopyRadius * 1.1, canopyRadius * 0.7, canopyRadius * 1.1], foliageColor, false, mirror);
    rasterizeSphere(state, [cx + canopyRadius * 0.4, canopyBaseY + canopyRadius * 0.8, cz], [canopyRadius * 0.6, canopyRadius * 0.6, canopyRadius * 0.6], foliageColor, false, mirror);
    rasterizeSphere(state, [cx - canopyRadius * 0.3, canopyBaseY + canopyRadius * 0.9, cz + canopyRadius * 0.3], [canopyRadius * 0.5, canopyRadius * 0.5, canopyRadius * 0.5], foliageColor, false, mirror);
  } else if (style === 'palm') {
    const fronds = 8;
    for (let f = 0; f < fronds; f++) {
      const angle = (f / fronds) * Math.PI * 2 + (f % 2 === 0 ? 0.2 : 0);
      const reach = canopyRadius * 1.6;
      const midX = cx + Math.cos(angle) * (reach * 0.5);
      const midZ = cz + Math.sin(angle) * (reach * 0.5);
      const midY = canopyBaseY + canopyRadius * 0.3;
      const tipX = cx + Math.cos(angle) * reach;
      const tipZ = cz + Math.sin(angle) * reach;
      const tipY = canopyBaseY - canopyRadius * 0.6;

      rasterizeCapsule(state, [cx, canopyBaseY, cz], [midX, midY, midZ], 1.2, 0.9, foliageColor, mirror);
      rasterizeCapsule(state, [midX, midY, midZ], [tipX, tipY, tipZ], 0.9, 0.4, foliageColor, mirror);
    }
  } else if (style === 'willow') {
    rasterizeSphere(state, [cx, canopyBaseY + canopyRadius * 0.5, cz], [canopyRadius, canopyRadius * 0.6, canopyRadius], foliageColor, false, mirror);
    const vines = 8;
    for (let v = 0; v < vines; v++) {
      const angle = (v / vines) * Math.PI * 2;
      const vx = cx + Math.cos(angle) * (canopyRadius * 0.8);
      const vz = cz + Math.sin(angle) * (canopyRadius * 0.8);
      rasterizeCapsule(state, [vx, canopyBaseY + 2, vz], [vx, canopyBaseY - canopyRadius, vz], 0.5, 0.5, foliageColor, mirror);
    }
  } else {
    rasterizeSphere(state, [cx, canopyBaseY + canopyRadius * 0.7, cz], [canopyRadius, canopyRadius, canopyRadius], foliageColor, false, mirror);
  }
}

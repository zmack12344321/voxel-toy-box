/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MirrorAxis } from '../../../models/declarativeTypes';
import { RasterizerState, setVoxel, getMirroredPositions, rotatePoint } from '../helpers';

export function rasterizeSphere(
  state: RasterizerState,
  at: [number, number, number],
  radii: [number, number, number],
  color: number,
  hollow = false,
  mirror: MirrorAxis = 'none',
  rotation?: [number, number, number]
): void {
  const [cx, cy, cz] = at;
  const [rx, ry, rz] = [Math.max(0.5, radii[0]), Math.max(0.5, radii[1]), Math.max(0.5, radii[2])];

  const minX = Math.round(cx - rx);
  const maxX = Math.round(cx + rx);
  const minY = Math.round(cy - ry);
  const maxY = Math.round(cy + ry);
  const minZ = Math.round(cz - rz);
  const maxZ = Math.round(cz + rz);

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        const dz = (z - cz) / rz;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq <= 1.0) {
          if (hollow && distSq < 0.65) continue;
          const [px, py, pz] = rotation ? rotatePoint(x, y, z, rotation, at) : [x, y, z];
          const mirrored = getMirroredPositions(px, py, pz, mirror);
          for (const [mx, my, mz] of mirrored) {
            setVoxel(state, mx, my, mz, color);
          }
        }
      }
    }
  }
}

export function rasterizeCylinder(
  state: RasterizerState,
  at: [number, number, number],
  radius: number,
  height: number,
  axis: 'x' | 'y' | 'z' = 'y',
  color: number,
  hollow = false,
  mirror: MirrorAxis = 'none',
  rotation?: [number, number, number]
): void {
  const [cx, cy, cz] = at;
  const r = Math.max(1, radius);
  const halfH = Math.max(0.5, height / 2);
  const rSq = r * r;
  const innerRSq = Math.max(0, (r - 1) * (r - 1));

  if (axis === 'y') {
    const minY = Math.round(cy - halfH);
    const maxY = Math.round(cy + halfH);
    const minX = Math.round(cx - r);
    const maxX = Math.round(cx + r);
    const minZ = Math.round(cz - r);
    const maxZ = Math.round(cz + r);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
          const dSq = (x - cx) * (x - cx) + (z - cz) * (z - cz);
          if (dSq <= rSq) {
            if (hollow && dSq < innerRSq && y > minY && y < maxY) continue;
            const [px, py, pz] = rotation ? rotatePoint(x, y, z, rotation, at) : [x, y, z];
            const mirrored = getMirroredPositions(px, py, pz, mirror);
            for (const [mx, my, mz] of mirrored) {
              setVoxel(state, mx, my, mz, color);
            }
          }
        }
      }
    }
  } else if (axis === 'z') {
    const minZ = Math.round(cz - halfH);
    const maxZ = Math.round(cz + halfH);
    const minX = Math.round(cx - r);
    const maxX = Math.round(cx + r);
    const minY = Math.round(cy - r);
    const maxY = Math.round(cy + r);

    for (let z = minZ; z <= maxZ; z++) {
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          const dSq = (x - cx) * (x - cx) + (y - cy) * (y - cy);
          if (dSq <= rSq) {
            if (hollow && dSq < innerRSq && z > minZ && z < maxZ) continue;
            const [px, py, pz] = rotation ? rotatePoint(x, y, z, rotation, at) : [x, y, z];
            const mirrored = getMirroredPositions(px, py, pz, mirror);
            for (const [mx, my, mz] of mirrored) {
              setVoxel(state, mx, my, mz, color);
            }
          }
        }
      }
    }
  } else {
    const minX = Math.round(cx - halfH);
    const maxX = Math.round(cx + halfH);
    const minY = Math.round(cy - r);
    const maxY = Math.round(cy + r);
    const minZ = Math.round(cz - r);
    const maxZ = Math.round(cz + r);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const dSq = (y - cy) * (y - cy) + (z - cz) * (z - cz);
          if (dSq <= rSq) {
            if (hollow && dSq < innerRSq && x > minX && x < maxX) continue;
            const [px, py, pz] = rotation ? rotatePoint(x, y, z, rotation, at) : [x, y, z];
            const mirrored = getMirroredPositions(px, py, pz, mirror);
            for (const [mx, my, mz] of mirrored) {
              setVoxel(state, mx, my, mz, color);
            }
          }
        }
      }
    }
  }
}

export function rasterizeCone(
  state: RasterizerState,
  at: [number, number, number],
  baseRadius: number,
  height: number,
  color: number,
  mirror: MirrorAxis = 'none',
  rotation?: [number, number, number]
): void {
  const [cx, cy, cz] = at;
  const h = Math.max(1, height);
  const r = Math.max(0.5, baseRadius);

  const minY = Math.round(cy);
  const maxY = Math.round(cy + h);

  for (let y = minY; y <= maxY; y++) {
    const progress = (y - minY) / h;
    const curRadius = Math.max(0.5, r * (1 - progress));
    const rSq = curRadius * curRadius;

    const minX = Math.round(cx - curRadius);
    const maxX = Math.round(cx + curRadius);
    const minZ = Math.round(cz - curRadius);
    const maxZ = Math.round(cz + curRadius);

    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        const dSq = (x - cx) * (x - cx) + (z - cz) * (z - cz);
        if (dSq <= rSq) {
          const [px, py, pz] = rotation ? rotatePoint(x, y, z, rotation, at) : [x, y, z];
          const mirrored = getMirroredPositions(px, py, pz, mirror);
          for (const [mx, my, mz] of mirrored) {
            setVoxel(state, mx, my, mz, color);
          }
        }
      }
    }
  }
}

export function rasterizeCapsule(
  state: RasterizerState,
  from: [number, number, number],
  to: [number, number, number],
  rStart: number,
  rEnd: number,
  color: number,
  mirror: MirrorAxis = 'none'
): void {
  const [x1, y1, z1] = from;
  const [x2, y2, z2] = to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const steps = Math.max(2, Math.ceil(dist * 2));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x1 + dx * t;
    const y = y1 + dy * t;
    const z = z1 + dz * t;
    const r = rStart + (rEnd - rStart) * t;
    rasterizeSphere(state, [x, y, z], [r, r, r], color, false, mirror);
  }
}

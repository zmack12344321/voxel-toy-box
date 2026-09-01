/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MirrorAxis } from '../../../models/declarativeTypes';
import { RasterizerState, getMirroredPositions } from '../helpers';
import { rasterizeBox, rasterizeCylinder, rasterizeCapsule, rasterizeSphere } from '../primitives';

export function rasterizeSpiralStairs(
  state: RasterizerState,
  at: [number, number, number],
  radius: number,
  totalHeight: number,
  steps: number,
  stepThickness = 1,
  centralPillarR = 1,
  pillarColor: number,
  stepColor: number,
  mirror: MirrorAxis = 'none'
): void {
  const [cx, cy, cz] = at;
  const numSteps = Math.max(3, steps);
  const r = Math.max(2, radius);

  if (centralPillarR > 0) {
    rasterizeCylinder(state, [cx, cy + totalHeight / 2, cz], centralPillarR, totalHeight, 'y', pillarColor, false, mirror);
  }

  for (let s = 0; s < numSteps; s++) {
    const t = s / numSteps;
    const stepY = cy + t * totalHeight;
    const angle = t * Math.PI * 4;
    const endX = cx + Math.cos(angle) * r;
    const endZ = cz + Math.sin(angle) * r;

    rasterizeCapsule(state, [cx, stepY, cz], [endX, stepY, endZ], stepThickness / 2, stepThickness / 2, stepColor, mirror);
  }
}

export function rasterizeTerrain(
  state: RasterizerState,
  at: [number, number, number],
  size: [number, number, number],
  roughness = 0.5,
  surfaceColor: number,
  underColor: number,
  mirror: MirrorAxis = 'none'
): void {
  const [cx, cy, cz] = at;
  const [sx, maxH, sz] = size;
  const hx = Math.max(1, sx / 2);
  const hz = Math.max(1, sz / 2);

  for (let x = Math.round(cx - hx); x <= Math.round(cx + hx); x++) {
    for (let z = Math.round(cz - hz); z <= Math.round(cz + hz); z++) {
      const nx = (x - cx) * 0.25;
      const nz = (z - cz) * 0.25;
      const elev = Math.sin(nx) * Math.cos(nz) + Math.sin(nx * 2.3 + nz * 1.7) * 0.5 * roughness;
      const columnHeight = Math.max(1, Math.round(cy + (elev + 1.2) * (maxH / 2)));

      for (let y = cy; y <= columnHeight; y++) {
        const col = y === columnHeight ? surfaceColor : underColor;
        const mirrored = getMirroredPositions(x, y, z, mirror);
        for (const [mx, my, mz] of mirrored) {
          state.map.set(`${mx},${my},${mz}`, { x: mx, y: my, z: mz, color: col });
        }
      }
    }
  }
}

export function rasterizeFence(
  state: RasterizerState,
  from: [number, number, number],
  to: [number, number, number],
  height: number,
  postSpacing = 4,
  color: number,
  mirror: MirrorAxis = 'none'
): void {
  const [x1, y1, z1] = from;
  const [x2, y2, z2] = to;
  const dist = Math.hypot(x2 - x1, z2 - z1);
  const posts = Math.max(2, Math.round(dist / postSpacing));

  for (let i = 0; i <= posts; i++) {
    const t = i / posts;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    const pz = z1 + (z2 - z1) * t;
    rasterizeBox(state, [px, py + height / 2, pz], [1, height, 1], color, false, 1, mirror);
  }

  const railHeights = [height * 0.35, height * 0.8];
  for (const rh of railHeights) {
    rasterizeCapsule(state, [x1, y1 + rh, z1], [x2, y2 + rh, z2], 0.5, 0.5, color, mirror);
  }
}

export function rasterizeTrim(
  state: RasterizerState,
  at: [number, number, number],
  size: [number, number, number],
  thickness = 1,
  color: number,
  mirror: MirrorAxis = 'none'
): void {
  const [cx, cy, cz] = at;
  const [sx, sy, sz] = size;
  const hx = Math.max(0.5, sx / 2);
  const hy = Math.max(0.5, sy / 2);
  const hz = Math.max(0.5, sz / 2);
  const t = Math.max(0.5, thickness);

  const edges: Array<[[number, number, number], [number, number, number]]> = [
    [[cx - hx, cy - hy, cz - hz], [cx + hx, cy - hy, cz - hz]],
    [[cx - hx, cy - hy, cz + hz], [cx + hx, cy - hy, cz + hz]],
    [[cx - hx, cy - hy, cz - hz], [cx - hx, cy - hy, cz + hz]],
    [[cx + hx, cy - hy, cz - hz], [cx + hx, cy - hy, cz + hz]],
    [[cx - hx, cy + hy, cz - hz], [cx + hx, cy + hy, cz - hz]],
    [[cx - hx, cy + hy, cz + hz], [cx + hx, cy + hy, cz + hz]],
    [[cx - hx, cy + hy, cz - hz], [cx - hx, cy + hy, cz + hz]],
    [[cx + hx, cy + hy, cz - hz], [cx + hx, cy + hy, cz + hz]],
    [[cx - hx, cy - hy, cz - hz], [cx - hx, cy + hy, cz - hz]],
    [[cx + hx, cy - hy, cz - hz], [cx + hx, cy + hy, cz - hz]],
    [[cx - hx, cy - hy, cz + hz], [cx - hx, cy + hy, cz + hz]],
    [[cx + hx, cy - hy, cz + hz], [cx + hx, cy + hy, cz + hz]],
  ];

  for (const [p1, p2] of edges) {
    rasterizeCapsule(state, p1, p2, t / 2, t / 2, color, mirror);
  }
}

export function rasterizeSplinePipe(
  state: RasterizerState,
  points: Array<[number, number, number]>,
  thickness = 1.6,
  color: number,
  mirror: MirrorAxis = 'none'
): void {
  if (!points || points.length === 0) return;
  if (points.length === 1) {
    const [x, y, z] = points[0];
    const r = Math.max(0.5, thickness / 2);
    rasterizeSphere(state, [x, y, z], [r, r, r], color, false, mirror);
    return;
  }
  if (points.length === 2) {
    const r = Math.max(0.5, thickness / 2);
    rasterizeCapsule(state, points[0], points[1], r, r, color, mirror);
    return;
  }

  function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
      (2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
  }

  const radius = Math.max(0.5, thickness / 2);
  const stepsPerSegment = 8;

  const paddedPoints: Array<[number, number, number]> = [
    points[0],
    ...points,
    points[points.length - 1]
  ];

  let prevPt: [number, number, number] | null = null;

  for (let i = 1; i < paddedPoints.length - 2; i++) {
    const p0 = paddedPoints[i - 1];
    const p1 = paddedPoints[i];
    const p2 = paddedPoints[i + 1];
    const p3 = paddedPoints[i + 2];

    for (let s = 0; s <= stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      const currPt: [number, number, number] = [
        catmullRom(p0[0], p1[0], p2[0], p3[0], t),
        catmullRom(p0[1], p1[1], p2[1], p3[1], t),
        catmullRom(p0[2], p1[2], p2[2], p3[2], t)
      ];

      if (prevPt) {
        rasterizeCapsule(state, prevPt, currPt, radius, radius, color, mirror);
      }
      prevPt = currPt;
    }
  }
}

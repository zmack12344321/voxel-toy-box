/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Compound shape rasterization functions (stairs, domes, arches, etc.).
 */

import { MirrorAxis } from '../../models/declarativeTypes';
import { RasterizerState, getMirroredPositions } from './helpers';
import { rasterizeBox, rasterizeSphere, rasterizeCylinder, rasterizeCone, rasterizeCapsule } from './primitives';

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
    const fronds = 6;
    for (let f = 0; f < fronds; f++) {
      const angle = (f / fronds) * Math.PI * 2;
      const tipX = cx + Math.cos(angle) * canopyRadius * 1.4;
      const tipZ = cz + Math.sin(angle) * canopyRadius * 1.4;
      const tipY = canopyBaseY - canopyRadius * 0.4;
      rasterizeCapsule(state, [cx, canopyBaseY, cz], [tipX, tipY, tipZ], 1, 0.5, foliageColor, mirror);
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

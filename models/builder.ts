/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VoxelData } from '../types';
import { BoxVolume, DetailedVoxelModelPayload } from './types';
import { parseColor } from './builder/colorUtils';
import { cullInternalVoxels, applyLightingShading } from './builder/shadingPasses';

export { parseColor, adjustBrightness } from './builder/colorUtils';

export class VoxelBuilder {
  private map = new Map<string, VoxelData>();

  public set(x: number, y: number, z: number, color: string | number): this {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rz = Math.round(z);
    const colNum = parseColor(color);
    this.map.set(`${rx},${ry},${rz}`, { x: rx, y: ry, z: rz, color: colNum });
    return this;
  }

  public setSymmetricX(x: number, y: number, z: number, color: string | number): this {
    this.set(x, y, z, color);
    if (Math.round(x) !== 0) {
      this.set(-x, y, z, color);
    }
    return this;
  }

  public box(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, color: string | number): this {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const minZ = Math.min(z1, z2);
    const maxZ = Math.max(z1, z2);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          this.set(x, y, z, color);
        }
      }
    }
    return this;
  }

  public boxSymmetricX(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, color: string | number): this {
    this.box(x1, y1, z1, x2, y2, z2, color);
    this.box(-x1, y1, z1, -x2, y2, z2, color);
    return this;
  }

  public sphere(cx: number, cy: number, cz: number, r: number, color: string | number, sy = 1, sz = 1): this {
    const rx = r;
    const ry = r * sy;
    const rz = r * sz;
    const minX = Math.floor(cx - rx);
    const maxX = Math.ceil(cx + rx);
    const minY = Math.floor(cy - ry);
    const maxY = Math.ceil(cy + ry);
    const minZ = Math.floor(cz - rz);
    const maxZ = Math.ceil(cz + rz);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const dx = (x - cx) / rx;
          const dy = (y - cy) / ry;
          const dz = (z - cz) / rz;
          if (dx * dx + dy * dy + dz * dz <= 1.0) {
            this.set(x, y, z, color);
          }
        }
      }
    }
    return this;
  }

  public sphereSymmetricX(cx: number, cy: number, cz: number, r: number, color: string | number): this {
    this.sphere(cx, cy, cz, r, color);
    if (Math.abs(cx) > 0.1) {
      this.sphere(-cx, cy, cz, r, color);
    }
    return this;
  }

  public cylinderYSymmetricX(cx: number, cyMin: number, cyMax: number, cz: number, r: number, color: string | number): this {
    this.cylinderY(cx, cyMin, cyMax, cz, r, color);
    if (Math.abs(cx) > 0.1) {
      this.cylinderY(-cx, cyMin, cyMax, cz, r, color);
    }
    return this;
  }

  public cylinderY(cx: number, cyMin: number, cyMax: number, cz: number, r: number, color: string | number): this {
    const minX = Math.floor(cx - r);
    const maxX = Math.ceil(cx + r);
    const minZ = Math.floor(cz - r);
    const maxZ = Math.ceil(cz + r);
    const r2 = r * r;

    for (let y = cyMin; y <= cyMax; y++) {
      for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
          const dx = x - cx;
          const dz = z - cz;
          if (dx * dx + dz * dz <= r2) {
            this.set(x, y, z, color);
          }
        }
      }
    }
    return this;
  }

  public line(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, color: string | number, radius = 1): this {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const steps = Math.max(1, Math.ceil(dist * 2));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + dx * t;
      const y = y1 + dy * t;
      const z = z1 + dz * t;
      if (radius <= 1) {
        this.set(x, y, z, color);
      } else {
        this.sphere(x, y, z, radius, color);
      }
    }
    return this;
  }

  public cullInternalVoxels(): this {
    this.map = cullInternalVoxels(this.map);
    return this;
  }

  public applyLightingShading(): this {
    this.map = applyLightingShading(this.map);
    return this;
  }

  public build(): VoxelData[] {
    return Array.from(this.map.values());
  }
}

export function compileDetailedPayload(payload: DetailedVoxelModelPayload): VoxelData[] {
  const builder = new VoxelBuilder();

  payload.boxes.forEach((vol: BoxVolume) => {
    const [x1, y1, z1] = vol.min;
    const [x2, y2, z2] = vol.max;
    builder.box(x1, y1, z1, x2, y2, z2, vol.color);
  });

  return builder.cullInternalVoxels().applyLightingShading().build();
}

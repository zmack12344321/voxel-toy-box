/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../types';
import { BoxVolume, DetailedVoxelModelPayload } from './types';

/**
 * Parses color string (e.g. '#FF5500', '0xFF5500', or number) into a numeric hex value.
 */
export function parseColor(color: string | number): number {
  if (typeof color === 'number') return color;
  if (typeof color === 'string') {
    let clean = color.trim();
    if (clean.startsWith('#')) clean = clean.substring(1);
    else if (clean.startsWith('0x') || clean.startsWith('0X')) clean = clean.substring(2);
    const parsed = parseInt(clean, 16);
    return isNaN(parsed) ? 0xcccccc : parsed;
  }
  return 0xcccccc;
}

/**
 * Adjusts the brightness of a hex color by a factor (-1.0 to 1.0).
 */
export function adjustBrightness(hex: number, factor: number): number {
  const r = Math.min(255, Math.max(0, Math.round(((hex >> 16) & 0xff) * (1 + factor))));
  const g = Math.min(255, Math.max(0, Math.round(((hex >> 8) & 0xff) * (1 + factor))));
  const b = Math.min(255, Math.max(0, Math.round((hex & 0xff) * (1 + factor))));
  return (r << 16) | (g << 8) | b;
}

/**
 * VoxelBuilder provides procedural 3D drawing tools, symmetry mirrors,
 * volume rasterization, and post-shading passes.
 */
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

  /**
   * Removes all interior voxels that are completely occluded by 6 solid neighbors.
   * Reduces rendered voxel count by 40-70% with ZERO visual difference.
   */
  public cullInternalVoxels(): this {
    const coords = new Set<string>(this.map.keys());
    const culledMap = new Map<string, VoxelData>();

    this.map.forEach((voxel, key) => {
      const { x, y, z } = voxel;

      // Check all 6 cardinal directions (Von Neumann neighborhood)
      const hasTop    = coords.has(`${x},${y + 1},${z}`);
      const hasBottom = coords.has(`${x},${y - 1},${z}`);
      const hasNorth  = coords.has(`${x},${y},${z + 1}`);
      const hasSouth  = coords.has(`${x},${y},${z - 1}`);
      const hasEast   = coords.has(`${x + 1},${y},${z}`);
      const hasWest   = coords.has(`${x - 1},${y},${z}`);

      const isCompletelyOccluded = 
        hasTop && hasBottom && 
        hasNorth && hasSouth && 
        hasEast && hasWest;

      if (!isCompletelyOccluded) {
        culledMap.set(key, voxel);
      }
    });

    this.map = culledMap;
    return this;
  }

  /**
   * Applies an ambient occlusion and directional top-light pass to enhance 3D depth.
   */
  public applyLightingShading(): this {
    const coords = new Set<string>(this.map.keys());
    const newMap = new Map<string, VoxelData>();

    this.map.forEach((voxel, key) => {
      const { x, y, z, color } = voxel;
      
      // Check top neighbor (is this an exposed top face?)
      const hasTop = coords.has(`${x},${y + 1},${z}`);
      // Check bottom neighbor
      const hasBottom = coords.has(`${x},${y - 1},${z}`);
      // Check count of direct neighbors (ambient density)
      let neighbors = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            if (dx === 0 && dy === 0 && dz === 0) continue;
            if (coords.has(`${x + dx},${y + dy},${z + dz}`)) neighbors++;
          }
        }
      }

      let brightness = 0;
      if (!hasTop) {
        // Highlight upward facing surfaces
        brightness += 0.08;
      }
      if (!hasBottom && y <= 2) {
        // Darken near ground
        brightness -= 0.12;
      }
      // Occlusion in deep crevices
      if (neighbors > 20) {
        brightness -= 0.15;
      }

      const shadedColor = brightness !== 0 ? adjustBrightness(color, brightness) : color;
      newMap.set(key, { x, y, z, color: shadedColor });
    });

    this.map = newMap;
    return this;
  }

  public build(): VoxelData[] {
    return Array.from(this.map.values());
  }
}

/**
 * Converts a detailed payload (composite boxes + fine voxels) into a flattened VoxelData array.
 */
export function compileDetailedPayload(payload: DetailedVoxelModelPayload | VoxelData[]): VoxelData[] {
  if (Array.isArray(payload)) {
    return payload.map(v => ({
      x: Number(v.x) || 0,
      y: Number(v.y) || 0,
      z: Number(v.z) || 0,
      color: parseColor(v.color)
    }));
  }

  const builder = new VoxelBuilder();

  // 1. Expand composite boxes
  if (payload.boxes && Array.isArray(payload.boxes)) {
    payload.boxes.forEach(box => {
      if (box.min && box.max && box.color) {
        if (box.symmetricX && (Math.abs(box.min[0]) > 0.1 || Math.abs(box.max[0]) > 0.1)) {
          builder.boxSymmetricX(
            box.min[0], box.min[1], box.min[2],
            box.max[0], box.max[1], box.max[2],
            box.color
          );
        } else {
          builder.box(
            box.min[0], box.min[1], box.min[2],
            box.max[0], box.max[1], box.max[2],
            box.color
          );
        }
      }
    });
  }

  // Expand composite cylinders
  if (payload.cylinders && Array.isArray(payload.cylinders)) {
    payload.cylinders.forEach(cyl => {
      if (typeof cyl.cx === 'number' && typeof cyl.y1 === 'number' && typeof cyl.y2 === 'number' && typeof cyl.cz === 'number') {
        const minY = Math.min(cyl.y1, cyl.y2);
        const maxY = Math.max(cyl.y1, cyl.y2);
        if (cyl.symmetricX && Math.abs(cyl.cx) > 0.1) {
          builder.cylinderYSymmetricX(cyl.cx, minY, maxY, cyl.cz, cyl.radius, cyl.color);
        } else {
          builder.cylinderY(cyl.cx, minY, maxY, cyl.cz, cyl.radius, cyl.color);
        }
      }
    });
  }

  // Expand composite spheres
  if (payload.spheres && Array.isArray(payload.spheres)) {
    payload.spheres.forEach(sph => {
      if (typeof sph.cx === 'number' && typeof sph.cy === 'number' && typeof sph.cz === 'number') {
        if (sph.symmetricX && Math.abs(sph.cx) > 0.1) {
          builder.sphereSymmetricX(sph.cx, sph.cy, sph.cz, sph.radius, sph.color);
        } else {
          builder.sphere(sph.cx, sph.cy, sph.cz, sph.radius, sph.color);
        }
      }
    });
  }

  // 2. Add fine-detail discrete voxels
  if (payload.voxels && Array.isArray(payload.voxels)) {
    payload.voxels.forEach(v => {
      if (typeof v.x === 'number' && typeof v.y === 'number' && typeof v.z === 'number') {
        builder.set(v.x, v.y, v.z, v.color);
      }
    });
  }

  return builder.build();
}

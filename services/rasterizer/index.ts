/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 3D Grid Rasterizer for High-Level Declarative Instructions.
 * Supports primitives, CSG carving, procedural repetitions, and coordinate mirroring.
 */

import { VoxelData, SceneWater } from '../../types';
import { parseColor } from '../../models/builder';
import { DeclarativeModelPayload, DeclarativeShapeCommand, PaletteEntry } from '../../models/declarativeTypes';
import { RasterizerState, resolveColor } from './helpers';
import { executeCommand as dispatchCommand } from './dispatcher';

export class DeclarativeRasterizer {
  private state: RasterizerState;
  public water: { level: number; extent: [number, number]; color: number; opacity: number } | null = null;

  constructor(palette?: Record<string, PaletteEntry>) {
    const paletteMap = new Map<string, number>();
    if (palette) {
      Object.entries(palette).forEach(([k, v]) => {
        const colorVal = typeof v === 'string' ? v : v.color;
        paletteMap.set(k.toLowerCase(), parseColor(colorVal));
      });
    }
    this.state = { map: new Map(), palette: paletteMap };
  }

  public executeCommand(cmd: DeclarativeShapeCommand): void {
    const waterRef = { value: this.water };
    dispatchCommand(this.state, cmd, waterRef, { executeCommand: this.executeCommand.bind(this) });
    this.water = waterRef.value;
  }

  public build(): VoxelData[] {
    return Array.from(this.state.map.values());
  }
}

/**
 * Compiles a declarative payload into a final centered VoxelData array
 * plus optional water metadata for the engine.
 */
export function compileDeclarativePayload(payload: DeclarativeModelPayload): { voxels: VoxelData[]; water: SceneWater | null } {
  const rasterizer = new DeclarativeRasterizer(payload.palette);

  if (payload.commands && Array.isArray(payload.commands)) {
    for (const cmd of payload.commands) {
      rasterizer.executeCommand(cmd);
    }
  }

  const rawVoxels = rasterizer.build();
  if (rawVoxels.length === 0) return { voxels: [], water: null };

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const v of rawVoxels) {
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
    if (v.z < minZ) minZ = v.z;
    if (v.z > maxZ) maxZ = v.z;
  }

  const offsetX = Math.round((minX + maxX) / 2);
  const offsetZ = Math.round((minZ + maxZ) / 2);
  const offsetY = minY;

  let water: SceneWater | null = null;
  if (rasterizer.water) {
    const w = rasterizer.water;
    water = {
      level: w.level - offsetY,
      extent: w.extent,
      color: w.color,
      opacity: w.opacity,
    };
  }

  return {
    voxels: rawVoxels.map(v => ({
      x: v.x - offsetX,
      y: v.y - offsetY,
      z: v.z - offsetZ,
      color: v.color,
    })),
    water,
  };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 3D Grid Rasterizer for High-Level Declarative Instructions.
 * Supports primitives, CSG carving, procedural repetitions, and coordinate mirroring.
 */

import { VoxelData, SceneWater } from '../../types';
import type { AnimatedEntity as CompiledAnimatedEntity } from '../../types';
export type { AnimatedEntity as CompiledAnimatedEntity } from '../../types';
import { parseColor } from '../../models/builder';
import { DeclarativeModelPayload, DeclarativeShapeCommand, PaletteEntry, SceneSpec } from '../../models/declarativeTypes';
import { RasterizerState, resolveColor } from './helpers';
import { executeCommand as dispatchCommand } from './dispatcher';

/**
 * Prunes completely occluded (hidden inside) voxels that are surrounded
 * by 6 orthogonal solid neighbors (+x, -x, +y, -y, +z, -z).
 */
export function pruneOccludedVoxels(map: Map<string, VoxelData>): VoxelData[] {
  const visibleVoxels: VoxelData[] = [];

  for (const v of map.values()) {
    const x = v.x;
    const y = v.y;
    const z = v.z;

    const hasTop    = map.has(`${x},${y + 1},${z}`);
    const hasBottom = map.has(`${x},${y - 1},${z}`);
    const hasLeft   = map.has(`${x - 1},${y},${z}`);
    const hasRight  = map.has(`${x + 1},${y},${z}`);
    const hasFront  = map.has(`${x},${y},${z + 1}`);
    const hasBack   = map.has(`${x},${y},${z - 1}`);

    // If missing AT LEAST ONE neighbor, it is an exposed surface voxel!
    if (!hasTop || !hasBottom || !hasLeft || !hasRight || !hasFront || !hasBack) {
      visibleVoxels.push(v);
    }
  }

  return visibleVoxels;
}
export class DeclarativeRasterizer {
  private state: RasterizerState;
  public water: SceneWater | null = null;
  private waterRef: { value: SceneWater | null } = { value: null };

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
    dispatchCommand(this.state, cmd, this.waterRef, { executeCommand: this.executeCommand.bind(this) });
    this.water = this.waterRef.value;
  }

  public build(): VoxelData[] {
    return pruneOccludedVoxels(this.state.map);
  }
}

/**
 * Compiles a declarative payload into a final centered VoxelData array,
 * compiled animated spline entities, plus optional water metadata for the engine.
 */
export function compileDeclarativePayload(payload: DeclarativeModelPayload): {
  voxels: VoxelData[];
  water: SceneWater | null;
  animatedEntities: CompiledAnimatedEntity[];
} {
  const rasterizer = new DeclarativeRasterizer(payload.palette);

  if (payload.commands && Array.isArray(payload.commands)) {
    for (const cmd of payload.commands) {
      rasterizer.executeCommand(cmd);
    }
  }

  // Compile individual animated entities
  const animatedEntities: CompiledAnimatedEntity[] = [];
  if (payload.animatedEntities && Array.isArray(payload.animatedEntities)) {
    for (const entityDesc of payload.animatedEntities) {
      const entityRasterizer = new DeclarativeRasterizer(payload.palette);
      for (const cmd of entityDesc.commands) {
        entityRasterizer.executeCommand(cmd);
      }
      animatedEntities.push({
        id: entityDesc.id,
        waypoints: entityDesc.waypoints.map(point => [...point] as [number, number, number]),
        speed: entityDesc.speed ?? 0.1,
        voxels: entityRasterizer.build(),
      });
    }
  }

  const rawVoxels = rasterizer.build();
  if (rawVoxels.length === 0) return { voxels: [], water: null, animatedEntities };

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
      extent: [...w.extent] as [number, number],
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
    animatedEntities,
  };
}

/** Compiles canonical model/scene contracts through the legacy rasterizer adapter. */
export function compileSceneSpec(spec: SceneSpec): ReturnType<typeof compileDeclarativePayload> {
  const placementCommands = (spec.placementRules ?? []).map(rule => ({
    ...rule,
    op: 'scatter' as const,
  }));
  return compileDeclarativePayload({
    ...spec.model,
    commands: [
      ...spec.model.commands,
      ...(spec.sceneCommands ?? []),
      ...placementCommands,
    ],
  });
}

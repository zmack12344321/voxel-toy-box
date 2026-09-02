import * as THREE from 'three';
import type { AnimatedEntity } from '../../types';
import type { SplineAnimationManager } from '../camera/SplineAnimationManager';
import { VoxelMesher } from '../meshing/VoxelMesher';

/** Converts compiled animated voxel entities into scene meshes and spline actors. */
export class AnimatedEntityRenderer {
  public clear(scene: THREE.Scene, animations: SplineAnimationManager): void {
    animations.clear(scene);
  }

  public load(
    entities: AnimatedEntity[],
    scene: THREE.Scene,
    animations: SplineAnimationManager,
  ): void {
    this.clear(scene, animations);
    if (!entities || entities.length === 0) return;
    for (const entity of entities) {
      if (!entity.voxels || entity.voxels.length === 0) continue;
      const { geometry } = VoxelMesher.buildCulledGeometry(entity.voxels);
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4 }),
      );
      const group = new THREE.Group();
      group.add(mesh);
      const scale = entity.id.includes('seagull') || entity.id.includes('bird') ? 0.35 : 0.6;
      animations.addEntity(entity.id, group, entity.waypoints, entity.speed, scale);
    }
  }
}

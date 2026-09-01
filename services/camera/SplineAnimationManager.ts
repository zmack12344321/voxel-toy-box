/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface AnimatedSplineEntity {
  id: string;
  group: THREE.Group;
  curve: THREE.CatmullRomCurve3;
  speed: number; // Progress speed (0.05 to 0.5 per sec)
  t: number;     // Current progress [0, 1]
}

export class SplineAnimationManager {
  private entities: AnimatedSplineEntity[] = [];

  /**
   * Register a new animated entity along a 3D Catmull-Rom spline path loop.
   */
  public addEntity(
    id: string,
    objectGroup: THREE.Group,
    waypoints: Array<[number, number, number]>,
    speed = 0.1
  ): AnimatedSplineEntity {
    if (waypoints.length < 2) {
      throw new Error("Spline path requires at least 2 control waypoints.");
    }

    const points = waypoints.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    // Closed loop spline
    const curve = new THREE.CatmullRomCurve3(points, true);

    const entity: AnimatedSplineEntity = {
      id,
      group: objectGroup,
      curve,
      speed,
      t: Math.random() // Start at random point along path
    };

    this.entities.push(entity);
    return entity;
  }

  /**
   * Update all entity positions and tangent lookAt directions for current frame tick.
   */
  public update(deltaTime: number, scene: THREE.Scene) {
    if (this.entities.length === 0) return;

    for (const entity of this.entities) {
      entity.t = (entity.t + entity.speed * deltaTime) % 1.0;

      // Position along 3D spline curve
      const pos = entity.curve.getPointAt(entity.t);
      entity.group.position.copy(pos);

      // Tangent velocity direction for lookAt orientation
      const tangent = entity.curve.getTangentAt(entity.t);
      const lookTarget = pos.clone().add(tangent);
      entity.group.lookAt(lookTarget);

      if (!entity.group.parent) {
        scene.add(entity.group);
      }
    }
  }

  public clear(scene: THREE.Scene) {
    for (const entity of this.entities) {
      if (entity.group.parent) {
        scene.remove(entity.group);
      }
      entity.group.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          (obj as THREE.Mesh).geometry.dispose();
          if (Array.isArray((obj as THREE.Mesh).material)) {
            ((obj as THREE.Mesh).material as THREE.Material[]).forEach(m => m.dispose());
          } else if ((obj as THREE.Mesh).material) {
            ((obj as THREE.Mesh).material as THREE.Material).dispose();
          }
        }
      });
    }
    this.entities = [];
  }
}

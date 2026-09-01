/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { SimulationVoxel, VoxelData, RebuildTarget } from '../../types';
import { CONFIG } from '../../utils/voxelConstants';

export class VoxelPhysics {
  rebuildStartTime = 0;

  /**
   * Initialize explosive dismantle physics for voxels.
   */
  initDismantle(voxels: SimulationVoxel[], data: VoxelData[], hitPoint?: THREE.Vector3) {
    voxels.forEach((v, i) => {
      let vx = 0, vy = 0, vz = 0;
      if (hitPoint) {
        // Radial blast outward from hit point
        const dx = v.x - hitPoint.x;
        const dy = v.y - hitPoint.y;
        const dz = v.z - hitPoint.z;
        const dist = Math.max(0.8, Math.sqrt(dx * dx + dy * dy + dz * dz));
        const force = (1.4 + Math.random() * 1.0) / Math.sqrt(dist);
        vx = (dx / dist) * force + (Math.random() - 0.5) * 0.3;
        vy = Math.max(0.3, (dy / dist) * force) + 0.4 + Math.random() * 0.7;
        vz = (dz / dist) * force + (Math.random() - 0.5) * 0.3;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const force = 0.6 + Math.random() * 1.0;
        vx = Math.cos(angle) * force;
        vy = 0.4 + Math.random() * 0.9;
        vz = Math.sin(angle) * force;
      }

      v.vx = vx;
      v.vy = vy;
      v.vz = vz;
      v.rx = 0;
      v.ry = 0;
      v.rz = 0;
      v.rvx = (Math.random() - 0.5) * 0.3;
      v.rvy = (Math.random() - 0.5) * 0.3;
      v.rvz = (Math.random() - 0.5) * 0.3;
    });
  }

  /**
   * Per-frame physics update during dismantle.
   */
  updateDismantle(voxels: SimulationVoxel[], config: typeof CONFIG): boolean {
    let allSettled = true;

    voxels.forEach(v => {
      v.vy += CONFIG.GRAVITY;
      v.vx *= CONFIG.AIR_RESISTANCE;
      v.vy *= CONFIG.AIR_RESISTANCE;
      v.vz *= CONFIG.AIR_RESISTANCE;

      v.x += v.vx;
      v.y += v.vy;
      v.z += v.vz;

      v.rx += v.rvx;
      v.ry += v.rvy;
      v.rz += v.rvz;

      // Ground collision
      if (v.y < CONFIG.FLOOR_Y + 0.5) {
        v.y = CONFIG.FLOOR_Y + 0.5;
        v.vy = -v.vy * CONFIG.BOUNCE;
        v.vx *= CONFIG.FRICTION;
        v.vz *= CONFIG.FRICTION;
        v.rvx *= CONFIG.FRICTION;
        v.rvy *= CONFIG.FRICTION;
        v.rvz *= CONFIG.FRICTION;
      }

      if (Math.abs(v.vy) > 0.005 || Math.abs(v.vx) > 0.005 || Math.abs(v.vz) > 0.005) {
        allSettled = false;
      }
    });

    return allSettled;
  }

  /**
   * Initialize rebuild targets with fast spatial + 12-bit color bucket matching.
   */
  initRebuild(
    voxels: SimulationVoxel[],
    targetModel: VoxelData[],
    config: typeof CONFIG,
  ): { voxels: SimulationVoxel[]; targets: RebuildTarget[] } {
    this.rebuildStartTime = performance.now();

    const currentCount = voxels.length;
    const sortedTargets = [...targetModel].sort((a, b) => a.y - b.y);
    const minY = sortedTargets.length > 0 ? sortedTargets[0].y : 0;

    const availableIndices = new Set<number>();
    for (let i = 0; i < currentCount; i++) {
      availableIndices.add(i);
    }

    const assignedVoxels: SimulationVoxel[] = [];
    const assignedTargets: RebuildTarget[] = [];

    // Group available voxels roughly by 12-bit RGB color for fast O(N) matching
    const colorBuckets = new Map<number, number[]>();
    for (let i = 0; i < currentCount; i++) {
      const v = voxels[i];
      const r = Math.round(v.color.r * 15);
      const g = Math.round(v.color.g * 15);
      const b = Math.round(v.color.b * 15);
      const key = (r << 8) | (g << 4) | b;
      let bucket = colorBuckets.get(key);
      if (!bucket) {
        bucket = [];
        colorBuckets.set(key, bucket);
      }
      bucket.push(i);
    }

    sortedTargets.forEach((target, targetIdx) => {
      let bestIndex = -1;

      const tc = new THREE.Color(target.color);
      const tr = Math.round(tc.r * 15);
      const tg = Math.round(tc.g * 15);
      const tb = Math.round(tc.b * 15);
      const targetKey = (tr << 8) | (tg << 4) | tb;

      const bucket = colorBuckets.get(targetKey);
      if (bucket && bucket.length > 0) {
        while (bucket.length > 0) {
          const candidate = bucket.pop()!;
          if (availableIndices.has(candidate)) {
            bestIndex = candidate;
            break;
          }
        }
      }

      if (bestIndex === -1 && availableIndices.size > 0) {
        const iter = availableIndices.values();
        bestIndex = iter.next().value!;
      }

      const layerDelay = Math.max(0, (target.y - minY) * 55);
      const targetDelay = Math.min(layerDelay + (targetIdx % 12) * 15, 1800);

      if (bestIndex !== -1) {
        availableIndices.delete(bestIndex);
        const v = voxels[bestIndex];
        v.color.set(target.color);
        assignedVoxels.push(v);
        assignedTargets.push({
          x: target.x,
          y: target.y,
          z: target.z,
          delay: targetDelay
        });
      } else {
        const newColor = new THREE.Color(target.color);
        const newVoxel: SimulationVoxel = {
          id: assignedVoxels.length,
          x: target.x + (Math.random() - 0.5) * 16,
          y: CONFIG.FLOOR_Y + 0.5,
          z: target.z + (Math.random() - 0.5) * 16,
          color: newColor,
          vx: 0, vy: 0, vz: 0,
          rx: (Math.random() - 0.5) * 0.5,
          ry: (Math.random() - 0.5) * 0.5,
          rz: (Math.random() - 0.5) * 0.5,
          rvx: 0, rvy: 0, rvz: 0
        };
        assignedVoxels.push(newVoxel);
        assignedTargets.push({
          x: target.x,
          y: target.y,
          z: target.z,
          delay: targetDelay
        });
      }
    });

    // Extra voxels fly to rubble perimeter
    let surplusAngle = 0;
    for (const idx of availableIndices) {
      const v = voxels[idx];
      assignedVoxels.push(v);
      const angle = surplusAngle;
      surplusAngle += 0.35;
      const radius = 26 + Math.random() * 12;
      assignedTargets.push({
        x: Math.cos(angle) * radius,
        y: CONFIG.FLOOR_Y + 0.5,
        z: Math.sin(angle) * radius,
        delay: Math.random() * 600,
        isRubble: true
      });
    }

    return { voxels: assignedVoxels, targets: assignedTargets };
  }

  /**
   * Per-frame rebuild update. Returns true when complete.
   */
  updateRebuild(
    voxels: SimulationVoxel[],
    targets: RebuildTarget[],
    config: typeof CONFIG,
  ): boolean {
    const now = performance.now();
    const elapsed = now - this.rebuildStartTime;
    let allDone = true;

    voxels.forEach((v, i) => {
      const t = targets[i];
      if (!t) return;

      if (elapsed < t.delay) {
        v.vy += CONFIG.GRAVITY;
        v.vx *= CONFIG.AIR_RESISTANCE;
        v.vz *= CONFIG.AIR_RESISTANCE;
        v.x += v.vx;
        v.y += v.vy;
        v.z += v.vz;
        if (v.y < CONFIG.FLOOR_Y + 0.5) {
          v.y = CONFIG.FLOOR_Y + 0.5;
          v.vy = 0;
        }
        allDone = false;
        return;
      }

      const lerpFactor = t.isRubble ? 0.08 : 0.12;
      v.x += (t.x - v.x) * lerpFactor;
      v.y += (t.y - v.y) * lerpFactor;
      v.z += (t.z - v.z) * lerpFactor;

      v.rx += (0 - v.rx) * 0.15;
      v.ry += (0 - v.ry) * 0.15;
      v.rz += (0 - v.rz) * 0.15;

      if ((t.x - v.x) ** 2 + (t.y - v.y) ** 2 + (t.z - v.z) ** 2 > 0.008) {
        allDone = false;
      } else {
        v.x = t.x;
        v.y = t.y;
        v.z = t.z;
        v.rx = 0;
        v.ry = 0;
        v.rz = 0;
      }
    });

    return allDone;
  }
}

import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { VoxelPhysics } from '../../services/physics/VoxelPhysics';
import { CONFIG } from '../../utils/voxelConstants';
import type { SimulationVoxel } from '../../types';

function voxel(): SimulationVoxel {
  return {
    id: 0, x: 0, y: 10, z: 0, color: new THREE.Color(0xffffff),
    vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, rz: 0, rvx: 0, rvy: 0, rvz: 0,
  };
}

describe('VoxelPhysics', () => {
  it('uses the supplied config during dismantle updates', () => {
    const physics = new VoxelPhysics();
    const item = voxel();
    const customConfig = { ...CONFIG, GRAVITY: 0, AIR_RESISTANCE: 1 };

    const settled = physics.updateDismantle([item], customConfig);

    expect(item.y).toBe(10);
    expect(settled).toBe(true);
  });
});

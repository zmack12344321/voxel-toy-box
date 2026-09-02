/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { SimulationVoxel, VoxelData, RenderMode, AppState, MeshStats } from '../../types';
import { CONFIG } from '../../utils/voxelConstants';
import { VoxelMesher, GreedyMeshResult } from './VoxelMesher';
import { SmoothMesher } from './SmoothMesher';
import { emitStats } from '../VoxelUtils';

export class MeshLifecycleManager {
  // Meshes
  dynamicPhysicsMesh: THREE.InstancedMesh | null = null;
  segmentedMesh: THREE.InstancedMesh | null = null;
  mergedMesh: THREE.Mesh | null = null;
  smoothMesh: THREE.Mesh | null = null;

  // Helpers
  dummy = new THREE.Object3D();

  // Culled geometry cache
  lastCulledResult: GreedyMeshResult | null = null;
  lastSmoothTriangleCount = 0;

  createAllMeshes(
    scene: THREE.Scene,
    data: VoxelData[],
    opts: { marchingRes: number; marchingSmooth: number; wireframe: boolean; shadows: boolean },
    onStatsChange: (stats: MeshStats) => void,
    renderMode: RenderMode,
    appState: AppState = AppState.STABLE,
  ): SimulationVoxel[] {
    this.clearAll(scene);

    const voxels: SimulationVoxel[] = data.map((v, i) => ({
      id: i,
      x: v.x * CONFIG.VOXEL_SIZE,
      y: v.y * CONFIG.VOXEL_SIZE,
      z: v.z * CONFIG.VOXEL_SIZE,
      color: new THREE.Color(v.color),
      vx: 0, vy: 0, vz: 0,
      rx: 0, ry: 0, rz: 0,
      rvx: 0, rvy: 0, rvz: 0,
    }));

    this.buildMergedMesh(scene, data, opts.wireframe, opts.shadows);
    if (renderMode === RenderMode.SMOOTH_MARCHING) {
      this.buildSmoothMesh(scene, data, opts.marchingRes, opts.marchingSmooth, opts.wireframe, opts.shadows);
    }
    this.buildSegmentedMesh(scene, voxels, opts.wireframe, opts.shadows);
    this.buildDynamicPhysicsMesh(scene, voxels, opts.wireframe, opts.shadows);
    this.drawSegmentedMesh(voxels);
    this.drawDynamicPhysics(voxels);
    this.updateVisibility(voxels.length, renderMode, appState, onStatsChange);

    return voxels;
  }

  clearAll(scene: THREE.Scene) {
    [this.dynamicPhysicsMesh, this.segmentedMesh].forEach(m => {
      if (m) { scene.remove(m); this.disposeMesh(m); }
    });
    this.dynamicPhysicsMesh = null;
    this.segmentedMesh = null;

    if (this.mergedMesh) {
      scene.remove(this.mergedMesh);
      this.disposeMesh(this.mergedMesh);
      this.mergedMesh = null;
    }

    this.lastCulledResult = null;
    this.lastSmoothTriangleCount = 0;
    if (this.smoothMesh) {
      scene.remove(this.smoothMesh);
      this.disposeMesh(this.smoothMesh);
      this.smoothMesh = null;
    }
  }

  // ── Individual mesh builders ──

  buildSegmentedMesh(scene: THREE.Scene, voxels: SimulationVoxel[], wireframe: boolean, shadows: boolean) {
    if (this.segmentedMesh) { scene.remove(this.segmentedMesh); this.disposeMesh(this.segmentedMesh); }
    if (voxels.length === 0) return;

    const geo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.65, metalness: 0.12, wireframe });
    this.segmentedMesh = new THREE.InstancedMesh(geo, mat, voxels.length);
    this.segmentedMesh.castShadow = shadows;
    this.segmentedMesh.receiveShadow = shadows;
    this.segmentedMesh.visible = false;
    scene.add(this.segmentedMesh);
  }

  buildDynamicPhysicsMesh(scene: THREE.Scene, voxels: SimulationVoxel[], wireframe: boolean, shadows: boolean) {
    if (this.dynamicPhysicsMesh) { scene.remove(this.dynamicPhysicsMesh); this.disposeMesh(this.dynamicPhysicsMesh); }
    if (voxels.length === 0) return;

    const geo = new THREE.BoxGeometry(0.92, 0.92, 0.92);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.12, wireframe });
    this.dynamicPhysicsMesh = new THREE.InstancedMesh(geo, mat, voxels.length);
    this.dynamicPhysicsMesh.castShadow = shadows;
    this.dynamicPhysicsMesh.receiveShadow = shadows;
    this.dynamicPhysicsMesh.visible = false;
    scene.add(this.dynamicPhysicsMesh);
  }

  ensureDynamicPhysicsCapacity(scene: THREE.Scene, requiredCapacity: number, wireframe: boolean, shadows: boolean) {
    if (!this.dynamicPhysicsMesh || this.dynamicPhysicsMesh.count < requiredCapacity) {
      if (this.dynamicPhysicsMesh) {
        scene.remove(this.dynamicPhysicsMesh);
        this.disposeMesh(this.dynamicPhysicsMesh);
      }
      const geo = new THREE.BoxGeometry(0.92, 0.92, 0.92);
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.12, wireframe });
      this.dynamicPhysicsMesh = new THREE.InstancedMesh(geo, mat, Math.max(requiredCapacity, 100));
      this.dynamicPhysicsMesh.castShadow = shadows;
      this.dynamicPhysicsMesh.receiveShadow = shadows;
      this.dynamicPhysicsMesh.visible = false;
      scene.add(this.dynamicPhysicsMesh);
    }
  }

  buildMergedMesh(scene: THREE.Scene, data: VoxelData[], wireframe: boolean, shadows: boolean) {
    if (this.mergedMesh) {
      scene.remove(this.mergedMesh);
      this.disposeMesh(this.mergedMesh);
      this.mergedMesh = null;
    }
    if (data.length === 0) return;

    const meshResult = VoxelMesher.buildCulledGeometry(data, 1.0);
    this.lastCulledResult = meshResult;

    const geo = meshResult.geometry;
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true, side: THREE.DoubleSide, metalness: 0.1, roughness: 0.55, wireframe,
    });
    this.mergedMesh = new THREE.Mesh(geo, mat);
    this.mergedMesh.castShadow = shadows;
    this.mergedMesh.receiveShadow = shadows;
    this.mergedMesh.visible = false;
    scene.add(this.mergedMesh);
  }

  buildSmoothMesh(scene: THREE.Scene, data: VoxelData[], resolution: number, smoothness: number, wireframe: boolean, shadows: boolean) {
    if (this.smoothMesh) {
      scene.remove(this.smoothMesh);
      this.disposeMesh(this.smoothMesh);
      this.smoothMesh = null;
    }
    if (data.length === 0) return;

    const smoothMesh = SmoothMesher.buildSmoothMesh(data, resolution, smoothness, { wireframe });
    if (!smoothMesh) return;

    const idx = smoothMesh.geometry.index;
    this.lastSmoothTriangleCount = idx ? Math.floor(idx.count / 3) : 0;
    smoothMesh.castShadow = shadows;
    smoothMesh.receiveShadow = shadows;
    smoothMesh.visible = false;
    scene.add(smoothMesh);
    this.smoothMesh = smoothMesh;
  }

  // ── Visibility + wireframe + draw ──

  updateVisibility(voxelCount: number, renderMode: RenderMode, appState: AppState, onStatsChange: (stats: MeshStats) => void) {
    const isDynamic = appState !== AppState.STABLE;

    if (isDynamic) {
      if (this.dynamicPhysicsMesh) this.dynamicPhysicsMesh.visible = true;
      if (this.segmentedMesh) this.segmentedMesh.visible = false;
      if (this.mergedMesh) this.mergedMesh.visible = false;
      if (this.smoothMesh) this.smoothMesh.visible = false;
      return;
    }

    if (this.dynamicPhysicsMesh) this.dynamicPhysicsMesh.visible = false;

    if (renderMode === RenderMode.MERGED_VOXEL) {
      if (this.mergedMesh) this.mergedMesh.visible = true;
      if (this.segmentedMesh) this.segmentedMesh.visible = false;
      if (this.smoothMesh) this.smoothMesh.visible = false;
    } else if (renderMode === RenderMode.SMOOTH_MARCHING) {
      if (this.smoothMesh) this.smoothMesh.visible = true;
      if (this.mergedMesh) this.mergedMesh.visible = false;
      if (this.segmentedMesh) this.segmentedMesh.visible = false;
    } else {
      if (this.segmentedMesh) this.segmentedMesh.visible = true;
      if (this.mergedMesh) this.mergedMesh.visible = false;
      if (this.smoothMesh) this.smoothMesh.visible = false;
    }

    emitStats(
      voxelCount,
      renderMode,
      this.lastCulledResult,
      this.lastSmoothTriangleCount,
      onStatsChange
    );
  }

  setWireframe(enabled: boolean) {
    if (this.mergedMesh) (this.mergedMesh.material as THREE.MeshStandardMaterial).wireframe = enabled;
    if (this.smoothMesh) (this.smoothMesh.material as THREE.MeshStandardMaterial).wireframe = enabled;
    if (this.segmentedMesh) (this.segmentedMesh.material as THREE.MeshStandardMaterial).wireframe = enabled;
    if (this.dynamicPhysicsMesh) (this.dynamicPhysicsMesh.material as THREE.MeshStandardMaterial).wireframe = enabled;
  }

  drawDynamicPhysics(voxels: SimulationVoxel[]) {
    if (!this.dynamicPhysicsMesh) return;
    voxels.forEach((v, i) => {
      this.dummy.position.set(v.x, v.y, v.z);
      this.dummy.rotation.set(v.rx, v.ry, v.rz);
      this.dummy.updateMatrix();
      this.dynamicPhysicsMesh!.setMatrixAt(i, this.dummy.matrix);
      this.dynamicPhysicsMesh!.setColorAt(i, v.color);
    });
    this.dynamicPhysicsMesh.instanceMatrix.needsUpdate = true;
    if (this.dynamicPhysicsMesh.instanceColor) {
      this.dynamicPhysicsMesh.instanceColor.needsUpdate = true;
    }
  }

  drawSegmentedMesh(voxels: SimulationVoxel[], spacing = 1.0) {
    if (!this.segmentedMesh) return;
    voxels.forEach((v, i) => {
      this.dummy.position.set(v.x * spacing, v.y * spacing, v.z * spacing);
      this.dummy.rotation.set(0, 0, 0);
      this.dummy.updateMatrix();
      this.segmentedMesh!.setMatrixAt(i, this.dummy.matrix);
      this.segmentedMesh!.setColorAt(i, v.color);
    });
    this.segmentedMesh.instanceMatrix.needsUpdate = true;
    if (this.segmentedMesh.instanceColor) {
      this.segmentedMesh.instanceColor.needsUpdate = true;
    }
  }

  dispose() {
    [this.dynamicPhysicsMesh, this.segmentedMesh].forEach(m => {
      if (m) this.disposeMesh(m);
    });
    if (this.mergedMesh) {
      this.disposeMesh(this.mergedMesh);
    }
    if (this.smoothMesh) {
      this.disposeMesh(this.smoothMesh);
    }

    this.dynamicPhysicsMesh = null;
    this.segmentedMesh = null;
    this.mergedMesh = null;
    this.smoothMesh = null;
    this.lastCulledResult = null;
    this.lastSmoothTriangleCount = 0;
  }

  private disposeMesh(mesh: THREE.Mesh): void {
    mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) mesh.material.forEach(material => material.dispose());
    else mesh.material.dispose();
    if (mesh instanceof THREE.InstancedMesh) mesh.dispose();
  }
}

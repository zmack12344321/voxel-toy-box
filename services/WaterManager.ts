/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { SceneWater } from '../types';

export class WaterManager {
  waterMesh: Water | null = null;

  /**
   * Create or replace a real Three.js Water plane.
   * Pass null to remove the water.
   */
  setup(scene: THREE.Scene, water: SceneWater | null, isFogEnabled: boolean) {
    // Remove existing water mesh
    if (this.waterMesh) {
      scene.remove(this.waterMesh);
      this.waterMesh.material['normalMap']?.dispose();
      (this.waterMesh.geometry as THREE.PlaneGeometry).dispose();
      (this.waterMesh.material as THREE.Material).dispose();
      this.waterMesh = null;
    }

    if (!water) return;

    // Procedural normal map for water surface detail
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = 128;
    normalCanvas.height = 128;
    const ctx = normalCanvas.getContext('2d')!;
    const imgData = ctx.createImageData(128, 128);

    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 128; x++) {
        const i = (y * 128 + x) * 4;
        const wave1 = Math.sin(x * 0.08 + y * 0.03) * 15 + 128;
        const wave2 = Math.sin(x * 0.04 - y * 0.06) * 8 + 128;
        const combined = (wave1 + wave2) / 2;

        imgData.data[i] = combined;       // R
        imgData.data[i + 1] = combined;   // G
        imgData.data[i + 2] = 255;        // B
        imgData.data[i + 3] = 255;        // A
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const normalMap = new THREE.CanvasTexture(normalCanvas);
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;

    const waterGeometry = new THREE.PlaneGeometry(water.extent[0], water.extent[1]);
    const waterMaterial = new THREE.MeshPhongMaterial({
      color: water.color,
      transparent: true,
      opacity: water.opacity,
      shininess: 100,
      side: THREE.DoubleSide,
    });

    this.waterMesh = new Water(waterGeometry, {
      waterColor: water.color,
      textureWidth: 512,
      textureHeight: 512,
      fog: isFogEnabled,
      waterNormals: normalMap,
    });

    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.y = water.level;
    scene.add(this.waterMesh);
  }

  update(deltaTime: number) {
    if (this.waterMesh) {
      this.waterMesh.material.uniforms['time'].value += 0.5 * deltaTime;
    }
  }

  dispose(scene: THREE.Scene) {
    if (this.waterMesh) {
      scene.remove(this.waterMesh);
      this.waterMesh.material['normalMap']?.dispose();
      (this.waterMesh.geometry as THREE.PlaneGeometry).dispose();
      (this.waterMesh.material as THREE.Material).dispose();
      this.waterMesh = null;
    }
  }
}

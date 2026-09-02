/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { SceneWater } from '../../types';
import type { EnvironmentRenderer, WaterOptions } from './contracts';

export class WaterManager implements EnvironmentRenderer {
  waterMesh: Water | null = null;

  /**
   * Create or replace a real Three.js Water plane.
   * Pass null to remove the water.
   */
  setup(scene: THREE.Scene, water: SceneWater | null, isFogEnabled: boolean, options: WaterOptions = {}) {
    this.disposeCurrent(scene);

    if (!water) return;

    // High-frequency procedural ocean wave normal map
    const textureSize = options.quality === 'low' ? 256 : 512;
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = textureSize;
    normalCanvas.height = textureSize;
    const ctx = normalCanvas.getContext('2d')!;
    const imgData = ctx.createImageData(textureSize, textureSize);

    for (let y = 0; y < textureSize; y++) {
      for (let x = 0; x < textureSize; x++) {
        const i = (y * textureSize + x) * 4;
        const wave1 = Math.sin(x * 0.05 + y * 0.04) * 40 + 128;
        const wave2 = Math.cos(x * 0.07 - y * 0.03) * 30 + 128;
        const wave3 = Math.sin((x + y) * 0.09) * 20 + 128;
        const combined = Math.floor((wave1 + wave2 + wave3) / 3);

        imgData.data[i]     = combined; // R
        imgData.data[i + 1] = combined; // G
        imgData.data[i + 2] = 255;      // B
        imgData.data[i + 3] = 255;      // A
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const normalMap = new THREE.CanvasTexture(normalCanvas);
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(options.quality === 'low' ? 60 : 100, options.quality === 'low' ? 60 : 100);

    const oceanWidth = Math.max(water.extent[0] * 40, 3500);
    const oceanHeight = Math.max(water.extent[1] * 40, 3500);
    const waterGeometry = new THREE.PlaneGeometry(oceanWidth, oceanHeight);

    // Official Drei / Three.js Water.js shader object with deep ocean color attenuation
    this.waterMesh = new Water(waterGeometry, {
      textureWidth: textureSize,
      textureHeight: textureSize,
      waterNormals: normalMap,
      sunDirection: new THREE.Vector3(1.0, 1.0, 0.8).normalize(),
      sunColor: 0xffffff,
      waterColor: water.color ?? 0x002b4d,
      distortionScale: options.quality === 'low' ? 6 : 10,
      fog: isFogEnabled,
    });

    const mat = this.waterMesh.material as THREE.ShaderMaterial;
    mat.transparent = true;
    mat.depthWrite = false;
    if (mat.uniforms['alpha']) {
      mat.uniforms['alpha'].value = Math.min(water.opacity ?? 0.72, 0.78);
    }
    if (mat.uniforms['distortionScale']) {
      mat.uniforms['distortionScale'].value = options.quality === 'low' ? 6 : 10;
    }

    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.y = water.level;
    scene.add(this.waterMesh);
  }

  update(deltaTime: number) {
    if (this.waterMesh) {
      const mat = this.waterMesh.material as THREE.ShaderMaterial;
      if (mat && mat.uniforms && mat.uniforms['time']) {
        mat.uniforms['time'].value += 1.2 * deltaTime;
      }
    }
  }

  setFog(enabled: boolean): void {
    if (!this.waterMesh) return;
    const material = this.waterMesh.material as THREE.ShaderMaterial;
    material.fog = enabled;
    material.needsUpdate = true;
  }

  dispose(scene: THREE.Scene) {
    this.disposeCurrent(scene);
  }

  private disposeCurrent(scene: THREE.Scene): void {
    if (!this.waterMesh) return;
    scene.remove(this.waterMesh);
    const material = this.waterMesh.material as THREE.ShaderMaterial;
    const normalSampler = material.uniforms?.['normalSampler']?.value;
    if (normalSampler instanceof THREE.Texture) normalSampler.dispose();
    (this.waterMesh.geometry as THREE.PlaneGeometry).dispose();
    material.dispose();
    this.waterMesh = null;
  }
}

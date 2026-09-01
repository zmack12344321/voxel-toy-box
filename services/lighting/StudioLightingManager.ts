/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export class StudioLightingManager {
  public keyLight: THREE.DirectionalLight;
  public keyLightTarget: THREE.Object3D;
  public fillLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public hemisphereLight: THREE.HemisphereLight;

  constructor(scene: THREE.Scene) {
    // Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(this.ambientLight);

    // Hemisphere Light
    this.hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    scene.add(this.hemisphereLight);

    // Key Light (Main Directional Light)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.keyLight.position.set(30, 50, 40);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 1;
    this.keyLight.shadow.camera.far = 150;
    this.keyLight.shadow.camera.left = -60;
    this.keyLight.shadow.camera.right = 60;
    this.keyLight.shadow.camera.top = 60;
    this.keyLight.shadow.camera.bottom = -60;
    this.keyLight.shadow.bias = -0.0005;
    this.keyLight.shadow.normalBias = 0.02;
    scene.add(this.keyLight);

    this.keyLightTarget = this.keyLight.target;
    scene.add(this.keyLightTarget);

    // Fill Light
    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    this.fillLight.position.set(-30, 20, -30);
    scene.add(this.fillLight);
  }

  public setShadows(enabled: boolean) {
    this.keyLight.castShadow = enabled;
  }

  public dispose(scene: THREE.Scene) {
    scene.remove(this.ambientLight);
    scene.remove(this.hemisphereLight);
    scene.remove(this.keyLight);
    scene.remove(this.keyLightTarget);
    scene.remove(this.fillLight);
  }
}

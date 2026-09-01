/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraController {
  constructor(
    private camera: THREE.PerspectiveCamera,
    private controls: OrbitControls
  ) {}

  public setDistance(distance: number) {
    this.camera.position.setLength(distance);
  }

  public setAngle(phi: number, theta: number) {
    const r = this.camera.position.length();
    this.camera.position.set(
      r * Math.sin(theta) * Math.cos(phi),
      r * Math.sin(theta) * Math.sin(phi),
      r * Math.cos(theta)
    );
  }

  public reset() {
    console.log('[CameraController] Resetting camera view.');
    this.camera.position.set(32, 28, 55);
    this.controls.target.set(0, 8, 0);
    this.controls.update();
  }

  public setAutoRotate(enabled: boolean) {
    this.controls.autoRotate = enabled;
    this.controls.autoRotateSpeed = 1.5;
  }

  public autofocus(voxels: { x: number; y: number; z: number }[]) {
    if (voxels.length === 0) return;

    let minY = Infinity, maxY = -Infinity;
    let maxRadiusSq = 0;

    voxels.forEach(v => {
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
      const rSq = v.x * v.x + v.z * v.z;
      maxRadiusSq = Math.max(maxRadiusSq, rSq);
    });

    const midY = (minY + maxY) / 2;
    const radius = Math.sqrt(maxRadiusSq);
    const height = maxY - minY;

    this.controls.target.set(0, Math.max(2, midY), 0);
    const distance = Math.max(40, Math.max(radius * 2.2, height * 1.8) + 15);
    const angle = Math.PI / 5;
    this.camera.position.set(
      Math.sin(angle) * distance * 0.8,
      midY + distance * 0.45,
      Math.cos(angle) * distance * 0.8
    );
    this.controls.update();
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ViewHelperManager {
  public viewHelper: ViewHelper;
  private onPointerDown: (e: PointerEvent) => void;

  constructor(
    private camera: THREE.PerspectiveCamera,
    private renderer: THREE.WebGLRenderer,
    private controls: OrbitControls
  ) {
    this.viewHelper = new ViewHelper(camera, renderer.domElement);
    this.viewHelper.setLabels('X', 'Y', 'Z');

    const dim = 128;
    const rightOffset = 16;
    const topOffset = 70;

    this.onPointerDown = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const containerW = rect.width;
      const containerH = rect.height;

      const targetX = containerW - dim - rightOffset;
      const targetY = topOffset;

      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (
        clickX >= targetX && clickX <= targetX + dim &&
        clickY >= targetY && clickY <= targetY + dim
      ) {
        const mappedX = rect.left + (containerW - dim) + (clickX - targetX);
        const mappedY = rect.top + (containerH - dim) + (clickY - targetY);

        const syntheticEvent = {
          clientX: mappedX,
          clientY: mappedY,
        } as PointerEvent;

        this.viewHelper.handleClick(syntheticEvent);
      }
    };

    renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
  }

  public render(delta: number, skyMesh?: THREE.Object3D) {
    if (!this.viewHelper) return;

    this.viewHelper.center.copy(this.controls.target);
    if (this.viewHelper.animating) {
      this.viewHelper.update(delta);
    }

    const containerW = this.renderer.domElement.clientWidth || window.innerWidth;
    const containerH = this.renderer.domElement.clientHeight || window.innerHeight;
    const dim = 128;
    const rightOffset = 16;
    const topOffset = 70;

    const targetX = containerW - dim - rightOffset;
    const targetY = containerH - dim - topOffset;

    const prevAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;

    const origSetViewport = this.renderer.setViewport.bind(this.renderer);
    this.renderer.setViewport = (vx: number, vy: number, vw: number, vh: number) => {
      if (typeof vx === 'number' && vw === dim && vh === dim) {
        return origSetViewport(targetX, targetY, dim, dim);
      }
      return origSetViewport(vx, vy, vw, vh);
    };

    if (skyMesh) skyMesh.visible = false;
    this.viewHelper.render(this.renderer);
    if (skyMesh) skyMesh.visible = true;

    this.renderer.setViewport = origSetViewport;
    this.renderer.autoClear = prevAutoClear;
  }

  public dispose() {
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.viewHelper.dispose();
  }
}

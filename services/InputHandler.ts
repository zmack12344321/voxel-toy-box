/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { useUIStore } from '../store';

export type GetVisibleMeshes = () => THREE.Object3D[];
export type OnDismantle = (hitPoint?: THREE.Vector3) => void;

export class InputHandler {
  private raycaster = new THREE.Raycaster();
  private pointerDownPos = { x: 0, y: 0 };
  private pointerDownTarget: EventTarget | null = null;
  private domElement: HTMLElement;
  private camera: THREE.PerspectiveCamera;
  private getState: () => string;
  private getVisibleMeshes: GetVisibleMeshes;
  private onDismantle: OnDismantle;
  private onPointerDownBound: (e: PointerEvent) => void;
  private onPointerUpBound: (e: PointerEvent) => void;

  constructor(
    domElement: HTMLElement,
    camera: THREE.PerspectiveCamera,
    getState: () => string,
    getVisibleMeshes: GetVisibleMeshes,
    onDismantle: OnDismantle,
  ) {
    this.domElement = domElement;
    this.camera = camera;
    this.getState = getState;
    this.getVisibleMeshes = getVisibleMeshes;
    this.onDismantle = onDismantle;

    this.onPointerDownBound = this.onPointerDown.bind(this);
    this.onPointerUpBound = this.onPointerUp.bind(this);

    this.domElement.addEventListener('pointerdown', this.onPointerDownBound);
    this.domElement.addEventListener('pointerup', this.onPointerUpBound);
  }

  private onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
    this.pointerDownTarget = e.target;
  }

  private onPointerUp(e: PointerEvent) {
    // Canvas pointer events are reserved for OrbitControls camera rotation & navigation.
    // Dismantle is explicitly triggered via the "BREAK BLOCKS" button.
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this.onPointerDownBound);
    this.domElement.removeEventListener('pointerup', this.onPointerUpBound);
  }
}

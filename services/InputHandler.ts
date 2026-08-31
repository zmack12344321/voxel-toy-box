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
    // Only primary left-click (button === 0) on the 3D canvas itself can dismantle
    if (e.button !== 0) return;
    if (e.target !== this.domElement || this.pointerDownTarget !== this.domElement) return;

    // Ignore clicks if any UI modal or drawer is open
    const ui = useUIStore.getState();
    if (ui.isModelLibraryOpen || ui.isJsonModalOpen || ui.isPromptModalOpen) return;

    // If user dragged more than 6px, it was an orbit rotation, not a click
    const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
    if (dist > 6) return;

    const currentState = this.getState();
    if (currentState !== 'STABLE') {
      console.log(`[InputHandler] Click ignored — engine state is ${currentState}`);
      return;
    }

    const rect = this.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    this.raycaster.setFromCamera(mouse, this.camera);

    const checkObjects = this.getVisibleMeshes();
    if (checkObjects.length === 0) {
      console.log('[InputHandler] Click ignored — no visible model meshes to raycast.');
      return;
    }

    const intersects = this.raycaster.intersectObjects(checkObjects, true);
    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      console.log(`[InputHandler] Raycast hit block at (${hitPoint.x.toFixed(2)}, ${hitPoint.y.toFixed(2)}, ${hitPoint.z.toFixed(2)}). Triggering dismantle...`);
      this.onDismantle(hitPoint);
    } else {
      console.log('[InputHandler] Click raycast missed 3D model.');
    }
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this.onPointerDownBound);
    this.domElement.removeEventListener('pointerup', this.onPointerUpBound);
  }
}

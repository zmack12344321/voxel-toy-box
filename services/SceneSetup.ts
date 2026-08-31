/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SceneTheme } from '../types';
import { CONFIG } from '../utils/voxelConstants';

export const THEME_PRESETS: Record<SceneTheme, { bg: number; floor: number; gridMain: number; gridSub: number; ambientIntensity: number; keyLightColor: number }> = {
  light: { bg: 0xf0f2f5, floor: 0xdfe3e8, gridMain: 0xcfd8dc, gridSub: 0xe2e8f0, ambientIntensity: 0.6, keyLightColor: 0xffffff },
  dark:  { bg: 0x111827, floor: 0x1f2937, gridMain: 0x374151, gridSub: 0x4b5563, ambientIntensity: 0.4, keyLightColor: 0xe5e7eb },
  studio:{ bg: 0xfafafa, floor: 0xf5f5f5, gridMain: 0xe5e5e5, gridSub: 0xf5f5f5, ambientIntensity: 0.7, keyLightColor: 0xffffff },
  dusk:  { bg: 0x1e1b4b, floor: 0x312e81, gridMain: 0x4338ca, gridSub: 0x6366f1, ambientIntensity: 0.35, keyLightColor: 0xfcd34d },
};

export class SceneSetup {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  floor: THREE.Mesh;
  floorMat: THREE.MeshStandardMaterial;
  grid: THREE.GridHelper | null = null;
  fogInstance: THREE.Fog;
  ambientLight: THREE.AmbientLight;
  keyLight: THREE.DirectionalLight;
  keyLightTarget: THREE.Object3D;
  fillLight: THREE.DirectionalLight;
  hemisphereLight: THREE.HemisphereLight;

  constructor(container: HTMLElement) {
    container.innerHTML = '';
    this.scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(32, 28, 55);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.6;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 150;
    this.controls.target.set(0, 8, 0);
    this.controls.update();

    this.scene.background = new THREE.Color(CONFIG.BG_COLOR);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    this.hemisphereLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.4);
    this.scene.add(this.hemisphereLight);

    this.keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    this.keyLight.position.set(15, 50, 30);
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
    this.scene.add(this.keyLight);
    this.keyLightTarget = this.keyLight.target;
    this.scene.add(this.keyLightTarget);

    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    this.fillLight.position.set(-20, 30, -20);
    this.scene.add(this.fillLight);

    this.floorMat = new THREE.MeshStandardMaterial({
      color: 0xdfe3e8,
      roughness: 0.95,
      metalness: 0.0,
    });
    this.floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), this.floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = CONFIG.FLOOR_Y;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    this.grid = new THREE.GridHelper(100, 50, 0xcfd8dc, 0xe2e8f0);
    this.grid.position.y = CONFIG.FLOOR_Y + 0.01;
    this.scene.add(this.grid);

    this.fogInstance = new THREE.Fog(CONFIG.BG_COLOR, 70, 160);
    this.scene.fog = this.fogInstance;
  }

  handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  setTheme(theme: SceneTheme) {
    const p = THEME_PRESETS[theme];
    this.scene.background = new THREE.Color(p.bg);
    (this.scene.fog as THREE.Fog).color.set(p.bg);
    this.floorMat.color.set(p.floor);
    this.ambientLight.intensity = p.ambientIntensity;
    this.keyLight.color.set(p.keyLightColor);
    if (this.grid) {
      (this.grid.material as THREE.Material).dispose();
      this.grid = new THREE.GridHelper(100, 50, p.gridMain, p.gridSub);
      this.grid.position.y = CONFIG.FLOOR_Y + 0.01;
      this.scene.add(this.grid);
    }
  }

  setFog(enabled: boolean) {
    if (this.scene.fog) {
      (this.scene.fog as THREE.Fog).near = enabled ? 70 : 999999;
      (this.scene.fog as THREE.Fog).far = enabled ? 160 : 999999;
    }
  }

  setGridFloor(enabled: boolean) {
    if (this.grid) this.grid.visible = enabled;
  }

  setGroundPlane(enabled: boolean) {
    this.floor.visible = enabled;
  }

  setShadows(enabled: boolean) {
    this.renderer.shadowMap.enabled = enabled;
    this.keyLight.castShadow = enabled;
    this.scene.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).castShadow = enabled;
        (obj as THREE.Mesh).receiveShadow = enabled;
      }
    });
  }

  setAutoRotate(enabled: boolean) {
    this.controls.autoRotate = enabled;
    this.controls.autoRotateSpeed = 1.5;
  }

  dispose() {
    this.controls.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
    this.scene.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).geometry.dispose();
        if (Array.isArray((obj as THREE.Mesh).material)) {
          ((obj as THREE.Mesh).material as THREE.Material[]).forEach((m: THREE.Material) => m.dispose());
        } else if ((obj as THREE.Mesh).material) {
          ((obj as THREE.Mesh).material as THREE.Material).dispose();
        }
      }
    });
  }
}

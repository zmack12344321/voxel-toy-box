import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SceneTheme } from '../types';
import { CONFIG } from '../utils/voxelConstants';
import { THEME_PRESETS } from './presets/themePresets';
import { ViewHelperManager } from './environment/ViewHelperManager';
import { StudioLightingManager } from './lighting/StudioLightingManager';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export { THEME_PRESETS };

export class SceneSetup {
  private readonly container: HTMLElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  controls: OrbitControls;
  floor: THREE.Mesh;
  floorMat: THREE.MeshStandardMaterial;
  grid: THREE.GridHelper | null = null;
  fogInstance: THREE.Fog;
  
  // Environment & Gizmo Managers
  public lighting: StudioLightingManager;
  public viewHelperManager: ViewHelperManager;
  private disposed = false;

  constructor(container: HTMLElement) {
    this.container = container;
    container.innerHTML = '';
    this.scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    this.camera.position.set(120, 100, 200);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.scene.userData.renderer = this.renderer;
    this.scene.userData.camera = this.camera;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.composer = new EffectComposer(this.renderer);
    this.scene.userData.composer = this.composer;
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.35, 0.55, 0.88));
    this.composer.addPass(new OutputPass());
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
    this.controls.minDistance = 2;
    this.controls.maxDistance = 5000;
    this.controls.target.set(0, 30, 0);
    this.controls.update();

    // Clean neutral studio background
    this.scene.background = new THREE.Color(CONFIG.BG_COLOR);

    // Modular 3-Point Studio Lighting
    this.lighting = new StudioLightingManager(this.scene);
    this.lighting.setShadows(false);

    this.floorMat = new THREE.MeshStandardMaterial({
      color: 0xdfe3e8,
      roughness: 0.95,
      metalness: 0.0,
    });
    this.floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), this.floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = CONFIG.FLOOR_Y;
    this.floor.receiveShadow = true;
    this.floor.visible = false;
    this.scene.add(this.floor);

    this.grid = new THREE.GridHelper(100, 50, 0xcfd8dc, 0xe2e8f0);
    this.grid.position.y = CONFIG.FLOOR_Y + 0.01;
    this.grid.visible = false;
    this.scene.add(this.grid);

    this.fogInstance = new THREE.Fog(0xf0f2f5, 100, 250);
    this.scene.fog = null; // Disabled by default

    this.viewHelperManager = new ViewHelperManager(
      this.camera,
      this.renderer,
      this.controls
    );
  }

  get keyLight(): THREE.DirectionalLight { return this.lighting.keyLight; }
  get keyLightTarget(): THREE.Object3D { return this.lighting.keyLightTarget; }
  get fillLight(): THREE.DirectionalLight { return this.lighting.fillLight; }
  get ambientLight(): THREE.AmbientLight { return this.lighting.ambientLight; }
  get hemisphereLight(): THREE.HemisphereLight { return this.lighting.hemisphereLight; }

  handleResize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  }

  renderGizmo(delta: number) {
    this.viewHelperManager.render(delta);
  }

  setTheme(theme: SceneTheme) {
    const p = THEME_PRESETS[theme];
    this.scene.background = new THREE.Color(p.bg);
    this.fogInstance.color.set(p.bg);
    if (this.scene.fog) this.scene.fog.color.copy(this.fogInstance.color);
    this.floorMat.color.set(p.floor);
    this.ambientLight.intensity = p.ambientIntensity;
    this.keyLight.color.set(p.keyLightColor);
    if (this.grid) {
      const isVisible = this.grid.visible;
      this.scene.remove(this.grid);
      this.grid.geometry.dispose();
      (this.grid.material as THREE.Material).dispose();
      this.grid = new THREE.GridHelper(100, 50, p.gridMain, p.gridSub);
      this.grid.position.y = CONFIG.FLOOR_Y + 0.01;
      this.grid.visible = isVisible;
      this.scene.add(this.grid);
    }
  }

  setFog(enabled: boolean) {
    this.scene.fog = enabled ? this.fogInstance : null;
  }

  setGridFloor(enabled: boolean) {
    if (this.grid) this.grid.visible = enabled;
  }

  setGroundPlane(enabled: boolean) {
    this.floor.visible = enabled;
  }

  setShadows(enabled: boolean) {
    this.renderer.shadowMap.enabled = enabled;
    this.lighting.setShadows(enabled);
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
    if (this.disposed) return;
    this.disposed = true;
    this.lighting.dispose(this.scene);
    this.viewHelperManager.dispose();
    this.controls.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.renderLists.dispose();
    this.composer.dispose();
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

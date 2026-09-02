import * as THREE from 'three';
import vertexSource from './shaders/water.vertex.glsl?raw';
import waterSource from './shaders/water.frag.glsl?raw';
import transformSource from './shaders/transform.glsl?raw';
import sunSource from './shaders/sun.glsl?raw';
import { WaterSimulation } from '../caustics/WaterSimulation';
import { WaterReceiverRegistry } from '../caustics/WaterReceiverRegistry';
import type { WaterTuning } from '../../types';

export const DEFAULT_WATER_TUNING: WaterTuning = {
  oceanLevel: 0,
  bigWaveHeight: 1.2,
  bigWaveSpeed: 0.35,
  bigWaveSize: 2.2,
  smallWaveHeight: 0.25,
  smallWaveSpeed: 1.2,
  smallWaveSize: 7.5,
  causticsStrength: 0.8,
};

export interface WatergliceConfig {
  level: number;
  extent: [number, number];
  color: number;
  opacity: number;
}

/** Direct Webglice shader port with Three.js render-target adapters. */
export class WatergliceAdapter {
  readonly mesh: THREE.Mesh;
  private readonly reflection = new THREE.WebGLRenderTarget(1024, 512, { type: THREE.HalfFloatType });
  private readonly refraction = new THREE.WebGLRenderTarget(1024, 512, { type: THREE.HalfFloatType, depthBuffer: true });
  private readonly combined = new THREE.WebGLRenderTarget(1024, 512, { type: THREE.HalfFloatType, depthBuffer: true });
  private readonly caustics = new THREE.WebGLRenderTarget(512, 512, { type: THREE.HalfFloatType, depthBuffer: false });
  private readonly reflectionCamera = new THREE.PerspectiveCamera();
  private readonly causticScene = new THREE.Scene();
  private readonly causticCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly causticMaterial: THREE.ShaderMaterial;
  private simulation: WaterSimulation | null = null;
  private readonly receivers = new WaterReceiverRegistry();
  private material: THREE.ShaderMaterial;
  private scene: THREE.Scene | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private time = 0;
  private disposed = false;
  private debugMode = 0;
  private waterConfig: WatergliceConfig | null = null;
  private tuning: WaterTuning = { ...DEFAULT_WATER_TUNING };
  private passState = { reflection: false, refraction: false, caustics: false, combined: false };

  constructor() {
    this.refraction.depthTexture = new THREE.DepthTexture();
    this.refraction.depthTexture.type = THREE.UnsignedShortType;
    const waterVertex = vertexSource
      .replace(/^attribute vec3 position;\s*/, '')
      .replace('#include "transform.glsl"', transformSource)
      .replace('uniform vec3 eye;', 'uniform vec3 eye;\nuniform sampler2D waterSimulation;\nuniform sampler2D normalnoise;\nuniform float time;\nuniform float bigWaveHeight;\nuniform float bigWaveSpeed;\nuniform float bigWaveSize;\nuniform float smallWaveHeight;\nuniform float smallWaveSpeed;\nuniform float smallWaveSize;\nuniform mat4 reflectionViewProjection;')
      .replace('transform(position);', 'vec4 sim = texture2D(waterSimulation, position.xz + 0.5);\n  vec2 waveUv = (position.xz + vec2(time * 0.43, time * 0.39)) * 0.07;\n  vec4 waveNoise = texture2D(normalnoise, waveUv);\n  vec3 displaced = position;\n  displaced.y += sim.r * 18.0 + (waveNoise.r + waveNoise.g - 1.0) * 0.12;\n  transform(displaced);');
    const waterFragment = waterSource
      .replace('#include "sun.glsl"', sunSource)
      .replace('uniform float time;', 'uniform float time;\nuniform sampler2D causticTex;\nuniform sampler2D refractionDepth;\nuniform sampler2D waterSimulation;\nuniform float cameraNear;\nuniform float cameraFar;\nuniform float causticsStrength;\nuniform vec2 waterExtent;\nuniform mat4 reflectionViewProjection;\nuniform int debugMode;')
      .replace('vec2 reflectionUV = clamp(screenPosition+vec2(noise.x, noise.y*0.5)*0.05, vec2(0.01), vec2(0.99));', 'vec4 reflectionProjected = reflectionViewProjection * vec4(worldPosition, 1.0);\n  vec2 reflectionScreenPosition = ((reflectionProjected.xy / max(reflectionProjected.w, 0.0001)) + 1.0) * 0.5;\n  vec2 reflectionUV = clamp(reflectionScreenPosition + vec2(noise.x, noise.y*0.5)*0.05, vec2(0.01), vec2(0.99));')
      .replace('vec3 finalColor = mix(refractionColor*diffuseColor, reflectionSample*(diffuseColor+specularColor), reflectance);', 'vec3 finalColor = mix(refractionColor*diffuseColor, reflectionSample*(diffuseColor+specularColor), reflectance);\n  float caustic = texture2D(causticTex, worldPosition.xz * 0.002 + 0.5).r;\n  finalColor += caustic * vec3(0.08, 0.16, 0.18);\n  vec2 debugUv = clamp(worldPosition.xz * 0.0005 + 0.5, 0.0, 1.0);\n  if (debugMode == 1) finalColor = texture2D(waterSimulation, debugUv).rrr * 4.0;\n  if (debugMode == 2) finalColor = vec3(texture2D(waterSimulation, debugUv).ba * 0.5 + 0.5, 0.0);\n  if (debugMode == 3) finalColor = texture2D(reflection, screenPosition).rgb;\n  if (debugMode == 4) finalColor = texture2D(refraction, screenPosition).rgb;\n  if (debugMode == 5) finalColor = vec3(texture2D(refractionDepth, screenPosition).r);\n  if (debugMode == 6) finalColor = texture2D(causticTex, debugUv).rgb;')
      .replace('float caustic = texture2D(causticTex, worldPosition.xz * 0.002 + 0.5).r;', 'vec2 causticUv = worldPosition.xz / max(waterExtent, vec2(1.0)) + 0.5;\n  float caustic = texture2D(causticTex, causticUv).r;\n  float causticFade = smoothstep(1.0, 0.82, max(abs(causticUv.x - 0.5), abs(causticUv.y - 0.5)) * 2.0);')
      .replace('finalColor += caustic * vec3(0.08, 0.16, 0.18);', 'finalColor += vec3(0.0);')
      .replace('vec2 debugUv = clamp(worldPosition.xz * 0.0005 + 0.5, 0.0, 1.0);', 'vec2 debugUv = clamp(causticUv, 0.0, 1.0);')
      .replace('smoothstep(1.0, 0.82, max(abs(causticUv.x - 0.5), abs(causticUv.y - 0.5)) * 2.0)', '1.0 - smoothstep(0.82, 1.0, max(abs(causticUv.x - 0.5), abs(causticUv.y - 0.5)) * 2.0)')
      .replace('float waterDepth = max(min(refractionSample.a-depth, 40.0), 0.0);', 'float sampledDepth = texture2D(refractionDepth, screenPosition).r;\n  float z = sampledDepth * 2.0 - 1.0;\n  float sceneDistance = (2.0 * cameraNear * cameraFar) / max(cameraFar + cameraNear - z * (cameraFar - cameraNear), 0.0001);\n  float waterDepth = clamp(sceneDistance - depth, 0.0, 40.0);')
      .replace('vec3 surfaceNormal = normalize(vec3(0, 1, 0)+vec3(noise.x, 0, noise.y)*0.5);', 'vec4 surfaceInfo = texture2D(waterSimulation, clamp(worldPosition.xz / max(waterExtent, vec2(1.0)) + 0.5, 0.0, 1.0));\n  vec3 surfaceNormal = normalize(vec3(surfaceInfo.b, 1.0, surfaceInfo.a) + vec3(noise.x, 0.0, noise.y) * 0.5);')
      .replace('gl_FragColor = vec4(finalColor, depth);', 'gl_FragColor = vec4(finalColor, 1.0);');
    this.material = new THREE.ShaderMaterial({
      vertexShader: waterVertex,
      fragmentShader: waterFragment,
      transparent: false,
      depthWrite: true,
      side: THREE.DoubleSide,
      uniforms: {
        color: { value: new THREE.Color(0x051b32) },
        reflection: { value: this.reflection.texture },
        reflectionViewProjection: { value: new THREE.Matrix4() },
        refraction: { value: this.refraction.texture },
        refractionDepth: { value: this.refraction.depthTexture },
        causticTex: { value: this.caustics.texture },
        causticsStrength: { value: DEFAULT_WATER_TUNING.causticsStrength },
        waterExtent: { value: new THREE.Vector2(3500, 3500) },
        normalnoise: { value: null },
        eye: { value: new THREE.Vector3() },
        time: { value: 0 },
        modelTransform: { value: new THREE.Matrix4() },
        worldViewProjection: { value: new THREE.Matrix4() },
        sunColor: { value: new THREE.Color(0xffffff) },
        sunDirection: { value: new THREE.Vector3(0, 0.5, 1).normalize() },
        alpha: { value: 0.72 },
        waterSimulation: { value: null },
        bigWaveHeight: { value: DEFAULT_WATER_TUNING.bigWaveHeight },
        bigWaveSpeed: { value: DEFAULT_WATER_TUNING.bigWaveSpeed },
        bigWaveSize: { value: DEFAULT_WATER_TUNING.bigWaveSize },
        smallWaveHeight: { value: DEFAULT_WATER_TUNING.smallWaveHeight },
        smallWaveSpeed: { value: DEFAULT_WATER_TUNING.smallWaveSpeed },
        smallWaveSize: { value: DEFAULT_WATER_TUNING.smallWaveSize },
        cameraNear: { value: 0.1 },
        cameraFar: { value: 10000 },
        debugMode: { value: 0 },
      },
    });
    this.causticMaterial = new THREE.ShaderMaterial({
      vertexShader: `uniform sampler2D water; uniform vec3 light; varying vec3 oldPos; varying vec3 newPos; varying vec3 refractedRay; void main(){ vec2 uv=position.xy*0.5+0.5; vec4 info=texture2D(water,uv); vec2 slope=info.ba*0.5; vec3 normal=normalize(vec3(slope.x,1.0,slope.y)); vec3 refractedLight=refract(-normalize(light),vec3(0.0,1.0,0.0),1.0/1.333); refractedRay=refract(-normalize(light),normal,1.0/1.333); vec3 p0=position.xzy; vec3 p1=p0+vec3(0.0,info.r,0.0); float t0=(-p0.y-1.0)/refractedLight.y; float t1=(-p1.y-1.0)/refractedLight.y; oldPos=p0+refractedLight*t0; newPos=p1+refractedRay*t1; gl_Position=vec4(0.75*(newPos.xz+refractedLight.xz/refractedLight.y),0.0,1.0);}`,
      fragmentShader: `uniform sampler2D water; uniform vec3 light; varying vec3 oldPos; varying vec3 newPos; varying vec3 refractedRay; void main(){ vec3 refractedLight=refract(-normalize(light),vec3(0.0,1.0,0.0),1.0/1.333); float oldArea=max(length(dFdx(oldPos))*length(dFdy(oldPos)),1.0e-5); float newArea=max(length(dFdx(newPos))*length(dFdy(newPos)),1.0e-5); float intensity=clamp(oldArea/newArea*0.2,0.0,4.0); float shadow=1.0; gl_FragColor=vec4(intensity,shadow,0.0,1.0);}`,
      uniforms: { water: { value: null }, light: { value: new THREE.Vector3(0, 1, 0) } },
    });
    this.causticMaterial.side = THREE.DoubleSide;
    this.causticMaterial.extensions.derivatives = true;
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 200, 200), this.causticMaterial);
    this.causticScene.add(quad);
    // The ocean spans thousands of world units. A 100x100 grid makes each
    // displaced cell visibly larger than the voxel scene, producing the
    // square/pixelated wave artifacts seen at distance.
    const surfaceGeometry = new THREE.PlaneGeometry(1, 1, 512, 512);
    surfaceGeometry.rotateX(-Math.PI / 2);
    this.mesh = new THREE.Mesh(surfaceGeometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 10;
  }

  initialize(scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, config: WatergliceConfig): void {
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    const targetWidth = 1024;
    const targetHeight = Math.max(1, Math.round(targetWidth / Math.max(camera.aspect, 0.1)));
    this.reflection.setSize(targetWidth, targetHeight);
    this.refraction.setSize(targetWidth, targetHeight);
    this.combined.setSize(targetWidth, targetHeight);
    this.waterConfig = { ...config, extent: [...config.extent] as [number, number] };
    this.tuning = { ...DEFAULT_WATER_TUNING, oceanLevel: config.level };
    this.mesh.scale.set(
      Math.max(config.extent[0] * 40, 3500),
      1,
      Math.max(config.extent[1] * 40, 3500),
    );
    this.mesh.position.y = config.level;
    this.material.uniforms.color.value.set(config.color);
    this.material.uniforms.waterExtent.value.set(this.mesh.scale.x, this.mesh.scale.z);
    this.receivers.setExtent(this.material.uniforms.waterExtent.value);
    this.material.uniforms.alpha.value = config.opacity;
    let sun: THREE.DirectionalLight | null = null;
    scene.traverse(object => { if (!sun && object instanceof THREE.DirectionalLight) sun = object; });
    if (sun) {
      this.material.uniforms.sunColor.value.copy(sun.color).multiplyScalar(sun.intensity);
      this.material.uniforms.sunDirection.value.copy(sun.position).normalize();
      this.causticMaterial.uniforms.light.value.copy(sun.position).normalize();
    }
    const fallbackNoise = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1, THREE.RGBAFormat);
    fallbackNoise.wrapS = THREE.RepeatWrapping;
    fallbackNoise.wrapT = THREE.RepeatWrapping;
    fallbackNoise.needsUpdate = true;
    this.material.uniforms.normalnoise.value = fallbackNoise;
    new THREE.TextureLoader().load('/water/normalnoise.png', texture => {
      if (this.disposed) { texture.dispose(); return; }
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      this.material.uniforms.normalnoise.value = texture;
      fallbackNoise.dispose();
    });
    this.simulation = new WaterSimulation(renderer, 512);
    this.simulation.initialize();
    this.material.uniforms.waterSimulation.value = this.simulation.texture;
    this.causticMaterial.uniforms.water.value = this.simulation.texture;
    this.receivers.setLight(sun?.position ?? new THREE.Vector3(0.5, 1, 0.2));
    this.receivers.setCaustics(this.caustics.texture, config.level);
    this.receivers.setStrength(this.tuning.causticsStrength);
    this.receivers.registerScene(scene);
    this.simulation.setTuning(this.tuning);
    scene.add(this.mesh);
  }

  update(deltaSeconds: number): void {
    if (this.disposed || !this.scene || !this.renderer || !this.camera) return;
    this.passState = { reflection: false, refraction: false, caustics: false, combined: false };
    this.time += deltaSeconds;
    this.simulation?.step(deltaSeconds);
    this.receivers.registerScene(this.scene);
    if (this.simulation) {
      this.material.uniforms.waterSimulation.value = this.simulation.texture;
      this.causticMaterial.uniforms.water.value = this.simulation.texture;
    }
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.eye.value.setFromMatrixPosition(this.camera.matrixWorld);
    this.material.uniforms.cameraNear.value = this.camera.near;
    this.material.uniforms.cameraFar.value = this.camera.far;
    this.mesh.updateMatrixWorld(true);
    this.material.uniforms.modelTransform.value.copy(this.mesh.matrixWorld);
    this.camera.updateMatrixWorld();
    // Webglice keeps modelTransform separate from worldViewProjection. Do not
    // apply mesh.matrixWorld twice or the ocean is clipped out of view.
    this.material.uniforms.worldViewProjection.value.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
  }

  renderRefraction(): void {
    if (!this.camera) return;
    this.renderSceneTarget(this.refraction, this.camera);
    this.passState.refraction = true;
  }

  renderReflection(): void {
    if (this.camera) {
      this.reflectionCamera.copy(this.camera);
      this.reflectionCamera.position.y = 2 * this.mesh.position.y - this.camera.position.y;
      const direction = new THREE.Vector3();
      const up = this.camera.up.clone();
      this.camera.getWorldDirection(direction);
      direction.y *= -1;
      up.y *= -1;
      this.reflectionCamera.up.copy(up);
      this.reflectionCamera.aspect = this.reflection.width / Math.max(this.reflection.height, 1);
      this.reflectionCamera.lookAt(this.reflectionCamera.position.clone().add(direction));
      this.reflectionCamera.updateProjectionMatrix();
      this.reflectionCamera.updateMatrixWorld(true);
      this.material.uniforms.reflectionViewProjection.value.multiplyMatrices(
        this.reflectionCamera.projectionMatrix,
        this.reflectionCamera.matrixWorldInverse,
      );
    }
    this.renderSceneTarget(this.reflection, this.reflectionCamera);
    this.passState.reflection = true;
  }

  renderCaustics(): void {
    if (!this.renderer) return;
    const previousTarget = this.renderer.getRenderTarget();
    try {
      this.renderer.setRenderTarget(this.caustics);
      this.renderer.clear();
      this.renderer.render(this.causticScene, this.causticCamera);
    } finally {
      this.renderer.setRenderTarget(previousTarget);
    }
    this.passState.caustics = true;
  }

  renderSurface(): void {
    this.renderCombinedTarget();
    this.passState.combined = true;
  }

  resize(width: number, height: number, pixelRatio: number): void {
    const scale = Math.min(pixelRatio, 2);
    this.reflection.setSize(Math.max(1, Math.floor(width * scale * 0.5)), Math.max(1, Math.floor(height * scale * 0.5)));
    this.refraction.setSize(Math.max(1, Math.floor(width * scale * 0.5)), Math.max(1, Math.floor(height * scale * 0.5)));
    this.combined.setSize(Math.max(1, Math.floor(width * scale)), Math.max(1, Math.floor(height * scale)));
  }

  setFog(enabled: boolean): void { this.material.fog = enabled; this.material.needsUpdate = true; }

  setDebugMode(mode: number): void {
    this.debugMode = Math.max(0, Math.min(6, Math.floor(mode)));
    this.material.uniforms.debugMode.value = this.debugMode;
  }

  getTuning(): WaterTuning | null { return this.scene && this.simulation ? { ...this.tuning } : null; }

  setTuning(values: Partial<WaterTuning>): void {
    this.tuning = {
      oceanLevel: Math.max(-1000, Math.min(1000, values.oceanLevel ?? this.tuning.oceanLevel)),
      bigWaveHeight: Math.max(0, Math.min(5, values.bigWaveHeight ?? this.tuning.bigWaveHeight)),
      bigWaveSpeed: Math.max(0, Math.min(10, values.bigWaveSpeed ?? this.tuning.bigWaveSpeed)),
      bigWaveSize: Math.max(0.05, Math.min(30, values.bigWaveSize ?? this.tuning.bigWaveSize)),
      smallWaveHeight: Math.max(0, Math.min(2, values.smallWaveHeight ?? this.tuning.smallWaveHeight)),
      smallWaveSpeed: Math.max(0, Math.min(20, values.smallWaveSpeed ?? this.tuning.smallWaveSpeed)),
      smallWaveSize: Math.max(0.05, Math.min(60, values.smallWaveSize ?? this.tuning.smallWaveSize)),
      causticsStrength: Math.max(0, Math.min(5, values.causticsStrength ?? this.tuning.causticsStrength)),
    };
    this.mesh.position.y = this.tuning.oceanLevel;
    this.material.uniforms.bigWaveHeight.value = this.tuning.bigWaveHeight;
    this.material.uniforms.bigWaveSpeed.value = this.tuning.bigWaveSpeed;
    this.material.uniforms.bigWaveSize.value = this.tuning.bigWaveSize;
    this.material.uniforms.smallWaveHeight.value = this.tuning.smallWaveHeight;
    this.material.uniforms.smallWaveSpeed.value = this.tuning.smallWaveSpeed;
    this.material.uniforms.smallWaveSize.value = this.tuning.smallWaveSize;
    this.material.uniforms.causticsStrength.value = this.tuning.causticsStrength;
    this.simulation?.setTuning(this.tuning);
    this.receivers.setCaustics(this.caustics.texture, this.tuning.oceanLevel);
    this.receivers.setStrength(this.tuning.causticsStrength);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.scene) this.scene.remove(this.mesh);
    const noise = this.material.uniforms.normalnoise.value;
    if (noise instanceof THREE.Texture) noise.dispose();
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.causticScene.traverse(object => { if (object instanceof THREE.Mesh) object.geometry.dispose(); });
    this.causticMaterial.dispose();
    this.simulation?.dispose();
    this.waterConfig = null;
    this.reflection.dispose(); this.refraction.dispose(); this.combined.dispose(); this.caustics.dispose();
  }

  getDiagnostics(): Record<string, unknown> {
    return {
      initialized: !!this.scene && !!this.renderer && !!this.camera,
      disposed: this.disposed,
      meshVisible: this.mesh.visible,
      meshPosition: this.mesh.position.toArray(),
      meshScale: this.mesh.scale.toArray(),
      meshRenderOrder: this.mesh.renderOrder,
      simulationReady: !!this.simulation,
      simulation: this.simulation?.diagnostics() ?? null,
      simulationTextureDimensions: this.simulation ? [this.simulation.resolution, this.simulation.resolution] : null,
      passes: { ...this.passState },
      reflectionTarget: [this.reflection.width, this.reflection.height],
      refractionTarget: [this.refraction.width, this.refraction.height],
      combinedTarget: [this.combined.width, this.combined.height],
      causticsTarget: [this.caustics.width, this.caustics.height],
      reflectionCamera: this.reflectionCamera.position.toArray(),
      cameraPosition: this.camera?.position.toArray() ?? null,
      bloomTargetStatus: this.scene?.userData.composer ? 'SceneSetup.EffectComposer' : 'unavailable',
      receiverCount: this.receivers.count,
      debugMode: this.debugMode,
      waterLevel: this.waterConfig?.level ?? this.mesh.position.y,
      waterExtent: this.waterConfig?.extent ?? null,
      tuning: this.getTuning(),
    };
  }

  private renderSceneTarget(target: THREE.WebGLRenderTarget, camera: THREE.PerspectiveCamera): void {
    if (!this.renderer || !this.scene) return;
    const previousTarget = this.renderer.getRenderTarget();
    const previousVisible = this.mesh.visible;
    const previousClipping = this.renderer.clippingPlanes;
    const previousLocalClipping = this.renderer.localClippingEnabled;
    const isRefraction = target === this.refraction;
    const waterLevel = this.mesh.position.y;
    this.renderer.localClippingEnabled = true;
    this.renderer.clippingPlanes = [
      isRefraction
        ? new THREE.Plane(new THREE.Vector3(0, -1, 0), waterLevel)
        : new THREE.Plane(new THREE.Vector3(0, 1, 0), -waterLevel),
    ];
    try {
      this.mesh.visible = false;
      this.renderer.setRenderTarget(target);
      this.renderer.clear();
      this.renderer.render(this.scene, camera);
    } finally {
      this.renderer.setRenderTarget(previousTarget);
      this.mesh.visible = previousVisible;
      this.renderer.clippingPlanes = previousClipping;
      this.renderer.localClippingEnabled = previousLocalClipping;
    }
  }

  private renderCombinedTarget(): void {
    if (!this.renderer || !this.scene || !this.camera) return;
    const previousTarget = this.renderer.getRenderTarget();
    const previousVisible = this.mesh.visible;
    try {
      this.mesh.visible = true;
      this.renderer.setRenderTarget(this.combined);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    } finally {
      this.renderer.setRenderTarget(previousTarget);
      this.mesh.visible = previousVisible;
    }
  }
}

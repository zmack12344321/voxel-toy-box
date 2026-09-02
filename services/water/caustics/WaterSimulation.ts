import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import type { WaterTuning } from '../../types';

const simulationFragmentShader = `
uniform vec2 delta;
uniform float time;
uniform float bigWaveHeight;
uniform float bigWaveSpeed;
uniform float bigWaveSize;
uniform float smallWaveHeight;
uniform float smallWaveSpeed;
uniform float smallWaveSize;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 info = texture2D(water, uv);
  vec2 dx = vec2(delta.x, 0.0);
  vec2 dy = vec2(0.0, delta.y);
  float average = (
    texture2D(water, uv - dx).r + texture2D(water, uv - dy).r +
    texture2D(water, uv + dx).r + texture2D(water, uv + dy).r
  ) * 0.25;
  // Evan's heightfield integration, driven by spatial target waves.
  info.g += (average - info.r) * 0.08;
  float broadBig = sin((uv.x + uv.y) * bigWaveSize * 6.28318 + time * bigWaveSpeed);
  float broadSmall = sin((uv.x - uv.y) * smallWaveSize * 6.28318 + time * smallWaveSpeed);
  float targetHeight = broadBig * bigWaveHeight * 0.045 + broadSmall * smallWaveHeight * 0.018;
  info.g += (targetHeight - info.r) * 0.12;
  info.g *= 0.94;
  vec2 sourceA = vec2(0.34, 0.48) + vec2(sin(time * 0.21), cos(time * 0.17)) * 0.08;
  vec2 sourceB = vec2(0.68, 0.62) + vec2(cos(time * 0.16), sin(time * 0.19)) * 0.07;
  float pulseA = max(0.0, 1.0 - length(uv - sourceA) / max(bigWaveSize * 0.08, 0.002));
  float pulseB = max(0.0, 1.0 - length(uv - sourceB) / max(smallWaveSize * 0.025, 0.001));
  info.g += (pulseA * sin(time * bigWaveSpeed) * bigWaveHeight + pulseB * cos(time * smallWaveSpeed) * smallWaveHeight) * 0.018;
  info.g = clamp(info.g, -0.08, 0.08);
  info.r += info.g;
  info.r = clamp(info.r, -1.0, 1.0);
  float hX = texture2D(water, uv + dx).r - texture2D(water, uv - dx).r;
  float hY = texture2D(water, uv + dy).r - texture2D(water, uv - dy).r;
  vec3 normal = normalize(vec3(-hX, 1.0, -hY));
  info.ba = normal.xz;
  gl_FragColor = info;
}`;

const normalFragmentShader = `
uniform vec2 delta;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 info = texture2D(water, uv);
  vec3 dx = vec3(delta.x, texture2D(water, uv + vec2(delta.x, 0.0)).r - info.r, 0.0);
  vec3 dy = vec3(0.0, texture2D(water, uv + vec2(0.0, delta.y)).r - info.r, delta.y);
  info.ba = normalize(cross(dy, dx)).xz;
  gl_FragColor = info;
}`;

export class WaterSimulation {
  readonly resolution: number;
  private readonly computation: GPUComputationRenderer;
  private readonly variable: ReturnType<GPUComputationRenderer['addVariable']>;
  private initialized = false;
  private accumulator = 0;
  private lastStepCount = 0;
  private elapsed = 0;

  constructor(renderer: THREE.WebGLRenderer, resolution = 256) {
    this.resolution = resolution;
    this.computation = new GPUComputationRenderer(resolution, resolution, renderer);
    const initial = this.computation.createTexture();
    for (let i = 0; i < initial.image.data.length; i += 4) {
      initial.image.data[i] = 0;
      initial.image.data[i + 1] = 0;
      initial.image.data[i + 2] = 0;
      initial.image.data[i + 3] = 0;
    }
    this.variable = this.computation.addVariable('water', simulationFragmentShader, initial);
    this.variable.material.uniforms.delta = { value: new THREE.Vector2(1 / resolution, 1 / resolution) };
    this.variable.material.uniforms.time = { value: 0 };
    this.variable.material.uniforms.bigWaveHeight = { value: 1.2 };
    this.variable.material.uniforms.bigWaveSpeed = { value: 0.35 };
    this.variable.material.uniforms.bigWaveSize = { value: 2.2 };
    this.variable.material.uniforms.smallWaveHeight = { value: 0.25 };
    this.variable.material.uniforms.smallWaveSpeed = { value: 1.2 };
    this.variable.material.uniforms.smallWaveSize = { value: 7.5 };
    this.computation.setVariableDependencies(this.variable, [this.variable]);
    this.computation.setDataType(THREE.HalfFloatType);
  }

  setTuning(tuning: Pick<WaterTuning, 'bigWaveHeight' | 'bigWaveSpeed' | 'bigWaveSize' | 'smallWaveHeight' | 'smallWaveSpeed' | 'smallWaveSize'>): void {
    const uniforms = this.variable.material.uniforms;
    uniforms.bigWaveHeight.value = tuning.bigWaveHeight;
    uniforms.bigWaveSpeed.value = tuning.bigWaveSpeed;
    uniforms.bigWaveSize.value = tuning.bigWaveSize;
    uniforms.smallWaveHeight.value = tuning.smallWaveHeight;
    uniforms.smallWaveSpeed.value = tuning.smallWaveSpeed;
    uniforms.smallWaveSize.value = tuning.smallWaveSize;
  }

  initialize(): void {
    const error = this.computation.init();
    if (error) throw new Error(`Water simulation initialization failed: ${error}`);
    this.initialized = true;
  }

  step(deltaSeconds: number): void {
    if (!this.initialized) return;
    this.accumulator += Math.min(deltaSeconds, 0.1);
    this.elapsed += deltaSeconds;
    const fixedStep = 1 / 60;
    let steps = 0;
    while (this.accumulator >= fixedStep && steps < 4) {
      this.variable.material.uniforms.time.value += fixedStep;
      this.computation.compute();
      this.accumulator -= fixedStep;
      steps++;
    }
    this.lastStepCount = steps;
  }

  addDrop(x: number, y: number, radius: number, strength: number): void {
    if (!this.initialized) return;
    const shader = this.variable.material;
    const previous = shader.fragmentShader;
    shader.fragmentShader = `
      uniform vec2 center;
      uniform float radius;
      uniform float strength;
      ${previous.replace('void main()', 'void simulationMain()')}
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 info = texture2D(water, uv);
        float drop = max(0.0, 1.0 - length(center - uv) / radius);
        drop = 0.5 - cos(drop * 3.14159265) * 0.5;
        info.r += drop * strength;
        gl_FragColor = info;
      }`;
    shader.uniforms.center = { value: new THREE.Vector2(x, y) };
    shader.uniforms.radius = { value: radius };
    shader.uniforms.strength = { value: strength };
    this.computation.compute();
    shader.fragmentShader = previous;
  }

  get texture(): THREE.Texture {
    return this.computation.getCurrentRenderTarget(this.variable).texture;
  }

  dispose(): void {
    this.computation.dispose();
  }

  diagnostics(): { initialized: boolean; resolution: number; elapsed: number; lastStepCount: number; waveAmplitude: number; activeImpulseCount: number; heightRangeEstimate: [number, number] } {
    const uniforms = this.variable.material.uniforms;
    const amplitude = Number(uniforms.bigWaveHeight.value) * 0.045 + Number(uniforms.smallWaveHeight.value) * 0.018;
    return {
      initialized: this.initialized,
      resolution: this.resolution,
      elapsed: this.elapsed,
      lastStepCount: this.lastStepCount,
      waveAmplitude: amplitude,
      activeImpulseCount: this.initialized ? 2 : 0,
      heightRangeEstimate: [-amplitude * 6.0, amplitude * 6.0],
    };
  }
}

export { normalFragmentShader };

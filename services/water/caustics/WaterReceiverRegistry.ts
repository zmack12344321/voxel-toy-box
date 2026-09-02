import * as THREE from 'three';

export class WaterReceiverRegistry {
  private readonly materials = new Set<THREE.Material>();
  private texture: THREE.Texture | null = null;
  private level = 0;
  private light = new THREE.Vector3(0.5, 1, 0.2).normalize();
  private strength = 0.8;
  private extent = new THREE.Vector2(3500, 3500);
  private readonly compiledUniforms = new Set<{ waterLevel: { value: number }; waterCausticsStrength: { value: number }; waterExtent: { value: THREE.Vector2 } }>();

  get count(): number { return this.materials.size; }

  setCaustics(texture: THREE.Texture, level: number): void {
    this.texture = texture;
    this.level = level;
    this.compiledUniforms.forEach(uniforms => { uniforms.waterLevel.value = level; uniforms.waterExtent.value.copy(this.extent); });
  }

  setExtent(extent: THREE.Vector2): void {
    this.extent.copy(extent);
    this.compiledUniforms.forEach(uniforms => uniforms.waterExtent.value.copy(this.extent));
  }

  setLight(direction: THREE.Vector3): void { this.light.copy(direction).normalize(); }
  setStrength(value: number): void { this.strength = value; this.compiledUniforms.forEach(uniforms => { uniforms.waterCausticsStrength.value = value; }); }

  registerScene(scene: THREE.Scene): void {
    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const list = Array.isArray(object.material) ? object.material : [object.material];
      list.forEach(material => this.registerMaterial(material));
    });
  }

  private registerMaterial(material: THREE.Material): void {
    if (this.materials.has(material)) return;
    const standard = material as THREE.MeshStandardMaterial & { userData: { waterReceiverPatched?: boolean } };
    if (!('roughness' in standard) || standard.userData.waterReceiverPatched) return;
    const previous = material.onBeforeCompile;
    material.onBeforeCompile = (shader) => {
      previous?.(shader, null as unknown as THREE.WebGLRenderer);
      shader.uniforms.waterCaustics = { value: this.texture };
      shader.uniforms.waterCausticsStrength = { value: this.strength };
      shader.uniforms.waterLevel = { value: this.level };
      shader.uniforms.waterLight = { value: this.light.clone() };
      shader.uniforms.waterExtent = { value: this.extent.clone() };
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        'float waterMask = step(vWorldPosition.y, waterLevel);\n' +
        'vec3 waterRefractedLight = refract(-normalize(waterLight), vec3(0.0, 1.0, 0.0), 1.0 / 1.333);\n' +
        'vec2 projectedWaterPosition = vWorldPosition.xz - vWorldPosition.y * waterRefractedLight.xz / max(abs(waterRefractedLight.y), 0.001);\n' +
        'vec2 waterUv = projectedWaterPosition / max(waterExtent, vec2(1.0)) + 0.5;\n' +
        'float waterUvValid = step(0.0, waterUv.x) * step(0.0, waterUv.y) * step(waterUv.x, 1.0) * step(waterUv.y, 1.0);\n' +
        'float waterCaustic = texture2D(waterCaustics, clamp(waterUv, 0.0, 1.0)).r;\n' +
        'diffuseColor.rgb += waterCaustic * waterCausticsStrength * waterMask * waterUvValid * vec3(0.22, 0.42, 0.30);\n#include <dithering_fragment>'
      );
      shader.vertexShader = `varying vec3 vWorldPosition;\n${shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;')}`;
      shader.fragmentShader = `varying vec3 vWorldPosition;\nuniform sampler2D waterCaustics;\nuniform float waterCausticsStrength;\nuniform float waterLevel;\nuniform vec3 waterLight;\nuniform vec2 waterExtent;\n${shader.fragmentShader}`;
      this.compiledUniforms.add(shader.uniforms as unknown as { waterLevel: { value: number }; waterCausticsStrength: { value: number }; waterExtent: { value: THREE.Vector2 } });
    };
    material.customProgramCacheKey = () => 'water-receiver';
    standard.userData.waterReceiverPatched = true;
    this.materials.add(material);
  }

}

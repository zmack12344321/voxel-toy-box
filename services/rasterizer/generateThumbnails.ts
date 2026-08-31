/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ModelRegistry } from '../../models/registry';
import { VoxelMesher } from '../VoxelMesher';
import { VoxelData } from '../../types';

export interface ThumbnailRenderOptions {
  width?: number;
  height?: number;
  backgroundColor?: number;
}

/**
 * Render a 3D Voxel Model into a Data URL (PNG image)
 */
export function renderVoxelThumbnailDataUrl(
  voxels: VoxelData[],
  options: ThumbnailRenderOptions = {}
): string {
  const width = options.width || 256;
  const height = options.height || 256;

  // Create offscreen canvas & WebGL renderer
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(1);
  renderer.setClearColor(options.backgroundColor || 0x000000, 0);

  // Create 3D Scene
  const scene = new THREE.Scene();

  // Studio Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
  mainLight.position.set(20, 30, 20);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0x90caf9, 0.5);
  fillLight.position.set(-20, -10, -20);
  scene.add(fillLight);

  // Generate Voxel Mesh
  const meshResult = VoxelMesher.buildMergedMesh(voxels);
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.35,
    metalness: 0.1,
  });
  const mesh = new THREE.Mesh(meshResult.geometry, material);
  scene.add(mesh);

  // Calculate Bounding Box to Center Camera
  meshResult.geometry.computeBoundingBox();
  const box = meshResult.geometry.boundingBox || new THREE.Box3();
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  mesh.position.sub(center);

  // Isometric Camera Setup
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = 45;
  const cameraDistance = (maxDim / (2 * Math.tan((Math.PI * fov) / 360))) * 1.5;

  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
  camera.position.set(cameraDistance, cameraDistance * 0.85, cameraDistance);
  camera.lookAt(0, 0, 0);

  // Render Frame
  renderer.render(scene, camera);
  const dataUrl = canvas.toDataURL('image/png');

  // Clean up WebGL resources
  meshResult.geometry.dispose();
  material.dispose();
  renderer.dispose();

  return dataUrl;
}

/**
 * Batch generate thumbnails for all registered preset models.
 * Downloads a ZIP or individual PNG files for placement into public/thumbnails/
 */
export async function batchGenerateAllPresetsThumbnails(): Promise<Record<string, string>> {
  const presets = ModelRegistry.getAllPresets();
  const thumbnailMap: Record<string, string> = {};

  for (const preset of presets) {
    const voxels = preset.generate();
    const dataUrl = renderVoxelThumbnailDataUrl(voxels, { width: 256, height: 256 });
    thumbnailMap[preset.id] = dataUrl;

    // Trigger individual PNG download for developer ease
    const link = document.createElement('a');
    link.download = `${preset.id}.png`;
    link.href = dataUrl;
    link.click();
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log('[ThumbnailGenerator] Successfully generated thumbnails for all models:', Object.keys(thumbnailMap));
  return thumbnailMap;
}

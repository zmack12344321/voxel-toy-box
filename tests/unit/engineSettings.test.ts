import { describe, expect, it } from 'vitest';
import { EngineSettings } from '../../services/runtime/EngineSettings';
import { RenderMode } from '../../types';

describe('EngineSettings', () => {
  it('clamps marching resolution to supported bounds', () => {
    const settings = new EngineSettings();
    expect(settings.setMarchingResolution(2)).toBe(8);
    expect(settings.setMarchingResolution(100)).toBe(64);
    expect(settings.setMarchingResolution(23.7)).toBe(24);
  });

  it('clamps smoothness and voxel spacing', () => {
    const settings = new EngineSettings();
    expect(settings.setMarchingSmoothness(-1)).toBe(0);
    expect(settings.setMarchingSmoothness(2)).toBe(1);
    expect(settings.setVoxelSpacing(0)).toBe(1);
    expect(settings.setVoxelSpacing(4)).toBe(3);
    expect(settings.setMarchingResolution(Number.NaN)).toBe(42);
    expect(settings.setMarchingSmoothness(Number.NaN)).toBe(1);
    expect(settings.setVoxelSpacing(Number.NaN)).toBe(3);
  });

  it('keeps render flags behind explicit setters', () => {
    const settings = new EngineSettings();
    expect(settings.setRenderMode(RenderMode.MERGED_VOXEL)).toBe(RenderMode.MERGED_VOXEL);
    expect(settings.setWireframe(true)).toBe(true);
    expect(settings.setShadows(true)).toBe(true);
    expect(settings.renderMode).toBe(RenderMode.MERGED_VOXEL);
    expect(settings.wireframe).toBe(true);
    expect(settings.shadows).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { ModelRegistry } from '../../models/registry';

describe('ModelRegistry', () => {
  it('keeps session presets separate from shipped presets', () => {
    const shipped = ModelRegistry.getAllPresets().length;
    const preset = ModelRegistry.createCustomPreset('test model', [{ x: 0, y: 0, z: 0, color: 0xffffff }]);
    expect(ModelRegistry.getAllPresets()).toHaveLength(shipped + 1);
    expect(ModelRegistry.getPresetById(preset.id)).toBe(preset);
    expect(ModelRegistry.getPresetsByCategory().objects).toContain(preset);
  });

  it('snapshots custom voxel data at registration', () => {
    const source = [{ x: 1, y: 2, z: 3, color: 0xffffff }];
    const preset = ModelRegistry.createCustomPreset('snapshot model', source);
    source[0].x = 99;
    const generated = preset.generate();
    generated[0].x = 77;
    expect(preset.generate()[0].x).toBe(1);
  });

  it('preserves custom scene metadata when registered as a preset', () => {
    const water = { level: 0, extent: [10, 10] as [number, number], color: 0x336699, opacity: 0.8 };
    const preset = ModelRegistry.createCustomPreset(
      'animated lake',
      [{ x: 0, y: 0, z: 0, color: 0xffffff }],
      'objects',
      {
        water,
        animatedEntities: [{
          id: 'fish',
          speed: 0.1,
          waypoints: [[0, 1, 0], [2, 1, 0]],
          voxels: [{ x: 0, y: 0, z: 0, color: 0xff0000 }],
        }],
      },
    );

    expect(preset.scene?.water?.level).toBe(0);
    expect(preset.scene?.animatedEntities?.[0].id).toBe('fish');
    water.extent[0] = 99;
    expect(preset.scene?.water?.extent[0]).toBe(10);
    preset.scene!.data[0].x = 99;
    expect(preset.generate()[0].x).toBe(0);
  });
});

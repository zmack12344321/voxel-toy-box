import { describe, expect, it } from 'vitest';
import { ModelCatalogService } from '../../services/application/ModelCatalogService';

describe('ModelCatalogService', () => {
  it('lists and resolves shipped presets through the application boundary', () => {
    const catalog = new ModelCatalogService();
    const presets = catalog.listPresets();

    expect(presets.length).toBeGreaterThan(0);
    expect(catalog.findPresetById('eagle')?.name).toBe('Majestic Eagle');
  });

  it('registers custom scenes without exposing registry storage', () => {
    const catalog = new ModelCatalogService();
    const preset = catalog.registerCustomPreset(
      'catalog lake',
      { data: [{ x: 0, y: 0, z: 0, color: 0xffffff }], water: null },
    );

    expect(catalog.findPresetById(preset.id)).toBe(preset);
    expect(preset.scene?.water).toBeNull();
  });
});

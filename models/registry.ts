/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { ModelPreset, ModelCategory } from './types';
import { EaglePreset } from './presets/eagle';
import { CatPreset } from './presets/cat';
import { RabbitPreset } from './presets/rabbit';
import { TwinsPreset } from './presets/twins';
import { CastlePreset } from './presets/castle';
import { RobotPreset } from './presets/robot';
import { SpaceshipPreset } from './presets/spaceship';
import { VoxelData } from '../types';
import { CATALOG_RECIPES } from './catalog/recipes';
import { compileDeclarativePayload } from '../services/rasterizer/index';

function initializePresetMap(): Map<string, ModelPreset> {
  const map = new Map<string, ModelPreset>([
    [EaglePreset.id, EaglePreset],
    [CatPreset.id, CatPreset],
    [RabbitPreset.id, RabbitPreset],
    [CastlePreset.id, CastlePreset],
    [RobotPreset.id, RobotPreset],
    [SpaceshipPreset.id, SpaceshipPreset],
    [TwinsPreset.id, TwinsPreset],
  ]);

  CATALOG_RECIPES.forEach(recipe => {
    let cat: ModelCategory = 'objects';
    if (recipe.category === 'architecture') cat = 'architecture';
    else if (recipe.category === 'creatures') cat = 'creatures';
    else if (recipe.category === 'scifi_mech' || recipe.category === 'vehicles') cat = 'scifi_mech';

    const colors = Object.values(recipe.palette).map(p => typeof p === 'string' ? p : p.color).slice(0, 5);

    const preset: ModelPreset = {
      id: `cat_${recipe.id}`,
      name: recipe.name,
      category: cat,
      description: recipe.description,
      tags: recipe.tags,
      iconName: cat === 'architecture' ? 'Castle' : (cat === 'creatures' ? 'Bird' : 'Sparkles'),
      palettePreview: colors,
      generate: () => compileDeclarativePayload(recipe).voxels
    };
    map.set(preset.id, preset);
  });

  return map;
}

export class ModelRegistry {
  private static presets: Map<string, ModelPreset> = initializePresetMap();

  /**
   * Returns all available preset models.
   */
  public static getAllPresets(): ModelPreset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Returns a preset by ID.
   */
  public static getPresetById(id: string): ModelPreset | undefined {
    return this.presets.get(id);
  }

  /**
   * Returns presets grouped by category.
   */
  public static getPresetsByCategory(): Record<ModelCategory, ModelPreset[]> {
    const grouped: Record<ModelCategory, ModelPreset[]> = {
      creatures: [],
      scifi_mech: [],
      architecture: [],
      objects: []
    };

    this.presets.forEach(preset => {
      if (grouped[preset.category]) {
        grouped[preset.category].push(preset);
      }
    });

    return grouped;
  }

  /**
   * Registers a dynamic / custom preset at runtime.
   */
  public static registerPreset(preset: ModelPreset): void {
    this.presets.set(preset.id, preset);
  }

  /**
   * Creates a ModelPreset from raw VoxelData.
   */
  public static createCustomPreset(name: string, data: VoxelData[], category: ModelCategory = 'objects'): ModelPreset {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Extract unique colors for palette preview
    const colors = Array.from(new Set(data.map(v => '#' + v.color.toString(16).padStart(6, '0')))).slice(0, 5);

    const newPreset: ModelPreset = {
      id,
      name,
      category,
      description: `Custom model with ${data.length} voxels.`,
      tags: ['custom', 'user-created'],
      iconName: 'Sparkles',
      palettePreview: colors.length > 0 ? colors : ['#3B82F6', '#10B981'],
      generate: () => data
    };

    this.registerPreset(newPreset);
    return newPreset;
  }
}

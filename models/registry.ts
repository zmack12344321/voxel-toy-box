/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { ModelPreset, ModelCategory } from './types';
import { ScenePayload, VoxelData } from '../types';
import { createStaticPresetCatalog } from './catalog/staticCatalog';

export class ModelRegistry {
  private static readonly staticPresets: Map<string, ModelPreset> = createStaticPresetCatalog();
  private static readonly sessionPresets = new Map<string, ModelPreset>();

  /**
   * Returns all available preset models.
   */
  public static getAllPresets(): ModelPreset[] {
    return [...this.staticPresets.values(), ...this.sessionPresets.values()];
  }

  /**
   * Returns a preset by ID.
   */
  public static getPresetById(id: string): ModelPreset | undefined {
    return this.staticPresets.get(id) ?? this.sessionPresets.get(id);
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

    [...this.staticPresets.values(), ...this.sessionPresets.values()].forEach(preset => {
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
    this.sessionPresets.set(preset.id, preset);
  }

  /**
   * Creates a ModelPreset from raw VoxelData.
   */
  public static createCustomPreset(
    name: string,
    data: VoxelData[],
    category: ModelCategory = 'objects',
    scene?: Omit<ScenePayload, 'data'>,
  ): ModelPreset {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const snapshot = data.map(voxel => ({ ...voxel }));
    const sceneSnapshot: ScenePayload | undefined = scene ? {
      data: snapshot.map(voxel => ({ ...voxel })),
      water: scene.water ? {
        ...scene.water,
        extent: [...scene.water.extent] as [number, number],
      } : null,
      animatedEntities: scene.animatedEntities?.map(entity => ({
        ...entity,
        waypoints: entity.waypoints.map(point => [...point] as [number, number, number]),
        voxels: entity.voxels.map(voxel => ({ ...voxel })),
      })),
    } : undefined;
    
    // Extract unique colors for palette preview
    const colors = Array.from(new Set(snapshot.map(v => '#' + v.color.toString(16).padStart(6, '0')))).slice(0, 5);

    const newPreset: ModelPreset = {
      id,
      name,
      category,
      description: `Custom model with ${snapshot.length} voxels.`,
      tags: ['custom', 'user-created'],
      iconName: 'Sparkles',
      palettePreview: colors.length > 0 ? colors : ['#3B82F6', '#10B981'],
      scene: sceneSnapshot,
      generate: () => snapshot.map(voxel => ({ ...voxel }))
    };

    this.registerPreset(newPreset);
    return newPreset;
  }
}

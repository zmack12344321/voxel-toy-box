/** Builds the immutable shipped preset catalog. */
import { ModelPreset, ModelCategory } from '../types';
import { EaglePreset } from '../presets/eagle';
import { CatPreset } from '../presets/cat';
import { RabbitPreset } from '../presets/rabbit';
import { TwinsPreset } from '../presets/twins';
import { CastlePreset } from '../presets/castle';
import { RobotPreset } from '../presets/robot';
import { SpaceshipPreset } from '../presets/spaceship';
import { TropicalIslandPreset } from '../presets/tropicalIsland';
import { CATALOG_RECIPES } from './recipes';
import { compileSceneSpec } from '../../services/rasterizer/index';

export function createStaticPresetCatalog(): Map<string, ModelPreset> {
  const map = new Map<string, ModelPreset>([
    [EaglePreset.id, EaglePreset], [CatPreset.id, CatPreset], [RabbitPreset.id, RabbitPreset],
    [CastlePreset.id, CastlePreset], [RobotPreset.id, RobotPreset], [SpaceshipPreset.id, SpaceshipPreset],
    [TwinsPreset.id, TwinsPreset], [TropicalIslandPreset.id, TropicalIslandPreset],
  ]);

  CATALOG_RECIPES.forEach(recipe => {
    let category: ModelCategory = 'objects';
    if (recipe.category === 'architecture') category = 'architecture';
    else if (recipe.category === 'creatures') category = 'creatures';
    else if (recipe.category === 'scifi_mech' || recipe.category === 'vehicles') category = 'scifi_mech';

    const palettePreview = Object.values(recipe.palette)
      .map(entry => typeof entry === 'string' ? entry : entry.color).slice(0, 5);
    const preset: ModelPreset = {
      id: `cat_${recipe.id}`,
      name: recipe.name,
      category,
      description: recipe.description,
      tags: recipe.tags,
      iconName: category === 'architecture' ? 'Castle' : category === 'creatures' ? 'Bird' : 'Sparkles',
      palettePreview,
      sceneSpec: { model: recipe },
      generate: () => compileSceneSpec({ model: recipe }).voxels,
    };
    map.set(preset.id, preset);
  });
  return map;
}

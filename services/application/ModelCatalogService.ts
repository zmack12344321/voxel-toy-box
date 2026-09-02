import type { ModelCategory, ModelPreset } from '../../models/types';
import type { ScenePayload } from '../../types';
import { ModelRegistry } from '../../models/registry';

/** Application-facing catalog operations. Keeps registry storage out of UI state. */
export class ModelCatalogService {
  public listPresets(): ModelPreset[] {
    return ModelRegistry.getAllPresets();
  }

  public findPresetById(id: string): ModelPreset | undefined {
    return ModelRegistry.getPresetById(id);
  }

  public registerCustomPreset(name: string, payload: ScenePayload, category?: ModelCategory): ModelPreset {
    return ModelRegistry.createCustomPreset(name, payload.data, category, payload);
  }
}

export const modelCatalogService = new ModelCatalogService();

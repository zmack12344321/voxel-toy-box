import type { AnimatedEntity, ScenePayload, SceneWater, VoxelData } from '../../types';
import { GeminiVoxelService, type GenerationOptions } from '../ai/GeminiVoxelService';
import { sceneController } from './SceneController';
import type { SceneRuntime } from './contracts';

export interface GeneratedModel {
  name: string;
  data: VoxelData[];
  water: SceneWater | null;
  animatedEntities?: AnimatedEntity[];
}

export function toScenePayload(result: GeneratedModel): ScenePayload {
  return {
    data: result.data,
    water: result.water,
    animatedEntities: result.animatedEntities,
  };
}

export type GenerationTarget = Pick<
  SceneRuntime,
  'getUniqueColors' | 'loadModel' | 'rebuild' | 'loadAnimatedEntities'
> & Partial<Pick<SceneRuntime, 'loadScene' | 'rebuildScene'>>;

export type GenerateModel = (options: GenerationOptions) => Promise<GeneratedModel>;

export interface GenerateAndApplyOptions {
  prompt: string;
  mode: 'create' | 'morph';
  detailLevel?: 'masterpiece' | 'detailed' | 'classic';
  currentVoxelCount: number;
}

export class GenerationService {
  constructor(private readonly generateModel: GenerateModel, private readonly target: GenerationTarget) {}

  async generateAndApply(options: GenerateAndApplyOptions): Promise<GeneratedModel> {
    const result = await this.generateModel({
      prompt: options.prompt,
      mode: options.mode,
      detailLevel: options.detailLevel,
      availableColors: this.target.getUniqueColors(),
      currentVolumeEstimate: options.currentVoxelCount > 0 ? options.currentVoxelCount : 800,
    });
    const scene = toScenePayload(result);
    if (options.mode === 'create') {
      if (this.target.loadScene) this.target.loadScene(scene);
      else {
        this.target.loadModel(result.data, result.water);
        this.target.loadAnimatedEntities(result.animatedEntities ?? []);
      }
    } else if (this.target.rebuildScene) {
      this.target.rebuildScene(scene);
    } else {
      this.target.rebuild(result.data, result.water);
      this.target.loadAnimatedEntities(result.animatedEntities ?? []);
    }
    return result;
  }
}

export const generationService = new GenerationService(
  (options) => GeminiVoxelService.generateModel(options),
  sceneController,
);

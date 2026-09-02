/**
 * Zustand store for UI / modal / model-library state.
 * Model actions dispatch through application services so components do not own
 * renderer or generation dependencies.
 */
import { create } from 'zustand';
import { SavedModel, VoxelData } from '../types';
import { ModelPreset } from '../models/types';
import { useEngineStore } from './useEngineStore';
import { generationService, modelCatalogService, sceneController } from '../services/application';
import { parseVoxelJson } from '../services/VoxelUtils';

interface UIStore {
  presets: ModelPreset[];
  currentBaseModel: string;
  customBuilds: SavedModel[];
  customRebuilds: SavedModel[];
  isModelLibraryOpen: boolean;
  isJsonModalOpen: boolean;
  jsonModalMode: 'view' | 'import';
  isPromptModalOpen: boolean;
  promptMode: 'create' | 'morph';
  showWelcome: boolean;
  jsonData: string;

  // Actions — preset / model
  loadPresets: () => void;
  selectPreset: (preset: ModelPreset) => void;
  selectPresetById: (id: string) => void;
  rebuildPreset: (preset: ModelPreset) => void;
  selectCustomBuild: (model: SavedModel) => void;
  selectCustomRebuild: (model: SavedModel) => void;
  addCustomBuild: (model: SavedModel) => void;
  addCustomRebuild: (model: SavedModel) => void;
  setCurrentBaseModel: (name: string) => void;

  // Actions — JSON import
  importJson: (jsonStr: string) => void;
  showJsonModal: () => void;

  // Actions — AI prompt
  submitPrompt: (prompt: string, detailLevel?: 'masterpiece' | 'detailed' | 'classic') => Promise<void>;

  // Actions — UI toggles
  setModelLibraryOpen: (v: boolean) => void;
  setJsonModalOpen: (v: boolean) => void;
  openJsonModal: (mode: 'view' | 'import') => void;
  setPromptModalOpen: (v: boolean) => void;
  setPromptMode: (mode: 'create' | 'morph') => void;
  setShowWelcome: (v: boolean) => void;
  setJsonData: (data: string) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  presets: [],
  currentBaseModel: 'Majestic Eagle',
  customBuilds: [],
  customRebuilds: [],
  isModelLibraryOpen: false,
  isJsonModalOpen: false,
  jsonModalMode: 'view',
  isPromptModalOpen: false,
  promptMode: 'create',
  showWelcome: false,
  jsonData: '',

  loadPresets: () => set({ presets: modelCatalogService.listPresets() }),

  selectPreset: (preset) => {
    console.log(`[UIStore] Selecting preset: ${preset.name}`);
    if (preset.recipe) {
      sceneController.loadDeclarativePayload(preset.recipe);
    } else if (preset.sceneSpec) {
      sceneController.loadSceneSpec(preset.sceneSpec);
    } else if (preset.scene) {
      sceneController.loadScene(preset.scene);
    } else {
      const data = preset.generate();
      sceneController.loadModel(data);
    }
    set({ currentBaseModel: preset.name });
  },

  selectPresetById: (id) => {
    const preset = modelCatalogService.findPresetById(id);
    if (preset) get().selectPreset(preset);
  },

  rebuildPreset: (preset) => {
    console.log(`[UIStore] Rebuilding preset into: ${preset.name}`);
    if (preset.recipe) sceneController.rebuildDeclarativePayload(preset.recipe);
    else if (preset.sceneSpec) sceneController.rebuildSceneSpec(preset.sceneSpec);
    else if (preset.scene) sceneController.rebuildScene(preset.scene);
    else sceneController.rebuild(preset.generate());
    set({ currentBaseModel: preset.name });
  },

  selectCustomBuild: (model) => {
    console.log(`[UIStore] Selecting custom build: ${model.name}`);
    sceneController.loadScene({ data: model.data, water: model.water, animatedEntities: model.animatedEntities });
    set({ currentBaseModel: model.name });
  },

  selectCustomRebuild: (model) => {
    console.log(`[UIStore] Selecting custom rebuild: ${model.name}`);
    sceneController.rebuildScene({ data: model.data, water: model.water, animatedEntities: model.animatedEntities });
    set({ currentBaseModel: model.name });
  },

  addCustomBuild: (model) =>
    set((s) => ({ customBuilds: [...s.customBuilds, model] })),

  addCustomRebuild: (model) =>
    set((s) => ({ customRebuilds: [...s.customRebuilds, model] })),

  setCurrentBaseModel: (name) => set({ currentBaseModel: name }),

  importJson: (jsonStr: string) => {
    try {
      const voxelData: VoxelData[] = parseVoxelJson(jsonStr);

      sceneController.loadModel(voxelData);
      const customName = `Imported Build (${voxelData.length} voxels)`;
      set({ currentBaseModel: customName });
      modelCatalogService.registerCustomPreset(customName, { data: voxelData });
      get().loadPresets();
      get().addCustomBuild({ name: customName, data: voxelData });
    } catch (e) {
      console.error('Failed to import JSON', e);
      alert('Failed to import JSON. Please ensure the format is correct (Array of {x, y, z, color}).');
    }
  },

  showJsonModal: () => {
    const data = sceneController.getJsonData();
    set({ jsonData: data, isJsonModalOpen: true, jsonModalMode: 'view' });
  },

  submitPrompt: async (prompt, detailLevel) => {
    const { promptMode, currentBaseModel } = get();

    useEngineStore.getState().setIsGenerating(true);
    set({ isPromptModalOpen: false });

    try {
      const currentVoxelCount = useEngineStore.getState().voxelCount;
      const result = await generationService.generateAndApply({
        prompt,
        mode: promptMode,
        detailLevel,
        currentVoxelCount,
      });

      if (promptMode === 'create') {
        set({ currentBaseModel: result.name });
        get().addCustomBuild({
          name: result.name,
          data: result.data,
          water: result.water,
          animatedEntities: result.animatedEntities,
          prompt,
        });
      modelCatalogService.registerCustomPreset(result.name, {
        data: result.data,
        water: result.water,
        animatedEntities: result.animatedEntities,
      });
        get().loadPresets();
      } else {
        set({ currentBaseModel: result.name });
        get().addCustomRebuild({
          name: result.name,
          data: result.data,
          water: result.water,
          animatedEntities: result.animatedEntities,
          baseModel: currentBaseModel,
          prompt,
        });
      }
    } catch (err: unknown) {
      console.error('Model generation failed:', err);
      const message = err instanceof Error ? err.message : 'Please try again.';
      alert(`Model generation encountered an issue: ${message}`);
    } finally {
      useEngineStore.getState().setIsGenerating(false);
    }
  },

  setModelLibraryOpen: (isModelLibraryOpen) => set({ isModelLibraryOpen }),
  setJsonModalOpen: (isJsonModalOpen) => set({ isJsonModalOpen }),
  openJsonModal: (mode) => set({ isJsonModalOpen: true, jsonModalMode: mode }),
  setPromptModalOpen: (isPromptModalOpen) => set({ isPromptModalOpen }),
  setPromptMode: (promptMode) => set({ promptMode }),
  setShowWelcome: (showWelcome) => set({ showWelcome }),
  setJsonData: (jsonData) => set({ jsonData }),
}));

/**
 * Zustand store for UI / modal / model-library state.
 * Engine actions that affect model state (load, rebuild, prompt, import) live here
 * so components can call them without prop-drilling.
 */
import { create } from 'zustand';
import { SavedModel, VoxelData } from '../types';
import { ModelPreset } from '../models/types';
import { ModelRegistry } from '../models/registry';
import { useEngineStore } from './useEngineStore';
import { GeminiVoxelService } from '../services/GeminiVoxelService';

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

const eng = () => useEngineStore.getState().engine;

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

  loadPresets: () => set({ presets: ModelRegistry.getAllPresets() }),

  selectPreset: (preset) => {
    console.log(`[UIStore] Selecting preset: ${preset.name}`);
    const data = preset.generate();
    eng()?.loadInitialModel(data);
    set({ currentBaseModel: preset.name });
  },

  rebuildPreset: (preset) => {
    console.log(`[UIStore] Rebuilding preset into: ${preset.name}`);
    const data = preset.generate();
    eng()?.rebuild(data);
    set({ currentBaseModel: preset.name });
  },

  selectCustomBuild: (model) => {
    console.log(`[UIStore] Selecting custom build: ${model.name}`);
    eng()?.loadInitialModel(model.data);
    set({ currentBaseModel: model.name });
  },

  selectCustomRebuild: (model) => {
    console.log(`[UIStore] Selecting custom rebuild: ${model.name}`);
    eng()?.rebuild(model.data);
    set({ currentBaseModel: model.name });
  },

  addCustomBuild: (model) =>
    set((s) => ({ customBuilds: [...s.customBuilds, model] })),

  addCustomRebuild: (model) =>
    set((s) => ({ customRebuilds: [...s.customRebuilds, model] })),

  setCurrentBaseModel: (name) => set({ currentBaseModel: name }),

  importJson: (jsonStr: string) => {
    try {
      const rawData = JSON.parse(jsonStr);
      if (!Array.isArray(rawData)) throw new Error('JSON must be an array');

      const voxelData: VoxelData[] = rawData.map((v: any) => {
        let colorVal = v.c || v.color;
        let colorInt = 0xCCCCCC;

        if (typeof colorVal === 'string') {
          if (colorVal.startsWith('#')) colorVal = colorVal.substring(1);
          colorInt = parseInt(colorVal, 16);
        } else if (typeof colorVal === 'number') {
          colorInt = colorVal;
        }

        return {
          x: Number(v.x) || 0,
          y: Number(v.y) || 0,
          z: Number(v.z) || 0,
          color: isNaN(colorInt) ? 0xCCCCCC : colorInt,
        };
      });

      eng()?.loadInitialModel(voxelData);
      const customName = `Imported Build (${voxelData.length} voxels)`;
      set({ currentBaseModel: customName });
      ModelRegistry.createCustomPreset(customName, voxelData);
      get().loadPresets();
      get().addCustomBuild({ name: customName, data: voxelData });
    } catch (e) {
      console.error('Failed to import JSON', e);
      alert('Failed to import JSON. Please ensure the format is correct (Array of {x, y, z, color}).');
    }
  },

  showJsonModal: () => {
    const data = eng()?.getJsonData() ?? '';
    set({ jsonData: data, isJsonModalOpen: true, jsonModalMode: 'view' });
  },

  submitPrompt: async (prompt, detailLevel) => {
    const { promptMode, currentBaseModel } = get();

    useEngineStore.getState().setIsGenerating(true);
    set({ isPromptModalOpen: false });

    try {
      const availableColors = eng()?.getUniqueColors() ?? [];
      const currentVoxelCount = useEngineStore.getState().voxelCount;
      const currentVolumeEstimate = currentVoxelCount > 0 ? currentVoxelCount : 800;

      const result = await GeminiVoxelService.generateModel({
        prompt,
        mode: promptMode,
        detailLevel,
        availableColors,
        currentVolumeEstimate,
      });

      if (promptMode === 'create') {
        eng()?.loadInitialModel(result.data, result.water);
        set({ currentBaseModel: result.name });
        get().addCustomBuild({ name: result.name, data: result.data });
        ModelRegistry.createCustomPreset(result.name, result.data);
        get().loadPresets();
      } else {
        eng()?.rebuild(result.data, result.water);
        set({ currentBaseModel: result.name });
        get().addCustomRebuild({ name: result.name, data: result.data, baseModel: currentBaseModel });
      }
    } catch (err: any) {
      console.error('Model generation failed:', err);
      alert(`Model generation encountered an issue: ${err?.message || 'Please try again.'}`);
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

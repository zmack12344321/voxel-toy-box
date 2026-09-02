/**
 * Zustand store for observable engine state. Scene actions belong to SceneController.
 */
import { create } from 'zustand';
import { AppState, MeshStats } from '../types';

interface EngineState {
  appState: AppState;
  voxelCount: number;
  meshStats: MeshStats | null;
  isGenerating: boolean;

  setAppState: (state: AppState) => void;
  setVoxelCount: (count: number) => void;
  setMeshStats: (stats: MeshStats) => void;
  setIsGenerating: (g: boolean) => void;
}

export const useEngineStore = create<EngineState>((set) => ({
  appState: AppState.STABLE,
  voxelCount: 0,
  meshStats: null,
  isGenerating: false,

  setAppState: (appState) => set({ appState }),
  setVoxelCount: (voxelCount) => set({ voxelCount }),
  setMeshStats: (meshStats) => set({ meshStats }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}));

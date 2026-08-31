/**
 * Zustand store for engine state and the VoxelEngine instance reference.
 * Actions that call engine methods live here so components don't need the ref.
 */
import { create } from 'zustand';
import { AppState, MeshStats } from '../types';
import type { VoxelEngine } from '../services/VoxelEngine';

interface EngineState {
  engine: VoxelEngine | null;
  appState: AppState;
  voxelCount: number;
  meshStats: MeshStats | null;
  isGenerating: boolean;

  setEngine: (engine: VoxelEngine) => void;
  setAppState: (state: AppState) => void;
  setVoxelCount: (count: number) => void;
  setMeshStats: (stats: MeshStats) => void;
  setIsGenerating: (g: boolean) => void;
}

export const useEngineStore = create<EngineState>((set) => ({
  engine: null,
  appState: AppState.STABLE,
  voxelCount: 0,
  meshStats: null,
  isGenerating: false,

  setEngine: (engine) => set({ engine }),
  setAppState: (appState) => set({ appState }),
  setVoxelCount: (voxelCount) => set({ voxelCount }),
  setMeshStats: (meshStats) => set({ meshStats }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}));

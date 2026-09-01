/**
 * Zustand store for scene settings.
 * Each toggle/action reads the engine from useEngineStore and calls the
 * corresponding VoxelEngine method, then updates local state.
 */
import { create } from 'zustand';
import { SceneSettings, SceneTheme, RenderMode } from '../types';
import { useEngineStore } from './useEngineStore';

const DEFAULTS: SceneSettings = {
  autoRotate: false,
  fog: false,
  gridFloor: false,
  groundPlane: false,
  shadows: false,
  wireframe: false,
  theme: 'light',
  renderMode: RenderMode.INDIVIDUAL_CUBES,
  marchingResolution: 42,
  marchingSmoothness: 0.3,
  voxelDensity: 1.0,
  voxelSpacing: 1.0,
};

interface SceneStore extends SceneSettings {
  toggleAutoRotate: () => void;
  toggleFog: () => void;
  toggleGridFloor: () => void;
  toggleGroundPlane: () => void;
  toggleShadows: () => void;
  toggleWireframe: () => void;
  setTheme: (theme: SceneTheme) => void;
  setRenderMode: (mode: RenderMode) => void;
  setMarchingSmoothness: (v: number) => void;
  setMarchingResolution: (v: number) => void;
  setVoxelDensity: (v: number) => void;
  setVoxelSpacing: (v: number) => void;
}

const engine = () => useEngineStore.getState().engine;

export const useSceneStore = create<SceneStore>((set) => ({
  ...DEFAULTS,

  toggleAutoRotate: () =>
    set((s) => {
      const next = !s.autoRotate;
      console.log(`[SceneStore] toggleAutoRotate -> ${next}`);
      engine()?.setAutoRotate(next);
      return { autoRotate: next };
    }),

  toggleFog: () =>
    set((s) => {
      const next = !s.fog;
      console.log(`[SceneStore] toggleFog -> ${next}`);
      engine()?.setFog(next);
      return { fog: next };
    }),

  toggleGridFloor: () =>
    set((s) => {
      const next = !s.gridFloor;
      console.log(`[SceneStore] toggleGridFloor -> ${next}`);
      engine()?.setGridFloor(next);
      return { gridFloor: next };
    }),

  toggleGroundPlane: () =>
    set((s) => {
      const next = !s.groundPlane;
      console.log(`[SceneStore] toggleGroundPlane -> ${next}`);
      engine()?.setGroundPlane(next);
      return { groundPlane: next };
    }),

  toggleShadows: () =>
    set((s) => {
      const next = !s.shadows;
      console.log(`[SceneStore] toggleShadows -> ${next}`);
      engine()?.setShadows(next);
      return { shadows: next };
    }),

  toggleWireframe: () =>
    set((s) => {
      const next = !s.wireframe;
      console.log(`[SceneStore] toggleWireframe -> ${next}`);
      engine()?.setWireframe(next);
      return { wireframe: next };
    }),

  setTheme: (theme) =>
    set(() => {
      console.log(`[SceneStore] setTheme -> ${theme}`);
      engine()?.setTheme(theme);
      return { theme };
    }),

  setRenderMode: (renderMode) =>
    set(() => {
      console.log(`[SceneStore] setRenderMode -> ${renderMode}`);
      engine()?.setRenderMode(renderMode);
      return { renderMode };
    }),

  setMarchingSmoothness: (marchingSmoothness) =>
    set(() => {
      console.log(`[SceneStore] setMarchingSmoothness -> ${marchingSmoothness}`);
      engine()?.setMarchingSmoothness(marchingSmoothness);
      return { marchingSmoothness };
    }),

  setMarchingResolution: (marchingResolution) =>
    set(() => {
      console.log(`[SceneStore] setMarchingResolution -> ${marchingResolution}`);
      engine()?.setMarchingResolution(marchingResolution);
      return { marchingResolution };
    }),

  setVoxelDensity: (voxelDensity) =>
    set(() => {
      console.log(`[SceneStore] setVoxelDensity -> ${voxelDensity}`);
      engine()?.setVoxelDensity(voxelDensity);
      return { voxelDensity };
    }),

  setVoxelSpacing: (voxelSpacing) =>
    set(() => {
      console.log(`[SceneStore] setVoxelSpacing -> ${voxelSpacing}`);
      engine()?.setVoxelSpacing(voxelSpacing);
      return { voxelSpacing };
    }),
}));

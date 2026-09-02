/**
 * Zustand store for scene settings.
 * Scene settings update local state and delegate runtime changes through SceneController.
 */
import { create } from 'zustand';
import { SceneSettings, SceneTheme, RenderMode, WaterTuning } from '../types';
import { sceneController } from '../services/application';

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
  waterTuning: { oceanLevel: 0, bigWaveHeight: 1.2, bigWaveSpeed: 0.35, bigWaveSize: 2.2, smallWaveHeight: 0.25, smallWaveSpeed: 1.2, smallWaveSize: 7.5, causticsStrength: 0.8 },
};
const DEFAULT_WATER_TUNING = DEFAULTS.waterTuning;

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
  setWaterTuning: (values: Partial<WaterTuning>) => void;
  resetWaterTuning: () => void;
}

export const useSceneStore = create<SceneStore>((set) => ({
  ...DEFAULTS,

  toggleAutoRotate: () =>
    set((s) => {
      const next = !s.autoRotate;
      console.log(`[SceneStore] toggleAutoRotate -> ${next}`);
      sceneController.setAutoRotate(next);
      return { autoRotate: next };
    }),

  toggleFog: () =>
    set((s) => {
      const next = !s.fog;
      console.log(`[SceneStore] toggleFog -> ${next}`);
      sceneController.setFog(next);
      return { fog: next };
    }),

  toggleGridFloor: () =>
    set((s) => {
      const next = !s.gridFloor;
      console.log(`[SceneStore] toggleGridFloor -> ${next}`);
      sceneController.setGridFloor(next);
      return { gridFloor: next };
    }),

  toggleGroundPlane: () =>
    set((s) => {
      const next = !s.groundPlane;
      console.log(`[SceneStore] toggleGroundPlane -> ${next}`);
      sceneController.setGroundPlane(next);
      return { groundPlane: next };
    }),

  toggleShadows: () =>
    set((s) => {
      const next = !s.shadows;
      console.log(`[SceneStore] toggleShadows -> ${next}`);
      sceneController.setShadows(next);
      return { shadows: next };
    }),

  toggleWireframe: () =>
    set((s) => {
      const next = !s.wireframe;
      console.log(`[SceneStore] toggleWireframe -> ${next}`);
      sceneController.setWireframe(next);
      return { wireframe: next };
    }),

  setTheme: (theme) =>
    set(() => {
      console.log(`[SceneStore] setTheme -> ${theme}`);
      sceneController.setTheme(theme);
      return { theme };
    }),

  setRenderMode: (renderMode) =>
    set(() => {
      console.log(`[SceneStore] setRenderMode -> ${renderMode}`);
      sceneController.setRenderMode(renderMode);
      return { renderMode };
    }),

  setMarchingSmoothness: (marchingSmoothness) =>
    set(() => {
      console.log(`[SceneStore] setMarchingSmoothness -> ${marchingSmoothness}`);
      sceneController.setMarchingSmoothness(marchingSmoothness);
      return { marchingSmoothness };
    }),

  setMarchingResolution: (marchingResolution) =>
    set(() => {
      console.log(`[SceneStore] setMarchingResolution -> ${marchingResolution}`);
      sceneController.setMarchingResolution(marchingResolution);
      return { marchingResolution };
    }),

  setVoxelDensity: (voxelDensity) =>
    set(() => {
      console.log(`[SceneStore] setVoxelDensity -> ${voxelDensity}`);
      sceneController.setVoxelDensity(voxelDensity);
      return { voxelDensity };
    }),

  setVoxelSpacing: (voxelSpacing) =>
    set(() => {
      console.log(`[SceneStore] setVoxelSpacing -> ${voxelSpacing}`);
      sceneController.setVoxelSpacing(voxelSpacing);
      return { voxelSpacing };
    }),
  setWaterTuning: (values) =>
    set((s) => {
      const waterTuning = { ...s.waterTuning, ...values };
      sceneController.setWaterTuning(values);
      return { waterTuning };
    }),
  resetWaterTuning: () => {
    set({ waterTuning: { ...DEFAULT_WATER_TUNING } });
  },
}));

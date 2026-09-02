/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { VoxelEngine } from './services/VoxelEngine';
import { UIOverlay } from './components/hud';
import { BottomPromptBar } from './components/hud/BottomPromptBar';
import { ModelLibraryDrawer } from './components/library';
import { JsonModal, PromptModal } from './components/modals';
import { useEngineStore, useUIStore } from './store';
import { modelCatalogService, sceneController } from './services/application';

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const setAppState = useEngineStore((s) => s.setAppState);
  const setVoxelCount = useEngineStore((s) => s.setVoxelCount);
  const setMeshStats = useEngineStore((s) => s.setMeshStats);

  useEffect(() => {
    useUIStore.getState().loadPresets();

    if (!containerRef.current) return;

    const engine = new VoxelEngine(
      containerRef.current,
      setAppState,
      setVoxelCount,
      setMeshStats,
    );
    sceneController.attach(engine);

    // Initial model: Eagle
    const initialPreset = modelCatalogService.findPresetById('eagle') ?? modelCatalogService.listPresets()[0];
    if (initialPreset) {
      useUIStore.getState().selectPreset(initialPreset);
    }

    return () => {
      sceneController.cleanup();
      sceneController.detach();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#f0f2f5] overflow-hidden select-none">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      <UIOverlay />
      <BottomPromptBar />
      <ModelLibraryDrawer />
      <JsonModal />
      <PromptModal />
    </div>
  );
};

export default App;

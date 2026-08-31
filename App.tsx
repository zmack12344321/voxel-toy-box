/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { VoxelEngine } from './services/VoxelEngine';
import { UIOverlay } from './components/UIOverlay';
import { ModelLibraryDrawer } from './components/ModelLibraryDrawer';
import { JsonModal } from './components/JsonModal';
import { PromptModal } from './components/PromptModal';
import { ModelRegistry } from './models/registry';
import { useEngineStore, useUIStore } from './store';

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const setEngine = useEngineStore((s) => s.setEngine);
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
    setEngine(engine);

    // Initial model: Eagle
    const initialPreset = ModelRegistry.getPresetById('eagle') ?? ModelRegistry.getAllPresets()[0];
    if (initialPreset) {
      engine.loadInitialModel(initialPreset.generate());
      useUIStore.getState().setCurrentBaseModel(initialPreset.name);
    }

    const handleResize = () => engine.handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.cleanup();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#f0f2f5] overflow-hidden select-none">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      <UIOverlay />
      <ModelLibraryDrawer />
      <JsonModal />
      <PromptModal />
    </div>
  );
};

export default App;

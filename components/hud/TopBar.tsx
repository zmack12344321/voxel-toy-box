/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Box, Wand2, FileJson, Info, Sparkles, Play, Pause,
  CloudFog, Grid, Layers, Sun, Focus, Library, SlidersHorizontal
} from 'lucide-react';
import {
  FloatingDropdown,
  DropdownItem,
  DropdownToggleItem,
  DropdownSubHeading,
  DropdownDivider,
} from '../ui/dropdown';
import { TactileButton } from '../ui/buttons';
import { ModelStatusBadge } from './ModelStatusBadge';
import { GuideModal } from '../modals/guide/GuideModal';
import { useEngineStore, useSceneStore, useUIStore } from '../../store';

export const TopBar: React.FC = () => {
  const voxelCount = useEngineStore((s) => s.voxelCount);
  const meshStats = useEngineStore((s) => s.meshStats);
  const scene = useSceneStore();
  const ui = useUIStore();

  const handleResetCamera = () => {
    console.log('[TopBar] Reset camera clicked');
    useEngineStore.getState().engine?.resetCamera();
  };

  const handleShowJson = () => {
    ui.showJsonModal();
  };

  return (
    <>
      <header className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none font-sans">
        {/* Left Side: Model Library and Status Badge */}
        <div className="pointer-events-auto flex items-center gap-2">
          <TactileButton
            onClick={() => ui.setModelLibraryOpen(true)}
            color="indigo"
            icon={<Library size={18} strokeWidth={2.5} />}
            label="Model Library"
          />

          <ModelStatusBadge
            baseModel={ui.currentBaseModel}
            voxelCount={voxelCount}
            meshStats={meshStats}
            renderMode={scene.renderMode}
          />
        </div>

        {/* Right Side: Icon-Only Play Button, Guide Button, Scene Options, Reset View, Export JSON */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Icon-Only Play / Pause Button */}
          <TactileButton
            onClick={scene.toggleAutoRotate}
            color={scene.autoRotate ? "indigo" : "slate"}
            icon={scene.autoRotate ? <Pause size={18} strokeWidth={2.5} /> : <Play size={18} strokeWidth={2.5} />}
          />

          {/* Guide Button without Carrot Icon */}
          <TactileButton
            onClick={() => ui.setShowWelcome(true)}
            color={ui.showWelcome ? 'indigo' : 'slate'}
            icon={<Info size={18} strokeWidth={2.5} />}
            label="Guide"
          />

          {/* Scene Options Dropdown Menu */}
          <FloatingDropdown 
            icon={<SlidersHorizontal size={18} strokeWidth={2.5} />}
            label="Scene Options"
            color="slate"
            align="right"
            menuWidth="w-80"
          >
            <DropdownSubHeading label="ENVIRONMENT & EFFECTS" />

            <DropdownToggleItem 
              icon={<CloudFog size={16} />}
              label="Atmospheric Fog"
              checked={scene.fog}
              onChange={scene.toggleFog}
            />

            <DropdownToggleItem 
              icon={<Grid size={16} />}
              label="Grid Floor"
              checked={scene.gridFloor}
              onChange={scene.toggleGridFloor}
            />

            <DropdownToggleItem 
              icon={<Layers size={16} />}
              label="Ground Platform"
              checked={scene.groundPlane}
              onChange={scene.toggleGroundPlane}
            />

            <DropdownToggleItem 
              icon={<Sun size={16} />}
              label="Realtime Shadows"
              checked={scene.shadows}
              onChange={scene.toggleShadows}
            />

            <DropdownToggleItem 
              icon={<Box size={16} />}
              label="Wireframe Mesh"
              checked={scene.wireframe}
              onChange={scene.toggleWireframe}
            />

            <DropdownDivider />

            <DropdownSubHeading label="SCENE BACKDROP" />
            
            <DropdownItem onClick={() => scene.setTheme('light')} icon={<Sun size={16} />} label="Clean Light" colorSwatch="#f0f2f5" active={scene.theme === 'light'} />
            <DropdownItem onClick={() => scene.setTheme('studio')} icon={<Box size={16} />} label="Pure Studio" colorSwatch="#ffffff" active={scene.theme === 'studio'} />
            <DropdownItem onClick={() => scene.setTheme('dark')} icon={<CloudFog size={16} />} label="Midnight Dark" colorSwatch="#0f172a" active={scene.theme === 'dark'} />
            <DropdownItem onClick={() => scene.setTheme('dusk')} icon={<Sparkles size={16} />} label="Twilight Dusk" colorSwatch="#1e1b4b" active={scene.theme === 'dusk'} />
          </FloatingDropdown>

          <TactileButton
            onClick={handleResetCamera}
            color="slate"
            icon={<Focus size={18} strokeWidth={2.5} />}
            label="Reset View"
          />

          <TactileButton
            onClick={handleShowJson}
            color="slate"
            icon={<FileJson size={18} strokeWidth={2.5} />}
            label="JSON / Export"
          />
        </div>
      </header>
    </>
  );
};

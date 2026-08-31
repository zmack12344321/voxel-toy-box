/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Box, Bird, Cat, Rabbit, Users, Castle, Bot, Rocket,
  Sparkles, Code2, Wand2, FileJson, History, Play, Pause, Info,
  TreePine, Shield, SlidersHorizontal, CloudFog, Grid, Layers, Sun, Focus, RotateCw
} from 'lucide-react';
import { RenderMode } from '../../types';
import {
  FloatingDropdown,
  DropdownItem,
  DropdownToggleItem,
  DropdownSectionHeader,
  DropdownSubHeading,
  DropdownDivider,
} from '../ui/FloatingDropdown';
import { TactileButton } from '../ui/Buttons';
import { THEME_SURFACES } from '../../theme/system';
import { useEngineStore, useSceneStore, useUIStore } from '../../store';

const renderIcon = (iconName: string, size = 18) => {
  switch (iconName) {
    case 'Bird': return <Bird size={size} />;
    case 'Cat': return <Cat size={size} />;
    case 'Rabbit': return <Rabbit size={size} />;
    case 'Users': return <Users size={size} />;
    case 'Castle': return <Castle size={size} />;
    case 'Bot': return <Bot size={size} />;
    case 'Rocket': return <Rocket size={size} />;
    case 'TreePine': return <TreePine size={size} />;
    case 'Shield': return <Shield size={size} />;
    default: return <Sparkles size={size} />;
  }
};

const categories = [
  { key: 'creatures', label: 'Creatures & Wildlife' },
  { key: 'scifi_mech', label: 'Sci-Fi & Mech' },
  { key: 'architecture', label: 'Architecture & Keeps' },
];

export const TopBar: React.FC = () => {
  const voxelCount = useEngineStore((s) => s.voxelCount);
  const meshStats = useEngineStore((s) => s.meshStats);
  const scene = useSceneStore();
  const ui = useUIStore();

  const handleImportClick = () => {
    ui.openJsonModal('import');
  };

  const handleResetCamera = () => {
    console.log('[TopBar] Reset camera clicked');
    useEngineStore.getState().engine?.resetCamera();
  };

  const handleShowJson = () => {
    ui.showJsonModal();
  };

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-40">
      
      {/* Global Scene Controls */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Model Library Dropdown Menu */}
        <FloatingDropdown 
          icon={<Box size={18} strokeWidth={2.5} />}
          label="Model Library"
          color="slate"
          menuWidth="w-72"
        >
          <DropdownSectionHeader 
            title="Model Library" 
            subtitle="Presets & AI" 
          />

          <DropdownItem onClick={() => { ui.setPromptMode('create'); ui.setPromptModalOpen(true); }} icon={<Wand2 size={16}/>} label="AI Sculpt (New 3D Model)" highlight />
          <DropdownDivider />

          {/* Categorized Presets */}
          {categories.map(cat => {
            const catPresets = ui.presets.filter(p => p.category === cat.key);
            if (catPresets.length === 0) return null;
            return (
              <React.Fragment key={cat.key}>
                <DropdownSubHeading label={cat.label} />
                {catPresets.map(preset => (
                  <DropdownItem 
                    key={preset.id} 
                    onClick={() => ui.selectPreset(preset)} 
                    icon={renderIcon(preset.iconName, 16)} 
                    label={preset.name}
                    palettePreview={preset.palettePreview}
                  />
                ))}
                <DropdownDivider />
              </React.Fragment>
            );
          })}
          
          {/* Custom Builds */}
          {ui.customBuilds.length > 0 && (
            <>
              <DropdownSubHeading label="YOUR AI CREATIONS" />
              {ui.customBuilds.map((model, idx) => (
                <DropdownItem 
                  key={`build-${idx}`} 
                  onClick={() => ui.selectCustomBuild(model)} 
                  icon={<History size={16}/>} 
                  label={model.name} 
                  truncate
                />
              ))}
              <DropdownDivider />
            </>
          )}

          <DropdownItem onClick={handleImportClick} icon={<FileJson size={16}/>} label="Import Custom JSON" />
        </FloatingDropdown>

        {/* Current Model Status Tag */}
        <div className={`flex items-center gap-2 px-3.5 py-3 ${THEME_SURFACES.tactilePill}`}>
          <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Model:</span>
          <span className="text-slate-900 font-extrabold max-w-[130px] truncate">{ui.currentBaseModel}</span>
          <span className="text-xs font-mono font-black text-slate-700 bg-white/80 px-2 py-0.5 rounded-lg border border-black/5">
            {voxelCount.toLocaleString()} voxels
          </span>
          {meshStats && (
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
              scene.renderMode === RenderMode.MERGED_VOXEL 
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : scene.renderMode === RenderMode.SMOOTH_MARCHING
                ? 'text-purple-700 bg-purple-50 border-purple-200'
                : 'text-amber-700 bg-amber-50 border-amber-200'
            }`}>
              {meshStats.triangleCount.toLocaleString()} tris
              {meshStats.savingsPercentage > 0 && ` (-${meshStats.savingsPercentage}%)`}
            </span>
          )}
        </div>
      </div>

      {/* Utilities */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Guide Dropdown Menu */}
        <FloatingDropdown 
          icon={<Info size={18} strokeWidth={2.5} />}
          label="Guide"
          color={ui.showWelcome ? 'indigo' : 'slate'}
          align="right"
          menuWidth="w-80"
          isOpen={ui.showWelcome}
          onOpenChange={(open) => {
            if (open !== ui.showWelcome) {
              ui.setShowWelcome(open);
            }
          }}
        >
          <DropdownSectionHeader 
            title="Voxel Engine Guide" 
            subtitle="Interactive Controls" 
          />

          <DropdownItem 
            onClick={() => { ui.setPromptMode('create'); ui.setPromptModalOpen(true); }}
            icon={<Wand2 size={16} />} 
            label="AI Prompt Sculptor" 
            sublabel="Generate 3D voxel models with Gemini 3.7"
            highlight
            badge="AI"
          />

          <DropdownDivider />

          <DropdownSubHeading label="NAVIGATION & CAMERA" />
          <DropdownItem icon={<RotateCw size={16} />} label="Orbit & Rotate" sublabel="Left-click and drag across viewport" badge="Rotate" />
          <DropdownItem icon={<Focus size={16} />} label="Pan & Zoom" sublabel="Right-click to pan • Scroll to zoom" badge="Pan/Zoom" />

          <DropdownDivider />

          <DropdownSubHeading label="SCENE & DISPLAY" />
          <DropdownItem icon={<SlidersHorizontal size={16} />} label="Scene & Lighting" sublabel="Configure fog, shadows, ground & dark mode" badge="Display" />
        </FloatingDropdown>

        <TactileButton
          onClick={scene.toggleAutoRotate}
          color={scene.autoRotate ? 'sky' : 'slate'}
          icon={scene.autoRotate ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          label={scene.autoRotate ? "Pause Orbit" : "Play Orbit"}
          compact
        />

        {/* Scene Options Dropdown Menu */}
        <FloatingDropdown 
          icon={<SlidersHorizontal size={18} strokeWidth={2.5} />}
          label="Scene Options"
          color="slate"
          align="right"
          menuWidth="w-80"
        >
          <DropdownSectionHeader title="Scene Options" subtitle="Rendering & Mesh Mode" />

          <DropdownSubHeading label="MESH & GEOMETRY STYLE" />

          <DropdownItem 
            onClick={() => scene.setRenderMode(RenderMode.MERGED_VOXEL)}
            icon={<Layers size={16} />}
            label="Merged Seamless Voxels"
            sublabel="Culls interior faces, eliminates gaps, saves up to 75% polygons"
            active={scene.renderMode === RenderMode.MERGED_VOXEL}
            badge="Zero Gaps"
          />

          <DropdownItem 
            onClick={() => scene.setRenderMode(RenderMode.INDIVIDUAL_CUBES)}
            icon={<Box size={16} />}
            label="Segmented Classic Cubes"
            sublabel="Discrete blocks with visible spacing seams"
            active={scene.renderMode === RenderMode.INDIVIDUAL_CUBES}
            badge="Gaps Visible"
          />

          <DropdownItem 
            onClick={() => scene.setRenderMode(RenderMode.SMOOTH_MARCHING)}
            icon={<Sparkles size={16} />}
            label="Smooth Surface Mesh"
            sublabel="Beveled & curved organic surface on clean merged model"
            active={scene.renderMode === RenderMode.SMOOTH_MARCHING}
            badge="Smooth"
          />

          <DropdownDivider />

          <DropdownSubHeading label="ENVIRONMENT & EFFECTS" />

          <DropdownToggleItem 
            icon={<CloudFog size={16} />}
            label="Atmospheric Fog"
            sublabel="Depth haze & distance fading"
            checked={scene.fog}
            onChange={scene.toggleFog}
          />

          <DropdownToggleItem 
            icon={<Grid size={16} />}
            label="Grid Floor"
            sublabel="Ground coordinate helper lines"
            checked={scene.gridFloor}
            onChange={scene.toggleGridFloor}
          />

          <DropdownToggleItem 
            icon={<Layers size={16} />}
            label="Ground Platform"
            sublabel="Shadow receiving ground plane"
            checked={scene.groundPlane}
            onChange={scene.toggleGroundPlane}
          />

          <DropdownToggleItem 
            icon={<Sun size={16} />}
            label="Realtime Shadows"
            sublabel="Directional soft shadow map"
            checked={scene.shadows}
            onChange={scene.toggleShadows}
          />

          <DropdownToggleItem 
            icon={<Box size={16} />}
            label="Wireframe Mesh"
            sublabel="Display voxel edge contours"
            checked={scene.wireframe}
            onChange={scene.toggleWireframe}
          />

          <DropdownDivider />

          <DropdownSubHeading label="SCENE BACKDROP" />
          
          <DropdownItem onClick={() => scene.setTheme('light')} icon={<Sun size={16} />} label="Clean Light" colorSwatch="#f0f2f5" active={scene.theme === 'light'} />
          <DropdownItem onClick={() => scene.setTheme('studio')} icon={<Box size={16} />} label="Pure Studio" colorSwatch="#ffffff" active={scene.theme === 'studio'} />
          <DropdownItem onClick={() => scene.setTheme('dark')} icon={<CloudFog size={16} />} label="Midnight Dark" colorSwatch="#0f172a" active={scene.theme === 'dark'} />
          <DropdownItem onClick={() => scene.setTheme('dusk')} icon={<Sparkles size={16} />} label="Twilight Dusk" colorSwatch="#1e1b4b" active={scene.theme === 'dusk'} />

          <DropdownDivider />

          <DropdownSubHeading label="CAMERA ACTIONS" />
          <DropdownItem onClick={handleResetCamera} icon={<Focus size={16} />} label="Reset & Center View" badge="Autofocus" />
        </FloatingDropdown>

        <TactileButton
          onClick={handleShowJson}
          color="slate"
          icon={<Code2 size={18} strokeWidth={2.5} />}
          label="JSON / Export"
        />
      </div>
    </div>
  );
};

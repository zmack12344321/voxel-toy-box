/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Hammer, Wrench, Wand2, History, Bird, Cat, Rabbit, Users, Castle, Bot, Rocket, TreePine, Shield, Sparkles } from 'lucide-react';
import { AppState } from '../../types';
import { useEngineStore, useUIStore } from '../../store';
import { BigActionButton } from '../ui/Buttons';
import { FloatingDropdown, DropdownItem, DropdownDivider, DropdownSubHeading } from '../ui/FloatingDropdown';

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

export const BottomBar: React.FC = () => {
  const appState = useEngineStore((s) => s.appState);
  const isGenerating = useEngineStore((s) => s.isGenerating);
  const engine = useEngineStore((s) => s.engine);
  const ui = useUIStore();

  const isStable = appState === AppState.STABLE;
  const isDismantling = appState === AppState.DISMANTLING;

  const handleDismantle = () => {
    console.log('[BottomBar] BREAK BLOCKS clicked');
    engine?.dismantle();
  };

  return (
    <div className="absolute bottom-8 left-0 w-full flex justify-center items-end pointer-events-none z-30">
      <div className="pointer-events-auto transition-all duration-500 ease-in-out transform">
        
        {/* STATE 1: STABLE -> DISMANTLE */}
        {isStable && (
          <div className="animate-in slide-in-from-bottom-10 fade-in duration-300">
            <BigActionButton 
              onClick={handleDismantle} 
              icon={<Hammer size={34} strokeWidth={2.5} />} 
              label="BREAK BLOCKS" 
              color="rose" 
            />
          </div>
        )}

        {/* STATE 2: DISMANTLED -> REBUILD */}
        {isDismantling && !isGenerating && (
          <div className="flex items-end gap-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <FloatingDropdown 
              icon={<Wrench size={24} />}
              label="Rebuild Into..."
              color="emerald"
              direction="up"
              big
            >
              <DropdownItem onClick={() => { ui.setPromptMode('morph'); ui.setPromptModalOpen(true); }} icon={<Wand2 size={18}/>} label="AI Morph into anything..." highlight />
              <DropdownDivider />

              {/* Preset Rebuilds */}
              <DropdownSubHeading label="PRESET SCULPTURES" />
              {ui.presets.map(preset => (
                <DropdownItem 
                  key={`rebuild-preset-${preset.id}`}
                  onClick={() => ui.rebuildPreset(preset)}
                  icon={renderIcon(preset.iconName, 18)}
                  label={preset.name}
                  palettePreview={preset.palettePreview}
                />
              ))}

              {/* Custom Rebuilds */}
              {ui.customRebuilds.length > 0 && (
                <>
                  <DropdownDivider />
                  <DropdownSubHeading label="SAVED REBUILDS" />
                  {ui.customRebuilds.map((model, idx) => (
                    <DropdownItem 
                      key={`rebuild-custom-${idx}`} 
                      onClick={() => ui.selectCustomRebuild(model)} 
                      icon={<History size={18}/>} 
                      label={model.name} 
                      truncate 
                    />
                  ))}
                </>
              )}
            </FloatingDropdown>
          </div>
        )}
      </div>
    </div>
  );
};

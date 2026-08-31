/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wrench, Wand2, History } from 'lucide-react';
import { useUIStore } from '../../store';
import { FloatingDropdown, DropdownItem, DropdownDivider, DropdownSubHeading } from '../ui/dropdown';
import { IconRenderer } from '../ui/IconRenderer';

export const RebuildMenu: React.FC = () => {
  const ui = useUIStore();

  return (
    <FloatingDropdown 
      icon={<Wrench size={24} />}
      label="Rebuild Into..."
      color="emerald"
      direction="up"
      big
    >
      <DropdownItem 
        onClick={() => { ui.setPromptMode('morph'); ui.setPromptModalOpen(true); }} 
        icon={<Wand2 size={18}/>} 
        label="AI Morph into anything..." 
        highlight 
      />
      <DropdownDivider />

      {/* Preset Rebuilds */}
      <DropdownSubHeading label="PRESET SCULPTURES" />
      {ui.presets.map(preset => (
        <DropdownItem 
          key={`rebuild-preset-${preset.id}`}
          onClick={() => ui.rebuildPreset(preset)}
          icon={<IconRenderer name={preset.iconName} size={18} />}
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
  );
};

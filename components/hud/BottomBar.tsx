/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Hammer } from 'lucide-react';
import { AppState } from '../../types';
import { useEngineStore } from '../../store';
import { sceneController } from '../../services/application';
import { BigActionButton } from '../ui/buttons';
import { RebuildMenu } from './RebuildMenu';

export const BottomBar: React.FC = () => {
  const appState = useEngineStore((s) => s.appState);
  const isGenerating = useEngineStore((s) => s.isGenerating);

  const isStable = appState === AppState.STABLE;
  const isDismantling = appState === AppState.DISMANTLING;

  const handleDismantle = () => {
    console.log('[BottomBar] BREAK BLOCKS clicked');
      sceneController.dismantle();
  };

  return (
    <div className="fixed bottom-6 right-6 flex items-center justify-end pointer-events-none z-40">
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
            <RebuildMenu />
          </div>
        )}
      </div>
    </div>
  );
};

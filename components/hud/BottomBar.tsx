/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Hammer } from 'lucide-react';
import { AppState } from '../../types';
import { useEngineStore } from '../../store';
import { BigActionButton } from '../ui/buttons';
import { RebuildMenu } from './RebuildMenu';

export const BottomBar: React.FC = () => {
  const appState = useEngineStore((s) => s.appState);
  const isGenerating = useEngineStore((s) => s.isGenerating);
  const engine = useEngineStore((s) => s.engine);

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
            <RebuildMenu />
          </div>
        )}
      </div>
    </div>
  );
};

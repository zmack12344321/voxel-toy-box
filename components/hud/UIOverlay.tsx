/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TopBar } from './TopBar';
import { FloatingControls } from './FloatingControls';
import { BottomBar } from './BottomBar';
import { LoadingOverlay } from './LoadingOverlay';
import { GuideModal } from '../modals/guide/GuideModal';
import { useUIStore } from '../../store';

export const UIOverlay: React.FC = () => {
  const showWelcome = useUIStore((s) => s.showWelcome);
  const setShowWelcome = useUIStore((s) => s.setShowWelcome);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none">
      <TopBar />
      <FloatingControls />
      <BottomBar />
      <LoadingOverlay />
      <GuideModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
      />
    </div>
  );
};

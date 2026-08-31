/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TopBar } from './overlay/TopBar';
import { FloatingControls } from './overlay/FloatingControls';
import { BottomBar } from './overlay/BottomBar';
import { LoadingOverlay } from './overlay/LoadingOverlay';

export const UIOverlay: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none">
      <TopBar />
      <FloatingControls />
      <BottomBar />
      <LoadingOverlay />
    </div>
  );
};

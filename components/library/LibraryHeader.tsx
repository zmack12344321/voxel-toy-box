/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, X } from 'lucide-react';
import { Text } from '../ui/typography/Typography';

interface LibraryHeaderProps {
  onClose: () => void;
}

export const LibraryHeader: React.FC<LibraryHeaderProps> = ({ onClose }) => {
  return (
    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
          <Box size={20} strokeWidth={2.5} />
        </div>
        <div>
          <Text variant="title">
            Model Library
          </Text>
        </div>
      </div>

      <button
        onClick={onClose}
        className="icon-btn"
        title="Close drawer"
      >
        <X size={18} />
      </button>
    </div>
  );
};

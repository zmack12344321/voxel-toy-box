/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wand2, FileJson } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

interface LibraryQuickActionsProps {
  onClose: () => void;
}

export const LibraryQuickActions: React.FC<LibraryQuickActionsProps> = ({ onClose }) => {
  return (
    <div className="p-3 border-b border-slate-100 grid grid-cols-2 gap-2.5 bg-slate-50/50">
      <button
        onClick={() => {
          useUIStore.getState().setPromptMode('create');
          useUIStore.getState().setPromptModalOpen(true);
          onClose();
        }}
        className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer"
      >
        <Wand2 size={17} />
        <span>AI Sculpt</span>
      </button>

      <button
        onClick={() => {
          useUIStore.getState().openJsonModal('import');
          onClose();
        }}
        className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 border border-slate-200/80 font-bold text-sm shadow-xs transition-all cursor-pointer"
      >
        <FileJson size={16} className="text-slate-500" />
        <span>Import JSON</span>
      </button>
    </div>
  );
};

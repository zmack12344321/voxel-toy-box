/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useEngineStore } from '../../store/useEngineStore';
import { THEME_SURFACES } from '../../theme/system';

export type VoxelBudget = '3k' | '10k' | '25k';

export const BottomPromptBar: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [budget, setBudget] = useState<VoxelBudget>('10k');
  const ui = useUIStore();
  const isGenerating = useEngineStore((state) => state.isGenerating);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    const detailLevel = budget === '25k' ? 'masterpiece' : (budget === '10k' ? 'detailed' : 'classic');
    ui.submitPrompt(prompt.trim(), detailLevel);
    setPrompt('');
  };

  const budgets: Array<{ id: VoxelBudget; label: string }> = [
    { id: '3k', label: '3k (Quick)' },
    { id: '10k', label: '10k (Standard)' },
    { id: '25k', label: '25k (Epic)' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 pointer-events-auto">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-2 p-2 ${THEME_SURFACES.floatingCard} shadow-2xl border border-white/40 bg-white/90 backdrop-blur-md rounded-2xl`}
      >
        <div className="flex items-center gap-1.5 pl-3 text-amber-500 font-bold text-xs select-none">
          <Sparkles size={16} />
        </div>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe anything to sculpt (e.g. 'tropical island with flying seagulls & coral reef')..."
          disabled={isGenerating}
          className="flex-1 bg-transparent border-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none px-2"
        />

        {/* Resolution Budget Pills */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {budgets.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBudget(b.id)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                budget === b.id
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
            !prompt.trim() || isGenerating
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Send size={14} />
              <span>Generate</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

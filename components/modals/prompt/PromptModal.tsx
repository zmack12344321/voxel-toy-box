/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Loader2, Wand2, Hammer, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { modalBackdropVariants, modalDialogVariants } from '../../../theme/system';
import { useUIStore, useEngineStore } from '../../../store';
import { InspirationChips } from './InspirationChips';
import { QualitySelector, DetailLevel } from './QualitySelector';

const INSPIRATION_SUGGESTIONS = {
  create: [
    'Cyberpunk Mech Golem',
    'Medieval Dragon on Gold',
    'Japanese Cherry Shrine',
    'Deep Space Fighter',
    'Cozy Pixel Coffee Shop',
    'Ancient Pirate Galleon'
  ],
  morph: [
    'High-Speed Hover Car',
    'Towering Battle Golem',
    'Ancient Mayan Pyramid',
    'Hovering Sci-Fi Drone',
    'Lighthouse on Sea Rocks'
  ]
};

export const PromptModal: React.FC = () => {
  const isOpen = useUIStore((s) => s.isPromptModalOpen);
  const mode = useUIStore((s) => s.promptMode);
  const onClose = () => useUIStore.getState().setPromptModalOpen(false);
  const submitPrompt = useUIStore((s) => s.submitPrompt);
  const isGenerating = useEngineStore((s) => s.isGenerating);

  const [prompt, setPrompt] = useState('');
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('masterpiece');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      await submitPrompt(prompt, detailLevel);
      setPrompt('');
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'The voxel generator encountered an issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isCreate = mode === 'create';
  const themeBg = isCreate ? 'bg-sky-500 hover:bg-sky-600' : 'bg-amber-500 hover:bg-amber-600';
  const themeLight = isCreate ? 'bg-sky-100 text-sky-600' : 'bg-amber-100 text-amber-600';
  const suggestions = isCreate ? INSPIRATION_SUGGESTIONS.create : INSPIRATION_SUGGESTIONS.morph;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans"
        >
          <motion.div
            variants={modalDialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col border-2 ${isCreate ? 'border-sky-100' : 'border-amber-100'} overflow-hidden`}
          >

            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isCreate ? 'border-sky-50 bg-gradient-to-r from-sky-50 to-blue-50' : 'border-amber-50 bg-gradient-to-r from-amber-50 to-orange-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${themeLight} shadow-sm`}>
                  {isCreate ? <Wand2 size={24} strokeWidth={2.5} /> : <Hammer size={24} strokeWidth={2.5} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {isCreate ? 'Sculpt High-Detail 3D Model' : 'Rebuild & Morph Voxel Blocks'}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-sky-500/10 text-sky-700">
                      <Flame size={11} className="text-sky-600" /> GEMINI 3.7 HD
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      • Creative AI Voxel Engine
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={!isLoading ? onClose : undefined}
                className="p-2 rounded-xl bg-white/70 text-slate-400 hover:bg-white hover:text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                disabled={isLoading}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 bg-white flex flex-col gap-4">
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-2">
                  {isCreate
                    ? "Describe what you want to build:"
                    : "Describe the new sculpture to morph into:"}
                </label>

                <form onSubmit={handleSubmit}>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={isCreate
                      ? "e.g., A glowing cyberpunk samurai robot with twin katanas, or a medieval wizard tower on a floating crystal..."
                      : "e.g., Transform this into a sleek interstellar rocket with glowing blue thrusters..."}
                    disabled={isLoading}
                    className={`w-full h-28 resize-none bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-medium text-slate-800 focus:outline-hidden focus:ring-4 transition-all placeholder:text-slate-400 ${isCreate ? 'focus:border-sky-400 focus:ring-sky-100' : 'focus:border-amber-400 focus:ring-amber-100'}`}
                    autoFocus
                  />

                  <InspirationChips
                    suggestions={suggestions}
                    disabled={isLoading}
                    onSelect={(s) => setPrompt(s)}
                  />

                  <QualitySelector
                    value={detailLevel}
                    disabled={isLoading}
                    onChange={(lvl) => setDetailLevel(lvl)}
                  />

                  {error && (
                    <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2">
                      <X size={16} className="shrink-0" /> {error}
                    </div>
                  )}

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isLoading}
                      className="px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 text-sm transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!prompt.trim() || isLoading}
                      className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm transition-all shadow-md active:scale-95 cursor-pointer
                        ${isLoading
                          ? 'bg-slate-200 text-slate-400 cursor-wait shadow-none'
                          : `${themeBg}`}
                      `}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Sculpting Voxels...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} fill="currentColor" />
                          Generate 3D Model
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

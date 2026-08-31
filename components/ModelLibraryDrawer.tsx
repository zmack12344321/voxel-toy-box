/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Box, Bird, Cat, Rabbit, Users, Castle, Bot, Rocket,
  Sparkles, Wand2, FileJson, History, TreePine, Shield,
  X, Search, ChevronRight, Check
} from 'lucide-react';
import { THEME_SURFACES } from '../theme/system';
import { useUIStore } from '../store';

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

const categories = [
  { key: 'all', label: 'All Models' },
  { key: 'creatures', label: 'Creatures & Wildlife' },
  { key: 'scifi_mech', label: 'Sci-Fi & Mech' },
  { key: 'architecture', label: 'Architecture & Keeps' },
  { key: 'objects', label: 'Custom & Objects' }
];

export const ModelLibraryDrawer: React.FC = () => {
  const isOpen = useUIStore((s) => s.isModelLibraryOpen);
  const onClose = () => useUIStore.getState().setModelLibraryOpen(false);
  const presets = useUIStore((s) => s.presets);
  const customBuilds = useUIStore((s) => s.customBuilds);
  const currentBaseModel = useUIStore((s) => s.currentBaseModel);
  const selectPreset = useUIStore((s) => s.selectPreset);
  const selectCustomBuild = useUIStore((s) => s.selectCustomBuild);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPresets = useMemo(() => {
    return presets.filter(preset => {
      const matchesCat = selectedCategory === 'all' || preset.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' ||
        preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [presets, selectedCategory, searchQuery]);

  const filteredCustomBuilds = useMemo(() => {
    if (selectedCategory !== 'all' && selectedCategory !== 'objects') return [];
    return customBuilds.filter(model => {
      return searchQuery.trim() === '' || model.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [customBuilds, selectedCategory, searchQuery]);

  const totalCount = filteredPresets.length + filteredCustomBuilds.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-50 pointer-events-auto"
          />

          {/* Left-Hand Sliding Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-84 sm:w-96 bg-white/95 backdrop-blur-xl border-r border-slate-200/90 shadow-2xl z-50 flex flex-col pointer-events-auto select-none"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                  <Box size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 leading-tight">Model Library</h2>
                  <p className="text-[11px] font-bold text-slate-400">3D Voxel Sculptures & Presets</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-b border-slate-100 grid grid-cols-2 gap-2 bg-slate-50/50">
              <button
                onClick={() => {
                  useUIStore.getState().setPromptMode('create');
                  useUIStore.getState().setPromptModalOpen(true);
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                <Wand2 size={15} />
                <span>AI Sculpt</span>
              </button>

              <button
                onClick={() => {
                  useUIStore.getState().openJsonModal('import');
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 border border-slate-200 font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <FileJson size={15} className="text-slate-500" />
                <span>Import JSON</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-3 pt-3 pb-2">
              <div className="relative flex items-center">
                <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search 3D models & tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-indigo-300 focus:outline-hidden transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 p-0.5 rounded-md text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar py-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Model List */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 custom-scrollbar">
              {totalCount === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <Box size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold text-slate-500">No matching models found</p>
                  <p className="text-[11px] mt-0.5 text-slate-400">Try a different search term or category</p>
                </div>
              )}

              {/* Custom AI Models Section */}
              {filteredCustomBuilds.length > 0 && (
                <div className="mb-3">
                  <div className="px-1 py-1 text-[10px] font-black text-indigo-900/70 uppercase tracking-wider flex items-center gap-1">
                    <History size={12} className="text-indigo-600" />
                    <span>Your AI Generations ({filteredCustomBuilds.length})</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {filteredCustomBuilds.map((model, idx) => {
                      const isCurrent = currentBaseModel === model.name;
                      return (
                        <button
                          key={`custom-${idx}`}
                          onClick={() => {
                            selectCustomBuild(model);
                            onClose();
                          }}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                            isCurrent
                              ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isCurrent ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                            }`}>
                              <History size={16} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate group-hover:text-indigo-600 transition-colors">
                                {model.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {model.data.length.toLocaleString()} voxels • Custom
                              </div>
                            </div>
                          </div>

                          {isCurrent && (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Preset Models Section */}
              {filteredPresets.map((preset) => {
                const isCurrent = currentBaseModel === preset.name;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      selectPreset(preset);
                      onClose();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/80'
                      }`}>
                        {renderIcon(preset.iconName, 16)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate group-hover:text-indigo-600 transition-colors">
                          {preset.name}
                        </div>
                        {preset.description && (
                          <div className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                            {preset.description}
                          </div>
                        )}
                        {/* Palette Dots */}
                        {preset.palettePreview && (
                          <div className="flex items-center gap-1 mt-1">
                            {preset.palettePreview.slice(0, 5).map((color, cIdx) => (
                              <span
                                key={cIdx}
                                className="w-2 h-2 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500 font-bold">
              <span>{presets.length + customBuilds.length} total sculptures</span>
              <span className="text-indigo-600 font-extrabold">Active: {currentBaseModel}</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

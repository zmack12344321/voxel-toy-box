/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Sparkles } from 'lucide-react';
import { ModelPreset } from '../../models/types';
import { SavedModel } from '../../types';
import { useUIStore } from '../../store/useUIStore';

import { LibraryHeader } from './LibraryHeader';
import { LibraryQuickActions } from './LibraryQuickActions';
import { ModelSearchHeader, CategoryOption } from './ModelSearchHeader';
import { ModelCardItem } from './ModelCardItem';
import { ModelHoverCard, HoveredModelInfo } from './ModelHoverCard';
import { LibraryEmptyState } from './LibraryEmptyState';
import { LibraryFooter } from './LibraryFooter';

export type CustomVoxelBuild = SavedModel;

interface ModelLibraryDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentModelId?: string;
  onSelectModel?: (presetId: string) => void;
  customBuilds?: CustomVoxelBuild[];
  onSelectCustomBuild?: (build: CustomVoxelBuild) => void;
}

const categories: CategoryOption[] = [
  { key: 'all', label: 'All Models', iconName: 'Sparkles' },
  { key: 'creatures', label: 'Creatures', iconName: 'PawPrint' },
  { key: 'scifi_mech', label: 'Sci-Fi & Mech', iconName: 'Bot' },
  { key: 'architecture', label: 'Architecture', iconName: 'Castle' },
  { key: 'objects', label: 'Objects', iconName: 'Box' }
];

const categoryIconMap: Record<string, string> = {
  creatures: 'PawPrint',
  scifi_mech: 'Bot',
  architecture: 'Castle',
  objects: 'Box',
};

export const ModelLibraryDrawer: React.FC<ModelLibraryDrawerProps> = (props) => {
  const storeIsOpen = useUIStore((s) => s.isModelLibraryOpen);
  const storeSetOpen = useUIStore((s) => s.setModelLibraryOpen);
  const storeCurrentModel = useUIStore((s) => s.currentBaseModel);
  const storeSelectPresetById = useUIStore((s) => s.selectPresetById);
  const storePresets = useUIStore((s) => s.presets);
  const storeCustomBuilds = useUIStore((s) => s.customBuilds);
  const storeSelectCustomBuild = useUIStore((s) => s.selectCustomBuild);

  const isOpen = props.isOpen ?? storeIsOpen;
  const onClose = props.onClose ?? (() => storeSetOpen(false));
  const currentModelId = props.currentModelId ?? storeCurrentModel;
  const onSelectModel = props.onSelectModel ?? ((id: string) => {
    storeSelectPresetById(id);
  });
  const customBuilds = props.customBuilds ?? storeCustomBuilds;
  const onSelectCustomBuild = props.onSelectCustomBuild ?? storeSelectCustomBuild;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredModel, setHoveredModel] = useState<HoveredModelInfo | null>(null);

  const presets = storePresets;

  const filteredPresets = presets.filter((preset) => {
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      preset.name.toLowerCase().includes(q) ||
      (preset.tags && preset.tags.some(t => t.toLowerCase().includes(q))) ||
      (preset.description && preset.description.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const filteredCustomBuilds = customBuilds.filter((build) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      build.name.toLowerCase().includes(q) ||
      (build.prompt && build.prompt.toLowerCase().includes(q))
    );
  });

  const totalCount = filteredPresets.length + filteredCustomBuilds.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-40"
          />

          {/* Hover Card Popover */}
          <AnimatePresence>
            {hoveredModel && <ModelHoverCard model={hoveredModel} />}
          </AnimatePresence>

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-[360px] bg-white/95 backdrop-blur-xl border-r border-slate-200/80 shadow-2xl z-40 flex flex-col font-sans"
          >
            {/* Header */}
            <LibraryHeader onClose={onClose} />

            {/* Quick Actions */}
            <LibraryQuickActions onClose={onClose} />

            {/* Search & Category Filter */}
            <ModelSearchHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Scrollable Model Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 blue-scrollbar">
              {totalCount === 0 && <LibraryEmptyState />}

              {/* Custom AI Models Section */}
              {filteredCustomBuilds.length > 0 && (
                <div className="mb-3">
                  <div className="px-1 py-1 text-xs font-semibold text-indigo-900/70 uppercase tracking-wider flex items-center gap-1">
                    <History size={12} className="text-indigo-600" />
                    <span>Your AI Generations ({filteredCustomBuilds.length})</span>
                  </div>
                  <div className="space-y-1.5 mt-1">
                    {filteredCustomBuilds.map((build) => {
                      const buildId = build.id ?? build.name;
                      const isCurrent = currentModelId === buildId;
                      return (
                        <ModelCardItem
                          key={buildId}
                          name={build.name}
                          iconName="Sparkles"
                          palettePreview={build.palettePreview}
                          isCurrent={isCurrent}
                          onClick={() => {
                            if (onSelectCustomBuild) onSelectCustomBuild(build);
                            onClose();
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredModel({
                              id: buildId,
                              name: build.name,
                              iconName: 'Sparkles',
                              description: build.prompt || 'Custom AI-generated 3D voxel sculpture',
                              palettePreview: build.palettePreview,
                              category: 'AI Sculpt',
                              voxelCount: build.data.length,
                              thumbnailUrl: build.thumbnailUrl,
                              topPos: rect.top,
                            });
                          }}
                          onMouseLeave={() => setHoveredModel(null)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Preset Models Section */}
              {filteredPresets.map((preset: ModelPreset) => {
                const isCurrent = currentModelId === preset.id;
                const iconName = categoryIconMap[preset.category] || 'Sparkles';

                return (
                  <ModelCardItem
                    key={preset.id}
                    name={preset.name}
                    iconName={iconName}
                    palettePreview={preset.palettePreview}
                    isCurrent={isCurrent}
                    onClick={() => {
                      onSelectModel(preset.id);
                      onClose();
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredModel({
                        id: preset.id,
                        name: preset.name,
                        iconName: iconName,
                        description: preset.description,
                        palettePreview: preset.palettePreview,
                        category: preset.category,
                        tags: preset.tags,
                        voxelCount: preset.voxelCount,
                        topPos: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredModel(null)}
                  />
                );
              })}
            </div>

            {/* Footer */}
            <LibraryFooter totalCount={totalCount} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

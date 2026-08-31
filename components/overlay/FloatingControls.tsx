/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Layers, Sparkles, Library } from 'lucide-react';
import { RenderMode } from '../../types';
import { TactileButton } from '../ui/Buttons';
import { DropdownSliderItem } from '../ui/FloatingDropdown';
import { THEME_SURFACES, dropdownMenuVariants } from '../../theme/system';
import { useSceneStore, useUIStore } from '../../store';

export const FloatingControls: React.FC = () => {
  const scene = useSceneStore();
  const ui = useUIStore();

  const [isSmoothMenuOpen, setIsSmoothMenuOpen] = useState(true);
  const smoothMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scene.renderMode === RenderMode.SMOOTH_MARCHING) {
      setIsSmoothMenuOpen(true);
    }
  }, [scene.renderMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (smoothMenuRef.current && !smoothMenuRef.current.contains(event.target as Node)) {
        setIsSmoothMenuOpen(false);
      }
    };
    if (isSmoothMenuOpen && scene.renderMode === RenderMode.SMOOTH_MARCHING) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSmoothMenuOpen, scene.renderMode]);

  return (
    <div className="absolute top-20 left-4 pointer-events-auto flex flex-col gap-2 z-40">
      <div className="mb-1">
        <TactileButton
          onClick={() => ui.setModelLibraryOpen(true)}
          color="indigo"
          icon={<Library size={18} strokeWidth={2.5} />}
          label="Library"
        />
      </div>

      <TactileButton
        onClick={() => scene.setRenderMode(RenderMode.INDIVIDUAL_CUBES)}
        color={scene.renderMode === RenderMode.INDIVIDUAL_CUBES ? 'amber' : 'slate'}
        icon={<Box size={16} strokeWidth={2.5} />}
        label="Normal"
      />

      <TactileButton
        onClick={() => scene.setRenderMode(RenderMode.MERGED_VOXEL)}
        color={scene.renderMode === RenderMode.MERGED_VOXEL ? 'emerald' : 'slate'}
        icon={<Layers size={16} strokeWidth={2.5} />}
        label="Merged"
      />

      <div className="relative" ref={smoothMenuRef}>
        <TactileButton
          onClick={() => {
            if (scene.renderMode !== RenderMode.SMOOTH_MARCHING) {
              scene.setRenderMode(RenderMode.SMOOTH_MARCHING);
              setIsSmoothMenuOpen(true);
            } else {
              setIsSmoothMenuOpen(prev => !prev);
            }
          }}
          color={scene.renderMode === RenderMode.SMOOTH_MARCHING ? 'purple' : 'slate'}
          icon={<Sparkles size={16} strokeWidth={2.5} />}
          label="Smooth"
        />

        {/* Floating Smooth Tuning Sliders Popover */}
        <AnimatePresence>
          {scene.renderMode === RenderMode.SMOOTH_MARCHING && isSmoothMenuOpen && (
            <motion.div
              variants={dropdownMenuVariants('right')}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`absolute top-0 left-full ml-3 w-64 ${THEME_SURFACES.floatingMenu} shadow-2xl border border-purple-200/90 bg-white/98 backdrop-blur-md p-3 z-50`}
            >
              <div className="flex items-center justify-between px-1 pb-2 mb-1 border-b border-purple-100">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={16} className="text-purple-600" />
                  <span className="text-xs font-black text-purple-950 uppercase tracking-wide">Organic Surface Mesh</span>
                </div>
              </div>

              <div className="space-y-1">
                <DropdownSliderItem 
                  icon={<Sparkles size={15} />}
                  label="Smoothing Intensity"
                  sublabel="0% = Exact Merged Boxes → 100% = Soft Organic Sculpt"
                  value={scene.marchingSmoothness}
                  min={0}
                  max={1}
                  step={0.05}
                  valueDisplay={`${Math.round(scene.marchingSmoothness * 100)}%`}
                  onChange={scene.setMarchingSmoothness}
                />

                <DropdownSliderItem 
                  icon={<Layers size={15} />}
                  label="Grid Sampling Resolution"
                  sublabel="Subdivision fidelity (Higher = ultra smooth)"
                  value={scene.marchingResolution}
                  min={16}
                  max={64}
                  step={2}
                  valueDisplay={`${scene.marchingResolution}³`}
                  onChange={scene.setMarchingResolution}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

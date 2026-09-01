/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Layers, Sparkles } from 'lucide-react';
import { RenderMode } from '../../types';
import { TactileButton } from '../ui/buttons';
import { DropdownSliderItem } from '../ui/dropdown';
import { THEME_SURFACES, dropdownMenuVariants } from '../../theme/system';
import { useSceneStore } from '../../store';

export const FloatingControls: React.FC = () => {
  const scene = useSceneStore();

  const [isSmoothMenuOpen, setIsSmoothMenuOpen] = useState(true);
  const [isNormalMenuOpen, setIsNormalMenuOpen] = useState(true);
  const smoothMenuRef = useRef<HTMLDivElement>(null);
  const normalMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scene.renderMode === RenderMode.SMOOTH_MARCHING) {
      setIsSmoothMenuOpen(true);
    }
    if (scene.renderMode === RenderMode.INDIVIDUAL_CUBES) {
      setIsNormalMenuOpen(true);
    }
  }, [scene.renderMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (smoothMenuRef.current && !smoothMenuRef.current.contains(event.target as Node)) {
        setIsSmoothMenuOpen(false);
      }
      if (normalMenuRef.current && !normalMenuRef.current.contains(event.target as Node)) {
        setIsNormalMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-2 pointer-events-auto z-40">
      <div className="relative" ref={normalMenuRef}>
        <TactileButton
          onClick={() => {
            if (scene.renderMode !== RenderMode.INDIVIDUAL_CUBES) {
              scene.setRenderMode(RenderMode.INDIVIDUAL_CUBES);
              setIsNormalMenuOpen(true);
            } else {
              setIsNormalMenuOpen(prev => !prev);
            }
          }}
          color={scene.renderMode === RenderMode.INDIVIDUAL_CUBES ? 'amber' : 'slate'}
          icon={<Box size={16} strokeWidth={2.5} />}
          label="Normal"
        />

        {/* Floating Normal Tuning Sliders Popover */}
        <AnimatePresence>
          {scene.renderMode === RenderMode.INDIVIDUAL_CUBES && isNormalMenuOpen && (
            <motion.div
              variants={dropdownMenuVariants('right')}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`absolute top-0 left-full ml-3 w-64 ${THEME_SURFACES.floatingMenu} shadow-2xl border border-amber-200/90 bg-white/98 backdrop-blur-md p-2 z-50 flex flex-col gap-1`}
            >
              <DropdownSliderItem 
                icon={<Box size={15} />}
                label="Spacing"
                value={scene.voxelSpacing}
                min={1.0}
                max={2.5}
                step={0.05}
                valueDisplay={`${Math.round((scene.voxelSpacing - 1.0) * 100)}%`}
                onChange={scene.setVoxelSpacing}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
              className={`absolute top-0 left-full ml-3 w-64 ${THEME_SURFACES.floatingMenu} shadow-2xl border border-purple-200/90 bg-white/98 backdrop-blur-md p-2 z-50 flex flex-col gap-1`}
            >
              <DropdownSliderItem 
                icon={<Sparkles size={15} />}
                label="Smoothing"
                value={scene.marchingSmoothness}
                min={0}
                max={1}
                step={0.01}
                valueDisplay={`${Math.round(scene.marchingSmoothness * 100)}%`}
                onChange={scene.setMarchingSmoothness}
              />

              <DropdownSliderItem 
                icon={<Layers size={15} />}
                label="Resolution"
                value={scene.marchingResolution}
                min={16}
                max={64}
                step={1}
                valueDisplay={`${scene.marchingResolution}³`}
                onChange={scene.setMarchingResolution}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

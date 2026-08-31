/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, Focus, SlidersHorizontal, Box } from 'lucide-react';
import { Text, Card } from '../../ui';
import { useUIStore } from '../../../store';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('[GuideModal] Closing guide modal');
    useUIStore.getState().setShowWelcome(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        onClick={handleClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 pointer-events-auto cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-3xl glass-card p-6 bg-white shadow-2xl rounded-3xl border border-slate-200 flex flex-col gap-6 relative pointer-events-auto cursor-default select-text"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                <Box size={22} />
              </div>
              <Text variant="title">How To Use Voxel Toy Box</Text>
            </div>
          </div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section 1 */}
            <Card variant="flat" className="p-4 flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <RotateCw size={20} />
              </div>
              <div>
                <Text variant="heading">Orbit & Rotate View</Text>
                <Text variant="description" className="mt-1">
                  Left-click and drag anywhere across the 3D viewport to inspect your voxel models from any angle smoothly.
                </Text>
              </div>
            </Card>

            {/* Section 2 */}
            <Card variant="flat" className="p-4 flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Focus size={20} />
              </div>
              <div>
                <Text variant="heading">Pan & Zoom Camera</Text>
                <Text variant="description" className="mt-1">
                  Right-click and drag to pan across the scene, or scrub your mouse wheel to zoom in and out.
                </Text>
              </div>
            </Card>

            {/* Section 3 */}
            <Card variant="flat" className="p-4 flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Box size={20} />
              </div>
              <div>
                <Text variant="heading">3D Model Library</Text>
                <Text variant="description" className="mt-1">
                  Browse standard 3D voxel preset models, filter by category, or import JSON model data.
                </Text>
              </div>
            </Card>

            {/* Section 4 */}
            <Card variant="flat" className="p-4 flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <SlidersHorizontal size={20} />
              </div>
              <div>
                <Text variant="heading">Scene & Display Options</Text>
                <Text variant="description" className="mt-1">
                  Configure environment lighting, real-time shadows, fog effects, grid floor, and render modes.
                </Text>
              </div>
            </Card>
          </div>

          {/* Footer Action */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-indigo-200/80 transition-all cursor-pointer pointer-events-auto"
            >
              Got it!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

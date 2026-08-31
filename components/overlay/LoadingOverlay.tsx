/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2 } from 'lucide-react';
import { useEngineStore } from '../../store';

const LOADING_MESSAGES = [
  "Consulting Gemini 3.7 Flash Voxel Sculptor...",
  "Synthesizing 3D color voxels...",
  "Optimizing geometry & face culling...",
  "Assembling final voxel model..."
];

export const LoadingOverlay: React.FC = () => {
  const isGenerating = useEngineStore((s) => s.isGenerating);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setLoadingMsgIndex(0);
    }
  }, [isGenerating]);

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center pointer-events-auto"
        >
          <div className="bg-white/95 border border-indigo-100 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-indigo-300 animate-pulse">
              <Wand2 size={32} className="animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            
            <h3 className="text-lg font-black text-slate-900 mb-1">Sculpting 3D Model</h3>
            <p className="text-xs font-semibold text-indigo-600 mb-4 h-5 flex items-center justify-center">
              {LOADING_MESSAGES[loadingMsgIndex]}
            </p>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
              <motion.div 
                className="bg-indigo-600 h-full rounded-full"
                animate={{ 
                  x: ['-100%', '100%']
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5, 
                  ease: 'easeInOut' 
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

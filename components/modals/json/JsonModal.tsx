/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, FileJson } from 'lucide-react';
import { motion } from 'framer-motion';
import { modalBackdropVariants, modalDialogVariants } from '../../../theme/system';
import { useUIStore } from '../../../store';
import { JsonViewPanel } from './JsonViewPanel';
import { JsonImportPanel } from './JsonImportPanel';

export const JsonModal: React.FC = () => {
  const isOpen = useUIStore((s) => s.isJsonModalOpen);
  const mode = useUIStore((s) => s.jsonModalMode);
  const onClose = () => useUIStore.getState().setJsonModalOpen(false);
  const jsonData = useUIStore((s) => s.jsonData);
  const importJson = useUIStore((s) => s.importJson);

  if (!isOpen) return null;

  const isViewMode = mode === 'view';

  const handleImport = (jsonStr: string) => {
    importJson(jsonStr);
    onClose();
  };

  return (
    <motion.div
      variants={modalBackdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
    >
      <motion.div
        variants={modalDialogVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col border-2 border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-indigo-100 text-indigo-600">
              <FileJson size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isViewMode ? 'Voxel JSON Data' : 'Import JSON Voxel Data'}
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {isViewMode
                  ? 'Copy this JSON to share or re-import later.'
                  : 'Paste an array of {x, y, z, color} voxels.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 bg-white flex flex-col gap-4">
          {isViewMode ? (
            <JsonViewPanel jsonData={jsonData} />
          ) : (
            <JsonImportPanel onImport={handleImport} onCancel={onClose} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

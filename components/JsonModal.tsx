/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, FileJson, Upload, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { modalBackdropVariants, modalDialogVariants } from '../theme/system';
import { useUIStore } from '../store';

export const JsonModal: React.FC = () => {
  const isOpen = useUIStore((s) => s.isJsonModalOpen);
  const mode = useUIStore((s) => s.jsonModalMode);
  const onClose = () => useUIStore.getState().setJsonModalOpen(false);
  const jsonData = useUIStore((s) => s.jsonData);
  const importJson = useUIStore((s) => s.importJson);

  const [importText, setImportText] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setImportText('');
      setError('');
      setIsCopied(false);
    }
  }, [isOpen]);

  const handleImportClick = () => {
    if (!importText.trim()) {
      setError('Please paste JSON data first.');
      return;
    }
    try {
      JSON.parse(importText);
      importJson(importText);
      onClose();
    } catch (e) {
      setError('Invalid JSON format. Please check your input.');
    }
  };

  const handleCopy = async () => {
    if (!jsonData) return;
    try {
      await navigator.clipboard.writeText(jsonData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';

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
              <h2 className="text-lg font-extrabold text-slate-800">
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
            <div className="relative">
              <textarea
                readOnly
                value={jsonData}
                className="w-full h-64 bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl border border-slate-200 focus:outline-none resize-none"
              />
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-md cursor-pointer"
              >
                {isCopied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <textarea
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setError('');
                }}
                placeholder='[
  { "x": 0, "y": 0, "z": 0, "color": "FF0000" },
  { "x": 1, "y": 0, "z": 0, "color": "00FF00" },
  ...
]'
                className="w-full h-48 bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-800 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all resize-none placeholder:text-slate-400"
                autoFocus
              />

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportClick}
                  disabled={!importText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 text-sm shadow-md shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Upload size={16} />
                  Import Data
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

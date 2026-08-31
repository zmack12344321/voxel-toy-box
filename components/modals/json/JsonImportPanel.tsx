/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface JsonImportPanelProps {
  onImport: (jsonStr: string) => void;
  onCancel: () => void;
}

export const JsonImportPanel: React.FC<JsonImportPanelProps> = ({ onImport, onCancel }) => {
  const [importText, setImportText] = useState('');
  const [error, setError] = useState('');

  const handleImportClick = () => {
    if (!importText.trim()) {
      setError('Please paste JSON data first.');
      return;
    }
    try {
      JSON.parse(importText);
      onImport(importText);
    } catch (e) {
      setError('Invalid JSON format. Please check your input.');
    }
  };

  return (
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
        className="w-full h-48 bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-800 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:outline-hidden transition-all resize-none placeholder:text-slate-400"
        autoFocus
      />

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
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
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface JsonViewPanelProps {
  jsonData: string;
}

export const JsonViewPanel: React.FC<JsonViewPanelProps> = ({ jsonData }) => {
  const [isCopied, setIsCopied] = useState(false);

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

  return (
    <div className="relative">
      <textarea
        readOnly
        value={jsonData}
        className="w-full h-64 bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl border border-slate-200 focus:outline-hidden resize-none"
      />
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-md cursor-pointer"
        title="Copy JSON to clipboard"
      >
        {isCopied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
      </button>
    </div>
  );
};

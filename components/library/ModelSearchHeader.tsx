/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, X } from 'lucide-react';
import { IconRenderer } from '../ui/IconRenderer';

export interface CategoryOption {
  key: string;
  label: string;
  iconName: string;
}

interface ModelSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: CategoryOption[];
  selectedCategory: string;
  onSelectCategory: (categoryKey: string) => void;
}

export const ModelSearchHeader: React.FC<ModelSearchHeaderProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex flex-col gap-2.5 pb-2 border-b border-slate-100">
      {/* Search Bar */}
      <div className="px-3 pt-3">
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search 3D models & tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 input-field text-sm font-semibold text-slate-800 placeholder-slate-400 placeholder:text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 p-0.5 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Cards with Clean Scrollbar */}
      <div 
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
        className="px-3 pb-2 flex gap-2 overflow-x-auto blue-scrollbar"
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className={`
                flex flex-col items-center justify-center py-2 px-3.5 min-w-[84px] h-[64px] rounded-2xl border transition-all cursor-pointer shrink-0 gap-1.5
                ${isActive
                  ? 'bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-200/60 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200/70 text-slate-700 font-bold'}
              `}
            >
              <IconRenderer name={cat.iconName} size={18} className={isActive ? 'text-white' : 'text-indigo-600'} />
              <span className="text-xs leading-none whitespace-nowrap text-center">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

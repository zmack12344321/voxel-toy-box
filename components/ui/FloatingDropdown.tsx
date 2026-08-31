/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  THEME_SURFACES, 
  THEME_BUTTON_COLORS, 
  ThemeButtonColor, 
  dropdownMenuVariants 
} from '../../theme/system';

export interface FloatingDropdownProps {
  icon?: React.ReactNode;
  label?: string;
  children: React.ReactNode;
  color?: ThemeButtonColor;
  direction?: 'up' | 'down';
  align?: 'left' | 'right';
  big?: boolean;
  menuWidth?: string;
  customTrigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const FloatingDropdown: React.FC<FloatingDropdownProps> = ({ 
  icon, 
  label, 
  children, 
  color = 'slate', 
  direction = 'down', 
  align = 'left',
  big,
  menuWidth = 'w-72',
  customTrigger,
  isOpen: controlledIsOpen,
  onOpenChange
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  
  const setIsOpen = (valOrFn: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof valOrFn === 'function' ? valOrFn(isOpen) : valOrFn;
    if (!isControlled) {
      setInternalIsOpen(nextVal);
    }
    onOpenChange?.(nextVal);
  };

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const colorConfig = THEME_BUTTON_COLORS[color] || THEME_BUTTON_COLORS.slate;

  return (
    <div className="relative" ref={menuRef}>
      {customTrigger ? (
        <div 
          onClick={() => setIsOpen(prev => !prev)} 
          role="button" 
          tabIndex={0} 
          onKeyDown={(e) => { 
            if (e.key === 'Enter' || e.key === ' ') { 
              e.preventDefault(); 
              setIsOpen(prev => !prev); 
            } 
          }}
        >
          {customTrigger}
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(prev => !prev)}
          className={`
            flex items-center gap-2 font-bold shadow-md rounded-2xl transition-all active:scale-95 cursor-pointer
            ${colorConfig.bg}
            ${big ? 'px-8 py-4 text-base border-b-[5px] active:border-b-0 active:translate-y-[5px]' : 'px-4 py-3 text-sm border-b-[4px] active:border-b-0 active:translate-y-[4px]'}
          `}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {icon}
          {label && <span>{label}</span>}
          <ChevronUp 
            size={16} 
            className={`transition-transform duration-200 ${isOpen ? (direction === 'down' ? 'rotate-0' : 'rotate-180') : (direction === 'down' ? 'rotate-180' : 'rotate-0')}`} 
          />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            variants={dropdownMenuVariants(direction)}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              absolute ${align === 'right' ? 'right-0' : 'left-0'} 
              ${direction === 'up' ? 'bottom-full mb-3' : 'top-full mt-3'} 
              ${menuWidth} max-h-[75vh] overflow-y-auto ${THEME_SURFACES.floatingMenu}
            `}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DropdownSectionHeader: React.FC<{
  title: string;
  subtitle?: string;
}> = ({ title, subtitle }) => (
  <div className={THEME_SURFACES.sectionHeader}>
    <span className={THEME_SURFACES.sectionTitle}>{title}</span>
    {subtitle && <span className={THEME_SURFACES.sectionSubtitle}>{subtitle}</span>}
  </div>
);

export const DropdownSubHeading: React.FC<{
  label: string;
}> = ({ label }) => (
  <div className={THEME_SURFACES.subHeading}>
    {label}
  </div>
);

export const DropdownDivider: React.FC = () => (
  <div className={THEME_SURFACES.divider} />
);

export const DropdownItem: React.FC<{ 
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  highlight?: boolean;
  active?: boolean;
  truncate?: boolean;
  badge?: string;
  palettePreview?: string[];
  colorSwatch?: string;
}> = ({ 
  onClick, 
  icon, 
  label, 
  sublabel, 
  highlight, 
  active, 
  truncate, 
  badge, 
  palettePreview, 
  colorSwatch 
}) => {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer
        ${highlight 
          ? 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 hover:from-sky-100 hover:to-blue-100 border border-sky-200' 
          : active 
            ? 'bg-indigo-50 text-indigo-900 border border-indigo-200/80 hover:bg-indigo-100/70' 
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}
      `}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`shrink-0 ${highlight ? 'text-sky-600' : active ? 'text-indigo-600' : 'text-slate-500'}`}>
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={truncate ? "truncate" : "leading-tight"}>{label}</span>
          {sublabel && (
            <span className="text-[10.5px] font-medium text-slate-400 leading-tight truncate">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {colorSwatch && (
          <span 
            className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs shrink-0" 
            style={{ backgroundColor: colorSwatch }}
          />
        )}

        {palettePreview && palettePreview.length > 0 && (
          <div className="flex items-center gap-0.5 shrink-0">
            {palettePreview.slice(0, 4).map((c, i) => (
              <div 
                key={i} 
                className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs" 
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}

        {badge && (
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60">
            {badge}
          </span>
        )}

        {active && (
          <Check size={14} strokeWidth={3} className="text-indigo-600 shrink-0" />
        )}
      </div>
    </button>
  );
};

export const DropdownToggleItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: () => void;
}> = ({ icon, label, sublabel, checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`
        w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer
        ${checked 
          ? 'text-slate-900 bg-slate-50/80 hover:bg-slate-100 hover:text-slate-950' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}
      `}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`shrink-0 transition-colors ${checked ? 'text-indigo-600' : 'text-slate-400'}`}>
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="leading-tight text-xs font-bold text-slate-800">{label}</span>
          {sublabel && <span className="text-[10.5px] text-slate-400 font-medium leading-tight">{sublabel}</span>}
        </div>
      </div>
      
      {/* Sleek tactile status switch */}
      <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors duration-200 shrink-0 ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}>
        <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-xs transform transition-transform duration-200 ${checked ? 'translate-x-3.5' : 'translate-x-0'}`} />
      </div>
    </button>
  );
};

export const DropdownSliderItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  valueDisplay?: string;
  plainValue?: boolean;
  accentColor?: string;
  onChange: (val: number) => void;
}> = ({ 
  icon, 
  label, 
  sublabel, 
  value, 
  min, 
  max, 
  step = 1, 
  valueDisplay, 
  plainValue = false,
  accentColor = 'accent-indigo-600',
  onChange 
}) => {
  return (
    <div className="w-full flex flex-col gap-2 px-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200/60 my-1">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="shrink-0 text-indigo-600">{icon}</div>
          <div className="flex flex-col min-w-0">
            <span className="leading-tight text-xs font-bold text-slate-800">{label}</span>
            {sublabel && <span className="text-[10px] text-slate-400 font-medium leading-tight truncate">{sublabel}</span>}
          </div>
        </div>
        {plainValue ? (
          <span className="text-[11px] font-mono font-bold text-slate-600 shrink-0">
            {valueDisplay ?? value}
          </span>
        ) : (
          <span className="text-[11px] font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md shrink-0">
            {valueDisplay ?? value}
          </span>
        )}
      </div>

      <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer ${accentColor} focus:outline-hidden`}
      />
    </div>
  );
};

export const DropdownGuideItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  hint?: string;
  highlight?: boolean;
}> = ({ icon, title, description, hint, highlight }) => {
  return (
    <div className={`
      w-full flex items-start justify-between gap-2.5 px-3 py-2 rounded-xl text-left transition-all
      ${highlight 
        ? 'bg-gradient-to-r from-sky-50 to-blue-50/60 border border-sky-200/80' 
        : 'hover:bg-slate-50'}
    `}>
      <div className="flex items-start gap-2.5 min-w-0">
        <div className={`shrink-0 mt-0.5 ${highlight ? 'text-sky-600' : 'text-slate-500'}`}>
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-xs font-bold leading-tight ${highlight ? 'text-sky-900' : 'text-slate-800'}`}>
            {title}
          </span>
          <span className="text-[10.5px] font-medium text-slate-400 leading-tight mt-0.5">
            {description}
          </span>
        </div>
      </div>
      {hint && (
        <span className="text-[9.5px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60 shrink-0 whitespace-nowrap mt-0.5">
          {hint}
        </span>
      )}
    </div>
  );
};

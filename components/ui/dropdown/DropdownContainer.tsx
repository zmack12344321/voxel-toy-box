/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  THEME_SURFACES, 
  THEME_BUTTON_COLORS, 
  ThemeButtonColor, 
  dropdownMenuVariants 
} from '../../../theme/system';

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
  hideChevron = false,
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
          {!hideChevron && (
            <ChevronUp 
              size={16} 
              className={`transition-transform duration-200 ${isOpen ? (direction === 'down' ? 'rotate-0' : 'rotate-180') : (direction === 'down' ? 'rotate-180' : 'rotate-0')}`} 
            />
          )}
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

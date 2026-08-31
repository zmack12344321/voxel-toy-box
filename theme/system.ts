/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Variants } from 'motion/react';

// --- Visual Style Tokens ---

export const THEME_SURFACES = {
  floatingMenu: 'bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-2 flex flex-col gap-1 z-50',
  floatingCard: 'bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-5 z-30',
  tactilePill: 'bg-slate-200 text-slate-800 rounded-2xl border-b-[4px] border-black/20 font-bold text-sm shadow-md',
  statusBadge: 'text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200',
  sectionHeader: 'px-3 py-1.5 flex items-center justify-between border-b border-slate-100 pb-2 mb-1',
  sectionTitle: 'text-[11px] font-black text-slate-700 uppercase tracking-wider',
  sectionSubtitle: 'text-[10px] font-semibold text-slate-400',
  subHeading: 'px-3 py-0.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider',
  divider: 'h-px bg-slate-100 my-1.5',
  modalBackdrop: 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4',
  modalContainer: 'bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col',
};

export const THEME_BUTTON_COLORS = {
  slate: {
    bg: 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-black/20 shadow-slate-300',
    border: 'border-black/20'
  },
  indigo: {
    bg: 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-900 shadow-indigo-900/20',
    border: 'border-indigo-900'
  },
  emerald: {
    bg: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-900 shadow-emerald-900/20',
    border: 'border-emerald-900'
  },
  sky: {
    bg: 'bg-sky-500 hover:bg-sky-600 text-white border-sky-700 shadow-sky-700/20',
    border: 'border-sky-700'
  },
  amber: {
    bg: 'bg-amber-500 hover:bg-amber-600 text-white border-amber-700 shadow-amber-700/20',
    border: 'border-amber-700'
  },
  purple: {
    bg: 'bg-purple-600 hover:bg-purple-700 text-white border-purple-900 shadow-purple-900/20',
    border: 'border-purple-900'
  },
  rose: {
    bg: 'bg-rose-500 hover:bg-rose-600 text-white border-rose-700 shadow-rose-700/20',
    border: 'border-rose-700'
  }
} as const;

export type ThemeButtonColor = keyof typeof THEME_BUTTON_COLORS;

// --- Motion Animation Variants ---

/**
 * Standard entrance and exit for floating dropdown menus
 */
export const dropdownMenuVariants = (direction: 'up' | 'down' | 'left' | 'right' = 'down'): Variants => ({
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: direction === 'up' ? 8 : direction === 'down' ? -8 : 0,
    x: direction === 'left' ? 8 : direction === 'right' ? -8 : 0,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1]
    }
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    x: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: direction === 'up' ? 6 : direction === 'down' ? -6 : 0,
    x: direction === 'left' ? 6 : direction === 'right' ? -6 : 0,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1]
    }
  }
});

/**
 * Standard entrance and exit for floating information banners & guides
 */
export const floatingBannerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -14,
    scale: 0.97,
    transition: {
      duration: 0.18,
      ease: [0.4, 0, 1, 1]
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.97,
    transition: {
      duration: 0.18,
      ease: [0.4, 0, 1, 1]
    }
  }
};

/**
 * Standard modal overlay & dialog animations
 */
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

export const modalDialogVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: 12 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.22, 
      ease: [0.16, 1, 0.3, 1] 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.96, 
    y: 8,
    transition: { 
      duration: 0.16, 
      ease: [0.4, 0, 1, 1] 
    }
  }
};

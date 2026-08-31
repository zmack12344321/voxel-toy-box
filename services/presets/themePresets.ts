/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SceneTheme } from '../../types';

export interface ThemeConfig {
  bg: number;
  floor: number;
  gridMain: number;
  gridSub: number;
  ambientIntensity: number;
  keyLightColor: number;
}

export const THEME_PRESETS: Record<SceneTheme, ThemeConfig> = {
  light:  { bg: 0xf0f2f5, floor: 0xdfe3e8, gridMain: 0xcfd8dc, gridSub: 0xe2e8f0, ambientIntensity: 0.6,  keyLightColor: 0xffffff },
  dark:   { bg: 0x111827, floor: 0x1f2937, gridMain: 0x374151, gridSub: 0x4b5563, ambientIntensity: 0.4,  keyLightColor: 0xe5e7eb },
  studio: { bg: 0xfafafa, floor: 0xf5f5f5, gridMain: 0xe5e5e5, gridSub: 0xf5f5f5, ambientIntensity: 0.7,  keyLightColor: 0xffffff },
  dusk:   { bg: 0x1e1b4b, floor: 0x312e81, gridMain: 0x4338ca, gridSub: 0x6366f1, ambientIntensity: 0.35, keyLightColor: 0xfcd34d },
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BiomeConfig {
  surface: string;
  under: string;
  accent: string;
}

export const BIOME_PRESETS: Record<string, BiomeConfig> = {
  desert: {
    surface: '#E8C99B',
    under: '#C4A56E',
    accent: '#D4A547',
  },
  snow: {
    surface: '#F0F4F8',
    under: '#B8C9D6',
    accent: '#FFFFFF',
  },
  forest_floor: {
    surface: '#4A6741',
    under: '#5C4033',
    accent: '#2E5E2E',
  },
  water: {
    surface: '#3AA0C6',
    under: '#1E6E8C',
    accent: '#7DC8E7',
  },
};

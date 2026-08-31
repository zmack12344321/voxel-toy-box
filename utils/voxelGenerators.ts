/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../types';
import { ModelRegistry } from '../models/registry';

/**
 * Generators mapping forwarded to the modular ModelRegistry for backwards compatibility.
 */
export const Generators: Record<string, () => VoxelData[]> = {
  Eagle: () => ModelRegistry.getPresetById('eagle')?.generate() || [],
  Cat: () => ModelRegistry.getPresetById('cat')?.generate() || [],
  Rabbit: () => ModelRegistry.getPresetById('rabbit')?.generate() || [],
  Twins: () => ModelRegistry.getPresetById('twins')?.generate() || [],
  Castle: () => ModelRegistry.getPresetById('castle')?.generate() || [],
  Robot: () => ModelRegistry.getPresetById('robot')?.generate() || [],
  Spaceship: () => ModelRegistry.getPresetById('spaceship')?.generate() || [],
};

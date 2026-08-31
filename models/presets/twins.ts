/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../../types';
import { ModelPreset } from '../types';
import { VoxelBuilder } from '../builder';

export const TwinsPreset: ModelPreset = {
  id: 'twins',
  name: 'Twin Guardians',
  category: 'creatures',
  description: 'A pair of companion eagles perched atop dual cliff pillars overlooking the valley.',
  author: 'Voxel Architect',
  tags: ['eagles', 'duo', 'twins', 'guardians', 'birds'],
  iconName: 'Users',
  palettePreview: ['#4E342E', '#F5F5F5', '#FFD700', '#2E7D32', '#3E2723'],
  generate: (): VoxelData[] => {
    const b = new VoxelBuilder();

    function buildMiniEagle(offsetX: number, offsetZ: number, flipX: boolean) {
      const dir = flipX ? -1 : 1;
      
      // Pillar / Branch
      for (let y = -10; y <= 0; y++) {
        const radius = 2.4 - (y * 0.05);
        b.sphere(offsetX, y, offsetZ, radius, '#3E2723', 1.0, 1.0);
        if (y === 0) {
          b.sphere(offsetX, y + 0.5, offsetZ, radius + 0.4, '#2E7D32', 0.5);
        }
      }

      // Torso
      const EY = 2;
      b.sphere(offsetX, EY + 4.5, offsetZ, 3.2, '#4E342E', 1.3, 1.1);
      // Chest
      b.box(offsetX - 1.2, EY + 3, offsetZ + 2.2, offsetX + 1.2, EY + 6.5, offsetZ + 2.2, '#D7CCC8');
      b.box(offsetX - 0.8, EY + 4, offsetZ + 2.8, offsetX + 0.8, EY + 6.0, offsetZ + 2.8, '#FFFFFF');

      // Wings
      b.box(offsetX - 3.2, EY + 3, offsetZ - 1.5, offsetX - 2.2, EY + 7, offsetZ + 1.5, '#3E2723');
      b.box(offsetX + 2.2, EY + 3, offsetZ - 1.5, offsetX + 3.2, EY + 7, offsetZ + 1.5, '#3E2723');

      // Tail
      b.box(offsetX - 1.2, EY + 1, offsetZ - 3.5, offsetX + 1.2, EY + 3, offsetZ - 2.0, '#FFFFFF');

      // Head
      const HY = EY + 8.5, HZ = offsetZ + 0.8;
      b.sphere(offsetX, HY, HZ, 2.4, '#FFFFFF', 1.0, 1.05);
      
      // Beak facing inward
      b.box(offsetX - 0.6, HY - 0.5, HZ + 2.0, offsetX + 0.6, HY + 0.6, HZ + 3.0, '#FFC107');
      b.set(offsetX, HY - 1.0, HZ + 3.2, '#FFA000');

      // Eyes
      b.set(offsetX - 1.4 * dir, HY + 0.4, HZ + 1.4, '#212121');
      b.set(offsetX - 1.4 * dir, HY + 0.4, HZ + 0.8, '#FFD54F');
      b.set(offsetX + 1.4 * dir, HY + 0.4, HZ + 1.4, '#212121');
      b.set(offsetX + 1.4 * dir, HY + 0.4, HZ + 0.8, '#FFD54F');

      // Talons
      b.box(offsetX - 1.4, EY, offsetZ + 1.2, offsetX - 0.6, EY + 0.8, offsetZ + 2.0, '#FFC107');
      b.box(offsetX + 0.6, EY, offsetZ + 1.2, offsetX + 1.4, EY + 0.8, offsetZ + 2.0, '#FFC107');
    }

    buildMiniEagle(-8, 0, false);
    buildMiniEagle(8, -1, true);

    return b.build();
  }
};

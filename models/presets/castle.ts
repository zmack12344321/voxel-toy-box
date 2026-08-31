/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../../types';
import { ModelPreset } from '../types';
import { VoxelBuilder } from '../builder';

export const CastlePreset: ModelPreset = {
  id: 'castle',
  name: 'Medieval Bastion Tower',
  category: 'architecture',
  description: 'A stone fortress keep featuring fortified battlements, arrow slits, an arched wooden gate, and a fluttering crest banner.',
  author: 'Voxel Architect',
  tags: ['castle', 'tower', 'medieval', 'fortress', 'stone'],
  iconName: 'Castle',
  palettePreview: ['#546E7A', '#37474F', '#78909C', '#8D6E63', '#D32F2F'],
  generate: (): VoxelData[] => {
    const b = new VoxelBuilder();

    // 1. Broad Stone Foundation Base
    b.box(-7, 0, -7, 7, 2, 7, '#37474F');
    // Stone paving steps
    b.box(-3, 0, 8, 3, 0.8, 10, '#455A64');
    b.box(-2, 0.8, 8, 2, 1.4, 9, '#546E7A');

    // 2. Main Tower Shaft (Layered with brick gradient)
    for (let y = 3; y <= 16; y++) {
      const stoneColor = y % 3 === 0 ? '#455A64' : y % 2 === 0 ? '#546E7A' : '#607D8B';
      b.box(-5, y, -5, 5, y, 5, stoneColor);
      
      // Hollow center
      b.box(-3, y, -3, 3, y, 3, '#263238');

      // Arrow slits on sides
      if (y === 8 || y === 12) {
        b.set(0, y, 5, '#111111');
        b.set(0, y, -5, '#111111');
        b.set(5, y, 0, '#111111');
        b.set(-5, y, 0, '#111111');
      }
    }

    // 3. Arched Entrance & Wooden Portcullis
    b.box(-2, 1, 4.5, 2, 6, 5.5, '#4E342E');
    b.box(-1.5, 1, 5.0, 1.5, 5, 5.5, '#3E2723'); // Wood slats
    // Iron bracing studs
    b.setSymmetricX(1.2, 2, 5.6, '#212121');
    b.setSymmetricX(1.2, 4, 5.6, '#212121');
    b.set(0, 5.5, 5.6, '#78909C'); // Keystone arch

    // Torches flanking the door
    [-3.2, 3.2].forEach(tx => {
      b.set(tx, 4, 5.6, '#8D6E63'); // Sconce bracket
      b.set(tx, 5, 5.6, '#FF9800'); // Flame
      b.set(tx, 5.5, 5.6, '#FFD54F');
    });

    // 4. Overhanging Corbel Crown
    b.box(-6, 17, -6, 6, 18, 6, '#455A64');

    // 5. Fortified Battlements (Crenels and Merlons)
    for (let x = -6; x <= 6; x++) {
      for (let z = -6; z <= 6; z++) {
        const isPerimeter = Math.abs(x) === 6 || Math.abs(z) === 6;
        if (isPerimeter) {
          // Merlons every 2 blocks
          const isMerlon = (x + z + 12) % 2 === 0;
          if (isMerlon) {
            b.set(x, 19, z, '#78909C');
            b.set(x, 20, z, '#546E7A');
          } else {
            b.set(x, 19, z, '#37474F');
          }
        }
      }
    }

    // 6. Rooftop Watchtower & Flagpost
    b.box(-2, 19, -2, 2, 22, 2, '#37474F');
    // Wooden flagpole
    for (let fy = 22; fy <= 29; fy++) {
      b.set(0, fy, 0, '#8D6E63');
    }
    // Golden Finial
    b.set(0, 30, 0, '#FFD700');

    // Fluttering Royal Red & Gold Banner
    const bannerShape = [
      { y: 28, z: 1, c: '#D32F2F' }, { y: 28, z: 2, c: '#D32F2F' }, { y: 28, z: 3, c: '#FFD700' }, { y: 28, z: 4, c: '#D32F2F' },
      { y: 27, z: 1, c: '#D32F2F' }, { y: 27, z: 2, c: '#FFD700' }, { y: 27, z: 3, c: '#FFD700' }, { y: 27, z: 4, c: '#D32F2F' }, { y: 27, z: 5, c: '#D32F2F' },
      { y: 26, z: 1, c: '#D32F2F' }, { y: 26, z: 2, c: '#D32F2F' }, { y: 26, z: 3, c: '#FFD700' }, { y: 26, z: 4, c: '#D32F2F' }
    ];

    bannerShape.forEach(pt => {
      // Gentle wind curve
      const windX = Math.sin(pt.z * 0.8) * 0.4;
      b.set(windX, pt.y, pt.z, pt.c);
    });

    return b.build();
  }
};

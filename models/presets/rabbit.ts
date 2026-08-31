/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../../types';
import { ModelPreset } from '../types';
import { VoxelBuilder } from '../builder';
import { CONFIG } from '../../utils/voxelConstants';

export const RabbitPreset: ModelPreset = {
  id: 'rabbit',
  name: 'Forest Snow Bunny',
  category: 'creatures',
  description: 'A fluffy snow rabbit nestled on a mossy hollowed log with wild forest mushrooms.',
  author: 'Voxel Architect',
  tags: ['rabbit', 'bunny', 'forest', 'mushroom', 'cute'],
  iconName: 'Rabbit',
  palettePreview: ['#FFFFFF', '#FFCDD2', '#3E2723', '#D32F2F', '#388E3C'],
  generate: (): VoxelData[] => {
    const b = new VoxelBuilder();
    const LOG_Y = CONFIG.FLOOR_Y + 2.5;
    const RX = 0, RZ = 0;

    // 1. Forest Mossy Log with Hollow Center
    for (let x = -8; x <= 8; x++) {
      const radius = 3.0 + Math.sin(x * 0.4) * 0.4;
      b.sphere(x, LOG_Y, 0, radius, '#3E2723', 0.9, 1.2);
      // Ring cuts at log ends
      if (x === -8 || x === 8) {
        b.sphere(x, LOG_Y, 0, radius - 0.7, '#8D6E63');
      }
      // Top moss vegetation
      if (Math.abs(x) % 2 === 0) {
        b.sphere(x, LOG_Y + radius * 0.85, (Math.sin(x) * 1.5), 1.3, '#388E3C');
      }
    }

    // 2. Wild Red Fly Agaric Mushrooms on log
    // Mushroom 1
    b.box(5, LOG_Y + 2, 2, 5, LOG_Y + 4, 2, '#FFFFFF'); // Stem
    b.sphere(5, LOG_Y + 4.5, 2, 1.6, '#D32F2F', 0.6); // Red cap
    b.set(4.5, LOG_Y + 5.0, 1.5, '#FFFFFF'); // White dot
    b.set(5.5, LOG_Y + 5.0, 2.5, '#FFFFFF');

    // Mushroom 2 (Smaller)
    b.box(-6, LOG_Y + 1.5, -2, -6, LOG_Y + 3.2, -2, '#FFFFFF');
    b.sphere(-6, LOG_Y + 3.6, -2, 1.2, '#D32F2F', 0.6);
    b.set(-6, LOG_Y + 4.0, -2, '#FFFFFF');

    // 3. Bunny Body & Rounded Haunches
    const BY = LOG_Y + 2.6;
    // Rear haunches
    b.sphere(RX - 2.0, BY + 1.8, RZ - 1.8, 2.2, '#FAFAFA', 1.0, 1.2);
    b.sphere(RX + 2.0, BY + 1.8, RZ - 1.8, 2.2, '#FAFAFA', 1.0, 1.2);

    // Fluffy Puffy Tail
    b.sphere(RX, BY + 2.2, RZ - 3.8, 1.4, '#FFFFFF');

    // Main torso
    b.sphere(RX, BY + 2.5, RZ, 2.8, '#F5F5F5', 1.0, 1.1);

    // Front Paws
    b.box(RX - 1.6, BY, RZ + 2.0, RX - 0.6, BY + 1.4, RZ + 3.2, '#FFFFFF');
    b.box(RX + 0.6, BY, RZ + 2.0, RX + 1.6, BY + 1.4, RZ + 3.2, '#FFFFFF');

    // 4. Bunny Head & Cheeks
    const HY = BY + 5.5, HZ = RZ + 1.5;
    b.sphere(RX, HY, HZ, 2.6, '#FFFFFF', 0.95, 1.05);
    // Chubby cheeks
    b.sphere(RX - 1.5, HY - 0.6, HZ + 0.8, 1.4, '#FAFAFA');
    b.sphere(RX + 1.5, HY - 0.6, HZ + 0.8, 1.4, '#FAFAFA');

    // Nose & Mouth
    b.set(RX, HY - 0.4, HZ + 2.6, '#F06292'); // Pink nose

    // Big expressive dark eyes with pink tint
    b.setSymmetricX(1.4, HY + 0.4, HZ + 2.0, '#1A237E');
    b.setSymmetricX(1.4, HY + 0.4, HZ + 2.4, '#111111');
    b.setSymmetricX(1.2, HY + 0.8, HZ + 2.3, '#FFFFFF'); // Highlight

    // 5. Long Upright Curved Bunny Ears
    for (let y = 0; y < 7; y++) {
      const curveZ = -y * 0.3;
      const spreadX = 1.6 + y * 0.15;
      
      // Outer white fur
      b.setSymmetricX(spreadX - 0.5, HY + 2.2 + y, HZ + curveZ, '#FFFFFF');
      b.setSymmetricX(spreadX + 0.5, HY + 2.2 + y, HZ + curveZ, '#FFFFFF');
      b.setSymmetricX(spreadX, HY + 2.2 + y, HZ + curveZ - 0.6, '#FFFFFF');
      
      // Inner soft pink ear canal
      b.setSymmetricX(spreadX, HY + 2.2 + y, HZ + curveZ + 0.2, '#F8BBD0');
    }
    // Rounded ear tips
    b.setSymmetricX(2.4, HY + 9.2, HZ - 2.1, '#FFFFFF');

    return b.build();
  }
};

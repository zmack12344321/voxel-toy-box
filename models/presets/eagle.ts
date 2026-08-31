/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../../types';
import { ModelPreset } from '../types';
import { VoxelBuilder } from '../builder';

export const EaglePreset: ModelPreset = {
  id: 'eagle',
  name: 'Majestic Eagle',
  category: 'creatures',
  description: 'An ultra high-definition golden raptor with sweeping tiered feather flight wings, curved beak, and talons gripping a weathered mossy branch.',
  author: 'Voxel Architect',
  tags: ['bird', 'nature', 'animal', 'wildlife', 'feathers', 'hd'],
  iconName: 'Bird',
  palettePreview: ['#3E2723', '#4E342E', '#FAFAFA', '#FFB300', '#2E7D32'],
  generate: (): VoxelData[] => {
    const b = new VoxelBuilder();

    // 1. Natural Weathered Branch Base with moss & bark knots
    for (let x = -14; x <= 14; x++) {
      const curveY = Math.sin(x * 0.18) * 2.2;
      const curveZ = Math.cos(x * 0.14) * 2.0;
      b.sphere(x, curveY, curveZ, 2.2, '#3E2723');
      // Moss growth on top
      if (Math.abs(x) % 2 === 0) {
        b.sphere(x, curveY + 1.4, curveZ + (Math.sin(x) * 0.8), 1.3, '#2E7D32');
      }
      if (Math.abs(x) % 3 === 1) {
        b.set(x, curveY + 2.2, curveZ, '#4CAF50');
      }
    }

    const EY = 10.0;
    const EZ = 1.0;

    // 2. Powerful Torso & Feathered Chest
    b.sphere(0, EY + 4, EZ, 4.8, '#4E342E', 1.4, 1.2);
    b.sphere(0, EY + 6, EZ + 0.8, 4.4, '#3E2723', 1.3, 1.1);

    // Front Chest Cream/White Feather Streaks
    b.box(-2.5, EY + 2.0, EZ + 3.2, 2.5, EY + 7.5, EZ + 4.2, '#D7CCC8');
    b.box(-1.5, EY + 3.0, EZ + 4.2, 1.5, EY + 6.8, EZ + 4.8, '#F5F5F5');
    b.box(-0.8, EY + 4.0, EZ + 4.8, 0.8, EY + 6.0, EZ + 5.2, '#FFFFFF');

    // 3. Sweeping High-Definition Wings (Multiple tiered feather bands)
    const wingSpans = [
      { x1: 4.0, x2: 9.0, y1: EY + 2.0, y2: EY + 6.0, z1: -3.5, z2: 2.5, c: '#4E342E' },
      { x1: 9.0, x2: 15.0, y1: EY + 4.5, y2: EY + 8.5, z1: -4.0, z2: 2.0, c: '#3E2723' },
      { x1: 15.0, x2: 21.0, y1: EY + 7.0, y2: EY + 11.5, z1: -4.5, z2: 1.5, c: '#2E1C14' },
      { x1: 21.0, x2: 26.0, y1: EY + 10.0, y2: EY + 14.5, z1: -5.0, z2: 0.5, c: '#1A0C08' },
    ];

    wingSpans.forEach(span => {
      b.boxSymmetricX(span.x1, span.y1, EZ + span.z1, span.x2, span.y2, EZ + span.z2, span.c);
      // Secondary covert feathers trailing edge
      b.boxSymmetricX(span.x1 + 0.5, span.y1 - 1.2, EZ + span.z1 - 1.2, span.x2, span.y1 + 0.5, EZ + span.z1, '#212121');
    });

    // Primary Flight Feather Tips (Stepped fanning points)
    const primaryTips = [
      { x1: 24.0, x2: 28.5, y: EY + 13.0, z1: -6.0, z2: -3.0, c: '#111111' },
      { x1: 25.0, x2: 29.5, y: EY + 14.5, z1: -3.5, z2: -0.5, c: '#111111' },
      { x1: 24.5, x2: 29.0, y: EY + 16.0, z1: -1.0, z2: 2.0, c: '#212121' },
      { x1: 23.0, x2: 27.5, y: EY + 17.2, z1: 1.5, z2: 4.0, c: '#3E2723' },
    ];
    primaryTips.forEach(tip => {
      b.boxSymmetricX(tip.x1, tip.y, EZ + tip.z1, tip.x2, tip.y + 1.2, EZ + tip.z2, tip.c);
    });

    // 4. Layered Tail Plumes (Fanned out)
    b.box(-3.5, EY - 1.0, EZ - 6.0, 3.5, EY + 2.0, EZ - 3.0, '#3E2723');
    b.box(-4.5, EY - 2.5, EZ - 10.0, 4.5, EY + 0.5, EZ - 6.0, '#FAFAFA'); // Tail white tip
    b.box(-5.2, EY - 3.5, EZ - 13.5, 5.2, EY - 1.0, EZ - 10.0, '#FFFFFF');

    // 5. White Sculpted Head & Crown
    const HY = EY + 10.0, HZ = EZ + 2.5;
    b.sphere(0, HY, HZ, 3.8, '#FAFAFA', 1.1, 1.15);
    b.sphere(0, HY - 2.5, HZ + 0.5, 3.4, '#F5F5F5', 1.05, 1.05); // Nape feather mantle
    b.box(-2.8, HY + 1.5, HZ + 1.0, 2.8, HY + 4.2, HZ + 3.8, '#FFFFFF'); // Crown crest

    // Sharp Golden Hook Raptor Beak
    b.box(-1.8, HY - 0.8, HZ + 3.5, 1.8, HY + 1.5, HZ + 6.2, '#FFB300');
    b.box(-1.2, HY - 2.2, HZ + 5.0, 1.2, HY + 0.5, HZ + 7.8, '#FFA000'); // Hook curve downward
    b.box(-0.6, HY - 3.4, HZ + 6.5, 0.6, HY - 1.0, HZ + 8.5, '#E65100'); // Razor sharp tip
    b.set(0, HY + 0.8, HZ + 4.5, '#212121'); // Nostril cere

    // Piercing Raptor Eyes & Orbital Brow Ridge
    b.setSymmetricX(2.5, HY + 0.8, HZ + 2.6, '#212121'); // Deep pupil
    b.setSymmetricX(2.5, HY + 0.8, HZ + 1.8, '#FFD54F'); // Amber iris ring
    b.boxSymmetricX(2.2, HY + 1.8, HZ + 1.4, 2.8, HY + 2.5, HZ + 3.2, '#FFFFFF'); // Fierce heavy brow

    // 6. Muscular Thighs & Golden Claws gripping branch
    b.cylinderYSymmetricX(3.0, EY - 3.5, EY + 1.5, EZ + 0.8, 1.8, '#4E342E'); // Feathered thigh
    b.cylinderYSymmetricX(3.0, EY - 6.5, EY - 3.5, EZ + 1.0, 1.1, '#FFA000'); // Golden shank
    
    // 3 Curved Front Claws + Gripping Rear Talon
    b.boxSymmetricX(1.8, EY - 7.5, EZ + 0.8, 4.2, EY - 6.0, EZ + 3.5, '#FFB300');
    b.setSymmetricX(2.0, EY - 7.8, EZ + 4.2, '#212121'); // Outer claw tip
    b.setSymmetricX(3.0, EY - 7.8, EZ + 4.8, '#212121'); // Middle claw tip
    b.setSymmetricX(4.0, EY - 7.8, EZ + 4.2, '#212121'); // Inner claw tip
    b.setSymmetricX(3.0, EY - 6.8, EZ - 1.2, '#212121'); // Rear lock talon

    return b.build();
  }
};

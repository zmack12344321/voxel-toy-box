/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../../types';
import { ModelPreset } from '../types';
import { VoxelBuilder } from '../builder';

export const SpaceshipPreset: ModelPreset = {
  id: 'spaceship',
  name: 'Apex Starfighter',
  category: 'scifi_mech',
  description: 'An agile deep-space interceptor with forward-swept delta wings, glowing ion plasma thrusters, tinted cockpit canopy, and wingtip laser cannons.',
  author: 'Voxel Architect',
  tags: ['spaceship', 'starfighter', 'scifi', 'vehicle', 'jets'],
  iconName: 'Rocket',
  palettePreview: ['#ECEFF1', '#1E88E5', '#00E5FF', '#212121', '#FF1744'],
  generate: (): VoxelData[] => {
    const b = new VoxelBuilder();

    // 1. Sleek Aerodynamic Fuselage Nose & Body
    // Sharp needle nose
    b.box(-0.5, 4, 12, 0.5, 5, 14, '#ECEFF1');
    b.set(0, 4.5, 15, '#1E88E5'); // Radar tip

    // Forward Fuselage expanding back
    for (let z = 0; z <= 12; z++) {
      const width = 1.0 + (12 - z) * 0.25;
      const height = 1.0 + (12 - z) * 0.18;
      b.box(-width, 4 - height, z, width, 4 + height, z, '#ECEFF1');
      // Blue racing stripe on center spine
      b.set(0, 4 + height + 0.2, z, '#1E88E5');
    }

    // 2. Tinted Cockpit Glass Canopy
    b.box(-1.5, 5.0, 3, 1.5, 6.8, 8, '#00E5FF');
    b.box(-1.0, 5.5, 4, 1.0, 7.2, 7, '#E0F7FA'); // Highlight glass glint

    // 3. Main Aft Body & Engine Mounts
    b.box(-4.5, 2.5, -8, 4.5, 6.5, 0, '#ECEFF1');
    // Armored heat shielding
    b.box(-4.0, 2.0, -8, 4.0, 3.0, 0, '#263238');

    // 4. Forward-Swept Delta Wings
    for (let span = 4; span <= 15; span++) {
      const sweepZ = -6 + (span - 4) * 0.8;
      const thickness = Math.max(0.4, 1.2 - (span - 4) * 0.08);
      b.boxSymmetricX(span, 4.2 - thickness, sweepZ - 3, span, 4.2 + thickness, sweepZ + 2, '#ECEFF1');
      
      // Wing trim line
      if (span % 2 === 0) {
        b.setSymmetricX(span, 4.8, sweepZ, '#1E88E5');
      }
    }

    // Wingtip Vertical Stabilizer Fins & Wingtip Cannons
    b.boxSymmetricX(14.5, 3.0, 2.0, 15.5, 8.5, 4.0, '#1E88E5');
    // Laser Cannon Barrels
    b.boxSymmetricX(14.8, 4.0, 4.0, 15.2, 4.5, 9.0, '#212121');
    b.setSymmetricX(15.0, 4.2, 9.5, '#FF1744'); // Glowing muzzle

    // 5. Twin Heavy Ion Plasma Thrusters
    b.boxSymmetricX(2.0, 3.0, -10, 4.5, 6.0, -7, '#263238');
    // Engine Intake & Rings
    b.boxSymmetricX(2.2, 3.2, -11, 4.3, 5.8, -10, '#37474F');
    // Burning Blue Plasma Exhaust Jet
    b.boxSymmetricX(2.5, 3.5, -13, 4.0, 5.5, -11, '#00E5FF');
    b.setSymmetricX(3.2, 4.5, -14, '#FFFFFF'); // Hot center trail

    // 6. Dorsal Tail Fin
    for (let ty = 6; ty <= 12; ty++) {
      const fz = -7 + (ty - 6) * 0.6;
      b.box(-0.6, ty, fz - 2, 0.6, ty, fz + 1, '#1E88E5');
    }

    return b.build();
  }
};

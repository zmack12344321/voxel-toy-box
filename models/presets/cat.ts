/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../../types';
import { ModelPreset } from '../types';
import { VoxelBuilder } from '../builder';
import { CONFIG } from '../../utils/voxelConstants';

export const CatPreset: ModelPreset = {
  id: 'cat',
  name: 'Playful Calico Cat',
  category: 'creatures',
  description: 'An expressive sitting calico cat with patterned tabby patches, pointed ears, a collar bell, and an arched tail.',
  author: 'Voxel Architect',
  tags: ['cat', 'feline', 'pet', 'cute', 'calico'],
  iconName: 'Cat',
  palettePreview: ['#E65100', '#263238', '#FAFAFA', '#FFD54F', '#D32F2F'],
  generate: (): VoxelData[] => {
    const b = new VoxelBuilder();
    const CY = CONFIG.FLOOR_Y + 1;
    const CX = 0, CZ = 0;

    // 1. Paws & Leg Base
    b.sphere(CX - 3.2, CY + 1.5, CZ - 1, 2.2, '#FAFAFA', 0.9, 1.2);
    b.sphere(CX + 3.2, CY + 1.5, CZ - 1, 2.2, '#E65100', 0.9, 1.2);

    // Front Paws (White mittens with pink paw pad accents)
    b.box(CX - 2.2, CY, CZ + 2.5, CX - 0.8, CY + 1.5, CZ + 4.5, '#FFFFFF');
    b.box(CX + 0.8, CY, CZ + 2.5, CX + 2.2, CY + 1.5, CZ + 4.5, '#FFFFFF');
    b.set(CX - 1.5, CY + 0.5, CZ + 4.8, '#FFCDD2');
    b.set(CX + 1.5, CY + 0.5, CZ + 4.8, '#FFCDD2');

    // 2. Body / Torso (Pear shape with Calico patches)
    for (let y = 0; y < 8; y++) {
      const radius = 3.6 - y * 0.18;
      b.sphere(CX, CY + 2 + y, CZ, radius, '#E65100', 1.0, 1.1);
      // White chest & belly bib
      b.sphere(CX, CY + 2 + y, CZ + 1.8, radius * 0.65, '#FAFAFA');
      // Black patch on side
      if (y >= 2 && y <= 6) {
        b.sphere(CX - 2.2, CY + 2 + y, CZ - 0.5, 1.6, '#263238');
      }
    }

    // 3. Collar with Golden Bell
    const collarY = CY + 8.5;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.25) {
      const rx = Math.cos(angle) * 2.8;
      const rz = Math.sin(angle) * 2.8;
      b.set(CX + rx, collarY, CZ + rz, '#D32F2F');
    }
    // Bell on front
    b.sphere(CX, collarY - 0.4, CZ + 3.2, 0.8, '#FFD700');

    // 4. Cat Head
    const CHY = CY + 11.2;
    b.sphere(CX, CHY, CZ, 3.4, '#FAFAFA', 0.95, 1.05);
    // Orange face patch (Right side of face)
    b.sphere(CX + 1.8, CHY + 0.5, CZ + 0.5, 2.2, '#E65100');
    // Dark patch (Left top forehead)
    b.sphere(CX - 1.8, CHY + 1.8, CZ - 0.5, 1.8, '#263238');

    // Muzzle & Cheeks
    b.box(CX - 1.8, CHY - 1.5, CZ + 2.5, CX + 1.8, CHY - 0.2, CZ + 3.6, '#FFFFFF');
    b.set(CX, CHY - 0.4, CZ + 3.9, '#F48FB1'); // Cute pink nose

    // Big expressive emerald green / gold eyes
    b.set(CX - 1.5, CHY + 0.4, CZ + 3.2, '#2E7D32'); // Green iris
    b.set(CX - 1.5, CHY + 0.4, CZ + 3.5, '#111111'); // Pupil
    b.set(CX - 1.2, CHY + 0.7, CZ + 3.5, '#FFFFFF'); // Catchlight highlight

    b.set(CX + 1.5, CHY + 0.4, CZ + 3.2, '#FFB300'); // Amber eye (heterochromia)
    b.set(CX + 1.5, CHY + 0.4, CZ + 3.5, '#111111');
    b.set(CX + 1.8, CHY + 0.7, CZ + 3.5, '#FFFFFF');

    // Whiskers
    b.set(CX - 3.2, CHY - 0.6, CZ + 3.2, '#FFFFFF');
    b.set(CX - 4.0, CHY - 0.4, CZ + 3.0, '#FFFFFF');
    b.set(CX + 3.2, CHY - 0.6, CZ + 3.2, '#FFFFFF');
    b.set(CX + 4.0, CHY - 0.4, CZ + 3.0, '#FFFFFF');

    // 5. Pointed Cat Ears (Shaded inside pink)
    // Left ear (Dark)
    b.box(CX - 2.8, CHY + 3.0, CZ, CX - 1.4, CHY + 4.2, CZ + 1.2, '#263238');
    b.set(CX - 2.2, CHY + 4.8, CZ + 0.5, '#263238');
    b.set(CX - 2.0, CHY + 3.4, CZ + 1.3, '#FFCDD2'); // inner pink

    // Right ear (Orange)
    b.box(CX + 1.4, CHY + 3.0, CZ, CX + 2.8, CHY + 4.2, CZ + 1.2, '#E65100');
    b.set(CX + 2.2, CHY + 4.8, CZ + 0.5, '#E65100');
    b.set(CX + 2.0, CHY + 3.4, CZ + 1.3, '#FFCDD2');

    // 6. Gracefully Curled Tail with Ring Bands
    const tailPoints = [
      { x: 0, y: 0.5, z: -2.5, c: '#E65100' },
      { x: 1.5, y: 0.8, z: -3.5, c: '#E65100' },
      { x: 3.2, y: 1.5, z: -3.2, c: '#263238' },
      { x: 4.5, y: 2.8, z: -1.8, c: '#263238' },
      { x: 4.8, y: 4.5, z: 0.0, c: '#E65100' },
      { x: 4.2, y: 6.2, z: 1.2, c: '#FAFAFA' },
      { x: 3.5, y: 7.2, z: 1.8, c: '#FAFAFA' } // White tail tip
    ];

    tailPoints.forEach(pt => {
      b.sphere(CX + pt.x, CY + pt.y, CZ + pt.z, 1.2, pt.c);
    });

    return b.build();
  }
};

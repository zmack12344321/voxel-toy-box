/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../../types';
import { ModelPreset } from '../types';
import { VoxelBuilder } from '../builder';

export const RobotPreset: ModelPreset = {
  id: 'robot',
  name: 'Titan Mecha Prime',
  category: 'scifi_mech',
  description: 'An ultra high-definition cybernetic combat mech with dual arm-mounted plasma railguns, jump thrusters, and an illuminated arc reactor core.',
  author: 'Voxel Architect',
  tags: ['robot', 'mech', 'scifi', 'cyberpunk', 'armor', 'hd'],
  iconName: 'Bot',
  palettePreview: ['#0D47A1', '#00E5FF', '#ECEFF1', '#FF9100', '#263238'],
  generate: (): VoxelData[] => {
    const b = new VoxelBuilder();

    // 1. Ground Feet & Reinforced Tread Braces
    b.boxSymmetricX(3.5, 0, -4.0, 7.5, 2.5, 4.5, '#1A237E');
    b.boxSymmetricX(4.0, 0, 4.6, 7.0, 1.8, 6.0, '#37474F'); // Reinforced toe armor
    b.boxSymmetricX(4.0, 0, -5.5, 7.0, 1.8, -4.0, '#37474F'); // Rear heel stabilizer
    b.boxSymmetricX(4.2, 2.0, -1.0, 6.8, 3.2, 2.0, '#00E5FF'); // Ankle glow band

    // 2. Ankle & Lower Leg Hydraulics
    b.cylinderYSymmetricX(5.5, 2.5, 9.5, 0, 1.8, '#263238');
    b.boxSymmetricX(3.5, 3.0, -2.8, 7.5, 9.8, 2.8, '#1E88E5'); // Outer calf shell
    b.boxSymmetricX(4.2, 4.0, 2.9, 6.8, 9.0, 4.0, '#90CAF9'); // Polished shin armor plate
    b.boxSymmetricX(4.8, 4.5, -3.8, 6.2, 8.0, -2.8, '#FF6D00'); // Calf booster exhaust

    // 3. Knee Mechanics
    b.cylinderYSymmetricX(5.5, 9.5, 12.0, 0, 1.6, '#37474F');
    b.boxSymmetricX(4.0, 10.2, 1.8, 7.0, 12.8, 3.8, '#ECEFF1'); // Knee shield
    b.setSymmetricX(5.5, 11.5, 3.9, '#00E5FF'); // Knee focus diode

    // 4. Thighs & Actuators
    b.cylinderYSymmetricX(5.5, 12.0, 16.5, 0, 1.7, '#263238');
    b.boxSymmetricX(3.8, 12.5, -2.2, 7.2, 16.2, 2.4, '#1565C0'); // Thigh armor wrap

    // 5. Pelvis / Waist
    b.box(-4.8, 16.0, -3.0, 4.8, 18.8, 3.0, '#263238');
    b.box(-2.2, 16.5, 3.1, 2.2, 18.2, 3.8, '#00E5FF'); // Belt power conduit
    b.boxSymmetricX(3.5, 16.5, -3.2, 5.5, 18.2, 3.2, '#37474F'); // Hip skirt armor

    // 6. Core Torso & Reinforced Breastplate
    b.box(-6.5, 18.8, -4.2, 6.5, 27.5, 4.2, '#0D47A1'); // Heavy chassis
    b.box(-5.5, 20.2, 4.3, 5.5, 26.5, 5.8, '#1976D2'); // Upper chest plate
    b.box(-3.0, 21.0, 5.9, 3.0, 25.2, 6.5, '#00E5FF'); // Heavy Arc Reactor Core
    b.box(-1.2, 22.2, 6.6, 1.2, 24.0, 6.8, '#FFFFFF'); // Superheated plasma core

    // 7. Dual Heavy Jump-Jet Backpack
    b.boxSymmetricX(2.2, 19.5, -6.8, 6.2, 27.0, -4.3, '#37474F');
    b.cylinderYSymmetricX(4.2, 17.5, 19.4, -5.5, 1.5, '#FF3D00'); // Main rocket bell
    b.cylinderYSymmetricX(4.2, 16.5, 17.4, -5.5, 1.0, '#FFEA00'); // Plasma flame trail
    b.boxSymmetricX(2.8, 27.1, -6.5, 5.6, 29.5, -4.6, '#00E5FF'); // Radiator fins

    // 8. Massive Layered Pauldrons & Shoulder Launchers
    b.boxSymmetricX(6.6, 23.5, -4.5, 11.5, 28.5, 4.5, '#ECEFF1');
    b.boxSymmetricX(7.5, 24.2, -4.0, 10.8, 28.0, 5.2, '#1565C0');
    b.boxSymmetricX(8.0, 28.6, -3.0, 10.2, 29.8, 3.0, '#FF9100'); // Hazard warning crest
    b.cylinderYSymmetricX(9.0, 25.0, 27.5, -5.5, 1.2, '#212121'); // Shoulder missile pods

    // 9. High-Caliber Arm Cannons & Manipulators
    b.cylinderYSymmetricX(8.8, 18.5, 23.4, 0, 1.6, '#263238'); // Bicep actuator
    b.boxSymmetricX(7.5, 12.0, -3.0, 10.5, 18.4, 3.0, '#1976D2'); // Heavy forearm
    b.boxSymmetricX(8.0, 8.5, -2.2, 10.0, 11.9, 2.2, '#212121'); // Reinforced manipulator fist
    
    // Twin Plasma Rail Cannons
    b.cylinderYSymmetricX(9.0, 11.0, 17.5, 4.5, 1.4, '#37474F');
    b.cylinderYSymmetricX(9.0, 11.2, 17.3, 7.0, 1.1, '#212121');
    b.boxSymmetricX(8.2, 12.5, 7.5, 9.8, 15.5, 9.8, '#00E5FF'); // Overcharged plasma tip
    b.setSymmetricX(9.0, 14.0, 10.0, '#FFFFFF');

    // 10. Armored Head & Command Sensor Crest
    b.box(-3.5, 27.6, -3.2, 3.5, 32.0, 3.2, '#0D47A1');
    b.box(-2.8, 28.8, 3.3, 2.8, 30.4, 4.0, '#00E5FF'); // Wide panoramic optic visor
    b.box(-0.8, 29.2, 4.1, 0.8, 30.0, 4.3, '#FFFFFF'); // Glint reflection
    b.boxSymmetricX(3.6, 29.5, -2.0, 4.4, 34.2, 0.2, '#FF9100'); // High-gain dual antennas
    b.set(0, 32.5, 1.0, '#FFEA00'); // Commander crest jewel

    return b.build();
  }
};

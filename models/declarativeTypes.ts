/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MirrorAxis = 'none' | 'x' | 'z' | 'xz';

// Core Declarative Commands
export type DeclarativeShapeCommand =
  // Tier 1 & 2 Geometric & Structural Primitives
  | {
      op: 'box';
      at: [number, number, number];
      size: [number, number, number];
      color: string;
      hollow?: boolean;
      wallThickness?: number;
      mirror?: MirrorAxis;
      rotation?: [number, number, number];
    }
  | {
      op: 'cylinder';
      at: [number, number, number];
      radius: number;
      height: number;
      axis?: 'x' | 'y' | 'z';
      color: string;
      hollow?: boolean;
      mirror?: MirrorAxis;
      rotation?: [number, number, number];
    }
  | {
      op: 'sphere' | 'ellipsoid';
      at: [number, number, number];
      radius?: number;
      radii?: [number, number, number];
      color: string;
      hollow?: boolean;
      mirror?: MirrorAxis;
      rotation?: [number, number, number];
    }
  | {
      op: 'cone' | 'pyramid';
      at: [number, number, number];
      baseRadius?: number;
      baseSize?: [number, number];
      height: number;
      color: string;
      mirror?: MirrorAxis;
      rotation?: [number, number, number];
    }
  | {
      op: 'wedge' | 'ramp';
      at: [number, number, number];
      size: [number, number, number];
      direction?: '+x' | '-x' | '+z' | '-z' | '+y' | '-y';
      color: string;
      mirror?: MirrorAxis;
      rotation?: [number, number, number];
    }
  | {
      op: 'capsule' | 'limb';
      from: [number, number, number];
      to: [number, number, number];
      radius?: number;
      radiusStart?: number;
      radiusEnd?: number;
      color: string;
      mirror?: MirrorAxis;
    }
  | {
      op: 'arch' | 'doorway';
      at: [number, number, number];
      width: number;
      height: number;
      depth: number;
      wallThickness?: number;
      style?: 'roman' | 'square';
      color: string;
      mirror?: MirrorAxis;
    }
  | {
      op: 'stairs';
      at: [number, number, number];
      width: number;
      steps: number;
      stepRise?: number;
      stepRun?: number;
      direction?: '+x' | '-x' | '+z' | '-z';
      color: string;
      mirror?: MirrorAxis;
    }
  | {
      op: 'ring' | 'wheel' | 'torus';
      at: [number, number, number];
      radius: number;
      thickness?: number;
      axis?: 'x' | 'y' | 'z';
      spokes?: number;
      spokeThickness?: number;
      color: string;
      mirror?: MirrorAxis;
    }
  | {
      op: 'dome' | 'hemisphere';
      at: [number, number, number];
      radius: number;
      axis?: '+y' | '-y' | '+z' | '-z' | '+x' | '-x';
      hollow?: boolean;
      color: string;
      mirror?: MirrorAxis;
    }
  | {
      op: 'poly_prism' | 'polygon_extrude';
      at: [number, number, number];
      radius: number;
      height: number;
      sides: number; // 3 = triangular prism, 5 = pentagon, 6 = hexagon, 8 = octagon
      axis?: 'x' | 'y' | 'z';
      color: string;
      mirror?: MirrorAxis;
    }
  | {
      op: 'wing' | 'fin';
      from: [number, number, number];
      span: [number, number, number]; // [spanX, spanY, spanZ]
      rootChord: number; // thickness/depth at base
      tipChord: number;  // thickness/depth at tip
      thickness?: number;
      color: string;
      mirror?: MirrorAxis;
    }
  | {
      op: 'spiral_stairs';
      at: [number, number, number];
      radius: number;
      totalHeight: number;
      steps: number;
      stepThickness?: number;
      centralPillarRadius?: number;
      pillarColor?: string;
      color: string;
      mirror?: MirrorAxis;
    }
  | {
      op: 'terrain' | 'noise_patch';
      at: [number, number, number];
      size: [number, number, number]; // [widthX, maxHeightY, depthZ]
      roughness?: number; // 0.1 to 1.0
      color: string;
      underColor?: string;
      mirror?: MirrorAxis;
    }
  | {
      op: 'fence' | 'railing';
      from: [number, number, number];
      to: [number, number, number];
      height: number;
      postSpacing?: number;
      color: string;
      mirror?: MirrorAxis;
    }
  | {
      op: 'trim' | 'bevel_edges';
      at: [number, number, number];
      size: [number, number, number];
      thickness?: number;
      color: string;
      mirror?: MirrorAxis;
    }
  | {
      op: 'tree' | 'foliage';
      at: [number, number, number];
      trunkHeight: number;
      trunkRadius?: number;
      canopyRadius: number;
      trunkColor: string;
      foliageColor: string;
      foliageStyle?: 'sphere' | 'pine' | 'cloud' | 'palm' | 'willow';
      mirror?: MirrorAxis;
    }
  | {
      op: 'line' | 'pipe';
      from: [number, number, number];
      to: [number, number, number];
      thickness?: number;
      color: string;
      mirror?: MirrorAxis;
    }
  | {
      op: 'spline_pipe' | 'curve';
      points: Array<[number, number, number]>;
      thickness?: number;
      color: string;
      mirror?: MirrorAxis;
    }
  // CSG Difference / Carving
  | {
      op: 'carve_box';
      at: [number, number, number];
      size: [number, number, number];
      mirror?: MirrorAxis;
    }
  | {
      op: 'carve_sphere';
      at: [number, number, number];
      radius: number;
      mirror?: MirrorAxis;
    }
  | {
      op: 'carve_cylinder';
      at: [number, number, number];
      radius: number;
      height: number;
      axis?: 'x' | 'y' | 'z';
      mirror?: MirrorAxis;
    }
  // Biome Surface & Water (metadata + expansion)
  | {
      op: 'water' | 'water_surface';
      at: [number, number, number];
      size: [number, number];
      color: string;
      opacity?: number;
      mirror?: MirrorAxis;
    }
  | {
      op: 'desert' | 'snow' | 'forest_floor';
      at: [number, number, number];
      size: [number, number, number];
      roughness?: number;
      color?: string;
      underColor?: string;
      accentColor?: string;
      mirror?: MirrorAxis;
    }
  // Repetition Modifiers
  | {
      op: 'repeat';
      count: number;
      step: [number, number, number];
      command: DeclarativeShapeCommand;
    }
  | {
      op: 'radialRepeat';
      count: number;
      radius: number;
      center?: [number, number, number];
      axis?: 'x' | 'y' | 'z';
      command: DeclarativeShapeCommand;
    }
  // Tier 3: Micro-Accents
  | {
      op: 'accents';
      voxels: Array<{
        at: [number, number, number];
        color: string;
        mirror?: MirrorAxis;
      }>;
    };

export type PaletteEntry = string | {
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: boolean | string;
};

export interface DeclarativeModelPayload {
  name?: string;
  description?: string;
  palette?: Record<string, PaletteEntry>;
  commands: DeclarativeShapeCommand[];
}


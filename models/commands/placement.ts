/** Commands that place or repeat other declarative commands. */
import type { MirrorAxis } from '../declarativeTypes';

export interface ScatterCommand {
  op: 'scatter';
  asset: string | string[];
  area: {
    type: 'ring' | 'box' | 'circle';
    center: [number, number, number];
    innerRadius?: number;
    outerRadius?: number;
    radius?: number;
    size?: [number, number];
  };
  count: number;
  seed?: number;
  minDistance?: number;
  scaleVariance?: [number, number];
  rotationVariance?: boolean;
  snapToSurface?: boolean;
  requireSurface?: boolean;
  maxSlope?: number;
  avoidWater?: boolean;
  mirror?: MirrorAxis;
}

export interface RepeatCommand {
  op: 'repeat';
  count: number;
  step: [number, number, number];
  command: import('../declarativeTypes').DeclarativeShapeCommand;
}

export interface RadialRepeatCommand {
  op: 'radialRepeat';
  count: number;
  radius: number;
  center?: [number, number, number];
  axis?: 'x' | 'y' | 'z';
  command: import('../declarativeTypes').DeclarativeShapeCommand;
}

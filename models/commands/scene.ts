/** Scene-level commands: environment metadata and biome expansion directives. */
import type { MirrorAxis } from '../declarativeTypes';

export interface WaterCommand {
  op: 'water' | 'water_surface';
  at: [number, number, number];
  size: [number, number];
  color: string;
  opacity?: number;
  mirror?: MirrorAxis;
}

export interface BiomeCommand {
  op: 'desert' | 'snow' | 'forest_floor';
  at: [number, number, number];
  size: [number, number, number];
  roughness?: number;
  color?: string;
  underColor?: string;
  accentColor?: string;
  mirror?: MirrorAxis;
}

export interface TropicalIslandCommand {
  op: 'tropical_island';
  at: [number, number, number];
  size: [number, number, number];
  palmCount?: number;
  seed?: number;
  mirror?: MirrorAxis;
}

export interface CoralReefBedCommand {
  op: 'coral_reef_bed';
  center: [number, number, number];
  innerRadius?: number;
  outerRadius?: number;
  mirror?: MirrorAxis;
}

export type SceneCommand = WaterCommand | BiomeCommand | TropicalIslandCommand | CoralReefBedCommand;

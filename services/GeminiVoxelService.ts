/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type } from "@google/genai";
import { VoxelData, SceneWater } from "../types";
import { compileDetailedPayload } from "../models/builder";
import { compileDeclarativePayload } from "./rasterizer/index";
import { DeclarativeModelPayload } from "../models/declarativeTypes";
import { DetailedVoxelModelPayload } from "../models/types";

export interface GenerationOptions {
  prompt: string;
  mode: 'create' | 'morph';
  detailLevel?: 'masterpiece' | 'detailed' | 'classic';
  availableColors?: string[];
  currentVolumeEstimate?: number;
}

export class GeminiVoxelService {
  private static getAI(): GoogleGenAI {
    // In Vite client environment, process.env.API_KEY is defined in vite.config.ts
    const apiKey = (typeof process !== 'undefined' && process.env && (process.env.API_KEY || process.env.GEMINI_API_KEY)) || '';
    if (!apiKey) {
      throw new Error("Gemini API key is required. Please check your project settings.");
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Generates a 3D high-detail model using high-level declarative primitives + micro accents.
   */
  public static async generateModel(options: GenerationOptions): Promise<{ name: string; data: VoxelData[]; water: SceneWater | null }> {
    const ai = this.getAI();
    const model = 'gemini-3.7-flash';

    const { prompt, mode, availableColors = [] } = options;

    let paletteHint = '';
    if (mode === 'morph') {
      const paletteList = availableColors.length > 0 ? availableColors.join(', ') : '#4A3728, #F5F5F7, #FFD700, #2E7D32';
      paletteHint = `
PHYSICAL MORPH CONTEXT: Rebuilding from existing materials. Harmonize with existing palette: [${paletteList}].
`;
    }

    const instructions = `
You are an expert 3D generative architect.
${paletteHint}

TASK: Generate a high-detail, visually stunning 3D model of: "${prompt}".

DECLARATIVE DSL VOCABULARY & RULES:
1. DESIGN & STRUCTURE:
   - Use high-level commands for maximum detail at low token cost:
      * Primitives: 'box' (size, hollow, wallThickness), 'cylinder' (radius, height, axis), 'sphere'/'ellipsoid' (radii/radius), 'cone'/'pyramid' (baseRadius, height), 'wedge'/'ramp' (size, direction: "+z"|"-z"|"+x"|"-x"), 'capsule'/'limb' (from, to, radiusStart, radiusEnd)
      * Compound Helpers: 'dome' (radius, axis: "+y"|"-y"), 'arch' (width, height, depth, style: "roman"|"square"), 'ring'/'wheel' (radius, thickness, axis, spokes), 'poly_prism' (radius, height, sides: 3|5|6|8), 'wing' (from, span: [sx,sy,sz], rootChord, tipChord, thickness), 'stairs'/'spiral_stairs' (radius, totalHeight, steps), 'tree' (trunkHeight, canopyRadius, foliageStyle: "sphere"|"pine"|"cloud"|"palm"|"willow"), 'fence' (from, to, height), 'trim'/'bevel_edges' (at, size, thickness), 'terrain' (at, size: [w, maxH, d], roughness)
      * Biome Surfaces: 'desert' (at, size, roughness: 0.3, color: sand, underColor: tan, accentColor: gold — sand dunes + ripples), 'snow' (at, size, roughness: 0.15, color: white, underColor: pale blue, accentColor: bright white — drifts + ice), 'forest_floor' (at, size, roughness: 0.25, color: green, underColor: brown, accentColor: dark green — terrain + scattered trees). Each produces a full terrain + terrain features automatically.
      * Water Surface: 'water' (at: [x, y, z], size: [width, depth], color: "#hex", opacity: 0.88). Metadata only — no voxels; the engine renders a real Three.js water plane at the given y level. Use for lakes, rivers, oceans. Place at y=0 for ground-level water or y>0 for elevated pools.
   - Boolean Carving (Negative space): 'carve_box', 'carve_sphere', 'carve_cylinder' (cut doors, windows, vents, hollow cockpits).
   - Symmetry Modifiers: 'mirror': "x" | "z" | "xz" (automatically replicates limbs, wings, eyes, wheels, thrusters across symmetry axes).
   - Repetition Loops: 'repeat' (count, step: [dx,dy,dz], command) and 'radialRepeat' (count, radius, axis: "y"|"z", command).
   - Micro Accents: 'accents' (list of { at: [x,y,z], color: "key", mirror: "x" } for pinpoint eyes, glow runes, headlights, buttons, rivets).

2. SPATIAL ALIGNMENT:
   - Center horizontally around x=0, z=0.
   - Ground level begins at y=0.

3. PALETTE:
   - Define named color keys in 'palette' (e.g. "primary", "secondary", "trim", "glow", "dark", "wood", "foliage").

OUTPUT JSON SCHEMA:
{
  "name": "Concise 2-4 word title",
  "palette": { "primary": "#hex", "secondary": "#hex", "trim": "#hex", "glow": "#hex", "accent": "#hex" },
  "commands": [
    { "op": "box", "at": [0, 5, 0], "size": [10, 10, 10], "color": "primary" },
    { "op": "capsule", "from": [5, 5, 0], "to": [12, 8, 0], "radiusStart": 2, "radiusEnd": 1, "color": "secondary", "mirror": "x" },
    { "op": "wing", "from": [5, 5, 0], "span": [10, 0, -4], "rootChord": 6, "tipChord": 2, "color": "primary", "mirror": "x" },
    { "op": "wedge", "at": [0, 11, 2], "size": [8, 3, 6], "direction": "+z", "color": "trim" },
    { "op": "accents", "voxels": [{ "at": [2, 7, 5], "color": "glow", "mirror": "x" }] }
  ]
}
`;

    const response = await ai.models.generateContent({
      model,
      contents: instructions,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
      throw new Error("No response returned from Gemini API");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(response.text.trim());
    } catch (e) {
      throw new Error("Failed to parse AI 3D response.");
    }

    let voxelData: VoxelData[] = [];
    let water: SceneWater | null = null;

    // Handle Declarative format
    if (parsed.commands && Array.isArray(parsed.commands)) {
      const declarativePayload: DeclarativeModelPayload = parsed;
      const compiled = compileDeclarativePayload(declarativePayload);
      voxelData = compiled.voxels;
      water = compiled.water;
    } else if (parsed.boxes || parsed.voxels) {
      // Backwards compatibility for legacy box/voxel format
      const legacyPayload: DetailedVoxelModelPayload = parsed;
      voxelData = compileDetailedPayload(legacyPayload);
    }

    if (voxelData.length === 0) {
      throw new Error("The generated model produced no 3D geometry. Please try a different prompt.");
    }

    const name = parsed.name && typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : prompt;

    return {
      name,
      data: voxelData,
      water
    };
  }
}


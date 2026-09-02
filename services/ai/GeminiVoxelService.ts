/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type } from "@google/genai";
import { VoxelData, SceneWater, AnimatedEntity } from "../../types";
import { compileDetailedPayload } from "../../models/builder";
import { compileSceneSpec } from "../rasterizer/index";
import { DeclarativeModelPayload, SceneSpec } from "../../models/declarativeTypes";
import { DetailedVoxelModelPayload } from "../../models/types";
import { CatalogRetriever } from "./CatalogRetriever";

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
   * Generates a 3D high-detail model using high-level declarative primitives + micro accents + animated entities.
   */
  public static async generateModel(options: GenerationOptions): Promise<{
    name: string;
    data: VoxelData[];
    water: SceneWater | null;
    animatedEntities?: AnimatedEntity[];
  }> {
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

    // Retrieve relevant catalog recipes for few-shot prompt injection
    const relevantRecipes = CatalogRetriever.findRelevantRecipes(prompt, 3);
    const fewShotExamples = CatalogRetriever.formatRecipesForPrompt(relevantRecipes);

    const instructions = `
You are an expert 3D generative architect.
${paletteHint}

TASK: Generate a high-detail, visually stunning 3D model of: "${prompt}".

DECLARATIVE DSL VOCABULARY & RULES:
1. DESIGN & STRUCTURE:
   - Use high-level commands for maximum detail at low token cost:
      * Primitives: 'box' (size, hollow, wallThickness, rotation: [rx,ry,rz] in degrees), 'cylinder' (radius, height, axis, rotation), 'sphere'/'ellipsoid' (radii/radius, rotation), 'cone'/'pyramid' (baseRadius, height, rotation), 'wedge'/'ramp' (size, direction: "+z"|"-z"|"+x"|"-x", rotation), 'capsule'/'limb' (from, to, radiusStart, radiusEnd)
      * Curved Spline Pipes: 'spline_pipe' (points: [[x,y,z], ...], thickness, color) — smooth 3D curves for vines, tentacles, cables, rivers, curved pipes
      * Compound Helpers: 'dome' (radius, axis: "+y"|"-y"), 'arch' (width, height, depth, style: "roman"|"square"), 'ring'/'wheel' (radius, thickness, axis, spokes), 'poly_prism' (radius, height, sides: 3|5|6|8), 'wing' (from, span: [sx,sy,sz], rootChord, tipChord, thickness), 'stairs'/'spiral_stairs' (radius, totalHeight, steps), 'tree' (trunkHeight, canopyRadius, foliageStyle: "sphere"|"pine"|"cloud"|"palm"|"willow"), 'fence' (from, to, height), 'trim'/'bevel_edges' (at, size, thickness), 'terrain' (at, size: [w, maxH, d], roughness)
      * Biome Surfaces: 'desert' (at, size, roughness: 0.3, color: sand, underColor: tan, accentColor: gold — sand dunes + ripples), 'snow' (at, size, roughness: 0.15, color: white, underColor: pale blue, accentColor: bright white — drifts + ice), 'forest_floor' (at, size, roughness: 0.25, color: green, underColor: brown, accentColor: dark green — terrain + scattered trees). Each produces a full terrain + terrain features automatically.
      * Water Surface: 'water' (at: [x, y, z], size: [width, depth], color: "#hex", opacity: 0.88). Metadata only — no voxels; the engine renders a real Three.js water plane at the given y level. Use for lakes, rivers, oceans. Place at y=0 for ground-level water or y>0 for elevated pools.
   - Boolean Carving (Negative space): 'carve_box', 'carve_sphere', 'carve_cylinder' (cut doors, windows, vents, hollow cockpits).
   - Symmetry Modifiers: 'mirror': "x" | "z" | "xz" (automatically replicates limbs, wings, eyes, wheels, thrusters across symmetry axes).
   - Repetition Loops: 'repeat' (count, step: [dx,dy,dz], command) and 'radialRepeat' (count, radius, axis: "y"|"z", command).
   - Micro Accents: 'accents' (list of { at: [x,y,z], color: "key", mirror: "x" } for pinpoint eyes, glow runes, headlights, buttons, rivets).

2. ANIMATED PATH ENTITIES:
   - When the user asks for dynamic motion (e.g. birds flying overhead, fish swimming around reefs, dragons circling a tower, speeders racing on a track):
   - Include an 'animatedEntities' array where each entity follows a closed-loop 3D Catmull-Rom spline trajectory:
     "animatedEntities": [
       {
         "id": "flying_birds",
         "speed": 0.08,
         "waypoints": [[0, 16, 12], [14, 18, 0], [0, 17, -14], [-14, 19, 0]],
         "commands": [
           { "op": "wing", "from": [0,0,0], "span": [3.5, 1.2, -1.8], "rootChord": 1.8, "tipChord": 0.6, "color": "birdWhite", "mirror": "x" }
         ]
       }
     ]

3. SPATIAL ALIGNMENT & ROTATION:
   - Center horizontally around x=0, z=0. Ground level begins at y=0.
   - Use 'rotation': [rx, ry, rz] to tilt, angle, or orient shapes in 3D space.

4. PALETTE:
   - Define named color keys in 'palette' (e.g. "primary", "secondary", "trim", "glow", "dark", "wood", "foliage").
   - Can use hex strings or objects with PBR attributes: { "glow": { "color": "#ff007f", "emissive": true }, "metal": { "color": "#888899", "metalness": 0.8, "roughness": 0.2 } }.

5. CONTEXTUAL CATALOG FEW-SHOT EXAMPLES:
Use the structural patterns and alignment conventions demonstrated in these matched reference recipes:
${fewShotExamples}

OUTPUT JSON SCHEMA:
{
  "name": "Concise 2-4 word title",
  "palette": { "primary": "#hex", "secondary": "#hex", "trim": "#hex", "glow": { "color": "#hex", "emissive": true } },
  "commands": [
    { "op": "box", "at": [0, 5, 0], "size": [10, 10, 10], "color": "primary", "rotation": [0, 45, 0] },
    { "op": "spline_pipe", "points": [[0,0,0], [5,4,2], [10,2,8]], "thickness": 2, "color": "secondary" }
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

    let parsed: Record<string, unknown>;
    try {
      const value: unknown = JSON.parse(response.text.trim());
      parsed = isRecord(value) ? value : {};
    } catch (e) {
      throw new Error("Failed to parse AI 3D response.");
    }

    let voxelData: VoxelData[] = [];
    let water: SceneWater | null = null;
    let animatedEntities: AnimatedEntity[] | undefined = undefined;

    // Handle Declarative format
    if (isDeclarativePayload(parsed)) {
      const declarativePayload = parsed;
      const sceneSpec: SceneSpec = { model: declarativePayload };
      const compiled = compileSceneSpec(sceneSpec);
      voxelData = compiled.voxels;
      water = compiled.water;
      animatedEntities = compiled.animatedEntities;
    } else if (isLegacyPayload(parsed)) {
      // Backwards compatibility for legacy box/voxel format
      const legacyPayload = parsed;
      voxelData = compileDetailedPayload(legacyPayload);
    }

    if (voxelData.length === 0) {
      throw new Error("The generated model produced no 3D geometry. Please try a different prompt.");
    }

    const name = typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : prompt;

    return {
      name,
      data: voxelData,
      water,
      animatedEntities
    };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isDeclarativePayload(value: unknown): value is DeclarativeModelPayload {
  return isRecord(value) && Array.isArray(value.commands);
}

function isLegacyPayload(value: unknown): value is DetailedVoxelModelPayload {
  return isRecord(value) && (
    Array.isArray(value.boxes) ||
    Array.isArray(value.cylinders) ||
    Array.isArray(value.spheres) ||
    Array.isArray(value.voxels)
  );
}

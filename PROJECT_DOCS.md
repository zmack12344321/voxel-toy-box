# Voxel Toy Box — Project Documentation

## 1. Overview

Voxel Toy Box is a browser-based 3D voxel editor built with React, Three.js, and Vite. Users can create voxel models via text prompts (powered by Google Gemini AI), browse and load preset models, and watch physics-based dismantle/rebuild animations. It supports multiple render modes, scene themes, and a water plane.

**Tech stack:** React 19, Three.js (via @types/three), Vite, Tailwind CSS v4, Google Gemini API (`@google/genai`).

---

## 2. Project Structure

```
src/
├── App.tsx                      Root React component — all state, engine init, modal orchestration
├── index.tsx                    ReactDOM entry point
├── types.ts                     Core enums and interfaces
├── vite.config.ts               Vite config (port 3000, Gemini API key, @ alias)
├── services/                    Engine core — 12 service classes
│   ├── VoxelEngine.ts           Main engine — owns all managers, animation loop
│   ├── SceneSetup.ts            Three.js scene, camera, renderer, controls, lights, themes
│   ├── VoxelMesher.ts           Greedy meshing with exterior culling
│   ├── SmoothMesher.ts          Subdivided + Taubin-smoothed mesh
│   ├── MeshLifecycleManager.ts  Creates/destroys all mesh variants
│   ├── VoxelPhysics.ts          Physics simulation (gravity, bounce, floor collision)
│   ├── VoxelStateManager.ts     Raw voxel data storage + density downsampling
│   ├── DeclarativeRasterizer.ts AI declarative commands → VoxelData[]
│   ├── GeminiVoxelService.ts    Gemini API calls for prompt → declarative payload
│   ├── InputHandler.ts          Raycasting + pointer events
│   ├── WaterManager.ts          Three.js Water plane
│   └── VoxelUtils.ts            JSON export, unique colors, stats
├── models/                      Voxel model definitions + builder
│   ├── types.ts                 ModelPreset, DetailedVoxelModelPayload, BoxVolume
│   ├── declarativeTypes.ts      DeclarativeShapeCommand union type
│   ├── builder.ts               VoxelBuilder class — procedural drawing tools
│   ├── registry.ts              ModelRegistry — static map of preset models
│   └── presets/                 7 preset model files
├── utils/                       Constants and generators
│   ├── voxelConstants.ts        CONFIG + COLORS
│   ├── voxelGenerators.ts       Backward-compatible generator wrappers
│   └── biomeHelpers.ts          Terrain generators (desert, snow, forest, water)
├── theme/
│   └── system.ts                Tailwind surface tokens, button colors, motion variants
└── components/                  UI components
    ├── UIOverlay.tsx            Main floating toolbar + settings
    ├── PromptModal.tsx          AI prompt input (create/morph modes)
    ├── JsonModal.tsx            JSON import/export
    ├── ModelLibraryDrawer.tsx   Preset model browser
    ├── WelcomeScreen.tsx        First-visit overlay
    └── ui/                      Shared primitives (Button, Badge, etc.)
```

---

## 3. Core Types (`types.ts`)

| Type | Purpose |
|------|---------|
| `AppState` | Enum: `LOADING`, `READY`, `GENERATING`, `GENERATION_ERROR`, `RAPID Prototype` |
| `RenderMode` | Enum: `MERGED_VOXEL`, `SMOOTH_MARCHING`, `INDIVIDUAL_CUBES` |
| `VoxelData` | `{ x, y, z, color }` — single voxel |
| `SimulationVoxel` | Extends VoxelData with `id`, velocity, rotation, `settled` flag, physics state |
| `RebuildTarget` | `{ x, y, z, color, targetId, startTick, targetTick, startX/Y/Z }` — rebuild animation keyframe |
| `SavedModel` | Stored model: `{ id, name, voxelData, boundingBox, renderMode, createdAt }` |
| `SceneSettings` | `{ backgroundColor, ambientIntensity, directionalIntensity, directionalPosition, floorVisible, gridVisible, shadowsEnabled, fogEnabled, fogColor, fogNear, fogFar, rotationSpeed, sceneTheme }` |
| `SceneWater` | `{ enabled, color, opacity, size, yPosition }` |
| `MeshStats` | `{ voxelCount, uniqueColors, greedyQuadCount, smoothTriangles, segmentedMeshes }` |

---

## 4. Configuration (`vite.config.ts` + `utils/voxelConstants.ts`)

### Vite
- **Port:** 3000
- **Gemini API key:** Injected from env (`VITE_GEMINI_API_KEY`) or hardcoded fallback
- **Alias:** `@` → `./src`

### CONFIG (`voxelConstants.ts`)
| Key | Value | Purpose |
|-----|-------|---------|
| `VOXEL_SIZE` | 1 | World-space unit per voxel |
| `SCENE_FLOOR_Y` | 0 | Y-position of ground plane |
| `SCENE_WIDTH` | 120 | Scene X extent (not enforced, used as hint) |
| `SCENE_DEPTH` | 120 | Scene Z extent |
| `SCENE_HEIGHT` | 64 | Scene Y extent |
| `FLOOR_Y` | 0 | Alias for floor position |
| `PHYSICS.*` | — | Gravity, bounce, velocity, rebuild duration constants |

### COLORS
Named palette: `VOXEL_1` through `VOXEL_10`, `FLOOR`, `GRID`, `WATER` — used by theme, materials, grid.

---

## 5. Services

### 5.1 `VoxelEngine` — Main Orchestrator

The central class. Owns all sub-managers and runs the animation loop.

**Responsibilities:**
- Initializes Three.js scene (`SceneSetup`), camera, controls
- Creates `VoxelStateManager`, `VoxelMesher`, `SmoothMesher`, `MeshLifecycleManager`, `VoxelPhysics`, `InputHandler`, `WaterManager`
- Runs `requestAnimationFrame` loop calling `update(deltaTime)` each frame
- Exposes `loadVoxelModel()` — the primary API to load new voxel data (used by AI generation, preset loading, JSON import)
- Manages dismantle animation: splits merged mesh into per-color segmented meshes, detaches to `VoxelPhysics`, transitions state to `RAPID`
- Manages rebuild animation: generates `RebuildTarget[]` with timing, sends back through `VoxelPhysics`
- Handles `generateFromPrompt()` — calls `DeclarativeRasterizer` then `loadVoxelModel()`
- Handles `morphFromPrompt()` — diffs current voxels, generates morph targets

**State flow:**
```
READY → loadVoxelModel() → meshing → READY
READY → dismantle() → GENERATING → physics loop → RAPID
RAPID → rebuild() → GENERATING → physics loop → READY
READY → generateFromPrompt() → GENERATING → DeclarativeRasterizer → meshing → READY
```

### 5.2 `SceneSetup` — Three.js Scene

Manages the Three.js renderer, scene, camera, controls, lights, floor, grid, fog.

**Key features:**
- `THEME_PRESETS`: `{ light, dark, studio, dusk }` — each sets background color, ambient/directional light intensity, fog color/distance, floor material, grid color
- `applyTheme(name)` switches all scene properties at once
- Creates directional light with shadow map (2048×2048)
- Floor plane: `MeshStandardMaterial` with grid texture overlay
- Grid helper: `THREE.GridHelper`
- OrbitControls: smooth damping, constrained polar angle, zoom limits
- `resize()` handles window resize, updates camera aspect, renderer size, pixel ratio

### 5.3 `VoxelMesher` — Greedy Meshing

Converts `VoxelData[]` into an optimized `THREE.BufferGeometry` using greedy meshing.

**Algorithm:**
1. Build occupancy lookup: `Set<string>` of `"x,y,z"` keys
2. Build color map: `Map<string, number[]>` grouping voxels by color
3. For each color, run greedy meshing per axis (X, Y, Z):
   - For each face direction, find adjacent empty cells
   - Merge coplanar, same-color faces into larger quads (greedy algorithm)
   - Emit 4 vertices + 2 triangles per quad, with normals and UVs
4. Return merged geometry with all colors in a single `BufferGeometry`

**Optimizations:**
- 3D flood-fill exterior culling: identifies exterior-connected voxels, skips interior-only voxels (not fully implemented in current code — interior check is incomplete but the flood-fill structure exists)
- Greedy quad merging drastically reduces triangle count vs per-voxel geometry
- Colors stored as flat `Float32Array` attribute (no material array needed)

### 5.4 `SmoothMesher` — Subdivision + Taubin Smoothing

Produces a smoothed, organic-looking mesh from voxel data.

**Algorithm:**
1. For each voxel, create a box primitive (24 vertices, 12 triangles)
2. Merge all box geometries into one `BufferGeometry`
3. Weld duplicate vertices using `BufferGeometryUtils.mergeVertices()` (tolerance = 0.1)
4. Apply `THREE.TaubinSmoothModifier` (1 iteration)
5. Compute vertex colors from original voxel colors (no texture needed)

**Output:** A single smooth geometry suitable for organic models (characters, terrain).

### 5.5 `MeshLifecycleManager` — Mesh Creation & Destruction

Creates, stores, and disposes all Three.js mesh variants.

**Mesh variants managed:**
| Variant | Purpose |
|---------|---------|
| `mergedMesh` | Greedy-meshed geometry (MERGED_VOXEL mode) |
| `smoothMesh` | Subdivided + smoothed geometry |
| `segmentedMeshes` | Per-color grouped meshes (for dismantle animation) |
| `dynamicVoxelMeshes` | Individual box meshes per voxel (INDIVIDUAL_CUBES + physics) |

**Key methods:**
- `createMergedMesh(voxelData)` → builds from `VoxelMesher`
- `createSmoothMesh(voxelData)` → builds from `SmoothMesher`
- `createSegmentedMeshes(voxelData)` → groups by color, creates separate `Mesh` per group
- `createDynamicVoxelMeshes(voxelData)` → one `BoxGeometry` per voxel for physics
- `setActiveMeshes(mode, scene)` → adds the correct variant to the scene, removes others
- `disposeAll()` → proper Three.js disposal (geometry, material, texture)

### 5.6 `VoxelPhysics` — Physics Simulation

Handles per-voxel physics for dismantle and rebuild animations.

**Data model:**
- `SimulationVoxel[]` — each voxel with `position`, `velocity`, `rotation`, `settled` flag
- After dismantle: voxels are `settled = false`, subject to gravity and bounce
- After rebuild: voxels animate from current position toward `RebuildTarget` positions

**Physics per frame:**
- Gravity: `velocity.y -= GRAVITY * dt`
- Position update: `position += velocity * dt`
- Floor collision: if `position.y < FLOOR_Y + halfHeight`, snap to floor, reverse Y velocity × bounce factor
- Rotation: random angular velocity on all axes
- Settling: when `velocity ≈ 0` and at floor, mark `settled = true`

**Rebuild animation:**
- Each voxel has `targetTick` and `startTick` — timing for staggered return
- Interpolates position from current to target using `lerp`
- When all voxels reach target, calls `onRebuildComplete` callback

### 5.7 `VoxelStateManager` — Data Storage

Stores the current voxel data and provides density downsampling.

**Density downsampling:**
- When voxel count exceeds a threshold, downsamples by merging nearby voxels
- Uses average color for merged groups
- Controlled by `voxelDensity` property
- Prevents AI-generated models from overwhelming the renderer

### 5.8 `DeclarativeRasterizer` — AI Command → Voxels

Converts the AI's declarative command payload into `VoxelData[]`.

**Supported shape commands** (from `DeclarativeShapeCommand` union):
- `box`, `cylinder`, `sphere`, `cone`, `pyramid`, `torus`, `arch`, `staircase`, `ramp`
- `wall`, `floor_plate`, `pillar`, `bezier_spline`, `scatter`, `erosion`
- `heightmap`, `valley`, `terrain`, `trees`, `snow_layer`, `desert_dunes`, `forest_floor`
- `water_surface`, `border`, `outline`, `line`, `pyramid_block`

**Process:**
1. Parse `DeclarativeModelPayload` (array of commands)
2. For each command, call the corresponding rasterizer function
3. Each function generates voxels in a local coordinate space
4. Post-shading: applies ambient occlusion, color variation, edge darkening
5. Merge all voxels, return `VoxelData[]`

### 5.9 `GeminiVoxelService` — AI Generation

Calls the Google Gemini API to generate voxel models from natural language prompts.

**API details:**
- Model: `gemini-3.7-flash`
- Input: user prompt string + optional `VoxelData[]` (for morph mode)
- Output: `DeclarativeModelPayload` (array of `DeclarativeShapeCommand`)
- System prompt instructs the model to output only valid JSON matching the declarative schema

**Modes:**
- **Create:** User prompt → full model generation
- **Morph:** User prompt + current voxels → differential generation (only changed voxels)

### 5.10 `InputHandler` — Raycasting + Events

Handles user interaction with the 3D scene.

**Features:**
- Raycasting on pointer down: detects which voxel was clicked
- Dismantle on click: when in READY state, clicking a voxel triggers dismantle animation
- Hover highlighting: optional outline on hovered voxel
- Integrates with OrbitControls (no conflict — checks pointer events before OrbitControls)

### 5.11 `WaterManager` — Water Plane

Manages a Three.js `Water` object for scene water effects.

**Features:**
- Creates `THREE.Water` geometry (plane) with procedural normal map
- Configurable: color, opacity, size, Y-position
- Toggles on/off based on `SceneWater.enabled`
- Updates water animation each frame

### 5.12 `VoxelUtils` — Utilities

- `exportToJson(voxelData)` → formatted JSON string
- `getUniqueColors(voxelData)` → count of unique colors
- `emitMeshStats(stats)` → dispatches custom event for UI consumption

---

## 6. Models

### 6.1 `types.ts` (models)

| Type | Purpose |
|------|---------|
| `ModelPreset` | `{ id, name, description, category, tags, generation }` — references a generator function |
| `DetailedVoxelModelPayload` | `{ version, name, description, dimensions, voxels }` — direct voxel array format |
| `BoxVolume` | `{ x, y, z, width, height, depth, color }` — axis-aligned box of voxels |
| `ModelCategory` | Enum: `animals`, `architecture`, `characters`, `vehicles`, `nature`, `fantasy`, `misc` |

### 6.2 `declarativeTypes.ts`

Defines the AI's output schema — a union of all supported shape commands.

Each command has:
- `type` — the shape kind (e.g. `"box"`, `"sphere"`, `"terrain"`)
- Shape-specific parameters (position, size, radius, color, density, etc.)

### 6.3 `builder.ts` — VoxelBuilder

A procedural drawing API for creating models programmatically.

**Methods:**
- `set(x, y, z, color)` — place single voxel
- `box(x, y, z, w, h, d, color)` — fill axis-aligned box
- `sphere(cx, cy, cz, r, color)` — fill sphere (Manhattan distance)
- `cylinder(cx, cy, cz, r, h, color, axis)` — fill cylinder along axis
- `line(x1, y1, z1, x2, y2, z2, color)` — Bresenham 3D line
- `fill(color)` — fill entire grid
- `clear()` — reset all voxels
- `getVoxels()` — return `VoxelData[]`
- `shades(baseColor, count)` — generate color ramp (darker → lighter)
- `postShade(intensity)` — apply edge darkening / AO
- `addNoise(amount)` — random color variation
- `mosaic(blockSize)` — pixelation effect
- `mirrorX()`, `mirrorZ()` — symmetry operations

### 6.4 `registry.ts` — ModelRegistry

Static map of all preset models. Each entry maps an ID to a generator function returning `VoxelData[]`.

**Current presets:**
| ID | Name | Category | File |
|----|------|----------|------|
| `eagle` | Eagle | animals | `presets/eagle.ts` |
| `cat` | Cat | animals | `presets/cat.ts` |
| `rabbit` | Rabbit | animals | `presets/rabbit.ts` |
| `twins` | Twins | characters | `presets/twins.ts` |
| `castle` | Castle | architecture | `presets/castle.ts` |
| `robot` | Robot | characters | `presets/robot.ts` |
| `spaceship` | Spaceship | vehicles | `presets/spaceship.ts` |

Each preset file exports a function that uses `VoxelBuilder` to construct the model.

---

## 7. Utils

### 7.1 `voxelGenerators.ts`

Backward-compatible wrappers that delegate to `ModelRegistry.getInstance()`. Kept for API compatibility with older code that imports generator functions directly.

### 7.2 `biomeHelpers.ts`

Terrain generators that return `DeclarativeShapeCommand[]` for use with the declarative system:

| Function | Output |
|----------|--------|
| `desertTerrain(size)` | Sand-colored dunes + heightmap |
| `snowTerrain(size)` | Snow blocks + heightmap |
| `forestFloor(size)` | Dirt base + scattered trees |
| `waterSurface(size, y)` | Water plane command |

---

## 8. Theme (`theme/system.ts`)

Defines Tailwind CSS design tokens and motion variants.

**Surface tokens:** `--surface-primary`, `--surface-secondary`, `--surface-elevated`, `--surface-overlay` — mapped to Tailwind colors for light/dark modes.

**Button colors:** `--button-primary-bg`, `--button-primary-text`, `--button-secondary-bg`, `--button-secondary-text`.

**Motion variants (Framer Motion):**
- `ANIM_SPRING` — spring transition for UI elements
- `ANIM_FADE_IN` — fade-in entrance animation

---

## 9. Components

### 9.1 `App.tsx` — Root Component

Orchestrates all state and manages modals.

**State variables:**
- `appState` — `AppState` enum
- `voxelData` — `VoxelData[]`
- `renderMode` — `RenderMode`
- `sceneSettings` — `SceneSettings`
- `sceneWater` — `SceneWater`
- `meshStats` — `MeshStats`
- Modal visibility: `isPromptModalOpen`, `isJsonModalOpen`, `isLibraryDrawerOpen`
- `selectedModel` — currently loaded model info

**Key handlers:**
- `handleLoadModel(data)` — calls `VoxelEngine.loadVoxelModel()`
- `handleGenerate(prompt, mode)` — calls `VoxelEngine.generateFromPrompt()`
- `handleDismantle()` / `handleRebuild()` — trigger physics animations
- `handleThemeChange(theme)` — calls `SceneSetup.applyTheme()`
- `handleExportJson()` / `handleImportJson(json)` — JSON serialization

### 9.2 `UIOverlay.tsx`

Main floating toolbar with:
- Render mode selector (Merged / Smooth / Cubes)
- Dismantle / Rebuild buttons
- Scene settings panel (theme, lights, fog, floor, grid, shadows, rotation)
- Water toggle
- Export / Import buttons
- Stats display (voxel count, unique colors, quad count)

### 9.3 `PromptModal.tsx`

- Text input for AI prompt
- Mode toggle: Create (new model) or Morph (modify current)
- Loading state while API call runs
- Calls `handleGenerate(prompt, mode)` on submit

### 9.4 `JsonModal.tsx`

- Displays JSON representation of current voxels
- Allows copy/paste for export/import
- Validates JSON structure before importing

### 9.5 `ModelLibraryDrawer.tsx`

- Slide-out drawer showing all preset models from `ModelRegistry`
- Each entry shows name, description, category, tag badges
- Click to load — calls `handleLoadModel(preset.generator())`
- Filter by category

### 9.6 `WelcomeScreen.tsx`

- First-visit overlay (stored in `localStorage`)
- Brief intro text + "Get Started" button
- Dismissed permanently after first interaction

---

## 10. Data Flow

```
User Prompt
    ↓
GeminiVoxelService.generateFromPrompt(prompt)
    ↓
DeclarativeModelPayload (JSON array of shape commands)
    ↓
DeclarativeRasterizer.rasterize(payload)
    ↓
VoxelData[] (array of { x, y, z, color })
    ↓
VoxelStateManager.store(voxelData)   ← density downsampling may occur here
    ↓
MeshLifecycleManager.createMergedMesh(voxelData)
    ↓
THREE.Mesh (added to scene)
    ↓
SceneSetup renders via requestAnimationFrame loop
```

**Dismantle flow:**
```
READY state
    ↓
MeshLifecycleManager.createSegmentedMeshes(voxelData)  ← per-color groups
    ↓
VoxelPhysics.initSimulation(segmentedMeshes)  ← creates SimulationVoxel[]
    ↓
Each frame: VoxelPhysics.update(dt)  ← applies gravity, bounce, rotation
    ↓
MeshLifecycleManager.updateDynamicVoxelMeshes(simulationVoxels)
    ↓
All voxels settled → state = RAPID
```

**Rebuild flow:**
```
RAPID state
    ↓
MeshLifecycleManager.createMergedMesh(originalVoxels)  ← target geometry
    ↓
VoxelPhysics.initRebuild(simulationVoxels, rebuildTargets)
    ↓
Each frame: VoxelPhysics.updateRebuild(dt)  ← lerps positions toward targets
    ↓
All voxels at target → onRebuildComplete() → dispose physics meshes → state = READY
```

---

## 11. Environment

- **Node:** 18+
- **Gemini API key:** Set `VITE_GEMINI_API_KEY` in `.env` or edit `vite.config.ts`
- **Run:** `npm run dev` (Vite dev server on port 3000)
- **Build:** `npm run build` (production bundle)
- **No tests currently defined** (no test framework configured)

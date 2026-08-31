# Voxel Toy Box — System Architecture & Documentation

## 1. Overview

Voxel Toy Box is a browser-based 3D voxel editor built with React, Three.js, and Vite. Users can create voxel models via natural language prompts (powered by Google Gemini AI), browse and load preset models, import/export custom JSON voxel structures, and watch physics-based dismantle/rebuild animations. It supports multiple render modes (greedy meshed voxels, smooth marching cubes, and instanced physics cubes), custom scene themes, and an animated water plane.

**Tech stack:** React 19, Three.js (`three`), Vite, Tailwind CSS v4, Zustand, Google Gemini API (`@google/genai`), Framer Motion, Lucide Icons.

---

## 2. Project Structure

```
├── App.tsx                      Root React component — mounts Three.js container & UI overlays
├── index.tsx                    ReactDOM entry point
├── types.ts                     Core enums and interfaces (AppState, RenderMode, MeshStats, etc.)
├── index.css                    Tailwind CSS entry point
├── vite.config.ts               Vite config (port 3000, Gemini API key, @ alias)
├── services/                    Engine core — service classes
│   ├── VoxelEngine.ts           Main orchestrator — owns setup, state, physics, meshing, lifecycle, water, input
│   ├── SceneSetup.ts            Three.js scene, camera, renderer, controls, lights, themes
│   ├── VoxelMesher.ts           Greedy meshing with face culling
│   ├── SmoothMesher.ts          Marching cubes / smoothed geometry builder
│   ├── MeshLifecycleManager.ts  InstancedMesh & geometry creation/cleanup
│   ├── VoxelPhysics.ts          Physics simulation (dismantle explosion & rebuild morphing)
│   ├── VoxelStateManager.ts     Raw voxel data storage + density downsampling
│   ├── DeclarativeRasterizer.ts AI declarative commands → VoxelData[]
│   ├── GeminiVoxelService.ts    Gemini API calls for prompt → declarative payload
│   ├── InputHandler.ts          Raycasting & click listeners
│   ├── WaterManager.ts          Three.js Water plane
│   ├── MeshSegmentation.ts     Color grouping & mesh segmentation helpers
│   └── VoxelUtils.ts            JSON parser/formatter, unique color extraction
├── models/                      Voxel model definitions & builders
│   ├── types.ts                 ModelPreset, ModelCategory, DetailedVoxelModelPayload
│   ├── declarativeTypes.ts      DeclarativeShapeCommand union type
│   ├── builder.ts               VoxelBuilder procedural drawing tools
│   ├── registry.ts              ModelRegistry static/dynamic presets manager
│   └── presets/                 Preset model definitions (eagle, cat, rabbit, twins, castle, robot, spaceship)
├── store/                       Zustand global stores
│   ├── useEngineStore.ts        Engine instance ref, appState, voxelCount, meshStats, isGenerating
│   └── useUIStore.ts            Presets list, active model name, custom builds/rebuilds, modals & prompt state
├── utils/                       Constants & biome generators
│   ├── voxelConstants.ts        CONFIG + COLORS palette
│   ├── voxelGenerators.ts       Preset generator compatibility wrappers
│   └── biomeHelpers.ts          Terrain helpers (desert, snow, forest, water)
├── theme/                       Design system & styling tokens
│   └── system.ts                Tailwind tokens & Framer Motion variants
└── components/                  React UI components
    ├── hud/                     HUD toolbar, render controls, theme & scene settings, rebuild menu
    ├── library/                 Model library drawer, category filters, quick actions
    ├── modals/                  JSON view/import modal & AI prompt modal
    ├── ui/                      Shared primitives (Button, Badge, Card, Typography, Tooltip)
    └── icons/                   Custom icon assets
```

---

## 3. Core Types (`types.ts`)

| Type | Purpose |
|------|---------|
| `AppState` | Enum: `STABLE`, `DISMANTLING`, `REBUILDING` |
| `RenderMode` | Enum: `MERGED_VOXEL`, `SMOOTH_MARCHING`, `INDIVIDUAL_CUBES` |
| `VoxelData` | `{ x, y, z, color }` — single voxel position and 24-bit hex color integer |
| `SimulationVoxel` | Physics voxel state: `id`, position (`x, y, z`), `color`, linear velocity (`vx, vy, vz`), rotational velocity (`rx, ry, rz`, `rvx, rvy, rvz`) |
| `RebuildTarget` | Keyframe target for rebuild morphing: `{ x, y, z, delay, isRubble? }` |
| `SavedModel` | Model record: `{ name, data: VoxelData[], baseModel? }` |
| `SceneTheme` | Type union: `'light' \| 'dark' \| 'studio' \| 'dusk'` |
| `SceneSettings` | Config: `{ autoRotate, fog, gridFloor, groundPlane, shadows, wireframe, theme, renderMode, marchingResolution, marchingSmoothness, voxelDensity }` |
| `SceneWater` | Water plane settings: `{ level, extent: [number, number], color, opacity }` |
| `MeshStats` | Render performance stats: `{ voxelCount, triangleCount, unmergedTriangles, savingsPercentage, renderMode }` |

---

## 4. Configuration (`vite.config.ts` + `utils/voxelConstants.ts`)

### Vite
- **Port:** 3000
- **Gemini API key:** Injected from env (`GEMINI_API_KEY` or `VITE_GEMINI_API_KEY`)
- **Alias:** `@` → `./`

### CONFIG (`utils/voxelConstants.ts`)
| Key | Value | Purpose |
|-----|-------|---------|
| `VOXEL_SIZE` | 1 | World-space unit size per voxel |
| `SCENE_FLOOR_Y` | 0 | Y-position of ground plane |
| `SCENE_WIDTH` | 120 | Scene X extent hint |
| `SCENE_DEPTH` | 120 | Scene Z extent hint |
| `SCENE_HEIGHT` | 64 | Scene Y extent hint |
| `FLOOR_Y` | 0 | Alias for floor position |
| `PHYSICS.*` | — | Gravity, floor bounce, friction, particle velocity, explosion force & duration constants |

### COLORS
Named palette: `VOXEL_1` through `VOXEL_10`, `FLOOR`, `GRID`, `WATER` — default hex color codes for UI and scene elements.

---

## 5. Services Architecture

### 5.1 `VoxelEngine` — Main Orchestrator

The central service class. Instantiated in `App.tsx` and registered into `useEngineStore`.

**Responsibilities:**
- Initializes Three.js container (`SceneSetup`), camera autofocus, controls, and rendering loop.
- Manages sub-services: `VoxelStateManager`, `MeshLifecycleManager`, `VoxelPhysics`, `WaterManager`, and `InputHandler`.
- `loadInitialModel(data, water?)`: Sets raw voxel data, creates initial meshes, autofocuses camera, and sets state to `AppState.STABLE`.
- `rebuild(targetModel, water?)`: Transitions state to `AppState.REBUILDING` and initiates particle morphing physics towards `targetModel`.
- `dismantle(hitPoint?)`: Transitions state to `AppState.DISMANTLING` and applies directional/global physics explosion force to voxels.
- Exposes controls to adjust marching resolution, smoothness, rendering modes, density downsampling, fog, grid floor, shadows, wireframe, camera parameters, and themes.

**State Flow:**
```
STABLE ── dismantle() ──> DISMANTLING (physics active)
DISMANTLING / STABLE ── rebuild() ──> REBUILDING (staggered particle morph) ──> STABLE
```

### 5.2 `SceneSetup` — Three.js Scene Setup

Manages renderer (`WebGLRenderer`), scene (`Scene`), camera (`PerspectiveCamera`), orbit controls (`OrbitControls`), lighting, floor, grid, and fog.

**Key features:**
- Theme presets: `light`, `dark`, `studio`, `dusk` controlling background color, lighting intensities, fog parameters, floor colors, and grid colors.
- Shadow mapping support (directional light shadow map).
- Responsive window resize handling (`handleResize()`).

### 5.3 `VoxelMesher` — Greedy Meshing

Converts `VoxelData[]` into an optimized `THREE.BufferGeometry` using a greedy quad-merging algorithm.

**Algorithm:**
1. Constructs 3D spatial occupancy grid.
2. Identifies visible exterior faces (culling occluded faces).
3. Merges contiguous coplanar faces of identical color into larger quad geometries.
4. Generates single buffer geometry with packed vertex positions, normals, and colors.

### 5.4 `SmoothMesher` — Marching Cubes & Taubin Smoothing

Generates smooth organic surface meshes from discrete voxel data.

**Algorithm:**
1. Constructs scalar density field from voxel positions.
2. Applies marching cubes algorithm to extract iso-surface geometry.
3. Applies Taubin mesh smoothing to reduce stair-step artifacts while preserving volume.

### 5.5 `MeshLifecycleManager` — Mesh & Physics Buffer Lifecycle

Manages Three.js mesh instances in the scene (`mergedMesh`, `smoothMesh`, `segmentedMesh`, and `InstancedMesh` physics buffers).

**Key features:**
- Allocates dynamic `THREE.InstancedMesh` capacity for physics particle animations during dismantle/rebuild.
- Manages visibility toggles based on current `RenderMode` (`MERGED_VOXEL`, `SMOOTH_MARCHING`, `INDIVIDUAL_CUBES`).
- Disposes geometries, materials, and textures cleanly to avoid WebGL context memory leaks.

### 5.6 `VoxelPhysics` — Particle & Rebuild Simulation

Handles physics simulation for dismantle explosion effects and rebuild morphing transitions.

**Physics features:**
- Gravity, linear velocity, rotational spin, and floor bounce collisions.
- Staggered timing delays (`RebuildTarget.delay`) for organic particle reconstruction animations.
- Dynamic particle settling detection when kinetic energy falls below threshold.

### 5.7 `VoxelStateManager` — State Storage & Downsampling

Stores current active voxel data and handles density downsampling (`setVoxelDensity()`) when voxel count exceeds performance limits.

### 5.8 `DeclarativeRasterizer` — AI Command Rasterizer

Rasterizes declarative shape commands (e.g. `box`, `sphere`, `cylinder`, `heightmap`, `terrain`, `trees`, `water_surface`, etc.) into discrete `VoxelData[]`. Includes post-shading color variations and ambient occlusion highlights.

### 5.9 `GeminiVoxelService` — AI Generation Service

Communicates with Google Gemini API (`gemini-3.7-flash` model) to convert natural language prompts into structured `DeclarativeModelPayload` shape commands for creation or morphing modes.

---

## 6. Models & Presets System

### 6.1 `ModelCategory` (`models/types.ts`)

Enum for organizing model presets in the library UI:
- `creatures` (e.g. Eagle, Cat, Rabbit)
- `scifi_mech` (e.g. Robot, Spaceship, Twins)
- `architecture` (e.g. Castle)
- `objects` (custom imported/generated models)

### 6.2 `ModelRegistry` (`models/registry.ts`)

Static and runtime registry for model presets.
- Preset definitions: `EaglePreset`, `CatPreset`, `RabbitPreset`, `CastlePreset`, `RobotPreset`, `SpaceshipPreset`, `TwinsPreset`.
- `createCustomPreset(name, voxelData, category)`: Registers dynamic user-created or AI-generated models at runtime with auto-extracted palette previews.

---

## 7. State Management (Zustand Stores)

The application separates state into two specialized Zustand stores (`store/`):

### 7.1 `useEngineStore` (`store/useEngineStore.ts`)
- `engine`: Reference to active `VoxelEngine` instance.
- `appState`: Current engine state (`AppState.STABLE`, `DISMANTLING`, `REBUILDING`).
- `voxelCount`: Total active voxel count.
- `meshStats`: Active `MeshStats` (triangles, savings percentage, render mode).
- `isGenerating`: Boolean flag indicating active AI model generation.

### 7.2 `useUIStore` (`store/useUIStore.ts`)
- `presets`: List of registered `ModelPreset` objects.
- `currentBaseModel`: Active model title display.
- `customBuilds` / `customRebuilds`: Saved custom user builds.
- UI Modal toggles: `isModelLibraryOpen`, `isJsonModalOpen`, `jsonModalMode` (`view` | `import`), `isPromptModalOpen`, `promptMode` (`create` | `morph`), `showWelcome`.
- Actions: `selectPreset()`, `rebuildPreset()`, `importJson()`, `submitPrompt()`.

---

## 8. User Interface Components (`components/`)

- `App.tsx`: Main application shell container. Initializes `VoxelEngine` on mounting and renders canvas container + HUD + modals.
- `hud/`: Floating UI Overlay containing theme controls, render mode toggles, setting drawers, dismantle/rebuild triggers, and live mesh performance statistics.
- `library/`: Slide-out `ModelLibraryDrawer` with category filtering, preset cards, palette previews, and quick AI/JSON import actions.
- `modals/`:
  - `JsonModal`: High-performance JSON view & import dialog.
  - `PromptModal`: AI sculpt modal supporting natural language prompts and Create vs Morph mode selection.
- `ui/`: Shared design system primitives built with Tailwind CSS and Framer Motion.

---

## 9. Data & Execution Flow

```
User Prompt (PromptModal)
    ↓
GeminiVoxelService.generateModel()
    ↓
DeclarativeModelPayload (JSON array of shape commands)
    ↓
DeclarativeRasterizer.rasterize()
    ↓
VoxelData[]
    ↓
useUIStore.submitPrompt()
    ↓
VoxelEngine.loadInitialModel() / rebuild()
    ↓
VoxelStateManager & MeshLifecycleManager
    ↓
Three.js Render Loop (SceneSetup)
```

---

## 10. Development & Build Environment

- **Runtime Environment:** Node.js 18+
- **Dev Server:** `npm run dev` (Vite dev server running on port 3000)
- **Production Build:** `npm run build`
- **Type Check:** `npm run typecheck` / TypeScript compiler (`tsc`)

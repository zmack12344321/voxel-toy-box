# Voxel Thing architecture

## Purpose

Voxel Thing is a browser-based voxel scene builder. React presents the editor, declarative payloads describe models and scenes, a rasterizer compiles those payloads to voxel data, and an imperative Three.js runtime renders and animates the result.

## Boundaries

```text
React components
  ↓ intents + observable state
Zustand stores
  ↓ application commands
SceneController / GenerationService / ModelCatalogService
  ↓ ScenePayload and runtime commands
VoxelEngine composition root
  ├─ SceneSetup                  Three.js scene, camera, controls, lighting
  ├─ EngineModelLoader            voxel data → meshes and initial scene state
  ├─ EngineSimulationController   dismantle/rebuild physics transitions
  ├─ EngineRenderCoordinator      per-frame environment and render submission
  ├─ AnimatedEntityRenderer       animated voxel mesh construction
  ├─ EngineFrameLoop               requestAnimationFrame lifecycle
  ├─ EngineSettings                render-quality state and clamping
  ├─ MeshLifecycleManager          mesh allocation, visibility, disposal
  ├─ VoxelStateManager             active/raw voxel state and density
  ├─ VoxelPhysics                  dismantle and rebuild simulation
  └─ WaterManager                  water resources and quality tiers
```

React and stores do not import `VoxelEngine`. `SceneController` is the only application-facing runtime facade. Declarative compilation happens before runtime calls; `ScenePayload` keeps compiled voxel data, water metadata, and animated entities together. `ModelCatalogService` is the application-facing catalog boundary; `ModelRegistry` remains its storage implementation.

## Data flow

1. A preset, imported JSON model, or Gemini response produces model data.
2. Declarative payloads are compiled by `compileDeclarativePayload` in `services/rasterizer`.
3. `SceneController` loads or rebuilds the attached runtime using one `ScenePayload`.
4. `EngineModelLoader` and `MeshLifecycleManager` create renderable meshes.
5. `EngineFrameLoop` drives simulation and `EngineRenderCoordinator` submits frames.

## Contracts

- `models/declarativeTypes.ts` is the compatibility payload union.
- `models/declarativeTypes.ts` also defines canonical `ModelSpec`, `SceneSpec`, and `PlacementRule`; `compileSceneSpec` adapts them to legacy commands.
- `models/commands/placement.ts` contains scatter and repetition contracts.
- `models/commands/scene.ts` contains water and biome scene contracts.
- `services/application/contracts.ts` defines the runtime facade contract.
- `types.ts` defines `ScenePayload`, the complete scene handoff contract.
- `services/application/ModelCatalogService.ts` defines the application-facing catalog operations.
- `services/environment/contracts.ts` defines the swappable environment renderer lifecycle.
- `types.ts` contains runtime data (`VoxelData`, `SceneWater`, `MeshStats`, and state enums).
- `ModelRegistry` exposes one compatibility API over separate shipped and session preset collections.

Scatter supports explicit seeds, minimum spacing, surface requirements, slope limits, and water avoidance. Omitted options retain legacy behavior.

## Ownership rules

- Components render state and dispatch intent; they do not manage Three.js objects.
- Zustand stores hold UI/application-observable state; they do not hold concrete engine instances.
- Application services coordinate generation and runtime commands.
- Runtime modules own Three.js resources and must dispose resources they create.
- A replacement scene invalidates any pending rebuild before loading new runtime state.
- `VoxelStateManager` owns canonical raw voxel data and clones it at its public boundary.
- Compiler modules remain deterministic and side-effect free with respect to the renderer.

## Verification

```bash
npm run test
npx tsc --noEmit
npm run build
```

The staged refactor plan and exit criteria live in [architecture/ROADMAP.md](architecture/ROADMAP.md). The change protocol lives in [.agents/WORKFLOW.md](../.agents/WORKFLOW.md).

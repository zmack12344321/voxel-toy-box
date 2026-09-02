# Voxel Thing Architecture Roadmap

## Purpose

Make the project easy to change while preserving the working voxel experience. This is an incremental refactor. Each milestone must leave the app working and have focused tests before the next one starts.

## Decisions already made

1. Keep the current imperative Three.js renderer. Do not migrate to React Three Fiber during this refactor. React owns UI; the renderer owns frame-by-frame Three.js work.
2. Keep the declarative generation system. It is the product's future interface for LLM output and reusable scene content.
3. Treat `VoxelData` as compiler output, not the universal application model. New product features should begin with declarative model or scene data, then compile to voxels.
4. Refactor by compatibility layer, never flag-day rewrite. Existing presets, imports, prompt generation, physics, and render modes keep working through every milestone.
5. Move orchestration out of Zustand stores. Stores hold observable UI state; one application-facing controller owns commands sent to the engine.
6. Do not touch water, caustics, or visual polish until architecture foundation and profiling exist. Rendering work must be an isolated subsystem, not another responsibility in `VoxelEngine`.
7. Do not add documentation that restates code. Docs explain decisions, boundaries, contracts, and workflows; code explains implementation.

## Target shape

```text
React components
  presentation stores: UI state only
    application layer: scene and generation use cases
      domain contracts: ModelSpec, SceneSpec, AssetDefinition, PlacementRule
        compiler: declarative commands -> VoxelData -> meshes
      infrastructure: Gemini adapter, Three.js runtime, persistence
```

`VoxelEngine` becomes a private runtime behind the application layer. It owns renderer, scene, animation, physics, and mesh updates. It does not know UI, catalog selection, or Gemini prompting.

## Milestones

### M0 — Safety net and change protocol

**Status:** Complete for automated coverage. Vitest, compiler tests, and seeded scatter tests are in place; manual smoke/performance recording remains an operational follow-up.

Manual smoke and measurement procedure: [M0_BASELINE_PROTOCOL.md](./M0_BASELINE_PROTOCOL.md).

**Goal:** Make behavior observable before refactoring.

- Add a TypeScript test runner and tests for pure compiler behavior: declarative payload compilation, pruning, palette resolution, and seeded scatter output.
- Add a small manual smoke checklist: launch app, load a preset, import voxels, create prompt result, morph prompt result, change render mode, dismantle/rebuild, load water scene.
- Record current performance measurements for representative small, medium, and island scenes before changing voxel or meshing code.
- Add architecture links to README only after docs are current.

**Exit:** `tsc --noEmit`, test suite, and manual smoke checklist pass; baseline performance is recorded.

### M1 — Application boundary

**Status:** Complete. `SceneController`, `GenerationService`, and `ModelCatalogService` now own engine/generation/catalog orchestration; stores expose observable UI state and intent dispatch only. Scene application uses an atomic `ScenePayload` contract with compatibility fallbacks for older runtimes.

**Goal:** Components and stores no longer invoke `VoxelEngine` directly.

- Introduce `SceneController` as the only public application facade for engine actions: load, rebuild, configure scene, import, and dispose.
- Move prompt generation orchestration into `GenerationService`; it calls Gemini, validates/compiles result, then asks `SceneController` to apply it.
- Change Zustand stores into state + intent dispatchers. They may call application services, never renderer internals.
- Remove the engine/store import cycle and keep renderer dependencies below the application boundary.

**Exit:** Existing UI flows keep identical behavior; CodeGraph reports no engine/store cycle; controller and generation service have unit tests with mocked engine and AI ports.

### M2 — Canonical scene contracts

**Status:** Complete for compatibility migration. Canonical scene contracts are active across catalog and generation paths; legacy payloads remain supported by adapter.

**Goal:** Make full-scene generation deterministic and reusable.

- Split current command union into `ModelSpec` (geometry/palette/animation), `SceneSpec` (biome, water, lighting, entities), and `PlacementRule` (asset selection, seeded region constraints).
- Keep current `DeclarativeModelPayload` as a compatibility adapter until every shipped preset and Gemini response uses new contracts.
- Make scatter deterministic with explicit seed; enforce spacing, terrain/slope/water constraints, transforms, and asset fallback policy.
- Split static shipped assets from session-created user models.

**Progress:** Scatter now accepts an explicit seed, repeatable placements, optional minimum spacing, surface requirements, slope limits, and water avoidance. The canonical tropical fixture now uses stable seeded palm generation as well. Command-type extraction has started in `models/commands/placement.ts` and `models/commands/scene.ts`; canonical `ModelSpec`, `SceneSpec`, and `PlacementRule` contracts now adapt through `compileSceneSpec` while legacy payloads remain supported. Tropical Island, catalog recipes, and Gemini declarative responses now run through `SceneSpec`; preset load and rebuild paths use the canonical contract. Shipped catalog construction now lives in `models/catalog/staticCatalog.ts`; `ModelRegistry` now keeps shipped and session-created presets in separate collections behind the compatibility API. Legacy payload compilation now preserves boxes, cylinders, spheres, raw voxels, and X symmetry. Saved custom models retain water and animated-entity metadata instead of reducing a scene to geometry only, including when an AI model is selected from the catalog preset list.

**Exit:** Same seed and spec compile identically; tropical island becomes canonical scene fixture; legacy presets work through adapter.

### M3 — Rendering runtime extraction

**Status:** Complete for code refactor. Runtime responsibilities are extracted behind focused modules; browser smoke and performance measurement remain follow-up work.

**Progress:** The requestAnimationFrame clock/scheduling lifecycle now lives in `services/runtime/EngineFrameLoop.ts`; simulation state transitions now live in `services/runtime/EngineSimulationController.ts`; per-frame environment/scene rendering now lives in `services/runtime/EngineRenderCoordinator.ts`; animated entity mesh construction now lives in `services/runtime/AnimatedEntityRenderer.ts`; initial model loading now lives in `services/runtime/EngineModelLoader.ts`; render-quality state now lives in `services/runtime/EngineSettings.ts`; declarative compilation now occurs in `SceneController` before the runtime is called; declarative rebuilds preserve water and animated entities; `ScenePayload` keeps geometry, environment, and animated entities together across the application boundary; `VoxelEngine` directly implements `SceneRuntime` and handles composition while focused runtime modules own scheduling, physics, model loading, settings, animation meshes, and frame submission. Runtime cleanup is idempotent, resize ownership is single-source, wireframe applies across every mesh variant, physics honors injected configuration, rebuild orchestration receives its physics contract at composition time, pending rebuilds are invalidated when replacement scenes load, canonical raw voxel state is clone-protected, and GPU resource disposal is centralized. Runtime lifecycle and simulation tests cover the extracted boundaries.

**Goal:** Shrink `VoxelEngine` into runtime composition root.

- Keep public runtime operations stable while extracting rendering responsibilities into focused modules: scene setup, mesh lifecycle, interaction/physics, environment, and camera.
- Remove declarative compilation and catalog knowledge from engine.
- Profile meshing and render modes before increasing voxel fidelity. Select quality budgets from measured frame time and memory, not fixed guesses.

**Exit:** `VoxelEngine` coordinates modules only; render behavior is covered by smoke tests and mesh statistics fixtures.

### M4 — Environment quality

**Status:** Deferred. Water quality improvements are a separate follow-up plan after browser validation.

**Progress:** Runtime consumers now depend on the `EnvironmentRenderer` contract, with `WaterManager` as the current implementation. Water replacement and disposal are centralized behind that boundary.

**Goal:** Add water and ice without contaminating scene orchestration.

- Define isolated environment renderer contract with quality tiers and explicit resource lifecycle.
- Replace procedural grayscale normal map with quality-controlled normal source; add reflection/refraction and caustics only after profiling.
- Integrate through `SceneSpec.environment`, never directly through UI or store code.

**Exit:** Environment renderer can be created, updated, and disposed independently; default scene performance remains within M0 budget.

## Required workflow

For every meaningful change:

1. Name roadmap milestone in PR/commit task description.
2. Read relevant architecture decision and contract before editing.
3. Add or update focused tests and run TypeScript check.
4. Update this roadmap only when milestone scope/status changes.
5. Add an ADR only for hard-to-reverse decisions: public schema, renderer ownership, dependency adoption, persistence format, or migration policy.

## Documentation maintenance

- Update architecture docs in same change as boundary or contract changes.
- Update content docs when catalog assets, biome rules, or generation vocabulary changes.
- Delete stale claims; do not preserve false history.
- Every documentation page links to source types or tests that keep it honest.

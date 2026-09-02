# Voxel Thing

Voxel Thing is a browser-based voxel scene builder. Users can load shipped models, import voxel data, generate declarative scenes with Gemini, morph between models, and inspect the result through an imperative Three.js renderer.

## Local development

Prerequisites: Node.js 20+.

```bash
npm install
npm run dev
```

Set `GEMINI_API_KEY` in `.env.local` to enable AI generation. The app can still be developed and tested without making generation requests.

## Verification

```bash
npm run test       # unit tests
npx tsc --noEmit   # type check
npm run build      # production build
```

## Architecture

- [Architecture overview](docs/architecture.md) — current boundaries and runtime ownership.
- [Architecture roadmap](docs/architecture/ROADMAP.md) — staged refactor decisions and exit criteria.
- [Agent workflow](.agents/WORKFLOW.md) — change, testing, and documentation protocol.

The application keeps React responsible for presentation and Zustand responsible for observable UI state. `SceneController` is the application boundary for renderer commands; `GenerationService` owns prompt-generation orchestration; declarative payloads compile into voxel data; focused runtime modules compose the Three.js engine.

## Project layout

```text
components/                 React presentation
models/                     presets, catalog, and declarative contracts
services/application/       application-facing use cases and controller
services/rasterizer/        declarative payload compiler
services/runtime/           frame loop, loading, simulation, and rendering
services/meshing/           voxel-to-mesh implementations
store/                      observable UI state and intent dispatch
tests/unit/                 deterministic compiler and boundary tests
```

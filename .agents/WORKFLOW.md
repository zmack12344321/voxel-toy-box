# Agent Workflow

Read `docs/architecture/ROADMAP.md` before making meaningful project changes.

Rules:

1. Preserve current user-visible behavior unless task explicitly changes it.
2. Do not let React components or Zustand stores call Three.js runtime internals directly.
3. Add focused tests before changing compiler contracts, scatter, meshing, generation, or engine boundaries.
4. Keep `VoxelData` inside compilation/rendering paths; new product contracts use declarative specs.
5. Update relevant docs in same change. Add ADR only for hard-to-reverse architecture decisions.

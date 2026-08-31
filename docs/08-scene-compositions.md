# Scene Compositions

Multi-element environment scenes composed from declarative commands.

| # | Scene | Primary Elements | Environment |
|---|-------|------------------|-------------|
| 1 | **Medieval Village** | Market stalls + timber houses + cobblestone path | Forest / Plains |
| 2 | **Desert Oasis** | Sand dunes + palm trees + water pool | Desert |
| 3 | **Castle Keep** | Watchtowers + fortress walls + moat | Plains |
| 4 | **Sci-Fi Outpost** | Landing pad + laser turret + energy core | Volcanic / Moon |
| 5 | **Snowy Cabin** | Gabled roof cabin + pine trees + snow drifts | Taiga / Tundra |

## Execution Pipeline

1. LLM output maps to [`DeclarativeModelPayload`](../models/declarativeTypes.ts).
2. Compiled using `compileDeclarativePayload()` in [`services/rasterizer/index.ts`](../services/rasterizer/index.ts).
3. Evaluates commands, centers geometry, and extracts [`SceneWater`](../types.ts) metadata.
4. Rendered in Three.js scene via [`services/VoxelEngine.ts`](../services/VoxelEngine.ts).

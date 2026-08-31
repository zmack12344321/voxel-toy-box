# Voxel Asset Catalog

Reference lists for declarative LLM generation. Each file = category of pre-composable assets.

## Files

| File | Category | Count | Description |
|------|----------|-------|-------------|
| [01-structure-packs](01-structure-packs.md) | Architecture | 53 | Walls, doors, stairs, roofs, buildings |
| [02-nature-terrain](02-nature-terrain.md) | Environment | 73 | Ground cover, rocks, trees, water, paths |
| [03-furniture-interior](03-furniture-interior.md) | Furniture | 74 | Tables, beds, storage, lighting, decor |
| [04-weapons-equipment](04-weapons-equipment.md) | Gear | 71 | Weapons, armor, tools, instruments |
| [05-vehicles](05-vehicles.md) | Transport | 10 | Land, water, air conveyances |
| [06-scifi-mech](06-scifi-mech.md) | Tech | 15 | Futuristic, robotic, energy |
| [07-creatures](07-creatures.md) | Beings | 69 | Farm, wild, birds, reptiles, fantasy |
| [08-scene-compositions](08-scene-compositions.md) | Scenes | 15 | Multi-element environments |
| [09-palette-sets](09-palette-sets.md) | Colors | 15 | Themed color palettes |
| [10-biome-profiles](10-biome-profiles.md) | Biomes | 15 | Complete environment presets |
| [11-basic-primitives](11-basic-primitives.md) | Primitives | 49 | Single-op building blocks |
| [12-essential-props](12-essential-props.md) | Props | 100 | Camp, graves, signs, farming, mining |

## Priority Order

Implementation order based on foundational importance:

1. **11-basic-primitives** - Foundation for everything
2. **01-structure-packs** - Buildings need walls/doors/windows
3. **02-nature-terrain** - Ground cover for all scenes
4. **12-essential-props** - Common scene elements
5. **03-furniture-interior** - Indoor detail
6. **07-creatures** - Living things
7. **04-weapons-equipment** - Character gear
8. **09-palette-sets** - Theming (needed by all)
9. **05-vehicles** - Transport
10. **10-biome-profiles** - Complete environments
11. **06-scifi-mech** - Specialized
12. **08-scene-compositions** - Composites of above

## DSL Primitives Used

All items use ops from `models/declarativeTypes.ts`:
- Shapes: `box`, `cylinder`, `sphere`, `ellipsoid`, `cone`, `pyramid`, `wedge`, `ramp`, `capsule`, `limb`
- Structural: `arch`, `doorway`, `stairs`, `spiral_stairs`, `ring`, `wheel`, `torus`, `dome`, `hemisphere`
- Detail: `poly_prism`, `wing`, `fin`, `fence`, `railing`, `trim`, `bevel_edges`, `line`, `pipe`
- Nature: `tree`, `foliage`, `terrain`, `noise_patch`, `water`, `water_surface`
- Biomes: `desert`, `snow`, `forest_floor`
- CSG: `carve_box`, `carve_sphere`, `carve_cylinder`
- Modifiers: `repeat`, `radialRepeat`, `accents`
- Mirror: `"none" | "x" | "z" | "xz"` on most commands

## Workflow

1. LLM selects category items by ID
2. Composes commands array from selected items
3. Assigns palette from Palette Sets
4. Wraps in `DeclarativeModelPayload`
5. Engine compiles to voxels

## Status

All items = TODO. Total: ~560 assets to implement.

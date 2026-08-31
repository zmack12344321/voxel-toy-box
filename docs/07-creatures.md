# Creatures

Living beings, wild animals, birds, and fantasy creatures.

## Catalog Items

| # | Item | Category | Core Ops |
|---|------|----------|----------|
| 1 | **Eagle** | Birds | limb wings + cone beak + box body |
| 2 | **Cat** | Animals | sphere head + capsule body + limb tail |
| 3 | **Rabbit** | Animals | sphere head + limb ears + box body |
| 4 | **Wolf** | Animals | box snout + limb legs + capsule body |
| 5 | **Dragon** | Fantasy | wing wings + cone horns + limb tail + terrain base |
| 6 | **Bear** | Animals | box body + sphere head + limb legs |
| 7 | **Owl** | Birds | cylinder body + sphere head + limb wings |
| 8 | **Deer** | Animals | limb legs + limb antlers + capsule body |

## Codebase Integration

- Category: `creatures` in [`models/types.ts`](../models/types.ts) and [`models/registry.ts`](../models/registry.ts).
- Built-in Presets:
  - `EaglePreset` ([`models/presets/eagle.ts`](../models/presets/eagle.ts))
  - `CatPreset` ([`models/presets/cat.ts`](../models/presets/cat.ts))
  - `RabbitPreset` ([`models/presets/rabbit.ts`](../models/presets/rabbit.ts))
- Uses `DeclarativeShapeCommand` ops from [`models/declarativeTypes.ts`](../models/declarativeTypes.ts).

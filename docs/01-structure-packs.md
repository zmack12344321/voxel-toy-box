# Structure Packs

Pre-composed architectural elements. Each self-contained, uses existing DSL ops.

## Basic Architectural Primitives

Single-element building blocks. Foundation for all complex structures.

| # | Pack Name | Components | Scale | Status |
|---|-----------|-----------|-------|--------|
| 1 | **Wall Segment (Stone)** | box (1x4x1) | 1x4x1 | TODO |
| 2 | **Wall Segment (Wood)** | box (1x4x1) | 1x4x1 | TODO |
| 3 | **Wall Segment (Brick)** | box (1x4x1) pattern | 1x4x1 | TODO |
| 4 | **Floor Tile (Stone)** | box (1x0.5x1) | 1x0.5x1 | TODO |
| 5 | **Floor Tile (Wood)** | box (1x0.5x1) | 1x0.5x1 | TODO |
| 6 | **Floor Tile (Marble)** | box (1x0.5x1) | 1x0.5x1 | TODO |
| 7 | **Ceiling Panel** | box (1x0.5x1) | 1x0.5x1 | TODO |
| 8 | **Pillar (Stone)** | cylinder (radius:0.5, height:4) | 1x4x1 | TODO |
| 9 | **Pillar (Wood)** | cylinder (radius:0.4, height:4) | 1x4x1 | TODO |
| 10 | **Pillar (Marble)** | cylinder (radius:0.6, height:4) | 1x4x1 | TODO |
| 11 | **Beam (Wood)** | box (8x0.5x0.5) | 8x0.5x0.5 | TODO |
| 12 | **Beam (Stone)** | box (8x0.8x0.8) | 8x0.8x0.8 | TODO |
| 13 | **Column Base** | box (1.2x0.4x1.2) | 1.2x0.4x1.2 | TODO |
| 14 | **Column Capital** | box (1.2x0.6x1.2) | 1.2x0.6x1.2 | TODO |

## Doorways & Openings

| # | Pack Name | Components | Scale | Status |
|---|-----------|-----------|-------|--------|
| 15 | **Door Frame (Wood)** | box frame + box threshold | 2x3x1 | TODO |
| 16 | **Door Frame (Stone)** | box frame + box threshold | 2x3x1 | TODO |
| 17 | **Door (Wooden, Closed)** | box panel + accents hinges + trim handle | 2x3x0.3 | TODO |
| 18 | **Door (Wooden, Open)** | box panel angled + box frame | 2x3x1 | TODO |
| 19 | **Door (Iron)** | box panel + trim rivets + accents handle | 2x3x0.4 | TODO |
| 20 | **Portcullis** | repeat vertical bars + repeat horizontal bars | 3x4x0.5 | TODO |
| 21 | **Window Open** | carve_box opening + trim frame | 2x2x0.5 | TODO |
| 22 | **Window Glass** | box pane + trim frame + accents reflection | 2x2x0.3 | TODO |
| 23 | **Window Shuttered** | box pane + box shutters x2 | 2x2x0.5 | TODO |
| 24 | **Arrow Slit** | carve_box narrow vertical | 0.3x2x0.5 | TODO |
| 25 | **Loop Hole** | carve_box small circle | 0.5x0.5x0.5 | TODO |

## Stairs & Ramps

| # | Pack Name | Components | Scale | Status |
|---|-----------|-----------|-------|--------|
| 26 | **Stairs (Straight)** | stairs (width:2, steps:8) | 2x4x4 | TODO |
| 27 | **Stairs (L-Shaped)** | stairs + stairs rotated 90 | 4x4x4 | TODO |
| 28 | **Stairs (Spiral)** | spiral_stairs (radius:2, steps:12) | 4x6x4 | TODO |
| 29 | **Ramp (Stone)** | wedge (size:[2,1,4]) | 2x1x4 | TODO |
| 30 | **Ramp (Wood)** | wedge (size:[2,1,4]) | 2x1x4 | TODO |
| 31 | **Stepping Stones** | repeat box small gap | 1x0.3x1 each | TODO |

## Walls & Enclosures

| # | Pack Name | Components | Scale | Status |
|---|-----------|-----------|-------|--------|
| 32 | **Fortress Walls** | box (hollow, wallThickness:2) perimeter + merlons via repeat + gate arch | 40x20x40 | TODO |
| 33 | **Watchtower** | cylinder base + box shaft + dome cap + stairs spiral_stairs interior | 8x24x8 | TODO |
| 34 | **Market Stalls** | box (wood frame) + wedge roof + fence posts + accent lanterns | 6x5x4 each | TODO |
| 35 | **Stone Bridge** | arch span + box supports + fence railings + water underneath | 20x6x8 | TODO |
| 36 | **Ruined Walls** | box fragmented + carve_box decay + trim rubble accents | 16x8x4 | TODO |
| 37 | **Moat & Drawbridge** | water ring + box bridge + capsule chains + cylinder winch | 30x2x30 | TODO |
| 38 | **Tiled Floor Pattern** | repeat box alternating two palette colors | any size | TODO |
| 39 | **Vaulted Ceiling** | repeat arch + dome sections | 12x10x12 | TODO |
| 40 | **Courtyard** | box ground + fence perimeter + tree center + water fountain | 30x8x30 | TODO |
| 41 | **Gatehouse** | twin box towers + arch entrance + dome roofs + flags | 16x14x10 | TODO |
| 42 | **Wooden Fence (Section)** | repeat box posts + box rails | 4x1x0.5 | TODO |
| 43 | **Stone Wall (Low)** | box (1x1x4) | 4x1x1 | TODO |
| 44 | **Stone Wall (High)** | box (1x3x4) | 4x3x1 | TODO |
| 45 | **Hedge Row** | repeat box green | 4x1.5x1 | TODO |

## Roof Types

| # | Pack Name | Components | Scale | Status |
|---|-----------|-----------|-------|--------|
| 46 | **Roof (Gabled)** | wedge x2 meeting at ridge | 6x3x4 | TODO |
| 47 | **Roof (Flat)** | box slab | 6x0.5x6 | TODO |
| 48 | **Roof (Hipped)** | wedge x4 + box cap | 6x3x6 | TODO |
| 49 | **Roof (Thatched)** | wedge x2 (rough texture) | 6x2x4 | TODO |
| 50 | **Roof (Dome)** | dome (hollow) | 6x4x6 | TODO |
| 51 | **Roof Tile** | wedge small (1x0.3x1) | 1x0.3x1 | TODO |
| 52 | **Chimney** | box (hollow) + trim cap | 1x3x1 | TODO |
| 53 | **Dormer Window** | box frame + wedge roof + window | 2x2x2 | TODO |

## Implementation Notes

- All use `DeclarativeShapeCommand` ops from [`models/declarativeTypes.ts`](../models/declarativeTypes.ts)
- Standardized rasterizer compiled via [`services/rasterizer/index.ts`](../services/rasterizer/index.ts)
- `repeat` and `radialRepeat` for repeated elements
- `accents` for lanterns, flags, decorative details
- Maps to category `architecture` in [`models/types.ts`](../models/types.ts) and [`models/registry.ts`](../models/registry.ts)

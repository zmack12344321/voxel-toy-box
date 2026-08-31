# Scene Compositions

Multi-element scenes combining structures, nature, and props.

| # | Scene | Components | Scale |
|---|-------|-----------|-------|
| 1 | **Village Clearing** | 3x market stalls + 2x oak trees + grass terrain + river | 40x40 |
| 2 | **Castle Siege** | fortress walls + watchtower + gatehouse + catapult (box+wedge) | 60x60 |
| 3 | **Forest Camp** | tent (wedge x2) + campfire (cylinder+accents) + log seats + torches | 20x20 |
| 4 | **Harbor Dock** | box pier + 2x rowboat + water surface + barrel accents | 30x30 |
| 5 | **Mountain Pass** | cliff terrain + cave entrance + pine trees + river gorge | 50x50 |
| 6 | **Desert Oasis** | desert terrain + water pool + palm trees + rocks | 40x40 |
| 7 | **Snow Village** | 3x cabins + snow terrain + pine trees + chimney smoke (accents) | 40x40 |
| 8 | **Ruined Temple** | broken pillars (cylinder) + carved arch + vine accents + rubble | 24x24 |
| 9 | **Wizard Tower** | spiral_stairs tower + dome top + chandelier + bookshelf interior | 16x30 |
| 10 | **Docking Bay** | box platform + landing pad + cargo containers + antenna | 30x30 |
| 11 | **Battlefield** | terrain rough + scattered debris (carve_box) + broken weapons | 50x50 |
| 12 | **Marketplace** | 6x stalls + fountain center + cart + crowd accents | 30x30 |
| 13 | **Royal Garden** | hedge rows (fence) + fountain + 4x trees + flower accents | 30x30 |
| 14 | **Dungeon** | box rooms + carve_box corridors + torches + chest + door arch | 24x24 |
| 15 | **Sky Island** | terrain floating + waterfall edge + tree center + cloud accents | 20x20 |

## Dependency Note

Each scene references other packs by ID:
- Structure Packs: #1-10
- Nature & Terrain: #1-17
- Furniture: #1-17
- Vehicles: #1-10

Scenes compose packs, not raw ops.

## Status

All TODO. Each scene = composite preset function calling sub-presets.

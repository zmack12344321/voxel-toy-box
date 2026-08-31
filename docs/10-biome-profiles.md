# Biome Profiles

Complete environment presets combining terrain, water, vegetation, and accents.

| # | Biome | Terrain Op | Water | Trees | Extras |
|---|-------|-----------|-------|-------|--------|
| 1 | **Plains** | terrain (roughness:0.15) | river optional | oak scattered | flower accents |
| 2 | **Taiga** | snow + terrain | frozen lake | pine dense | rock accents |
| 3 | **Tropical** | terrain (roughness:0.2) | coastal water | palm | coral (ring accents) |
| 4 | **Volcanic** | terrain (roughness:0.7, color:"#212121") | lava (water op, red) | none | smoke accents |
| 5 | **Swamp** | terrain (roughness:0.3, color:"#33691E") | water pools | willow | mushroom accents |
| 6 | **Tundra** | snow (roughness:0.1) | ice (water, white) | sparse pine | rock formations |
| 7 | **Canyon** | cliff + terrain layers | river bottom | none | erosion carve_box |
| 8 | **Meadow** | terrain (roughness:0.1, color:"#66BB6A") | stream | oak + cloud tree | flowers |
| 9 | **Rainforest** | terrain (roughness:0.25, color:"#1B5E20") | river + waterfall | palm + willow | vine accents |
| 10 | **Savanna** | terrain (roughness:0.2, color:"#C9A96E") | waterhole | acacia (tree variant) | rock outcrops |
| 11 | **Coral Reef** | underwater terrain | water full | none | ring coral + fish |
| 12 | **Glacier** | snow + ice terrain | frozen river | none | ice cliff carve |
| 13 | **Mushroom Forest** | terrain + mushroom clusters | stream | mushroom tall | glow accents |
| 14 | **Crystal Caves** | terrain underground | pool | none | poly_prism crystals |
| 15 | **Floating Islands** | terrain elevated + carve underside | waterfalls | mixed trees | cloud accents |

## Biome Composition Pattern

Each biome = sequence of:
1. Base terrain (terrain/desert/snow/forest_floor op)
2. Water feature (water op, optional)
3. Vegetation (tree ops, repeated)
4. Accent details (accents op)
5. Structural elements (optional packs from Structure Packs)

## Status

All TODO. Each biome = composite preset function.

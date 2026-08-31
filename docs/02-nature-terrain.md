# Nature & Terrain

Environmental elements, vegetation, water features, and biome surfaces.

## Ground Cover (Single Elements)

Minimal terrain patches. Foundation for ground planes.

| # | Element | Core Ops | Notes |
|---|---------|----------|-------|
| 1 | **Grass Patch** | terrain (roughness:0.15, color:"#4CAF50") | Flat, green |
| 2 | **Dirt Patch** | terrain (roughness:0.2, color:"#795548") | Brown soil |
| 3 | **Sand Patch** | terrain (roughness:0.1, color:"#D4A574") | Beach/desert |
| 4 | **Stone Patch** | terrain (roughness:0.3, color:"#757575") | Rocky ground |
| 5 | **Snow Patch** | terrain (roughness:0.1, color:"#E3F2FD") | White cover |
| 6 | **Ice Patch** | terrain (roughness:0.05, color:"#90CAF9") | Frozen surface |
| 7 | **Mud Patch** | terrain (roughness:0.25, color:"#5D4037") | Wet soil |
| 8 | **Gravel Patch** | terrain (roughness:0.35, color:"#9E9E9E") | Loose stones |
| 9 | **Ash Patch** | terrain (roughness:0.2, color:"#424242") | Volcanic/dead |
| 10 | **Leaf Litter** | terrain (roughness:0.2, color:"#8D6E63") + accents scattered | Forest floor |

## Rocks & Stones

Single rock elements for scatter and formation.

| # | Element | Core Ops | Notes |
|---|---------|----------|-------|
| 11 | **Pebble** | sphere (radius:0.3) | Tiny, smooth |
| 12 | **Small Rock** | sphere (radius:0.6) | Hand-sized |
| 13 | **Medium Rock** | sphere (radii:[1,0.8,1]) | Knee-sized |
| 14 | **Large Rock** | sphere (radii:[2,1.5,2]) | Waist-sized |
| 15 | **Boulder** | sphere (radii:[3,2,3]) + terrain base | Massive |
| 16 | **Flat Stone** | box (2x0.3x2) | Stepping stone |
| 17 | **Jagged Rock** | cone (baseRadius:1, height:2) | Sharp peak |
| 18 | **Mossy Rock** | sphere + accents green | Aged, natural |
| 19 | **Crystal Rock** | poly_prism (sides:6) + accents glow | Magical |
| 20 | **Standing Stone** | cylinder (radius:0.5, height:3) | Monolith |

## Bushes & Shrubs

Low vegetation for ground detail.

| # | Element | Core Ops | Notes |
|---|---------|----------|-------|
| 21 | **Bush (Round)** | sphere (radius:1.5) green | Standard |
| 22 | **Bush (Tall)** | ellipsoid (radii:[1,2,1]) green | Hedge-like |
| 23 | **Bush (Wild)** | sphere + accents berries | Fruit-bearing |
| 24 | **Shrub** | cylinder (radius:0.8, height:1) + sphere top | Small, compact |
| 25 | **Thornbush** | sphere + accents spikes | Dangerous |
| 26 | **Hedge (Section)** | box (2x1x1) green | Man-made |
| 27 | **Vine Patch** | cylinder (thin, hanging) green | Climbing |

## Trees (Expanded)

| # | Element | Core Ops | Notes |
|---|---------|----------|-------|
| 28 | **Oak Tree** | tree (trunkHeight:6, canopyRadius:4, foliageStyle:"sphere") | Standard deciduous |
| 29 | **Pine Tree** | tree (trunkHeight:8, canopyRadius:3, foliageStyle:"pine") | Conifer, tall |
| 30 | **Palm Tree** | tree (trunkHeight:7, canopyRadius:5, foliageStyle:"palm") | Tropical |
| 31 | **Willow Tree** | tree (trunkHeight:6, canopyRadius:5, foliageStyle:"willow") | Drooping branches |
| 32 | **Cloud Tree** | tree (foliageStyle:"cloud", trunkColor:"#8D6E63") | Fantasy, fluffy |
| 33 | **Dead Tree** | cylinder trunk bare + no foliage | Skeletal |
| 34 | **Tree Stump** | cylinder (radius:1, height:1.5) | Cut down |
| 35 | **Fallen Log** | cylinder (axis:"z", radius:0.8, length:6) | Horizontal |
| 36 | **Sapling** | cylinder (thin, height:2) + sphere small green | Young tree |
| 37 | **Bushy Tree** | tree (canopyRadius:5, foliageStyle:"cloud") | Dense canopy |

## Fungi & Flowers

| # | Element | Core Ops | Notes |
|---|---------|----------|-------|
| 38 | **Mushroom (Small)** | cylinder stem + dome cap (radius:0.3) | Single |
| 39 | **Mushroom (Large)** | cylinder stem + dome cap (radius:0.8) | Big |
| 40 | **Mushroom Cluster** | radialRepeat mushroom x5 | Grouped |
| 41 | **Toadstool** | cylinder stem + dome cap red + accents spots | Fairy tale |
| 42 | **Flower (Single)** | cylinder stem + sphere bloom | One flower |
| 43 | **Flower Bed** | repeat flower + terrain base | Patch |
| 44 | **Tulip** | cylinder stem + cone bloom | Specific type |
| 45 | **Rose Bush** | sphere bush + accents red | Flowering |

## Water Features

| # | Element | Core Ops | Notes |
|---|---------|----------|-------|
| 46 | **Puddle** | water (size:[3,3]) | Small, shallow |
| 47 | **Pond** | water (size:[8,8]) + terrain surround | Medium |
| 48 | **Lake** | water (size:[30,30], opacity:0.85) + terrain surround | Large |
| 49 | **River** | water (size:[40,60], color:"#1565C0") + terrain banks | Flowing |
| 50 | **Stream** | water (size:[8,40]) + terrain rocks | Small, winding |
| 51 | **Waterfall** | cylinder water column + water base pool + terrain rocks | Vertical |
| 52 | **Fountain (Basic)** | cylinder basin + cylinder column + water top | Decorative |
| 53 | **Well** | cylinder walls + water bottom + trim rim | Water source |
| 54 | **Hot Spring** | water + terrain + accents steam | Thermal |
| 55 | **Pond with Lily Pads** | water + green accents floating | Natural |

## Terrain Formations

| # | Element | Core Ops | Notes |
|---|---------|----------|-------|
| 56 | **Rock Formation** | terrain (roughness:0.8) + sphere eroded | Jagged rocks |
| 57 | **Cliff Face** | terrain (size:[20,15,8], roughness:0.9) + carve overhangs | Steep |
| 58 | **Cave Entrance** | terrain + carve_box + carve_sphere darkness | Dark opening |
| 59 | **Hill** | terrain (roughness:0.3, size:[15,5,15]) | Gentle rise |
| 60 | **Mound** | terrain (roughness:0.2, size:[6,2,6]) | Small bump |
| 61 | **Ravine** | terrain + carve_box deep cut | Narrow valley |
| 62 | **Riverbank** | terrain sloping + water edge | Shoreline |
| 63 | **Dune** | terrain (roughness:0.25, color:"#D4A574") | Sand hill |
| 64 | **Snowdrift** | terrain (roughness:0.15, color:"#FFFFFF") | Snow pile |
| 65 | **Ice Formation** | poly_prism (sides:6) + sphere cluster | Icicles/crystals |

## Biome Surfaces (DSL Auto-Generated)

| # | Element | DSL Op | Auto-Features |
|---|---------|--------|---------------|
| 66 | **Desert Dunes** | desert (size:[40,6,40], roughness:0.3) | Sand dunes + ripples |
| 67 | **Snow Field** | snow (size:[40,4,40], roughness:0.15) | Drifts + ice |
| 68 | **Forest Floor** | forest_floor (size:[40,8,40]) | Terrain + scattered trees |

## Paths & Trails

| # | Element | Core Ops | Notes |
|---|---------|----------|-------|
| 69 | **Dirt Path** | terrain (roughness:0.1, color:"#8D6E63") narrow | Walking trail |
| 70 | **Cobblestone Path** | repeat box stone pattern narrow | Paved trail |
| 71 | **Wooden Planks** | repeat box wood narrow | Boardwalk |
| 72 | **Stone Steps** | stairs (width:1, steps:3) | Small stairs |
| 73 | **Stepping Stones** | repeat sphere flat across water | Crossing |

## Status

All TODO. Each element = standalone preset function.

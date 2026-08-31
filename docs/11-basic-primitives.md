# Basic Primitives

Standalone single-op items. Foundation for all complex compositions.

## Box Primitives

| # | Name | Op | Params | Notes |
|---|------|----|--------|-------|
| 1 | **Cube (1x1x1)** | box | at:[0,0,0], size:[1,1,1] | Unit cube |
| 2 | **Cube (2x2x2)** | box | at:[0,1,0], size:[2,2,2] | Double unit |
| 3 | **Slab (Flat)** | box | at:[0,0.25,0], size:[2,0.5,2] | Floor tile |
| 4 | **Pillar** | box | at:[0,2,0], size:[1,4,1] | Vertical post |
| 5 | **Beam** | box | at:[0,4,0], size:[8,0.5,0.5] | Horizontal span |
| 6 | **Wall Segment** | box | at:[0,2,0], size:[1,4,1] | Single wall block |
| 7 | **Platform** | box | at:[0,0.5,0], size:[4,1,4] | Raised surface |
| 8 | **Step** | box | at:[0,0.5,0], size:[2,1,2] | Single stair |
| 9 | **Hollow Box** | box | hollow:true, wallThickness:1 | Container shell |
| 10 | **Thin Panel** | box | at:[0,1,0], size:[2,2,0.2] | Flat surface |

## Cylinder Primitives

| # | Name | Op | Params | Notes |
|---|------|----|--------|-------|
| 11 | **Cylinder (Thin)** | cylinder | at:[0,2,0], radius:0.3, height:4 | Pole/rod |
| 12 | **Cylinder (Medium)** | cylinder | at:[0,2,0], radius:0.8, height:4 | Column |
| 13 | **Cylinder (Thick)** | cylinder | at:[0,2,0], radius:1.5, height:4 | Pillar |
| 14 | **Disc** | cylinder | at:[0,0.25,0], radius:2, height:0.5 | Flat circle |
| 15 | **Ring** | ring | at:[0,1,0], radius:2, thickness:0.5 | Torus |
| 16 | **Tube** | cylinder | hollow:true, radius:1, height:4 | Pipe |
| 17 | **Cone** | cone | at:[0,2,0], baseRadius:1, height:4 | Pointed |
| 18 | **Pyramid** | pyramid | at:[0,2,0], baseSize:[2,2], height:4 | Square base |

## Sphere Primitives

| # | Name | Op | Params | Notes |
|---|------|----|--------|-------|
| 19 | **Sphere (Small)** | sphere | at:[0,1,0], radius:0.5 | Ball |
| 20 | **Sphere (Medium)** | sphere | at:[0,1.5,0], radius:1.5 | Large ball |
| 21 | **Sphere (Large)** | sphere | at:[0,3,0], radius:3 | Massive ball |
| 22 | **Ellipsoid** | ellipsoid | at:[0,1,0], radii:[2,1,1] | Stretched sphere |
| 23 | **Dome** | dome | at:[0,2,0], radius:2, axis:"+y" | Half sphere up |
| 24 | **Hemisphere** | hemisphere | at:[0,2,0], radius:2, axis:"-y" | Half sphere down |

## Wedge Primitives

| # | Name | Op | Params | Notes |
|---|------|----|--------|-------|
| 25 | **Ramp (+Z)** | wedge | at:[0,0,0], size:[2,1,4], direction:"+z" | Slope forward |
| 26 | **Ramp (-Z)** | wedge | at:[0,0,0], size:[2,1,4], direction:"-z" | Slope backward |
| 27 | **Ramp (+X)** | wedge | at:[0,0,0], size:[4,1,2], direction:"+x" | Slope right |
| 28 | **Ramp (-X)** | wedge | at:[0,0,0], size:[4,1,2], direction:"-x" | Slope left |
| 29 | **Roof Peak** | wedge x2 | meeting at ridge | Gabled top |

## Capsule Primitives

| # | Name | Op | Params | Notes |
|---|------|----|--------|-------|
| 30 | **Capsule (Short)** | capsule | from:[0,0,0], to:[0,2,0], radius:0.5 | Pill |
| 31 | **Capsule (Long)** | capsule | from:[0,0,0], to:[0,4,0], radius:0.3 | Rod |
| 32 | **Limb** | limb | from:[0,2,0], to:[4,3,0], radiusStart:0.5, radiusEnd:0.3 | Tapered arm |

## Composite Primitives

| # | Name | Op | Params | Notes |
|---|------|----|--------|-------|
| 33 | **Arch (Roman)** | arch | at:[0,2,0], width:3, height:4, depth:1, style:"roman" | Rounded top |
| 34 | **Arch (Square)** | arch | at:[0,2,0], width:3, height:4, depth:1, style:"square" | Flat top |
| 35 | **Poly Prism (Tri)** | poly_prism | at:[0,2,0], radius:1, height:4, sides:3 | Triangle |
| 36 | **Poly Prism (Hex)** | poly_prism | at:[0,2,0], radius:1, height:4, sides:6 | Hexagon |
| 37 | **Poly Prism (Oct)** | poly_prism | at:[0,2,0], radius:1, height:4, sides:8 | Octagon |
| 38 | **Wing** | wing | from:[0,2,0], span:[4,0,0], rootChord:2, tipChord:1 | Aircraft wing |
| 39 | **Fin** | fin | from:[0,2,0], span:[0,0,2], rootChord:1, tipChord:0.5 | Stabilizer |

## Line Primitives

| # | Name | Op | Params | Notes |
|---|------|----|--------|-------|
| 40 | **Line (Vertical)** | line | from:[0,0,0], to:[0,4,0], thickness:0.2 | Pole |
| 41 | **Line (Horizontal)** | line | from:[0,2,0], to:[4,2,0], thickness:0.2 | Beam |
| 42 | **Pipe** | pipe | from:[0,0,0], to:[4,2,0], thickness:0.3 | Conduit |

## Trim & Detail

| # | Name | Op | Params | Notes |
|---|------|----|--------|-------|
| 43 | **Trim (Edge)** | trim | at, size, thickness:0.2 | Border accent |
| 44 | **Bevel** | bevel_edges | at, size, thickness:0.1 | Softened edge |

## Water & Terrain

| # | Name | Op | Params | Notes |
|---|------|----|--------|-------|
| 45 | **Water Plane** | water | at:[0,0,0], size:[10,10], color:"#1565C0" | Flat water |
| 46 | **Terrain Patch** | terrain | at:[0,0,0], size:[10,3,10], roughness:0.3 | Ground |
| 47 | **Desert Patch** | desert | at:[0,0,0], size:[10,2,10] | Sand terrain |
| 48 | **Snow Patch** | snow | at:[0,0,0], size:[10,2,10] | Snow terrain |
| 49 | **Forest Patch** | forest_floor | at:[0,0,0], size:[10,5,10] | Forest terrain |

## Status

All TODO. Each primitive = single op, minimal wrapper function.

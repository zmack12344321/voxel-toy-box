# Palette Sets

Named color palettes for consistent theming across models.

| # | Palette | Colors | Use Case |
|---|---------|--------|----------|
| 1 | **Medieval Stone** | `#37474F, #546E7A, #78909C, #455A64, #263238` | Castles, walls, towers |
| 2 | **Dark Wood** | `#4E342E, #3E2723, #6D4C41, #5D4037, #8D6E63` | Furniture, ships, doors |
| 3 | **Royal** | `#D32F2F, #FFD700, #1A237E, #F5F5F5, #212121` | Banners, thrones, heraldry |
| 4 | **Forest** | `#2E7D32, #4CAF50, #1B5E20, #8D6E63, #795548` | Trees, terrain, nature |
| 5 | **Desert** | `#D4A574, #C9A96E, #F5DEB3, #8B7355, #FFD54F` | Sand, ruins, oases |
| 6 | **Snow/Ice** | `#E3F2FD, #90CAF9, #BBDEFB, #FFFFFF, #E1F5FE` | Winter scenes, frozen |
| 7 | **Volcanic** | `#212121, #D32F2F, #FF6F00, #FF8F00, #4E342E` | Lava, fire, hellscape |
| 8 | **Sci-Fi** | `#00E5FF, #1DE9B6, #263238, #E0E0E0, #7C4DFF` | Mech, tech, energy |
| 9 | **Ocean** | `#0D47A1, #1565C0, #1E88E5, #42A5F5, #E3F2FD` | Water, docks, underwater |
| 10 | **Autumn** | `#E65100, #F9A825, #D84315, #4E3428, #827717` | Fall forest, harvest |
| 11 | **Pastel** | `#F8BBD0, #B39DDB, #81D4FA, #A5D6A7, #FFE082` | Cute, fantasy, magical |
| 12 | **Iron** | `#37474F, #455A64, #607D8B, #78909C, #263238` | Mechanical, industrial |
| 13 | **Jungle** | `#1B5E20, #2E7D32, #4CAF50, #8D6E63, #FFEB3B` | Dense tropical |
| 14 | **Night** | `#1A237E, #283593, #3949AB, #5C6BC0, #E8EAF6` | Dark, moody, nocturnal |
| 15 | **Candy** | `#F48FB1, #CE93D8, #90CAF9, #80CBC4, #FFF59D` | Sweet, playful |

## Palette Key Mapping

Maps to the `palette` object in [`DeclarativeModelPayload`](../models/declarativeTypes.ts):
```json
{
  "primary": "#hex",
  "secondary": "#hex",
  "trim": "#hex",
  "glow": "#hex",
  "accent": "#hex",
  "dark": "#hex",
  "wood": "#hex",
  "foliage": "#hex"
}
```

The rasterizer ([`services/rasterizer/index.ts`](../services/rasterizer/index.ts)) automatically resolves color key names (case-insensitive) to 24-bit integer values during compilation. Built-in voxel colors are defined in [`utils/voxelConstants.ts`](../utils/voxelConstants.ts) (`COLORS`).

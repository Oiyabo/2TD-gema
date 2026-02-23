# Modular Architecture Overview

This procedural world generator has been refactored into clean, modular JavaScript files. Each file is responsible for a specific feature or system.

## Module Structure

### Core Modules (`js/`)

#### **config.js**
- Centralized configuration for all game constants
- Tile size, chunk size, world dimensions
- Noise scales, thresholds, and spawn rates
- All magic numbers in one place for easy tweaking

#### **seed.js**
- **Mulberry32** - Fast deterministic RNG algorithm
- `createSeededRandom(seed)` - Create RNG with seed
- Seeded random utility functions (int, angle)
- **Feature**: Seed System (deterministic generation)

#### **noise.js**
- Simplex Noise integration via CDN
- `createSeededNoise(seed, offset)` - Create seeded noise layers
- `normalizeNoise(value)` - Convert to 0-1 range
- `getDomainWarpedNoise()` - River/natural feature generation
- **Features**: Noise Elevation System, River Generator (Domain Warp)

#### **tile.js**
- `Tile` class - Represents single tile in world
- Properties: elevation, biome, temperature, humidity, structure, object
- Helper methods: `isSolid()`, `isWalkable()`, `reset()`
- **Feature**: Grid Tile System

#### **biome.js**
- `classifyBiome(elevation, temp, humidity)` - Determine biome type
- `getBiomeColor(biome)` - Visual color for rendering
- `isBiomeValidForStructure()` - Placement validation
- **Features**: Biome System, Multi-Layer Terrain (Height Tier)

#### **structure.js**
- `STRUCTURE_TEMPLATES` - Village & Dungeon templates
- `VILLAGE_PIECES` - Individual building pieces
- `rotateTemplate(template, rotations)` - 90° rotation
- `scaleTemplate(template, scale)` - Scale up templates
- `getRandomizedTemplate()` - Random rotation + scale
- `canPlaceStructure()` - Placement validation
- **Features**: Structure System, Structure Template System, Structure Rotation System, Piece-Based Structure Generator

#### **road.js**
- `RoadNode`, `RoadEdge`, `RoadGraph` classes
- `generateVillageRoadGraph()` - Procedural village layout
- `drawLineOnGrid()` - Bresenham line algorithm
- `rasterizeroads()` - Convert graph to tile data
- **Feature**: Village Road Graph Generator

#### **scatter.js**
- `getScatterType()` - Determine object (tree, rock) for tile
- `SCATTER_OBJECTS` - Define object properties by type
- Biome-based spawn rules and density thresholds
- **Feature**: Object Scatter System

#### **chunk.js**
- `generateChunk(cx, cy, ...)` - Main chunk generation
- `ChunkCache` class - Manage chunk lifecycle
- Structure spacing rules (minimal distance)
- Multi-chunk structure detection
- **Features**: Chunk System, Infinite World Streaming, Terrain Flattening, Multi-Chunk Structure System

#### **camera.js**
- `Camera` class - Viewport management
- `CameraInput` class - Keyboard input handling
- World-to-screen coordinate conversion
- Visible chunk/tile range calculation
- **Feature**: Camera System

#### **renderer.js**
- `Renderer` class - Canvas rendering system
- `renderWorld()` - Main render loop with viewport culling
- `drawTile()`, `drawObject()` - Draw methods
- Debug information display
- **Feature**: Rendering (implied by viewport culling in world streaming)

#### **main.js**
- `WorldGenerator` class - Main engine
- Initializes all systems (Camera, Renderer, Chunks, Noise)
- Game loop with update/render cycle
- `regenerateWorld(seed)` - Create new world
- `getStats()` - Debug information

### Entry Point

**main.js** (root)
- Imports `WorldGenerator` from `js/main.js`
- Initializes game on `DOMContentLoaded`

## Features Checklist

✅ **1. Grid Tile System** - `tile.js`
✅ **2. Noise Elevation System** - `noise.js`
✅ **3. Seed System (Deterministic Generation)** - `seed.js`
✅ **4. Camera System** - `camera.js`
✅ **5. Chunk System** - `chunk.js`
✅ **6. Infinite World Streaming** - `chunk.js`, `renderer.js`
✅ **7. Biome System** - `biome.js`
✅ **8. Structure Generator** - `structure.js`, `chunk.js`
✅ **9. Structure Template System** - `structure.js`
✅ **10. Structure Rotation System** - `structure.js`
✅ **11. Multi-Chunk Structure System** - `chunk.js`
✅ **12. Terrain Flattening** - `chunk.js`
✅ **13. Piece-Based Structure Generator** - `structure.js`
✅ **14. Village Road Graph Generator** - `road.js`
✅ **15. River Generator (Domain Warp)** - `noise.js`
✅ **16. Multi-Layer Terrain (Height Tier)** - `biome.js`, `chunk.js`
✅ **17. Object Scatter System** - `scatter.js`

## Architecture Diagram

```
WorldGenerator (main.js)
├── Renderer (renderer.js)
│   └── Camera (camera.js)
├── Camera + CameraInput
├── ChunkCache
│   └── generateChunk()
│       ├── Structure Placement
│       ├── Tiles
│       │   ├── Noise Sampling (noise.js)
│       │   ├── Biome Classification (biome.js)
│       │   ├── Structure Application (structure.js)
│       │   └── Object Scatter (scatter.js)
│       └── Road Generation (road.js)
└── Noise Layer Functions
    ├── Elevation
    ├── Temperature
    └── Humidity
```

## Usage

```javascript
// Access from browser console
worldGenerator.regenerateWorld(54321);  // New seed
worldGenerator.getStats();               // Get current state
worldGenerator.stop();                   // Stop engine
```

## Configuration

Edit [config.js](config.js) to adjust:
- Tile and chunk sizes
- World dimensions
- Noise scales and thresholds
- Structure spawn rates
- Object density
- Camera speed

## Key Design Decisions

1. **Modular exports** - Each file exports only what's needed
2. **Single responsibility** - Each module handles one system
3. **Configuration centralization** - All constants in `config.js`
4. **Class-based architecture** - Tile, Camera, Renderer use ES6 classes
5. **Functional utilities** - Noise, biome, scatter use pure functions
6. **Seeded determinism** - All generation uses seeded RNG for reproducibility
7. **Viewport culling** - Only render visible tiles for performance

## Next Steps (From Documentation Roadmap)

- [ ] Structure Collision Solver
- [ ] Bounding Box System
- [ ] Tile Auto-Tiling (Bitmask / Wang Tiles)
- [ ] Cave Generator (Cellular Automata)
- [ ] Dimension System (multi-world layer)
- [ ] LOD Rendering
- [ ] Tile Atlas Optimization

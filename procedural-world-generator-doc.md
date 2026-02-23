# Procedural World Generator 2D (Web) --- Technical Documentation

## Overview

Engine ini adalah **procedural world generator 2D top‑down berbasis
web** yang dibangun menggunakan:

-   HTML Canvas
-   CSS
-   JavaScript (deterministic generation)
-   Seed-based world reproducibility
-   Chunk streaming system

Arsitektur mengikuti pendekatan procedural sandbox modern seperti
Minecraft tetapi dalam format: - 2D - top-down - browser-based

Pipeline utama:

    Seed
    ↓
    Noise Maps
    ↓
    Biome Classification
    ↓
    Chunk Generation
    ↓
    Structure Placement
    ↓
    Object Scatter
    ↓
    Streaming Render

------------------------------------------------------------------------

# 1. Grid Tile System

## Konsep

Dunia dibangun menggunakan struktur hierarki:

    World
     └─ Chunk (32x32 tile)
          └─ Tile

Tile menyimpan: - biome - elevation - object - structure reference

Chunk digunakan untuk optimasi performa dan streaming.

------------------------------------------------------------------------

# 2. Noise Elevation System

Terrain dibuat menggunakan:

-   Simplex Noise
-   Multi-layer noise blending

Output elevation range:

    0.0 → Water
    1.0 → Mountain

Digunakan untuk: - biome generation - river shaping - structure
placement

------------------------------------------------------------------------

# 3. Seed System (Deterministic Generation)

Seluruh world generation berbasis seed.

Artinya: - Seed sama → world identik - Seed berbeda → world berbeda

Digunakan pada: - Noise - Structure - Object scatter - Road graph

Core function:

``` js
createSeededRandom(seed)
```

------------------------------------------------------------------------

# 4. Camera System

Camera mengontrol:

-   world offset
-   visible chunk range
-   streaming region

Viewport menentukan chunk mana yang perlu dirender.

------------------------------------------------------------------------

# 5. Chunk System

Chunk size:

    32 x 32 tile

Tujuan: - lazy generation - caching - streaming optimization

Chunk cache:

``` js
Map<chunkKey, chunkData>
```

------------------------------------------------------------------------

# 6. Infinite World Streaming

World tidak memiliki batas.

Algoritma:

    Camera Move
    ↓
    Detect Visible Chunk
    ↓
    Generate Missing Chunk
    ↓
    Render

Chunk hanya dibuat ketika diperlukan.

------------------------------------------------------------------------

# 7. Biome System

Biome ditentukan dari kombinasi:

-   Elevation
-   Secondary noise

Contoh biome:

-   water
-   grassland
-   forest
-   mountain

Biome digunakan untuk: - structure rules - object spawning - terrain
color

------------------------------------------------------------------------

# 8. Structure Generator

Structure placement menggunakan rule system:

-   Tidak spawn di water
-   Memiliki jarak minimum
-   Memiliki biome requirement

Jenis structure:

-   Village
-   Dungeon

------------------------------------------------------------------------

# 9. Structure Template System

Structure dibangun menggunakan template tile:

Contoh:

    VVV
    V.V
    VVV

Template mendukung: - rotation - offset placement

------------------------------------------------------------------------

# 10. Structure Rotation System

Template dapat diputar:

-   0°
-   90°
-   180°
-   270°

Digunakan untuk meningkatkan variasi visual.

------------------------------------------------------------------------

# 11. Multi‑Chunk Structure System

Structure besar dapat melewati batas chunk.

Konsep:

    Origin Chunk
    +
    Structure Radius

Digunakan registry:

``` js
structureRegistry
```

------------------------------------------------------------------------

# 12. Terrain Flattening

Digunakan untuk foundation village.

Proses:

    Sample height area
    ↓
    Average height
    ↓
    Override terrain

Mencegah struktur melayang.

------------------------------------------------------------------------

# 13. Piece-Based Structure Generator

Village terdiri dari beberapa piece kecil:

-   House
-   Plaza
-   Decoration

Layout dibuat procedural menggunakan seeded random.

------------------------------------------------------------------------

# 14. Village Road Graph Generator

Village menggunakan graph procedural:

-   Node = intersection
-   Edge = road

Pipeline:

    Generate Nodes
    ↓
    Connect Edges
    ↓
    Rasterize Road
    ↓
    Spawn House Near Node

------------------------------------------------------------------------

# 15. River Generator (Domain Warp)

River dibuat menggunakan:

-   Noise domain warp

Tujuan: - bentuk natural - menghindari garis lurus

River mempengaruhi: - biome - structure placement

------------------------------------------------------------------------

# 16. Multi-layer Terrain (Height Tier)

Terrain dibagi menjadi tier:

-   Water
-   Lowland
-   Highland
-   Mountain

Digunakan untuk variasi biome.

------------------------------------------------------------------------

# 17. Object Scatter System

Object kecil seperti:

-   tree
-   rock
-   decoration

menggunakan rule:

-   biome filter
-   density
-   seeded random

Object deterministic terhadap seed.

------------------------------------------------------------------------

# Architecture Summary

    Seed System
       ↓
    Noise System
       ↓
    Biome System
       ↓
    Chunk Generator
       ↓
    Structure System
       ↓
    Object Scatter
       ↓
    Streaming Renderer

------------------------------------------------------------------------

# Next Development Roadmap

-   Structure Collision Solver
-   Bounding Box System
-   Tile Auto‑Tiling (Bitmask / Wang Tiles)
-   Cave Generator (Cellular Automata)
-   Dimension System (multi-world layer)
-   LOD Rendering
-   Tile Atlas Optimization

// =============================
// AUTO-TILING SYSTEM (Bitmask-based)
// =============================

/**
 * Autotiling system using 8-direction bitmask
 * Detects neighboring tiles and selects appropriate variant
 *
 * Neighbor mask layout:
 *   NW  N  NE
 *    7  0  1
 *   W  [ ]  E
 *    6  4  2
 *   SW  S  SE
 *    5  3  8
 */

/**
 * Group biomes into compatibility classes
 * Same class = seamless tiling, different class = transition
 */
export const BIOME_GROUPS = {
  water: 0,
  sand: 1,
  grass: 2,
  grassland: 2,
  forest: 3,
  mountain: 4,
  snow: 5,
  desert: 6,
  village: 7,
  dungeon: 8,
};

/**
 * Define which biom groups transition to which
 * Used for creating smooth edges
 */
const BIOME_TRANSITIONS = {
  0: [0, 1],      // water transitions to sand
  1: [1, 0, 2],   // sand transitions to water & grass
  2: [2, 3, 1],   // grass transitions to forest & sand
  3: [3, 2],      // forest transitions to grass
  4: [4, 5],      // mountain transitions to snow
  5: [5, 4],      // snow transitions to mountain
  6: [6, 1],      // desert transitions to sand
  7: [7, 2],      // village transitions to grass
  8: [8],         // dungeon is isolated
};

/**
 * Tile variant patterns based on 8-direction neighbors
 * Each position represents a specific tile edge configuration
 *
 * Variants:
 * 0 - all same (center)
 * 1-8 - single direction different
 * 9-16 - two directions different (corners)
 * etc.
 */
export const TILE_VARIANTS = {
  // Full tile (all neighbors same)
  0x00: { id: "full", rotation: 0, priority: 1 },

  // Four corners (center with all 4 corner match)
  0xff: { id: "corners", rotation: 0, priority: 2 },

  // Single sides
  0x01: { id: "n", rotation: 0, priority: 3 },       // North only
  0x02: { id: "e", rotation: 0, priority: 3 },       // East only
  0x04: { id: "s", rotation: 0, priority: 3 },       // South only
  0x08: { id: "w", rotation: 0, priority: 3 },       // West only

  // Diagonal corners (only corner neighbors match)
  0x10: { id: "nw", rotation: 0, priority: 4 },      // NW corner
  0x20: { id: "ne", rotation: 0, priority: 4 },      // NE corner
  0x40: { id: "se", rotation: 0, priority: 4 },      // SE corner
  0x80: { id: "sw", rotation: 0, priority: 4 },      // SW corner

  // Edge transitions (T-junctions)
  0x0e: { id: "t_down", rotation: 0, priority: 5 },  // T down
  0x0d: { id: "t_right", rotation: 0, priority: 5 }, // T right
  0x0b: { id: "t_up", rotation: 0, priority: 5 },    // T up
  0x07: { id: "t_left", rotation: 0, priority: 5 },  // T left

  // Straight edges
  0x05: { id: "edge_h", rotation: 0, priority: 6 },  // Horizontal
  0x0a: { id: "edge_v", rotation: 0, priority: 6 },  // Vertical

  // Corners (L-shape)
  0x0c: { id: "corner_ne", rotation: 0, priority: 7 },  // Northeast
  0x06: { id: "corner_nw", rotation: 0, priority: 7 },  // Northwest
  0x03: { id: "corner_se", rotation: 0, priority: 7 },  // Southeast
  0x09: { id: "corner_sw", rotation: 0, priority: 7 },  // Southwest

  // Single isolated
  0x0f: { id: "single", rotation: 0, priority: 8 },
};

/**
 * Check if two biomes can transition smoothly
 * @param {string} fromBiome - Origin biome
 * @param {string} toBiome - Target biome
 * @returns {boolean} Can transition
 */
export function canTransition(fromBiome, toBiome) {
  if (fromBiome === toBiome) return true;

  const fromGroup = BIOME_GROUPS[fromBiome];
  const toGroup = BIOME_GROUPS[toBiome];

  if (fromGroup === undefined || toGroup === undefined) return false;

  return BIOME_TRANSITIONS[fromGroup]?.includes(toGroup) ?? false;
}

/**
 * Calculate 8-neighbor bitmask for autotiling
 * Checks if each neighbor matches the center tile's biome
 *
 * @param {Tile} centerTile - Center tile
 * @param {Tile[][]} chunkTiles - Chunk tile data
 * @param {number} localX - Tile X in chunk
 * @param {number} localY - Tile Y in chunk
 * @returns {number} Bitmask (0-255)
 */
export function calculateTileMask(centerTile, chunkTiles, localX, localY) {
  let mask = 0;

  // Neighbor positions and bit positions
  const neighbors = [
    { dx: 0, dy: -1, bit: 0 }, // North
    { dx: 1, dy: -1, bit: 1 }, // NE
    { dx: 1, dy: 0, bit: 2 },  // East
    { dx: 1, dy: 1, bit: 3 },  // SE
    { dx: 0, dy: 1, bit: 4 },  // South
    { dx: -1, dy: 1, bit: 5 }, // SW
    { dx: -1, dy: 0, bit: 6 }, // West
    { dx: -1, dy: -1, bit: 7 }, // NW
  ];

  const centerBiome = centerTile.biome;
  const neighborBiomes = {};

  for (const { dx, dy, bit } of neighbors) {
    const nx = localX + dx;
    const ny = localY + dy;

    // Check if neighbor exists and matches
    if (nx >= 0 && nx < chunkTiles.length &&
        ny >= 0 && ny < chunkTiles[0]?.length) {
      
      const neighborTile = chunkTiles[nx][ny];
      const neighborBiome = neighborTile.biome;
      
      // Store neighbor biome for later use
      const directionName = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][bit];
      neighborBiomes[directionName] = neighborBiome;
      
      // Neighbor matches if same biome or can transition
      if (canTransition(centerBiome, neighborBiome)) {
        mask |= (1 << bit);
      }
    }
  }

  // Store neighbor biomes on centerTile for rendering
  centerTile.neighborBiomes = neighborBiomes;

  return mask;
}

/**
 * Get tile variant based on mask
 * @param {number} mask - Bitmask from neighbors
 * @returns {Object} Variant info { id, rotation, priority }
 */
export function getVariantFromMask(mask) {
  // Check exact matches first
  if (TILE_VARIANTS[mask]) {
    return TILE_VARIANTS[mask];
  }

  // Check patterns and return closest match
  // All 8 neighbors match
  if (mask === 0xff) {
    return TILE_VARIANTS[0xff];
  }

  // No neighbors match
  if (mask === 0x00) {
    return TILE_VARIANTS[0x00];
  }

  // Default to full tile
  return TILE_VARIANTS[0x00];
}

/**
 * Apply autotiling to entire chunk
 * @param {Tile[][]} chunkTiles - Chunk tiles
 */
export function applyChunkAutotiling(chunkTiles) {
  const width = chunkTiles.length;
  const height = chunkTiles[0]?.length ?? 0;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const tile = chunkTiles[x][y];

      // Skip structures and objects - they don't participate in tiling
      if (tile.structure !== null) {
        tile.tileVariant = null;
        continue;
      }

      // Calculate mask based on neighbors
      const mask = calculateTileMask(tile, chunkTiles, x, y);

      // Get variant from mask
      const variant = getVariantFromMask(mask);

      // Store on tile
      tile.tileVariant = variant;
      tile.tileMask = mask;
    }
  }
}

/**
 * Apply autotiling to edge of chunk (for cross-chunk seaming)
 * @param {Tile[][]} chunkTiles - Current chunk
 * @param {Tile[][]} neighborChunk - Neighbor chunk
 * @param {string} direction - Direction of neighbor (n, s, e, w)
 */
export function applyEdgeAutotiling(chunkTiles, neighborChunk, direction) {
  const width = chunkTiles.length;
  const height = chunkTiles[0]?.length ?? 0;

  if (direction === "north" && neighborChunk) {
    // Apply to top edge considering neighbor below
    for (let x = 0; x < width; x++) {
      const tile = chunkTiles[x][0];
      if (tile.structure === null) {
        const mask = calculateTileMask(tile, chunkTiles, x, 0);
        tile.tileVariant = getVariantFromMask(mask);
        tile.tileMask = mask;
      }
    }
  } else if (direction === "south" && neighborChunk) {
    // Apply to bottom edge
    for (let x = 0; x < width; x++) {
      const tile = chunkTiles[x][height - 1];
      if (tile.structure === null) {
        const mask = calculateTileMask(tile, chunkTiles, x, height - 1);
        tile.tileVariant = getVariantFromMask(mask);
        tile.tileMask = mask;
      }
    }
  } else if (direction === "east" && neighborChunk) {
    // Apply to right edge
    for (let y = 0; y < height; y++) {
      const tile = chunkTiles[width - 1][y];
      if (tile.structure === null) {
        const mask = calculateTileMask(tile, chunkTiles, width - 1, y);
        tile.tileVariant = getVariantFromMask(mask);
        tile.tileMask = mask;
      }
    }
  } else if (direction === "west" && neighborChunk) {
    // Apply to left edge
    for (let y = 0; y < height; y++) {
      const tile = chunkTiles[0][y];
      if (tile.structure === null) {
        const mask = calculateTileMask(tile, chunkTiles, 0, y);
        tile.tileVariant = getVariantFromMask(mask);
        tile.tileMask = mask;
      }
    }
  }
}

/**
 * Get visual hint for variant (for debugging)
 * @param {number} mask - Bitmask
 * @returns {string} Description
 */
export function getMaskDescription(mask) {
  const variant = getVariantFromMask(mask);
  return variant?.id ?? "unknown";
}

/**
 * Calculate rotation angle for variant
 * @param {number} mask - Bitmask
 * @returns {number} Rotation in degrees (0, 90, 180, 270)
 */
export function getVariantRotation(mask) {
  const variant = getVariantFromMask(mask);
  return (variant?.rotation ?? 0) * 90;
}

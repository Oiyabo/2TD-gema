// =============================
// TILE STRUCTURE
// =============================

/**
 * Represents a single 2D tile in the world
 */
export class Tile {
  /**
   * @param {number} x - World X coordinate
   * @param {number} y - World Y coordinate
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;

    // Elevation from noise (0.0 = water, 1.0 = mountain)
    this.elevation = 0.5;

    // Biome type (water, grassland, forest, mountain, etc)
    this.biome = "grass";

    // Environmental factors
    this.temperature = 0.5;
    this.humidity = 0.5;

    // Features
    this.structure = null; // village, dungeon, etc
    this.object = null; // tree, rock, decoration
    this.roadType = null; // road identifier
  }

  /**
   * Check if tile is solid (has structure or object)
   * @returns {boolean}
   */
  isSolid() {
    return this.structure !== null || this.object !== null;
  }

  /**
   * Check if tile is walkable
   * @returns {boolean}
   */
  isWalkable() {
    return this.biome !== "water" && this.structure === null;
  }

  /**
   * Reset tile to base state
   */
  reset() {
    this.elevation = 0.5;
    this.biome = "grass";
    this.temperature = 0.5;
    this.humidity = 0.5;
    this.structure = null;
    this.object = null;
    this.roadType = null;
  }
}

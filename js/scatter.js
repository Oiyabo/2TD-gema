// =============================
// OBJECT SCATTER SYSTEM
// =============================

import { createSeededNoise, normalizeNoise } from "./noise.js";
import { CONFIG } from "./config.js";

/**
 * Scatter object type (tree, rock, etc)
 */
export const SCATTER_OBJECTS = {
  tree: {
    name: "tree",
    color: "#145a32",
    biomes: ["forest", "grass"],
  },
  rock: {
    name: "rock",
    color: "#7f8c8d",
    biomes: ["mountain", "grass", "desert"],
  },
  flower: {
    name: "flower",
    color: "#e74c3c",
    biomes: ["grass", "forest"],
  },
};

/**
 * Get scatter objects for a tile based on biome and noise
 * @param {Tile} tile - Tile to populate
 * @param {number} worldX - World X coordinate
 * @param {number} worldY - World Y coordinate
 * @param {Function} scatterNoise - Noise function for scatter
 * @returns {string|null} Object type or null
 */
export function getScatterType(tile, worldX, worldY, scatterNoise) {
  // Don't spawn objects on structures or water
  if (tile.structure !== null || tile.biome === "water") {
    return null;
  }

  // Get noise density at this location
  const density = normalizeNoise(
    scatterNoise(worldX * CONFIG.SCATTER_SCALE, worldY * CONFIG.SCATTER_SCALE),
  );

  // Forest: high tree density
  if (tile.biome === "forest") {
    if (density > CONFIG.FOREST_TREE_DENSITY) {
      return "tree";
    }
  }

  // Grassland: moderate trees, sparse rocks
  if (tile.biome === "grass" || tile.biome === "grassland") {
    if (density > CONFIG.GRASS_TREE_DENSITY) {
      return "tree";
    }
    if (
      density > CONFIG.GRASS_ROCK_DENSITY_MIN &&
      density < CONFIG.GRASS_ROCK_DENSITY_MAX
    ) {
      return "rock";
    }
  }

  // Mountain: high rock density
  if (tile.biome === "mountain") {
    if (density > CONFIG.MOUNTAIN_ROCK_DENSITY) {
      return "rock";
    }
  }

  // Desert: scattered rocks
  if (tile.biome === "desert") {
    if (density > 0.7) {
      return "rock";
    }
  }

  return null;
}

/**
 * Get visual properties for scatter object
 * @param {string} objectType - Object type
 * @returns {Object} { color, size, ... }
 */
export function getObjectProperties(objectType) {
  const props = {
    tree: {
      color: "#145a32",
      sizeRatio: 0.5,
    },
    rock: {
      color: "#7f8c8d",
      sizeRatio: 0.33,
    },
    flower: {
      color: "#e74c3c",
      sizeRatio: 0.25,
    },
  };

  return props[objectType] || props.tree;
}

/**
 * Check if object type is valid for biome
 * @param {string} objectType - Object type
 * @param {string} biomeName - Biome name
 * @returns {boolean} Is valid
 */
export function isObjectValidForBiome(objectType, biomeName) {
  const obj = SCATTER_OBJECTS[objectType];
  return obj && obj.biomes.includes(biomeName);
}

/**
 * Get object color
 * @param {string} objectType - Object type
 * @returns {string} Hex color
 */
export function getObjectColor(objectType) {
  const obj = SCATTER_OBJECTS[objectType];
  return obj ? obj.color : "#999999";
}

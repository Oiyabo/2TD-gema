// =============================
// BIOME SYSTEM
// =============================

import { CONFIG } from "./config.js";

/**
 * Determine biome based on elevation, temperature, and humidity
 * @param {number} elevation - Elevation value (0-1)
 * @param {number} temperature - Temperature value (0-1)
 * @param {number} humidity - Humidity value (0-1)
 * @returns {string} Biome type
 */
export function classifyBiome(elevation, temperature, humidity) {
  // Water (lowest elevation)
  if (elevation < CONFIG.WATER_THRESHOLD) {
    return "water";
  }

  // Sand (slightly higher than water)
  if (elevation < CONFIG.SAND_THRESHOLD) {
    return "sand";
  }

  // Mountain tiers
  if (elevation > CONFIG.MOUNTAIN_THRESHOLD) {
    if (elevation > CONFIG.SNOW_THRESHOLD) {
      return "snow";
    }
    return "mountain";
  }

  // Desert (hot and dry)
  if (temperature > CONFIG.DESERT_TEMP && humidity < CONFIG.DESERT_HUMIDITY) {
    return "desert";
  }

  // Snow (cold)
  if (temperature < CONFIG.SNOW_TEMP) {
    return "snow";
  }

  // Forest (humid)
  if (humidity > CONFIG.FOREST_HUMIDITY) {
    return "forest";
  }

  // Grassland (default)
  return "grass";
}

/**
 * Get visual color for biome
 * @param {string} biome - Biome type
 * @returns {string} Hex color code
 */
export function getBiomeColor(biome) {
  const colors = {
    water: "#3498db",
    sand: "#f1c40f",
    forest: "#2ecc71",
    grassland: "#27ae60",
    grass: "#27ae60",
    mountain: "#95a5a6",
    snow: "#ecf0f1",
    desert: "#d4a574",
    village: "#c97c3a",
    dungeon: "#555555",
    road: "#8b7355",
  };

  return colors[biome] || colors.grass;
}

/**
 * Check if biome is valid for structure placement
 * @param {string} biome - Biome type
 * @param {string} structureType - Structure type (village, dungeon)
 * @returns {boolean} Is valid for placement
 */
export function isBiomeValidForStructure(biome, structureType) {
  if (structureType === "village") {
    // Villages only in grass/forest
    return biome === "grass" || biome === "forest" || biome === "grassland";
  }

  if (structureType === "dungeon") {
    // Dungeons anywhere except water
    return biome !== "water";
  }

  return false;
}

/**
 * Get visual description of biome
 * @param {string} biome - Biome type
 * @returns {string} Description
 */
export function getBiomeDescription(biome) {
  const descriptions = {
    water: "Water",
    sand: "Beach/Sand",
    forest: "Forest",
    grass: "Grassland",
    mountain: "Mountain",
    snow: "Snow Peak",
    desert: "Desert",
    village: "Village",
    dungeon: "Dungeon",
    road: "Road",
  };

  return descriptions[biome] || "Unknown";
}

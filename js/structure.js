// =============================
// STRUCTURE SYSTEM
// =============================

import { createSeededRandom, seededRandomInt, seededRandomAngle } from "./seed.js";

/**
 * Structure templates (cell-based layout)
 * V = village tile
 * D = dungeon tile
 * . = empty space
 * R = road
 */
export const STRUCTURE_TEMPLATES = {
  village: [".....", ".VVV.", ".VVV.", ".VVV.", "....."],

  dungeon: ["..D..", ".DDD.", "DDDDD", ".DDD.", "..D.."],
};

/**
 * Village piece templates (for piece-based generation)
 */
export const VILLAGE_PIECES = [
  {
    name: "house_small",
    layout: ["VVV", "V.V", "VVV"],
  },
  {
    name: "house_long",
    layout: ["VVVV", "V..V", "VVVV"],
  },
  {
    name: "plaza",
    layout: ["RRR", "RRR", "RRR"],
  },
];

/**
 * Rotate template 90 degrees clockwise
 * @param {string[]} template - Template rows
 * @param {number} rotations - Number of 90-degree rotations (0-3)
 * @returns {string[]} Rotated template
 */
export function rotateTemplate(template, rotations = 0) {
  let result = template;

  for (let r = 0; r < rotations % 4; r++) {
    const size = result.length;
    const rotated = [];

    for (let y = 0; y < size; y++) {
      let row = "";
      for (let x = 0; x < size; x++) {
        row += result[size - x - 1][y];
      }
      rotated.push(row);
    }

    result = rotated;
  }

  return result;
}

/**
 * Scale template up
 * @param {string[]} template - Template rows
 * @param {number} scale - Scale factor (1 = original, 2 = 2x2, etc)
 * @returns {string[]} Scaled template
 */
export function scaleTemplate(template, scale) {
  if (scale === 1) return template;

  const result = [];

  for (let y = 0; y < template.length; y++) {
    for (let sy = 0; sy < scale; sy++) {
      let row = "";

      for (let x = 0; x < template[y].length; x++) {
        for (let sx = 0; sx < scale; sx++) {
          row += template[y][x];
        }
      }

      result.push(row);
    }
  }

  return result;
}

/**
 * Get structure template with random rotation and scaling
 * @param {string} structureType - Type of structure
 * @param {number} seed - Seed for randomization
 * @returns {Object} { template, rotation, scale }
 */
export function getRandomizedTemplate(structureType, seed) {
  if (!STRUCTURE_TEMPLATES[structureType]) {
    return null;
  }

  const rng = createSeededRandom(seed);
  const baseTemplate = STRUCTURE_TEMPLATES[structureType];

  // Random rotation (0-3 x 90 degrees)
  const rotation = Math.floor(rng() * 4);

  // Random scale (1-2)
  const scale = 1 + Math.floor(rng() * 2);

  let template = rotateTemplate(baseTemplate, rotation);
  template = scaleTemplate(template, scale);

  return {
    template,
    rotation,
    scale,
  };
}

/**
 * Check if structure can be placed at tile
 * @param {string} structureType - Type of structure
 * @param {string} biomeName - Current biome
 * @param {boolean} isWater - Is water biome
 * @returns {boolean} Can place
 */
export function canPlaceStructure(structureType, biomeName, isWater) {
  if (isWater) return false;

  if (structureType === "village") {
    return biomeName === "grass" || biomeName === "forest" || biomeName === "grassland";
  }

  if (structureType === "dungeon") {
    return biomeName !== "water";
  }

  return false;
}

/**
 * Get structure placement cost/penalty
 * @param {string} structureType - Type of structure
 * @returns {number} Cost
 */
export function getStructureCost(structureType) {
  const costs = {
    village: 1.0,
    dungeon: 0.5,
  };

  return costs[structureType] || 1.0;
}

/**
 * Structure registry key generator
 * @param {number} cx - Chunk X
 * @param {number} cy - Chunk Y
 * @returns {string} Registry key
 */
export function getStructureKey(cx, cy) {
  return `${cx},${cy}`;
}

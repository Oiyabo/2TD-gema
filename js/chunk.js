// =============================
// CHUNK SYSTEM
// =============================

import { CONFIG } from "./config.js";
import { Tile } from "./tile.js";
import { classifyBiome } from "./biome.js";
import {
  getRandomizedTemplate,
  scaleTemplate,
  rotateTemplate,
  canPlaceStructure,
  getStructureKey,
} from "./structure.js";
import { getScatterType } from "./scatter.js";
import { createSeededRandom, seededRandomInt } from "./seed.js";
import {
  createSeededNoise,
  normalizeNoise,
  getDomainWarpedNoise,
} from "./noise.js";
import { applyChunkAutotiling } from "./autotile.js";

/**
 * Chunk key generator
 * @param {number} cx - Chunk X
 * @param {number} cy - Chunk Y
 * @returns {string} Key
 */
export function getChunkKey(cx, cy) {
  return `${cx},${cy}`;
}

/**
 * Generate a single chunk
 * @param {number} cx - Chunk X coordinate
 * @param {number} cy - Chunk Y coordinate
 * @param {number} worldSeed - World seed
 * @param {Object} noiseFunctions - { elevation, temperature, humidity, scatter }
 * @param {Object} registry - Structure registry (shared across chunks)
 * @returns {Tile[][]} 2D tile array
 */
export function generateChunk(
  cx,
  cy,
  worldSeed,
  noiseFunctions,
  registry = {},
) {
  const chunk = [];

  // =============================
  // STRUCTURE PLACEMENT LOGIC
  // =============================

  // Spacing rule: only one structure per grid cell
  const SPACING = CONFIG.STRUCTURE_SPACING;
  const gridX = Math.floor(cx / SPACING);
  const gridY = Math.floor(cy / SPACING);

  // Seeded RNG for this grid cell
  const gridRng = createSeededRandom(
    worldSeed + gridX * 918273 + gridY * 192837,
  );

  // Candidate position within grid cell
  const candidateOffX = Math.floor(gridRng() * SPACING);
  const candidateOffY = Math.floor(gridRng() * SPACING);

  const isCandidateChunk =
    cx === gridX * SPACING + candidateOffX &&
    cy === gridY * SPACING + candidateOffY;

  let structureType = null;
  let structureChunk = null;

  if (isCandidateChunk) {
    const roll = gridRng();

    if (roll < CONFIG.STRUCTURE_SPAWN_CHANCE_VILLAGE) {
      structureType = "village";
    } else if (roll < CONFIG.STRUCTURE_SPAWN_CHANCE_DUNGEON) {
      structureType = "dungeon";
    }

    if (structureType) {
      const structKey = getStructureKey(cx, cy);
      registry[structKey] = {
        type: structureType,
        cx,
        cy,
      };
    }
  }

  // =============================
  // CHECK FOR NEARBY STRUCTURES
  // Multi-chunk structure detection
  // =============================

  let nearbyStructure = null;

  for (const key in registry) {
    const data = registry[key];
    const dx = Math.abs(cx - data.cx);
    const dy = Math.abs(cy - data.cy);

    if (dx <= 1 && dy <= 1) {
      nearbyStructure = data;
      if (!structureType) {
        structureType = data.type;
        structureChunk = `${data.cx},${data.cy}`;
      }
      break;
    }
  }

  // =============================
  // PRECOMPUTE ROTATED TEMPLATE
  // =============================

  let rotatedTemplate = null;
  let templateScale = 1;

  if (structureType) {
    const templateSeed = worldSeed + cx * 123456 + cy * 789012;
    const templateData = getRandomizedTemplate(structureType, templateSeed);

    if (templateData) {
      rotatedTemplate = templateData.template;
      templateScale = templateData.scale;
    }
  }

  // =============================
  // GENERATE TILES FOR CHUNK
  // =============================

  const chunkRng = createSeededRandom(worldSeed + cx * 374829 + cy * 928374);
  const scatterNoise = noiseFunctions.scatter;

  for (let x = 0; x < CONFIG.CHUNK_SIZE; x++) {
    chunk[x] = [];

    for (let y = 0; y < CONFIG.CHUNK_SIZE; y++) {
      const worldX = cx * CONFIG.CHUNK_SIZE + x;
      const worldY = cy * CONFIG.CHUNK_SIZE + y;

      const tile = new Tile(worldX, worldY);

      // =============================
      // ELEVATION & NOISE SAMPLING
      // Domain-warped for rivers
      // =============================

      const warp = normalizeNoise(
        noiseFunctions.elevation(worldX * 0.01, worldY * 0.01),
      );

      let elevation = normalizeNoise(
        noiseFunctions.elevation(
          worldX * CONFIG.NOISE_SCALE + warp * 8,
          worldY * CONFIG.NOISE_SCALE + warp * 8,
        ),
      );

      let temperature = normalizeNoise(
        noiseFunctions.temperature(
          worldX * CONFIG.TEMP_SCALE,
          worldY * CONFIG.TEMP_SCALE,
        ),
      );

      let humidity = normalizeNoise(
        noiseFunctions.humidity(
          worldX * CONFIG.HUMIDITY_SCALE,
          worldY * CONFIG.HUMIDITY_SCALE,
        ),
      );

      tile.elevation = elevation;
      tile.temperature = temperature;
      tile.humidity = humidity;

      // =============================
      // BIOME CLASSIFICATION
      // =============================

      tile.biome = classifyBiome(elevation, temperature, humidity);

      // =============================
      // APPLY STRUCTURE TEMPLATE
      // =============================

      if (structureType && rotatedTemplate) {
        const template = rotatedTemplate;
        const size = template.length;
        const start = Math.floor(CONFIG.CHUNK_SIZE / 2 - size / 2);

        const tx = x - start;
        const ty = y - start;

        if (tx >= 0 && ty >= 0 && tx < size && ty < size) {
          const char = template[ty][tx];

          if (char !== ".") {
            // Check if placement is valid
            const isValid = canPlaceStructure(
              structureType,
              tile.biome,
              tile.biome === "water",
            );

            if (isValid) {
              tile.structure = structureType;
              tile.biome = structureType;

              // =============================
              // TERRAIN FLATTENING
              // Prevent buildings from floating
              // =============================

              if (structureType === "village") {
                tile.elevation = 0.5;
              }
            }
          }
        }
      }

      // =============================
      // OBJECT SCATTER
      // =============================

      if (
        !tile.structure &&
        tile.biome !== "water" &&
        tile.roadType === null
      ) {
        tile.object = getScatterType(tile, worldX, worldY, scatterNoise);
      }

      chunk[x][y] = tile;
    }
  }

  // =============================
  // APPLY AUTOTILING
  // =============================
  applyChunkAutotiling(chunk);

  return chunk;
}

/**
 * Cache for generated chunks
 */
export class ChunkCache {
  constructor() {
    this.chunks = {};
    this.registry = {}; // Structure registry
  }

  /**
   * Get or generate chunk
   * @param {number} cx - Chunk X
   * @param {number} cy - Chunk Y
   * @param {number} worldSeed - World seed
   * @param {Object} noiseFunctions - Noise functions
   * @returns {Tile[][]} Chunk tiles
   */
  getChunk(cx, cy, worldSeed, noiseFunctions) {
    const key = getChunkKey(cx, cy);

    if (!this.chunks[key]) {
      this.chunks[key] = generateChunk(
        cx,
        cy,
        worldSeed,
        noiseFunctions,
        this.registry,
      );
    }

    return this.chunks[key];
  }

  /**
   * Clear chunk and nearby structure registries
   * @param {number} cx - Chunk X
   * @param {number} cy - Chunk Y
   */
  unloadChunk(cx, cy) {
    const key = getChunkKey(cx, cy);
    delete this.chunks[key];

    // Also clean up structure registry for this chunk
    const registryKey = key;
    delete this.registry[registryKey];
  }

  /**
   * Clear all chunks within distance
   * @param {number} centerCX - Center chunk X
   * @param {number} centerCY - Center chunk Y
   * @param {number} keepDistance - Distance to keep
   */
  unloadDistantChunks(centerCX, centerCY, keepDistance) {
    const toDelete = [];

    for (const key in this.chunks) {
      const [cx, cy] = key.split(",").map(Number);
      const dx = Math.abs(cx - centerCX);
      const dy = Math.abs(cy - centerCY);

      if (dx > keepDistance || dy > keepDistance) {
        toDelete.push(key);
      }
    }

    for (const key of toDelete) {
      delete this.chunks[key];
    }
  }

  /**
   * Get all active chunks
   * @returns {Object} Chunk map
   */
  getActiveChunks() {
    return this.chunks;
  }

  /**
   * Clear all chunks
   */
  clear() {
    this.chunks = {};
    this.registry = {};
  }
}

// =============================
// AUTOTILING DEBUG UTILITIES
// =============================

import { getMaskDescription } from "./autotile.js";
import { CONFIG } from "./config.js";
import { AutotileProfiler, validateAutotileConfig } from "./autotile-profiler.js";

/**
 * Visualize autotiling information on canvas
 */
export class AutotileDebugger {
  constructor(renderer) {
    this.renderer = renderer;
    this.enabled = false;
    this.showMaskValues = false;
    this.showVariantInfo = false;
  }

  /**
   * Toggle debug visualization
   */
  toggle() {
    this.enabled = !this.enabled;
    console.log(`[AutotileDebug] ${this.enabled ? "Enabled" : "Disabled"}`);
  }

  /**
   * Toggle mask value display
   */
  toggleMaskValues() {
    this.showMaskValues = !this.showMaskValues;
    console.log(`[AutotileDebug] Mask values: ${this.showMaskValues ? "ON" : "OFF"}`);
  }

  /**
   * Toggle variant info display
   */
  toggleVariantInfo() {
    this.showVariantInfo = !this.showVariantInfo;
    console.log(`[AutotileDebug] Variant info: ${this.showVariantInfo ? "ON" : "OFF"}`);
  }

  /**
   * Draw debug info for tile
   * @param {Tile} tile - Tile to debug
   * @param {number} screenX - Screen X
   * @param {number} screenY - Screen Y
   * @param {number} tileSize - Tile size
   */
  drawTileDebug(tile, screenX, screenY, tileSize) {
    if (!this.enabled) return;

    const ctx = this.renderer.getContext();

    // Draw debug overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(screenX, screenY, tileSize, tileSize);

    if (this.showMaskValues && tile.tileMask !== null) {
      ctx.fillStyle = "#fff000";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        `${tile.tileMask.toString(2).padStart(8, "0")}`,
        screenX + tileSize / 2,
        screenY + tileSize / 2,
      );
    }

    if (this.showVariantInfo && tile.tileVariant) {
      ctx.fillStyle = "#00ff00";
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        tile.tileVariant.id,
        screenX + tileSize / 2,
        screenY + tileSize / 2 + 12,
      );
    }
  }

  /**
   * Get statistics for all loaded chunks
   * @param {ChunkCache} chunks - Chunk cache
   * @returns {Object} Statistics
   */
  getStats(chunks) {
    const activeChunks = chunks.getActiveChunks();
    let totalTiles = 0;
    let tiledTiles = 0;
    let variantCounts = {};

    for (const key in activeChunks) {
      const chunk = activeChunks[key];
      for (let x = 0; x < chunk.length; x++) {
        for (let y = 0; y < chunk[x].length; y++) {
          const tile = chunk[x][y];
          totalTiles++;

          if (tile.tileMask !== null && tile.tileVariant) {
            tiledTiles++;
            const vid = tile.tileVariant.id;
            variantCounts[vid] = (variantCounts[vid] || 0) + 1;
          }
        }
      }
    }

    return {
      totalTiles,
      tiledTiles,
      tilePercentage: ((tiledTiles / totalTiles) * 100).toFixed(2),
      variantCounts,
    };
  }

  /**
   * Print debug info to console
   * @param {ChunkCache} chunks - Chunk cache
   */
  printStats(chunks) {
    const stats = this.getStats(chunks);
    console.log("=== AUTOTILING STATISTICS ===");
    console.log(`Total Tiles: ${stats.totalTiles}`);
    console.log(`Tiled Tiles: ${stats.tiledTiles} (${stats.tilePercentage}%)`);
    console.log("Variant Distribution:");
    for (const [variant, count] of Object.entries(stats.variantCounts)) {
      console.log(`  ${variant}: ${count}`);
    }
  }
}

/**
 * Visualize neighbor connectivity
 */
export function visualizeNeighbors(tile) {
  if (!tile.tileMask) {
    console.log(`Tile [${tile.x}, ${tile.y}] - No autotiling data`);
    return;
  }

  const bits = tile.tileMask.toString(2).padStart(8, "0").split("");
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  console.log(`Tile [${tile.x}, ${tile.y}] - Biome: ${tile.biome}`);
  console.log("Neighbors:", directions.map((d, i) => `${d}:${bits[i]}`).join(" "));
  console.log("Variant:", tile.tileVariant?.id ?? "none");
  console.log("---");
}

/**
 * Analyze biome transition patterns
 */
export function analyzeBiomeTransitions(chunks) {
  const activeChunks = chunks.getActiveChunks();
  const transitionMap = {};

  for (const key in activeChunks) {
    const chunk = activeChunks[key];
    for (let x = 0; x < chunk.length; x++) {
      for (let y = 0; y < chunk[x].length; y++) {
        const tile = chunk[x][y];

        if (tile.tileMask !== null) {
          const biome = tile.biome;
          if (!transitionMap[biome]) {
            transitionMap[biome] = [];
          }
          transitionMap[biome].push(tile.tileMask);
        }
      }
    }
  }

  console.log("=== BIOME TRANSITION ANALYSIS ===");
  for (const [biome, masks] of Object.entries(transitionMap)) {
    const unique = new Set(masks);
    console.log(`${biome}: ${unique.size} different neighbor patterns`);
  }
}

/**
 * Export debug commands for console
 */
export const DebugCommands = {
  /**
   * Enable/disable autotile debug visualization
   * Usage: worldGenerator.debug.toggleAutotile()
   */
  toggleAutotile() {
    if (window.autotileDebugger) {
      window.autotileDebugger.toggle();
    }
  },

  /**
   * Enable/disable mask value display
   * Usage: worldGenerator.debug.toggleMasks()
   */
  toggleMasks() {
    if (window.autotileDebugger) {
      window.autotileDebugger.toggleMaskValues();
    }
  },

  /**
   * Enable/disable variant info display
   * Usage: worldGenerator.debug.toggleVariants()
   */
  toggleVariants() {
    if (window.autotileDebugger) {
      window.autotileDebugger.toggleVariantInfo();
    }
  },

  /**
   * Print autotiling statistics
   * Usage: worldGenerator.debug.stats()
   */
  stats() {
    if (window.autotileDebugger && window.worldGenerator) {
      window.autotileDebugger.printStats(window.worldGenerator.chunks);
    }
  },

  /**
   * Analyze tile at world position
   * Usage: worldGenerator.debug.analyzeTile(x, y)
   */
  analyzeTile(worldX, worldY) {
    if (!window.worldGenerator) return;

    const chunkX = Math.floor(worldX / CONFIG.CHUNK_SIZE);
    const chunkY = Math.floor(worldY / CONFIG.CHUNK_SIZE);
    const localX = worldX % CONFIG.CHUNK_SIZE;
    const localY = worldY % CONFIG.CHUNK_SIZE;

    const chunks = window.worldGenerator.chunks;
    const chunk = chunks.chunks[`${chunkX},${chunkY}`];

    if (chunk && chunk[localX] && chunk[localX][localY]) {
      visualizeNeighbors(chunk[localX][localY]);
    } else {
      console.log("Chunk not loaded or tile out of bounds");
    }
  },

  /**
   * Analyze biome transitions
   * Usage: worldGenerator.debug.analyzeBiomes()
   */
  analyzeBiomes() {
    if (window.worldGenerator) {
      analyzeBiomeTransitions(window.worldGenerator.chunks);
    }
  },

  /**
   * Profile autotiling performance
   * Usage: worldGenerator.debug.profile()
   */
  profile() {
    if (!window.worldGenerator) return;

    const profiler = new AutotileProfiler();
    profiler.analyzeChunks(window.worldGenerator.chunks);
    profiler.printReport();

    console.log("");
    console.log("Average Edge Strengths:");
    const avgStrengths = profiler.getAverageEdgeStrengths();
    for (const [transition, strength] of Object.entries(avgStrengths)) {
      console.log(`  ${transition}: ${strength}`);
    }
  },

  /**
   * Validate autotile configuration
   * Usage: worldGenerator.debug.validate()
   */
  validate() {
    const issues = validateAutotileConfig();
    if (issues.length === 0) {
      console.log("✅ Autotile configuration is valid!");
    } else {
      console.log("❌ Found issues in autotile configuration:");
      issues.forEach((issue) => {
        console.log(`  - ${issue}`);
      });
    }
  },
};

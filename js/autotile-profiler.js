// =============================
// AUTOTILING PROFILER & ANALYZER
// Untuk debugging dan optimization
// =============================

import { BIOM_PERMEABILITY } from "./autotile-config.js";

/**
 * Profile autotiling performance dan distribution
 */
export class AutotileProfiler {
  constructor() {
    this.stats = {
      totalTiles: 0,
      tiledTiles: 0,
      variantDistribution: {},
      maskDistribution: {},
      biomEdges: {},
      edgeStrength: {},
    };
  }

  /**
   * Analyze chunks untuk mengumpulkan statistik
   * @param {ChunkCache} chunks - Chunk cache
   */
  analyzeChunks(chunks) {
    this.stats = {
      totalTiles: 0,
      tiledTiles: 0,
      variantDistribution: {},
      maskDistribution: {},
      biomEdges: {},
      edgeStrength: {},
    };

    const activeChunks = chunks.getActiveChunks();

    for (const key in activeChunks) {
      const chunk = activeChunks[key];

      for (let x = 0; x < chunk.length; x++) {
        for (let y = 0; y < chunk[x].length; y++) {
          const tile = chunk[x][y];
          this.stats.totalTiles++;

          if (tile.tileMask !== null && tile.tileVariant) {
            this.stats.tiledTiles++;

            // Variant distribution
            const variantId = tile.tileVariant.id;
            this.stats.variantDistribution[variantId] =
              (this.stats.variantDistribution[variantId] || 0) + 1;

            // Mask distribution
            const maskKey = tile.tileMask.toString(2).padStart(8, "0");
            this.stats.maskDistribution[maskKey] =
              (this.stats.maskDistribution[maskKey] || 0) + 1;

            // Biom edge analysis
            if (tile.neighborBiomes) {
              const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
              for (let i = 0; i < directions.length; i++) {
                const neighborBiom = tile.neighborBiomes[directions[i]];
                if (neighborBiom && neighborBiom !== tile.biome) {
                  const edgeKey = `${tile.biome}-${neighborBiom}`;
                  this.stats.biomEdges[edgeKey] =
                    (this.stats.biomEdges[edgeKey] || 0) + 1;

                  // Calculate edge strength
                  const perm =
                    BIOM_PERMEABILITY[tile.biome]?.[neighborBiom] ?? 0.5;
                  const strength = 1.0 - perm;
                  if (!this.stats.edgeStrength[edgeKey]) {
                    this.stats.edgeStrength[edgeKey] = [];
                  }
                  this.stats.edgeStrength[edgeKey].push(strength);
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Get formatted statistics
   * @returns {Object} Formatted stats
   */
  getFormattedStats() {
    const variantPercent = (
      (this.stats.tiledTiles / this.stats.totalTiles) *
      100
    ).toFixed(2);

    const variantSortedByCount = Object.entries(
      this.stats.variantDistribution
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const edgeSortedByCount = Object.entries(this.stats.biomEdges)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    return {
      totalTiles: this.stats.totalTiles,
      tiledTiles: this.stats.tiledTiles,
      variantPercent,
      topVariants: variantSortedByCount.map((v) => ({
        variant: v[0],
        count: v[1],
      })),
      topEdges: edgeSortedByCount.map((e) => ({
        transition: e[0],
        count: e[1],
      })),
      uniqueVariants: Object.keys(this.stats.variantDistribution).length,
      uniqueMasks: Object.keys(this.stats.maskDistribution).length,
    };
  }

  /**
   * Print organized report
   */
  printReport() {
    const stats = this.getFormattedStats();

    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║           AUTOTILING PROFILER REPORT                           ║");
    console.log("╚════════════════════════════════════════════════════════════════╝");
    console.log("");

    console.log(`📊 Overall Statistics:`);
    console.log(`   Total Tiles: ${stats.totalTiles}`);
    console.log(`   Tiled Tiles: ${stats.tiledTiles}`);
    console.log(`   Percentage: ${stats.variantPercent}%`);
    console.log(`   Unique Variants: ${stats.uniqueVariants}`);
    console.log(`   Unique Masks: ${stats.uniqueMasks}`);
    console.log("");

    console.log(`🎨 Top 10 Most Used Variants:`);
    stats.topVariants.forEach((v, i) => {
      const percent = ((v.count / stats.tiledTiles) * 100).toFixed(1);
      console.log(`   ${i + 1}. ${v.variant.padEnd(12)} x${v.count} (${percent}%)`);
    });
    console.log("");

    console.log(`🌏 Top 15 Biom Transitions:`);
    stats.topEdges.forEach((e, i) => {
      console.log(`   ${i + 1}. ${e.transition.padEnd(20)} x${e.count}`);
    });
  }

  /**
   * Find unused variants
   * @returns {Array} Variant IDs not used
   */
  findUnusedVariants() {
    const allVariants = Object.keys(this.stats.variantDistribution);
    // This would need knowledge of all possible variants
    // Returns used variants for now
    return allVariants;
  }

  /**
   * Get average edge strength untuk setiap biom transition
   * @returns {Object} Edge strength averages
   */
  getAverageEdgeStrengths() {
    const averages = {};
    for (const [edge, strengths] of Object.entries(
      this.stats.edgeStrength
    )) {
      if (strengths.length > 0) {
        const avg =
          strengths.reduce((a, b) => a + b, 0) / strengths.length;
        averages[edge] = parseFloat(avg.toFixed(3));
      }
    }
    return averages;
  }
}

/**
 * Visual autotile coverage map untuk debugging
 */
export function generateCoverageMap(chunks, width = 64, height = 64) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const activeChunks = chunks.getActiveChunks();
  const tiledAreas = {};

  // Collect data
  for (const key in activeChunks) {
    const chunk = activeChunks[key];
    for (let x = 0; x < Math.min(chunk.length, width); x++) {
      for (let y = 0; y < Math.min(chunk[x].length, height); y++) {
        const tile = chunk[x][y];
        const color = tile.tileMask !== null ? "#00ff00" : "#ff0000";
        tiledAreas[`${x},${y}`] = color;
      }
    }
  }

  // Draw
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, width, height);

  for (const [key, color] of Object.entries(tiledAreas)) {
    const [x, y] = key.split(",").map(Number);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }

  return canvas;
}

/**
 * Validate autotiling configuration
 * @returns {Array} Issues found
 */
export function validateAutotileConfig() {
  const issues = [];

  // Check permeability ranges
  for (const [biom, transitions] of Object.entries(BIOM_PERMEABILITY)) {
    for (const [targetBiom, perm] of Object.entries(transitions)) {
      if (perm < 0 || perm > 1) {
        issues.push(
          `Invalid permeability: ${biom} -> ${targetBiom} = ${perm} (must be 0-1)`
        );
      }
    }
  }

  // Check for missing bioma
  const bioms = Object.keys(BIOM_PERMEABILITY);
  for (const biom of bioms) {
    for (const targetBiom of bioms) {
      if (!BIOM_PERMEABILITY[biom][targetBiom]) {
        issues.push(
          `Missing permeability entry: ${biom} -> ${targetBiom}`
        );
      }
    }
  }

  return issues;
}

/**
 * Optimize biom permeability values berdasarkan visual testing
 * @param {Array} testResults - Array of { from, to, userRating }
 * @returns {Object} Suggested permeability updates
 */
export function optimizePermeability(testResults) {
  const suggestions = {};

  for (const result of testResults) {
    const { from, to, userRating } = result;
    // userRating: 0 = seamless, 1 = too subtle, 2 = too strong

    const currentPerm =
      BIOM_PERMEABILITY[from]?.[to] ?? 0.5;

    let suggested = currentPerm;
    if (userRating === 1) {
      // Increase permeability (reduce edge strength)
      suggested = Math.min(1.0, currentPerm + 0.1);
    } else if (userRating === 2) {
      // Decrease permeability (increase edge strength)
      suggested = Math.max(0.0, currentPerm - 0.1);
    }

    if (suggested !== currentPerm) {
      suggestions[`${from}->${to}`] = {
        current: currentPerm,
        suggested: parseFloat(suggested.toFixed(2)),
        reason: [
          "seamless",
          "increase opacity",
          "decrease opacity",
        ][userRating],
      };
    }
  }

  return suggestions;
}

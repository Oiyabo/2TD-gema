// =============================
// NOISE GENERATION SYSTEM
// =============================

import { createNoise2D } from "https://cdn.jsdelivr.net/npm/simplex-noise@4.0.1/dist/esm/simplex-noise.js";
import { createSeededRandom } from "./seed.js";

/**
 * Create seeded Simplex noise function
 * @param {number} seed - World seed
 * @param {number} seedOffset - Offset for layer variety
 * @returns {Function} Noise function (x, y) => value
 */
export function createSeededNoise(seed, seedOffset = 0) {
  const rng = createSeededRandom(seed + seedOffset);
  return createNoise2D(rng);
}

/**
 * Multi-layer noise blending for terrain variation
 * @param {Function} noiseFn - Noise function
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} scale - Noise scale
 * @returns {number} Blended noise value (-1 to 1)
 */
export function getMultiLayerNoise(noiseFn, x, y, scale) {
  const value = noiseFn(x * scale, y * scale);
  return value;
}

/**
 * Normalize noise value to 0-1 range
 * @param {number} value - Noise value (-1 to 1)
 * @returns {number} Normalized value (0 to 1)
 */
export function normalizeNoise(value) {
  return (value + 1) / 2;
}

/**
 * Get domain-warped noise (for rivers, natural features)
 * @param {Function} warpNoise - Warp noise function
 * @param {Function} primaryNoise - Primary noise function
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} warpAmount - Amount of warping
 * @returns {number} Warped noise value
 */
export function getDomainWarpedNoise(warpNoise, primaryNoise, x, y, warpAmount) {
  const warp = warpNoise(x * 0.01, y * 0.01);
  return primaryNoise(x + warp * warpAmount, y + warp * warpAmount);
}

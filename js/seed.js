// =============================
// SEED & RANDOM NUMBER GENERATION
// =============================

/**
 * Mulberry32 - Fast, deterministic RNG for seeded world generation
 * @param {number} a - Seed value
 * @returns {Function} Random number generator (0-1)
 */
export function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Create a seeded RNG instance
 * @param {number} seed - Base seed
 * @returns {Function} Random number generator
 */
export function createSeededRandom(seed) {
  return mulberry32(seed);
}

/**
 * Generate a seeded random integer within range
 * @param {Function} rng - RNG function
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random integer
 */
export function seededRandomInt(rng, min, max) {
  return Math.floor(rng() * (max - min)) + min;
}

/**
 * Generate a seeded random angle (0-2π)
 * @param {Function} rng - RNG function
 * @returns {number} Angle in radians
 */
export function seededRandomAngle(rng) {
  return rng() * Math.PI * 2;
}

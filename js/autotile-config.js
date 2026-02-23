// =============================
// AUTOTILING CONFIGURATION
// Customizable biom compatibility & visual settings
// =============================

/**
 * Biom permeability - how easily they transition to each other
 * Higher value = stronger transition (darker edge)
 */
export const BIOM_PERMEABILITY = {
  water: {
    water: 1.0,      // Same biom, no edge
    sand: 0.3,       // Water to sand is subtle
    grass: 0.5,      // Water to grass is moderate
    forest: 0.6,     // Water to forest visible
    mountain: 0.8,   // Water to mountain clear
    desert: 0.7,
    snow: 0.9,
    village: 1.0,    // Hard border with village
    dungeon: 1.0,    // Hard border with dungeon
  },

  sand: {
    water: 0.3,
    sand: 1.0,
    grass: 0.2,      // Sand to grass is very subtle
    forest: 0.5,
    mountain: 0.7,
    desert: 0.1,     // Sand to desert is barely visible
    snow: 0.8,
    village: 0.8,
    dungeon: 1.0,
  },

  grass: {
    water: 0.5,
    sand: 0.2,
    grass: 1.0,
    forest: 0.15,    // Grass to forest is subtle (same group)
    mountain: 0.6,
    desert: 0.7,
    snow: 0.8,
    village: 0.2,    // Grass to village minimal (same area)
    dungeon: 1.0,
  },

  forest: {
    water: 0.6,
    sand: 0.5,
    grass: 0.15,
    forest: 1.0,
    mountain: 0.7,
    desert: 0.8,
    snow: 0.9,
    village: 0.3,
    dungeon: 1.0,
  },

  mountain: {
    water: 0.8,
    sand: 0.7,
    grass: 0.6,
    forest: 0.7,
    mountain: 1.0,
    desert: 0.7,
    snow: 0.2,       // Mountain to snow subtle (same group)
    village: 1.0,
    dungeon: 0.5,    // Dungeon in mountain less obvious
  },

  desert: {
    water: 0.7,
    sand: 0.1,
    grass: 0.7,
    forest: 0.8,
    mountain: 0.7,
    desert: 1.0,
    snow: 1.0,
    village: 0.9,
    dungeon: 1.0,
  },

  snow: {
    water: 0.9,
    sand: 0.8,
    grass: 0.8,
    forest: 0.9,
    mountain: 0.2,
    desert: 1.0,
    snow: 1.0,
    village: 1.0,
    dungeon: 1.0,
  },

  village: {
    water: 1.0,
    sand: 0.8,
    grass: 0.2,      // Village on grass minimal edge
    forest: 0.4,
    mountain: 1.0,
    desert: 0.9,
    snow: 1.0,
    village: 0.0,    // Village to village same texture
    dungeon: 1.0,
  },

  dungeon: {
    water: 1.0,
    sand: 1.0,
    grass: 1.0,
    forest: 1.0,
    mountain: 0.5,
    desert: 1.0,
    snow: 1.0,
    village: 1.0,
    dungeon: 0.0,    // Dungeon to dungeon same
  },
};

/**
 * Get permeability between two bioms
 * @param {string} fromBiom - Source biom
 * @param {string} toBiom - Target biom
 * @returns {number} Permeability (0-1)
 */
export function getBiomPermeability(fromBiom, toBiom) {
  if (fromBiom === toBiom) return 1.0;

  const permeability = BIOM_PERMEABILITY[fromBiom]?.[toBiom];
  if (permeability !== undefined) return permeability;

  // Fallback to reciprocal if not found
  return BIOM_PERMEABILITY[toBiom]?.[fromBiom] ?? 0.5;
}

/**
 * Calculate edge strength based on permeability
 * @param {number} permeability - Permeability value (0-1)
 * @returns {number} Edge strength (0-1)
 */
export function getEdgeStrength(permeability) {
  // 1.0 permeability = 0 edge strength (seamless)
  // 0.0 permeability = 1 edge strength (hard border)
  return 1.0 - permeability;
}

/**
 * Calculate edge opacity based on neighbor and center bioms
 * @param {string} centerBiom - Center tile biom
 * @param {string} neighborBiom - Neighbor tile biom
 * @returns {number} Opacity for edge (0-1)
 */
export function calculateEdgeOpacity(centerBiom, neighborBiom) {
  if (centerBiom === neighborBiom) return 0;

  const perm1 = getBiomPermeability(centerBiom, neighborBiom);
  const perm2 = getBiomPermeability(neighborBiom, centerBiom);
  const avgPerm = (perm1 + perm2) / 2;

  return getEdgeStrength(avgPerm);
}

/**
 * Enhanced edge smoothing with gradient falloff
 * @param {number} edgeWidth - Width of edge in pixels
 * @param {number} distanceFromEdge - Distance from edge center (0 = on edge)
 * @returns {number} Opacity value (0-1)
 */
export function getGradientFalloff(edgeWidth, distanceFromEdge) {
  if (distanceFromEdge <= 0) return 1.0;
  if (distanceFromEdge >= edgeWidth) return 0;

  // Smooth cubic falloff
  const t = distanceFromEdge / edgeWidth;
  return 1.0 - (t * t * (3.0 - 2.0 * t)); // Smoothstep
}

/**
 * Neighboring biom compatibility check with tolerance
 * @param {string} centerBiom - Center biom
 * @param {string} neighborBiom - Neighbor biom
 * @param {number} tolerance - Compatibility threshold (0-1)
 * @returns {boolean} Compatible enough
 */
export function areBiomsCompatible(centerBiom, neighborBiom, tolerance = 0.3) {
  if (centerBiom === neighborBiom) return true;

  const perm = getBiomPermeability(centerBiom, neighborBiom);
  // Compatible if permeability is high (low edge strength)
  return perm > (1.0 - tolerance);
}

/**
 * Get visual edge color based on biom transition
 * @param {string} fromColor - Source biom color
 * @param {string} toColor - Target biom color
 * @param {number} opacity - Edge opacity
 * @returns {string} RGBA color string
 */
export function calculateEdgeColor(fromColor, toColor, opacity) {
  // Parse hex colors
  const fromHex = fromColor.replace("#", "");
  const toHex = toColor.replace("#", "");

  let r1 = parseInt(fromHex.substring(0, 2), 16);
  let g1 = parseInt(fromHex.substring(2, 4), 16);
  let b1 = parseInt(fromHex.substring(4, 6), 16);

  let r2 = parseInt(toHex.substring(0, 2), 16);
  let g2 = parseInt(toHex.substring(2, 4), 16);
  let b2 = parseInt(toHex.substring(4, 6), 16);

  // Blend and darken for shadow effect
  const r = Math.floor((r1 + r2) / 2 * 0.7);
  const g = Math.floor((g1 + g2) / 2 * 0.7);
  const b = Math.floor((b1 + b2) / 2 * 0.7);

  const opacityPercent = Math.round(opacity * 100);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

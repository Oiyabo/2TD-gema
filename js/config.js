// =============================
// GAME CONFIGURATION
// =============================

export const CONFIG = {
  // Canvas
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 800,

  // Tile & World
  TILE_SIZE: 64,
  MAP_WIDTH: 100,
  MAP_HEIGHT: 100,

  // Chunk System
  CHUNK_SIZE: 32,
  RENDER_DISTANCE: 3,

  // Camera
  CAMERA_SPEED: 10,

  // World Seed
  WORLD_SEED: 12345,

  // Structure Spacing (minimal distance rule)
  STRUCTURE_SPACING: 4,
  STRUCTURE_SPAWN_CHANCE_VILLAGE: 0.03,
  STRUCTURE_SPAWN_CHANCE_DUNGEON: 0.05,

  // Noise Scales
  NOISE_SCALE: 0.05,
  TEMP_SCALE: 0.02,
  HUMIDITY_SCALE: 0.02,
  SCATTER_SCALE: 0.08,

  // Elevation Thresholds
  WATER_THRESHOLD: 0.3,
  SAND_THRESHOLD: 0.35,
  MOUNTAIN_THRESHOLD: 0.8,
  SNOW_THRESHOLD: 0.9,

  // Temperature/Humidity Thresholds
  DESERT_TEMP: 0.7,
  DESERT_HUMIDITY: 0.4,
  SNOW_TEMP: 0.3,
  FOREST_HUMIDITY: 0.6,

  // Object Biome Densities
  FOREST_TREE_DENSITY: 0.55,
  GRASS_TREE_DENSITY: 0.75,
  GRASS_ROCK_DENSITY_MIN: 0.65,
  GRASS_ROCK_DENSITY_MAX: 0.7,
  MOUNTAIN_ROCK_DENSITY: 0.6,
};

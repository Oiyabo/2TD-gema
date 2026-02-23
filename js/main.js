// =============================
// PROCEDURAL WORLD GENERATOR
// Main Entry Point
// =============================

import { CONFIG } from "./config.js";
import { createSeededNoise } from "./noise.js";
import { Camera, CameraInput } from "./camera.js";
import { Renderer } from "./renderer.js";
import { ChunkCache } from "./chunk.js";

/**
 * Main Game Engine
 */
class WorldGenerator {
  constructor() {
    // Initialize systems
    this.canvas = document.getElementById("gameCanvas");
    if (!this.canvas) {
      console.error("Canvas element not found!");
      return;
    }

    this.renderer = new Renderer(this.canvas);
    this.camera = new Camera();
    this.cameraInput = new CameraInput(this.camera);
    this.chunks = new ChunkCache();

    // World state
    this.worldSeed = CONFIG.WORLD_SEED;
    this.noiseFunctions = this.createNoiseLayers(this.worldSeed);
    this.running = false;

    // Bind methods
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.gameLoop = this.gameLoop.bind(this);
  }

  /**
   * Create noise layers for world generation
   * @param {number} seed - World seed
   * @returns {Object} Noise functions by type
   */
  createNoiseLayers(seed) {
    return {
      elevation: createSeededNoise(seed, 1),
      temperature: createSeededNoise(seed, 2),
      humidity: createSeededNoise(seed, 3),
      scatter: createSeededNoise(seed, 999),
    };
  }

  /**
   * Initialize the world
   */
  init() {
    console.log(`🌍 Procedural World Generator initialized`);
    console.log(`📍 Seed: ${this.worldSeed}`);
    console.log(`📐 Chunk Size: ${CONFIG.CHUNK_SIZE} tiles`);
    console.log(`🎮 Controls: Arrow Keys or WASD to move`);

    this.running = true;
    this.gameLoop();
  }

  /**
   * Update game state
   */
  update() {
    // Update camera from input
    this.cameraInput.update();
  }

  /**
   * Render frame
   */
  render() {
    this.renderer.renderWorld(
      this.chunks,
      this.camera,
      this.worldSeed,
      this.noiseFunctions,
    );

    // Draw debug info
    this.renderDebugInfo();
  }

  /**
   * Draw debug information
   */
  renderDebugInfo() {
    const pos = this.camera.getPosition();
    const chunkX = Math.floor(pos.x / CONFIG.TILE_SIZE / CONFIG.CHUNK_SIZE);
    const chunkY = Math.floor(pos.y / CONFIG.TILE_SIZE / CONFIG.CHUNK_SIZE);
    const tileX = Math.floor(pos.x / CONFIG.TILE_SIZE);
    const tileY = Math.floor(pos.y / CONFIG.TILE_SIZE);

    const debugText = `Seed: ${this.worldSeed} | Chunk: [${chunkX}, ${chunkY}] | Tile: [${tileX}, ${tileY}]`;

    this.renderer.drawText(debugText, 10, 20, {
      color: "#ffffff",
      size: "14px",
      background: "rgba(0, 0, 0, 0.5)",
    });
  }

  /**
   * Main game loop
   */
  gameLoop() {
    if (!this.running) return;

    this.update();
    this.render();

    requestAnimationFrame(this.gameLoop);
  }

  /**
   * Regenerate world with new seed
   * @param {number} newSeed - New seed value
   */
  regenerateWorld(newSeed) {
    this.worldSeed = newSeed;
    this.noiseFunctions = this.createNoiseLayers(newSeed);
    this.chunks.clear();

    console.log(`🔄 World regenerated with seed: ${newSeed}`);
  }

  /**
   * Stop the world generator
   */
  stop() {
    this.running = false;
  }

  /**
   * Get world statistics
   * @returns {Object} Stats
   */
  getStats() {
    return {
      seed: this.worldSeed,
      loadedChunks: Object.keys(this.chunks.getActiveChunks()).length,
      cameraPosition: this.camera.getPosition(),
    };
  }
}

// =============================
// INITIALIZATION
// =============================

let worldGenerator = null;

window.addEventListener("DOMContentLoaded", () => {
  worldGenerator = new WorldGenerator();
  worldGenerator.init();

  // Expose to global scope for debugging
  window.worldGenerator = worldGenerator;

  // Console commands
  console.log("Available commands:");
  console.log("  worldGenerator.regenerateWorld(seed)");
  console.log("  worldGenerator.getStats()");
  console.log("  worldGenerator.stop()");
});

export { WorldGenerator };

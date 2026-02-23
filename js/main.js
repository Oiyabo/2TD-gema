// =============================
// PROCEDURAL WORLD GENERATOR
// Main Entry Point
// =============================

import { CONFIG } from "./config.js";
import { createSeededNoise } from "./noise.js";
import { Camera, CameraInput } from "./camera.js";
import { Renderer } from "./renderer.js";
import { ChunkCache } from "./chunk.js";
import { AutotileDebugger, DebugCommands } from "./autotile-debug.js";

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

    // Autotile debugging
    this.autotileDebugger = new AutotileDebugger(this.renderer);
    this.debug = DebugCommands;

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

    // Initialize tile images
    this.renderer.initializeTileImages();

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
      this.autotileDebugger,
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

  /**
   * Show tile images preview
   */
  showTilePreview() {
    const previewContainer = document.getElementById("tilePreview") || this.createPreviewContainer();
    this.renderer.getTileGenerator().displayTilesPreview(previewContainer);
    previewContainer.style.display = "grid";
    console.log("📋 Tile preview displayed in bottom panel");
  }

  /**
   * Show tileset atlas
   */
  showAtlasPreview() {
    const previewContainer = document.getElementById("tilePreview") || this.createPreviewContainer();
    this.renderer.getTileGenerator().createAtlas();
    this.renderer.getTileGenerator().displayAtlasPreview(previewContainer);
    previewContainer.style.display = "block";
    console.log("📋 Tileset atlas displayed in bottom panel");
  }

  /**
   * Create preview container if it doesn't exist
   */
  createPreviewContainer() {
    let container = document.getElementById("tilePreview");
    if (!container) {
      container = document.createElement("div");
      container.id = "tilePreview";
      container.style.position = "fixed";
      container.style.bottom = "10px";
      container.style.right = "10px";
      container.style.maxWidth = "500px";
      container.style.maxHeight = "500px";
      container.style.overflowY = "auto";
      container.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
      container.style.border = "2px solid #333";
      container.style.borderRadius = "4px";
      container.style.zIndex = "1000";
      container.style.display = "none";
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Export tiles as images
   */
  exportTiles() {
    const tileGen = this.renderer.getTileGenerator();
    const exportContainer = this.createExportContainer();

    exportContainer.innerHTML = "<h3>Tile Exports</h3>";

    for (const [biomName, tileCanvas] of Object.entries(tileGen.getAllTiles())) {
      const link = document.createElement("a");
      link.href = tileCanvas.toDataURL("image/png");
      link.download = `tile-${biomName}.png`;
      link.textContent = `Download ${biomName}`;
      link.style.display = "block";
      link.style.margin = "5px 0";
      exportContainer.appendChild(link);
    }

    // Atlas export
    const atlasLink = document.createElement("a");
    atlasLink.href = tileGen.exportAtlasAsDataURL();
    atlasLink.download = "tileset-atlas.png";
    atlasLink.textContent = "Download Atlas (all tiles)";
    atlasLink.style.display = "block";
    atlasLink.style.margin = "10px 0";
    atlasLink.style.fontWeight = "bold";
    exportContainer.appendChild(atlasLink);

    exportContainer.style.display = "block";
    console.log("💾 Tile export links created in bottom right panel");
  }

  /**
   * Create export container
   */
  createExportContainer() {
    let container = document.getElementById("tileExport");
    if (!container) {
      container = document.createElement("div");
      container.id = "tileExport";
      container.style.position = "fixed";
      container.style.bottom = "10px";
      container.style.right = "520px";
      container.style.padding = "15px";
      container.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
      container.style.border = "2px solid #333";
      container.style.borderRadius = "4px";
      container.style.zIndex = "1000";
      container.style.display = "none";
      document.body.appendChild(container);
    }
    return container;
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
  window.autotileDebugger = worldGenerator.autotileDebugger;

  // Console commands
  console.log("Available commands:");
  console.log("  worldGenerator.regenerateWorld(seed)");
  console.log("  worldGenerator.getStats()");
  console.log("  worldGenerator.stop()");
  console.log("");
  console.log("Autotiling debug commands:");
  console.log("  worldGenerator.debug.toggleAutotile()    // Toggle debug visualization");
  console.log("  worldGenerator.debug.toggleMasks()       // Toggle mask values");
  console.log("  worldGenerator.debug.toggleVariants()    // Toggle variant info");
  console.log("  worldGenerator.debug.stats()             // Print statistics");
  console.log("  worldGenerator.debug.analyzeTile(x, y)   // Analyze tile at world position");
  console.log("  worldGenerator.debug.analyzeBiomes()     // Analyze biome transitions");
  console.log("");
  console.log("Tile preview commands:");
  console.log("  worldGenerator.showTilePreview()         // Show all tiles");
  console.log("  worldGenerator.showAtlasPreview()        // Show tileset atlas");
  console.log("  worldGenerator.exportTiles()             // Create download links");
});

export { WorldGenerator };

// =============================
// RENDERING SYSTEM
// =============================

import { CONFIG } from "./config.js";
import { getBiomeColor } from "./biome.js";
import { getObjectColor, getObjectProperties } from "./scatter.js";

/**
 * Renderer for world visualization
 */
export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas element
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.canvas.width = CONFIG.CANVAS_WIDTH;
    this.canvas.height = CONFIG.CANVAS_HEIGHT;
  }

  /**
   * Clear canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw a single tile
   * @param {Tile} tile - Tile to draw
   * @param {number} screenX - Screen X
   * @param {number} screenY - Screen Y
   * @param {number} tileSize - Tile size
   */
  drawTile(tile, screenX, screenY, tileSize) {
    // Draw biome background
    this.ctx.fillStyle = getBiomeColor(tile.biome);
    this.ctx.fillRect(screenX, screenY, tileSize, tileSize);

    // Draw grid lines (optional, for debugging)
    // this.ctx.strokeStyle = '#aaa';
    // this.ctx.strokeRect(screenX, screenY, tileSize, tileSize);
  }

  /**
   * Draw object on tile
   * @param {string} objectType - Object type
   * @param {number} screenX - Screen X
   * @param {number} screenY - Screen Y
   * @param {number} tileSize - Tile size
   */
  drawObject(objectType, screenX, screenY, tileSize) {
    const color = getObjectColor(objectType);
    const props = getObjectProperties(objectType);
    const size = tileSize * props.sizeRatio;
    const offset = (tileSize - size) / 2;

    this.ctx.fillStyle = color;

    if (objectType === "tree") {
      this.ctx.fillRect(screenX + offset, screenY + offset, size, size);
    } else if (objectType === "rock") {
      // Draw as circle
      this.ctx.beginPath();
      this.ctx.arc(
        screenX + tileSize / 2,
        screenY + tileSize / 2,
        size / 2,
        0,
        Math.PI * 2,
      );
      this.ctx.fill();
    } else {
      // Generic object
      this.ctx.fillRect(screenX + offset, screenY + offset, size, size);
    }
  }

  /**
   * Render entire world
   * @param {ChunkCache} chunks - Chunk cache
   * @param {Camera} camera - Camera
   * @param {number} worldSeed - World seed
   * @param {Object} noiseFunctions - Noise functions
   */
  renderWorld(chunks, camera, worldSeed, noiseFunctions) {
    this.clear();

    const range = camera.getVisibleChunkRange(
      CONFIG.TILE_SIZE,
      CONFIG.CHUNK_SIZE,
      this.canvas.width,
      this.canvas.height,
    );

    const activeChunks = {};

    // Calculate padded render distance
    const padding = CONFIG.RENDER_DISTANCE;

    for (
      let cy = range.minChunkY - padding;
      cy <= range.maxChunkY + padding;
      cy++
    ) {
      for (
        let cx = range.minChunkX - padding;
        cx <= range.maxChunkX + padding;
        cx++
      ) {
        const chunkKey = `${cx},${cy}`;
        activeChunks[chunkKey] = true;

        // Get or generate chunk
        const chunk = chunks.getChunk(cx, cy, worldSeed, noiseFunctions);

        // Render tiles
        for (let x = 0; x < CONFIG.CHUNK_SIZE; x++) {
          for (let y = 0; y < CONFIG.CHUNK_SIZE; y++) {
            const tile = chunk[x][y];

            const screenX = camera.worldToScreenX(tile.x, CONFIG.TILE_SIZE);
            const screenY = camera.worldToScreenY(tile.y, CONFIG.TILE_SIZE);

            // Viewport culling
            if (
              screenX < -CONFIG.TILE_SIZE ||
              screenY < -CONFIG.TILE_SIZE ||
              screenX > this.canvas.width ||
              screenY > this.canvas.height
            ) {
              continue;
            }

            // Draw tile
            this.drawTile(tile, screenX, screenY, CONFIG.TILE_SIZE);

            // Draw object if present
            if (tile.object !== null) {
              this.drawObject(
                tile.object,
                screenX,
                screenY,
                CONFIG.TILE_SIZE,
              );
            }

            // Draw structure outline (optional debug)
            // if (tile.structure) {
            //   this.ctx.strokeStyle = '#ff0000';
            //   this.ctx.lineWidth = 2;
            //   this.ctx.strokeRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            // }
          }
        }
      }
    }

    // Unload distant chunks
    chunks.unloadDistantChunks(
      range.minChunkX + Math.floor((range.maxChunkX - range.minChunkX) / 2),
      range.minChunkY + Math.floor((range.maxChunkY - range.minChunkY) / 2),
      padding + 2,
    );
  }

  /**
   * Draw UI text
   * @param {string} text - Text to draw
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} options - { color, size, background }
   */
  drawText(text, x, y, options = {}) {
    const color = options.color || "#ffffff";
    const size = options.size || "16px";
    const bgColor = options.background;

    this.ctx.fillStyle = color;
    this.ctx.font = `${size} Arial`;
    this.ctx.textAlign = "left";

    if (bgColor) {
      const metrics = this.ctx.measureText(text);
      this.ctx.fillStyle = bgColor;
      this.ctx.fillRect(
        x - 4,
        y - 12,
        metrics.width + 8,
        16 + 4,
      );
      this.ctx.fillStyle = color;
    }

    this.ctx.fillText(text, x, y);
  }

  /**
   * Get canvas
   * @returns {HTMLCanvasElement}
   */
  getCanvas() {
    return this.canvas;
  }

  /**
   * Get context
   * @returns {CanvasRenderingContext2D}
   */
  getContext() {
    return this.ctx;
  }
}

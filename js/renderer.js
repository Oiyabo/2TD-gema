// =============================
// RENDERING SYSTEM
// =============================

import { CONFIG } from "./config.js";
import { getBiomeColor } from "./biome.js";
import { getObjectColor, getObjectProperties } from "./scatter.js";
import { getMaskDescription, getVariantRotation } from "./autotile.js";
import { calculateEdgeOpacity, getGradientFalloff } from "./autotile-config.js";
import { TileGenerator } from "./tile-generator.js";

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

    // Initialize tile generator
    this.tileGenerator = new TileGenerator(CONFIG.TILE_SIZE);
    this.useTileImages = false;
    this.tileImages = {};
  }

  /**
   * Initialize tile images
   */
  initializeTileImages() {
    console.log("🎨 Initializing tile images...");
    this.tileGenerator.generateAllTiles();
    this.tileImages = this.tileGenerator.getAllTiles();
    this.useTileImages = true;
    console.log("✅ Tile images initialized");
  }

  /**
   * Get tile generator instance
   * @returns {TileGenerator}
   */
  getTileGenerator() {
    return this.tileGenerator;
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
    // Draw tile image if available
    if (this.useTileImages && this.tileImages[tile.biome]) {
      this.ctx.drawImage(this.tileImages[tile.biome], screenX, screenY, tileSize, tileSize);
    } else {
      // Fallback to solid color
      this.ctx.fillStyle = getBiomeColor(tile.biome);
      this.ctx.fillRect(screenX, screenY, tileSize, tileSize);
    }

    // =============================
    // DRAW AUTOTILING EDGES
    // =============================
    if (tile.tileMask !== undefined && tile.tileMask !== null) {
      this.drawTileEdges(tile, screenX, screenY, tileSize);
    }

    // Draw grid lines (optional, for debugging)
    // this.ctx.strokeStyle = '#aaa';
    // this.ctx.strokeRect(screenX, screenY, tileSize, tileSize);
  }

  /**
   * Draw smooth edges for autotiling with permeability awareness
   * @param {Tile} tile - Tile to draw
   * @param {number} screenX - Screen X
   * @param {number} screenY - Screen Y
   * @param {number} tileSize - Tile size
   */
  drawTileEdges(tile, screenX, screenY, tileSize) {
    const mask = tile.tileMask;
    const edgeWidth = Math.max(2, Math.floor(tileSize / 6));
    const baseColor = getBiomeColor(tile.biome);
    const neighborBiomes = tile.neighborBiomes || {};

    // Neighbor bit positions: N=0, NE=1, E=2, SE=3, S=4, SW=5, W=6, NW=7
    const directions = [
      { name: "N", bit: 0, x: 0, y: 0, w: tileSize, h: edgeWidth },
      { name: "E", bit: 2, x: tileSize - edgeWidth, y: 0, w: edgeWidth, h: tileSize },
      { name: "S", bit: 4, x: 0, y: tileSize - edgeWidth, w: tileSize, h: edgeWidth },
      { name: "W", bit: 6, x: 0, y: 0, w: edgeWidth, h: tileSize },
    ];

    // Draw main edge directions
    for (const dir of directions) {
      // Only draw if neighbor doesn't match
      if (!(mask & (1 << dir.bit))) {
        const neighborBiom = neighborBiomes[dir.name];
        
        if (neighborBiom) {
          const opacity = calculateEdgeOpacity(tile.biome, neighborBiom);
          
          if (opacity > 0.05) {
            const neighborColor = getBiomeColor(neighborBiom);
            const edgeColor = this.blendColors(baseColor, neighborColor, opacity * 0.5);
            
            this.ctx.fillStyle = edgeColor;
            this.ctx.globalAlpha = opacity;
            this.ctx.fillRect(screenX + dir.x, screenY + dir.y, dir.w, dir.h);
            this.ctx.globalAlpha = 1.0;
          }
        } else {
          // Fallback to darker color if no neighbor info
          const edgeColor = this.getDarkerColor(baseColor);
          this.ctx.fillStyle = edgeColor;
          this.ctx.globalAlpha = 0.5;
          this.ctx.fillRect(screenX + dir.x, screenY + dir.y, dir.w, dir.h);
          this.ctx.globalAlpha = 1.0;
        }
      }
    }

    // Draw corner accents
    const corners = [
      { bit: 7, x: 0, y: 0 },           // NW
      { bit: 1, x: tileSize - edgeWidth, y: 0 },    // NE
      { bit: 3, x: tileSize - edgeWidth, y: tileSize - edgeWidth }, // SE
      { bit: 5, x: 0, y: tileSize - edgeWidth },    // SW
    ];

    for (const corner of corners) {
      if (!(mask & (1 << corner.bit))) {
        const edgeColor = this.getDarkerColor(baseColor);
        this.ctx.fillStyle = edgeColor;
        this.ctx.globalAlpha = 0.4;
        this.ctx.fillRect(screenX + corner.x, screenY + corner.y, edgeWidth, edgeWidth);
        this.ctx.globalAlpha = 1.0;
      }
    }
  }

  /**
   * Blend two colors with weighted opacity
   * @param {string} color1 - First hex color
   * @param {string} color2 - Second hex color
   * @param {number} weight - Weight towards color2 (0-1)
   * @returns {string} Blended color
   */
  blendColors(color1, color2, weight) {
    const hex1 = color1.replace("#", "");
    const hex2 = color2.replace("#", "");

    let r1 = parseInt(hex1.substring(0, 2), 16);
    let g1 = parseInt(hex1.substring(2, 4), 16);
    let b1 = parseInt(hex1.substring(4, 6), 16);

    let r2 = parseInt(hex2.substring(0, 2), 16);
    let g2 = parseInt(hex2.substring(2, 4), 16);
    let b2 = parseInt(hex2.substring(4, 6), 16);

    const r = Math.floor(r1 + (r2 - r1) * weight);
    const g = Math.floor(g1 + (g2 - g1) * weight);
    const b = Math.floor(b1 + (b2 - b1) * weight);

    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Get darker shade of color for edges
   * @param {string} hexColor - Hex color code
   * @returns {string} Darker hex color
   */
  getDarkerColor(hexColor) {
    // Parse hex color
    const hex = hexColor.replace("#", "");
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Darken by 30%
    r = Math.max(0, Math.floor(r * 0.7));
    g = Math.max(0, Math.floor(g * 0.7));
    b = Math.max(0, Math.floor(b * 0.7));

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
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
   * @param {AutotileDebugger} autotileDebugger - Optional debugger instance
   */
  renderWorld(chunks, camera, worldSeed, noiseFunctions, autotileDebugger = null) {
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

            // Draw autotile debug info if enabled
            if (autotileDebugger && autotileDebugger.enabled) {
              autotileDebugger.drawTileDebug(tile, screenX, screenY, CONFIG.TILE_SIZE);
            }

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

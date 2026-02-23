// =============================
// TILE IMAGE GENERATOR
// =============================
// Generates procedural tile images for all biomes
// Can create individual tiles or a tileset atlas

import { CONFIG } from "./config.js";
import { BIOMES } from "./biome.js";

/**
 * Tile image generator - creates procedural tile graphics
 */
export class TileGenerator {
  /**
   * @param {number} tileSize - Tile size in pixels
   */
  constructor(tileSize = 32) {
    this.tileSize = tileSize;
    this.tiles = {};
    this.atlas = null;
  }

  /**
   * Generate all tile images
   */
  generateAllTiles() {
    console.log("🎨 Generating tile images...");

    for (const biomName of Object.keys(BIOMES)) {
      this.tiles[biomName] = this.generateTile(biomName, this.tileSize);
    }

    console.log(`✅ Generated ${Object.keys(this.tiles).length} tile images`);
    return this.tiles;
  }

  /**
   * Generate tile image for a specific biome
   * @param {string} biomName - Biome name
   * @param {number} size - Tile size
   * @returns {HTMLCanvasElement} Canvas element with tile image
   */
  generateTile(biomName, size = 32) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const biom = BIOMES[biomName];
    const baseColor = biom.color;

    // Fill base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    // Apply biome-specific texture
    switch (biomName) {
      case "water":
        this.drawWaterTile(ctx, size, baseColor);
        break;
      case "sand":
        this.drawSandTile(ctx, size, baseColor);
        break;
      case "grass":
        this.drawGrassTile(ctx, size, baseColor);
        break;
      case "forest":
        this.drawForestTile(ctx, size, baseColor);
        break;
      case "mountain":
        this.drawMountainTile(ctx, size, baseColor);
        break;
      case "snow":
        this.drawSnowTile(ctx, size, baseColor);
        break;
      case "desert":
        this.drawDesertTile(ctx, size, baseColor);
        break;
      case "village":
        this.drawVillageTile(ctx, size, baseColor);
        break;
      case "dungeon":
        this.drawDungeonTile(ctx, size, baseColor);
        break;
    }

    // Add subtle grid outline
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(0, 0, size, size);

    return canvas;
  }

  /**
   * Draw water tile with waves
   */
  drawWaterTile(ctx, size, baseColor) {
    // Wave pattern
    ctx.fillStyle = "rgba(0, 100, 200, 0.3)";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(size * 0.3 + i * size * 0.4, size * 0.5, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(size * 0.25, size * 0.25, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw sand tile with grain texture
   */
  drawSandTile(ctx, size, baseColor) {
    // Sand grains
    ctx.fillStyle = "rgba(255, 200, 100, 0.4)";
    const grainCount = Math.floor(size / 4);
    for (let i = 0; i < grainCount; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const grain = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(x, y, grain, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shadow for depth
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(size * 0.7, size * 0.7, size * 0.3, size * 0.3);
  }

  /**
   * Draw grass tile with grass blades
   */
  drawGrassTile(ctx, size, baseColor) {
    // Grass blades
    ctx.strokeStyle = "rgba(34, 139, 34, 0.6)";
    ctx.lineWidth = 1;

    const bladeCount = Math.floor(size / 2);
    for (let i = 0; i < bladeCount; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const height = size * 0.3;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.random() * 2 - 1, y - height);
      ctx.stroke();
    }

    // Darker patches for variation
    ctx.fillStyle = "rgba(34, 139, 34, 0.2)";
    ctx.beginPath();
    ctx.ellipse(size * 0.3, size * 0.4, size * 0.2, size * 0.15, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw forest tile with trees
   */
  drawForestTile(ctx, size, baseColor) {
    // Tree canopies
    ctx.fillStyle = "rgba(34, 100, 34, 0.8)";
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.4, size * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(size * 0.7, size * 0.6, size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Tree trunks
    ctx.fillStyle = "rgba(139, 69, 19, 0.7)";
    ctx.fillRect(size * 0.28, size * 0.6, size * 0.04, size * 0.35);
    ctx.fillRect(size * 0.68, size * 0.75, size * 0.04, size * 0.2);

    // Shadows
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, size * 0.85, size, size * 0.15);
  }

  /**
   * Draw mountain tile with peaks
   */
  drawMountainTile(ctx, size, baseColor) {
    // Peak triangle
    ctx.fillStyle = "rgba(160, 160, 160, 0.6)";
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    ctx.lineTo(size, size * 0.6);
    ctx.lineTo(0, size * 0.6);
    ctx.closePath();
    ctx.fill();

    // Snow cap
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    ctx.lineTo(size * 0.65, size * 0.25);
    ctx.lineTo(size * 0.35, size * 0.25);
    ctx.closePath();
    ctx.fill();

    // Rock texture
    ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
    ctx.fillRect(size * 0.3, size * 0.4, size * 0.15, size * 0.15);
    ctx.fillRect(size * 0.55, size * 0.45, size * 0.2, size * 0.1);
  }

  /**
   * Draw snow tile with snowflakes
   */
  drawSnowTile(ctx, size, baseColor) {
    // Snow crystals
    ctx.strokeStyle = "rgba(200, 220, 255, 0.7)";
    ctx.lineWidth = 0.5;

    const flakeCount = Math.floor(size / 3);
    for (let i = 0; i < flakeCount; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = size * 0.05;

      // Snowflake pattern
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x, y + r);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - r, y);
      ctx.lineTo(x + r, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - r * 0.7, y - r * 0.7);
      ctx.lineTo(x + r * 0.7, y + r * 0.7);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - r * 0.7, y + r * 0.7);
      ctx.lineTo(x + r * 0.7, y - r * 0.7);
      ctx.stroke();
    }

    // Ice patches
    ctx.fillStyle = "rgba(0, 150, 200, 0.2)";
    ctx.fillRect(size * 0.6, size * 0.6, size * 0.35, size * 0.35);
  }

  /**
   * Draw desert tile with sand dunes
   */
  drawDesertTile(ctx, size, baseColor) {
    // Sand dunes
    ctx.fillStyle = "rgba(218, 165, 32, 0.5)";
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.7, size * 0.3, 0, Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(size * 0.75, size * 0.6, size * 0.25, 0, Math.PI);
    ctx.fill();

    // Desert rocks
    ctx.fillStyle = "rgba(139, 90, 43, 0.6)";
    ctx.beginPath();
    ctx.arc(size * 0.2, size * 0.2, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(size * 0.85, size * 0.3, size * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Heat shimmer effect
    ctx.strokeStyle = "rgba(255, 200, 0, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.5);
    ctx.quadraticCurveTo(size * 0.5, size * 0.45, size, size * 0.5);
    ctx.stroke();
  }

  /**
   * Draw village tile with houses
   */
  drawVillageTile(ctx, size, baseColor) {
    // House structure
    ctx.fillStyle = "rgba(184, 115, 51, 0.8)";
    ctx.fillRect(size * 0.2, size * 0.3, size * 0.3, size * 0.4);
    ctx.fillRect(size * 0.55, size * 0.35, size * 0.35, size * 0.4);

    // Roofs
    ctx.fillStyle = "rgba(139, 69, 19, 0.9)";
    ctx.beginPath();
    ctx.moveTo(size * 0.2, size * 0.3);
    ctx.lineTo(size * 0.35, size * 0.15);
    ctx.lineTo(size * 0.5, size * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(size * 0.55, size * 0.35);
    ctx.lineTo(size * 0.725, size * 0.2);
    ctx.lineTo(size * 0.9, size * 0.35);
    ctx.closePath();
    ctx.fill();

    // Windows
    ctx.fillStyle = "rgba(255, 200, 0, 0.7)";
    ctx.fillRect(size * 0.25, size * 0.4, size * 0.08, size * 0.08);
    ctx.fillRect(size * 0.35, size * 0.4, size * 0.08, size * 0.08);
    ctx.fillRect(size * 0.6, size * 0.45, size * 0.08, size * 0.08);

    // Ground
    ctx.fillStyle = "rgba(139, 90, 43, 0.5)";
    ctx.fillRect(0, size * 0.75, size, size * 0.25);
  }

  /**
   * Draw dungeon tile with stones
   */
  drawDungeonTile(ctx, size, baseColor) {
    // Stone blocks
    const blockSize = size / 2;
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, blockSize, blockSize);
    ctx.fillRect(blockSize, blockSize, blockSize, blockSize);

    ctx.fillStyle = "rgba(50, 50, 50, 0.4)";
    ctx.fillRect(blockSize, 0, blockSize, blockSize);
    ctx.fillRect(0, blockSize, blockSize, blockSize);

    // Cracks
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(blockSize, 0);
    ctx.lineTo(blockSize, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, blockSize);
    ctx.lineTo(size, blockSize);
    ctx.stroke();

    // Moss/decay spots
    ctx.fillStyle = "rgba(34, 100, 34, 0.3)";
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.3, size * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(size * 0.75, size * 0.7, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Create tileset atlas from all tiles
   * @returns {HTMLCanvasElement} Atlas canvas
   */
  createAtlas() {
    const tilesArray = Object.values(this.tiles);
    const cols = 3;
    const rows = Math.ceil(tilesArray.length / cols);

    const atlasCanvas = document.createElement("canvas");
    atlasCanvas.width = this.tileSize * cols;
    atlasCanvas.height = this.tileSize * rows;
    const ctx = atlasCanvas.getContext("2d");

    // Fill with transparent background
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);

    // Draw each tile
    tilesArray.forEach((tile, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * this.tileSize;
      const y = row * this.tileSize;

      ctx.drawImage(tile, x, y);
    });

    this.atlas = atlasCanvas;
    return atlasCanvas;
  }

  /**
   * Export tile as data URL (for saving/displaying)
   * @param {string} biomName - Biome name
   * @returns {string} Data URL
   */
  exportTileAsDataURL(biomName) {
    const tile = this.tiles[biomName];
    if (!tile) return null;
    return tile.toDataURL("image/png");
  }

  /**
   * Export atlas as data URL
   * @returns {string} Data URL
   */
  exportAtlasAsDataURL() {
    if (!this.atlas) this.createAtlas();
    return this.atlas.toDataURL("image/png");
  }

  /**
   * Display tiles in a container element for preview
   * @param {HTMLElement} container - Container element
   */
  displayTilesPreview(container) {
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(3, 1fr)";
    container.style.gap = "10px";
    container.style.padding = "10px";

    for (const [biomName, tile] of Object.entries(this.tiles)) {
      const div = document.createElement("div");
      div.style.display = "flex";
      div.style.flexDirection = "column";
      div.style.alignItems = "center";
      div.style.padding = "10px";
      div.style.backgroundColor = "#f0f0f0";
      div.style.borderRadius = "4px";

      const label = document.createElement("p");
      label.textContent = biomName;
      label.style.margin = "5px 0";
      label.style.fontSize = "12px";
      label.style.fontWeight = "bold";

      const image = document.createElement("img");
      image.src = tile.toDataURL("image/png");
      image.style.imageRendering = "pixelated";
      image.style.border = "1px solid #ccc";
      image.style.padding = "5px";
      image.style.width = this.tileSize * 3 + "px";
      image.style.height = this.tileSize * 3 + "px";

      div.appendChild(image);
      div.appendChild(label);
      container.appendChild(div);
    }
  }

  /**
   * Display atlas preview
   * @param {HTMLElement} container - Container element
   */
  displayAtlasPreview(container) {
    container.innerHTML = "";
    container.style.padding = "10px";

    const image = document.createElement("img");
    image.src = this.exportAtlasAsDataURL();
    image.style.imageRendering = "pixelated";
    image.style.border = "2px solid #333";
    image.style.width = this.atlas.width * 3 + "px";
    image.style.height = this.atlas.height * 3 + "px";

    const label = document.createElement("p");
    label.textContent = "Tileset Atlas";
    label.style.marginBottom = "10px";
    label.style.fontSize = "16px";
    label.style.fontWeight = "bold";

    container.appendChild(label);
    container.appendChild(image);
  }

  /**
   * Get tile image by biome name
   * @param {string} biomName - Biome name
   * @returns {HTMLCanvasElement} Tile canvas
   */
  getTile(biomName) {
    return this.tiles[biomName] || null;
  }

  /**
   * Get all tiles
   * @returns {Object} Map of biomName -> canvas
   */
  getAllTiles() {
    return this.tiles;
  }

  /**
   * Get atlas
   * @returns {HTMLCanvasElement} Atlas canvas
   */
  getAtlas() {
    return this.atlas;
  }
}

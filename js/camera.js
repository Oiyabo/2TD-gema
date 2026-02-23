// =============================
// CAMERA SYSTEM
// =============================

import { CONFIG } from "./config.js";

/**
 * Camera for viewport management
 */
export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  /**
   * Move camera
   * @param {number} dx - Delta X
   * @param {number} dy - Delta Y
   */
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  /**
   * Set camera position
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Get camera position
   * @returns {Object} { x, y }
   */
  getPosition() {
    return { x: this.x, y: this.y };
  }

  /**
   * Get visible chunk range
   * @param {number} tileSize - Tile size in pixels
   * @param {number} chunkSize - Chunk size in tiles
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @returns {Object} { minChunkX, maxChunkX, minChunkY, maxChunkY }
   */
  getVisibleChunkRange(tileSize, chunkSize, canvasWidth, canvasHeight) {
    const pixelsPerChunk = tileSize * chunkSize;

    const minChunkX = Math.floor(this.x / pixelsPerChunk);
    const maxChunkX = Math.floor((this.x + canvasWidth) / pixelsPerChunk);

    const minChunkY = Math.floor(this.y / pixelsPerChunk);
    const maxChunkY = Math.floor((this.y + canvasHeight) / pixelsPerChunk);

    return { minChunkX, maxChunkX, minChunkY, maxChunkY };
  }

  /**
   * Get visible tile range
   * @param {number} tileSize - Tile size in pixels
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @returns {Object} { minTileX, maxTileX, minTileY, maxTileY }
   */
  getVisibleTileRange(tileSize, canvasWidth, canvasHeight) {
    const minTileX = Math.floor(this.x / tileSize);
    const maxTileX = Math.floor((this.x + canvasWidth) / tileSize);

    const minTileY = Math.floor(this.y / tileSize);
    const maxTileY = Math.floor((this.y + canvasHeight) / tileSize);

    return {
      minTileX,
      maxTileX,
      minTileY,
      maxTileY,
    };
  }

  /**
   * Convert world position to screen position
   * @param {number} worldX - World X
   * @param {number} tileSize - Tile size in pixels
   * @returns {number} Screen X
   */
  worldToScreenX(worldX, tileSize) {
    return worldX * tileSize - this.x;
  }

  /**
   * Convert world position to screen position
   * @param {number} worldY - World Y
   * @param {number} tileSize - Tile size in pixels
   * @returns {number} Screen Y
   */
  worldToScreenY(worldY, tileSize) {
    return worldY * tileSize - this.y;
  }

  /**
   * Convert screen position to world position
   * @param {number} screenX - Screen X
   * @param {number} tileSize - Tile size in pixels
   * @returns {number} World X
   */
  screenToWorldX(screenX, tileSize) {
    return (screenX + this.x) / tileSize;
  }

  /**
   * Convert screen position to world position
   * @param {number} screenY - Screen Y
   * @param {number} tileSize - Tile size in pixels
   * @returns {number} World Y
   */
  screenToWorldY(screenY, tileSize) {
    return (screenY + this.y) / tileSize;
  }
}

/**
 * Input handler for camera movement
 */
export class CameraInput {
  constructor(camera) {
    this.camera = camera;
    this.keysPressed = {};

    window.addEventListener("keydown", (e) => this.onKeyDown(e));
    window.addEventListener("keyup", (e) => this.onKeyUp(e));
  }

  /**
   * Handle keydown
   * @param {KeyboardEvent} e - Event
   */
  onKeyDown(e) {
    this.keysPressed[e.key.toLowerCase()] = true;
  }

  /**
   * Handle keyup
   * @param {KeyboardEvent} e - Event
   */
  onKeyUp(e) {
    this.keysPressed[e.key.toLowerCase()] = false;
  }

  /**
   * Update camera based on input
   */
  update() {
    const speed = CONFIG.CAMERA_SPEED;

    if (
      this.keysPressed["arrowup"] ||
      this.keysPressed["w"] ||
      this.keysPressed["W"]
    ) {
      this.camera.move(0, -speed);
    }
    if (
      this.keysPressed["arrowdown"] ||
      this.keysPressed["s"] ||
      this.keysPressed["S"]
    ) {
      this.camera.move(0, speed);
    }
    if (
      this.keysPressed["arrowleft"] ||
      this.keysPressed["a"] ||
      this.keysPressed["A"]
    ) {
      this.camera.move(-speed, 0);
    }
    if (
      this.keysPressed["arrowright"] ||
      this.keysPressed["d"] ||
      this.keysPressed["D"]
    ) {
      this.camera.move(speed, 0);
    }
  }

  /**
   * Check if key is pressed
   * @param {string} key - Key
   * @returns {boolean} Is pressed
   */
  isPressed(key) {
    return this.keysPressed[key.toLowerCase()] === true;
  }
}

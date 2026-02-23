// =============================
// GRID TILE SYSTEM (2D TOP DOWN)
// =============================

// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 800;

// =============================
// CONFIG
// =============================
const TILE_SIZE = 16;
const MAP_WIDTH = 100;
const MAP_HEIGHT = 100;

// =============================
// TILE STRUCTURE
// =============================
class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.elevation = 0;
    this.biome = "grass";
    this.structure = null;
  }
}

// =============================
// WORLD GRID
// =============================
let world = [];

function createWorld() {
  world = [];

  for (let x = 0; x < MAP_WIDTH; x++) {
    world[x] = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
      world[x][y] = new Tile(x, y);
    }
  }
}

// =============================
// DEBUG BIOME COLOR
// =============================
function getBiomeColor(biome) {
  switch (biome) {
    case "water": return "#3498db";
    case "sand": return "#f1c40f";
    case "forest": return "#2ecc71";
    case "mountain": return "#95a5a6";
    default: return "#27ae60";
  }
}

// =============================
// RENDER GRID
// =============================
function renderWorld() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {

      const tile = world[x][y];

      ctx.fillStyle = getBiomeColor(tile.biome);
      ctx.fillRect(
        x * TILE_SIZE,
        y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }
}

// =============================
// SIMPLEX NOISE ELEVATION MAP (v4 API)
// =============================
// Versi terbaru simplex-noise TIDAK lagi memakai class SimplexNoise.
// Sekarang menggunakan factory function createNoise2D.

// Tambahkan di index.html:
// <script type="module" src="main.js"></script>

// Lalu di paling atas file main.js:
// import { createNoise2D } from 'https://cdn.jsdelivr.net/npm/simplex-noise@4.0.1/dist/esm/simplex-noise.js';

import { createNoise2D } from 'https://cdn.jsdelivr.net/npm/simplex-noise@4.0.1/dist/esm/simplex-noise.js';

const noise2D = createNoise2D();

const NOISE_SCALE = 0.05; // semakin kecil = semakin smooth

function generateElevation() {
  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      // nilai -1 sampai 1
      let value = noise2D(x * NOISE_SCALE, y * NOISE_SCALE);

      // normalize ke 0 - 1
      value = (value + 1) / 2;

      world[x][y].elevation = value;

      // sementara mapping biome dari elevation
      if (value < 0.3) world[x][y].biome = "water";
      else if (value < 0.4) world[x][y].biome = "sand";
      else if (value < 0.7) world[x][y].biome = "grass";
      else world[x][y].biome = "mountain";
    }
  }
}

// =============================
// INIT
// =============================
function init() {
  createWorld();
  generateElevation();
  renderWorld();
}

init();

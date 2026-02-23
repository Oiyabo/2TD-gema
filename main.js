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
// SIMPLE RANDOM BIOME (TEMP)
// =============================
function randomizeBiome() {
  const biomes = ["grass", "water", "sand", "forest", "mountain"];

  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      const rand = Math.floor(Math.random() * biomes.length);
      world[x][y].biome = biomes[rand];
    }
  }
}

// =============================
// INIT
// =============================
function init() {
  createWorld();
  randomizeBiome();
  renderWorld();
}

init();

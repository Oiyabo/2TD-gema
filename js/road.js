// =============================
// VILLAGE ROAD GRAPH GENERATOR
// =============================

import { createSeededRandom, seededRandomInt, seededRandomAngle } from "./seed.js";

/**
 * Graph node for village structure
 */
export class RoadNode {
  /**
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  constructor(x, y) {
    this.x = Math.floor(x);
    this.y = Math.floor(y);
  }

  /**
   * Distance to another node
   * @param {RoadNode} other - Other node
   * @returns {number} Distance
   */
  distance(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

/**
 * Graph edge for village road
 */
export class RoadEdge {
  /**
   * @param {RoadNode} from - Start node
   * @param {RoadNode} to - End node
   */
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  /**
   * Get length of edge
   * @returns {number} Length
   */
  getLength() {
    return this.from.distance(this.to);
  }
}

/**
 * Road graph for procedural village generation
 */
export class RoadGraph {
  /**
   * @param {number} centerX - Center X
   * @param {number} centerY - Center Y
   * @param {Function} rng - RNG function
   */
  constructor(centerX, centerY, rng) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.nodes = [];
    this.edges = [];

    this.generateGraph(rng);
  }

  /**
   * Generate graph structure
   * @param {Function} rng - RNG function
   */
  generateGraph(rng) {
    // Center node
    const centerNode = new RoadNode(this.centerX, this.centerY);
    this.nodes.push(centerNode);

    // Generate surrounding nodes
    const nodeCount = 5 + Math.floor(rng() * 6);

    for (let i = 1; i < nodeCount; i++) {
      const angle = seededRandomAngle(rng);
      const distance = 6 + rng() * 12;

      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const node = new RoadNode(x, y);
      this.nodes.push(node);

      // Connect to random parent node (spanning tree)
      const parentIdx = Math.floor(rng() * this.nodes.length);
      const parentNode = this.nodes[parentIdx];

      this.edges.push(new RoadEdge(parentNode, node));
    }
  }

  /**
   * Get all nodes
   * @returns {RoadNode[]} Nodes
   */
  getNodes() {
    return this.nodes;
  }

  /**
   * Get all edges
   * @returns {RoadEdge[]} Edges
   */
  getEdges() {
    return this.edges;
  }

  /**
   * Get radius bounding box
   * @returns {Object} { minX, maxX, minY, maxY }
   */
  getBounds() {
    let minX = this.centerX,
      maxX = this.centerX,
      minY = this.centerY,
      maxY = this.centerY;

    for (const node of this.nodes) {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    }

    return { minX, maxX, minY, maxY };
  }
}

/**
 * Draw line using Bresenham's algorithm
 * @param {Function} callback - Callback for each tile (x, y) => void
 * @param {number} x0 - Start X
 * @param {number} y0 - Start Y
 * @param {number} x1 - End X
 * @param {number} y1 - End Y
 */
export function drawLineOnGrid(callback, x0, y0, x1, y1) {
  x0 = Math.floor(x0);
  y0 = Math.floor(y0);
  x1 = Math.floor(x1);
  y1 = Math.floor(y1);

  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);

  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;

  let err = dx - dy;

  while (true) {
    callback(x0, y0);

    if (x0 === x1 && y0 === y1) break;

    let e2 = err * 2;

    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }

    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/**
 * Rasterize road edges onto tile map
 * @param {Object} tileMap - 2D tile array
 * @param {RoadGraph} graph - Road graph
 * @param {Object} options - { roadWidth, roadType }
 */
export function rasterizeroads(tileMap, graph, options = {}) {
  const roadWidth = options.roadWidth || 1;
  const roadType = options.roadType || "road";

  for (const edge of graph.getEdges()) {
    drawLineOnGrid(
      (x, y) => {
        // Set road tiles with width
        for (let dx = -roadWidth; dx <= roadWidth; dx++) {
          for (let dy = -roadWidth; dy <= roadWidth; dy++) {
            const tx = x + dx;
            const ty = y + dy;

            if (
              tileMap[ty] &&
              tileMap[ty][tx] &&
              tileMap[ty][tx].roadType === null
            ) {
              tileMap[ty][tx].roadType = roadType;
            }
          }
        }
      },
      edge.from.x,
      edge.from.y,
      edge.to.x,
      edge.to.y,
    );
  }
}

/**
 * Generate village road graph
 * @param {number} centerX - Village center X
 * @param {number} centerY - Village center Y
 * @param {number} seed - Seed for RNG
 * @returns {RoadGraph} Generated graph
 */
export function generateVillageRoadGraph(centerX, centerY, seed) {
  const rng = createSeededRandom(seed);
  return new RoadGraph(centerX, centerY, rng);
}

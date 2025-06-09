import { WarpPoint, MeshTriangle } from '@/types';

// Delaunay triangulation for mesh generation
export function generateDelaunayTriangulation(points: WarpPoint[]): MeshTriangle[] {
  if (points.length < 3) return [];
  
  const triangles: MeshTriangle[] = [];
  
  // Simple triangulation for now - in production, use a proper Delaunay algorithm
  for (let i = 0; i < points.length - 2; i++) {
    for (let j = i + 1; j < points.length - 1; j++) {
      for (let k = j + 1; k < points.length; k++) {
        const triangle: MeshTriangle = {
          points: [points[i], points[j], points[k]],
          centroid: {
            x: (points[i].x + points[j].x + points[k].x) / 3,
            y: (points[i].y + points[j].y + points[k].y) / 3,
            z: (points[i].z + points[j].z + points[k].z) / 3,
          }
        };
        triangles.push(triangle);
      }
    }
  }
  
  return triangles;
}

// Barycentric coordinate calculation
export function getBarycentricCoordinates(
  point: { x: number; y: number },
  triangle: [WarpPoint, WarpPoint, WarpPoint]
): { u: number; v: number; w: number } {
  const [p1, p2, p3] = triangle;
  
  const denom = (p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y);
  const u = ((p2.y - p3.y) * (point.x - p3.x) + (p3.x - p2.x) * (point.y - p3.y)) / denom;
  const v = ((p3.y - p1.y) * (point.x - p3.x) + (p1.x - p3.x) * (point.y - p3.y)) / denom;
  const w = 1 - u - v;
  
  return { u, v, w };
}

// Interpolate Z-depth using barycentric coordinates
export function interpolateDepth(
  point: { x: number; y: number },
  triangle: [WarpPoint, WarpPoint, WarpPoint]
): number {
  const barycentric = getBarycentricCoordinates(point, triangle);
  const [p1, p2, p3] = triangle;
  
  return barycentric.u * p1.z + barycentric.v * p2.z + barycentric.w * p3.z;
}

// Calculate perspective scaling based on depth
export function getPerspectiveScale(depth: number): number {
  // Closer points (higher z) should appear larger
  // Further points (lower z) should appear smaller
  return 0.5 + (depth * 0.5); // Scale between 0.5 and 1.0
}

// Auto-detect body contour points using edge detection
export function autoDetectWarpPoints(
  imageData: ImageData,
  numPoints: number = 20
): Omit<WarpPoint, 'id'>[] {
  const { width, height, data } = imageData;
  const points: Omit<WarpPoint, 'id'>[] = [];
  
  // Simple edge detection using Sobel operator
  const edges: number[][] = [];
  for (let y = 0; y < height; y++) {
    edges[y] = [];
    for (let x = 0; x < width; x++) {
      edges[y][x] = calculateEdgeStrength(data, x, y, width, height);
    }
  }
  
  // Find contour points by scanning edges
  const contourPoints = findContourPoints(edges, width, height);
  
  // Select evenly distributed points from contour
  const selectedPoints = selectDistributedPoints(contourPoints, numPoints);
  
  // Estimate depth based on brightness/shading
  return selectedPoints.map(point => ({
    x: point.x / width,
    y: point.y / height,
    z: estimateDepthFromShading(data, point.x, point.y, width, height)
  }));
}

// Calculate edge strength using Sobel operator
function calculateEdgeStrength(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number
): number {
  if (x <= 0 || x >= width - 1 || y <= 0 || y >= height - 1) return 0;
  
  const getPixel = (px: number, py: number) => {
    const idx = (py * width + px) * 4;
    return (data[idx] + data[idx + 1] + data[idx + 2]) / 3; // Grayscale
  };
  
  // Sobel X
  const gx = -1 * getPixel(x - 1, y - 1) + 1 * getPixel(x + 1, y - 1) +
             -2 * getPixel(x - 1, y) + 2 * getPixel(x + 1, y) +
             -1 * getPixel(x - 1, y + 1) + 1 * getPixel(x + 1, y + 1);
  
  // Sobel Y
  const gy = -1 * getPixel(x - 1, y - 1) + -2 * getPixel(x, y - 1) + -1 * getPixel(x + 1, y - 1) +
             1 * getPixel(x - 1, y + 1) + 2 * getPixel(x, y + 1) + 1 * getPixel(x + 1, y + 1);
  
  return Math.sqrt(gx * gx + gy * gy);
}

// Find contour points from edge data
function findContourPoints(
  edges: number[][],
  width: number,
  height: number
): { x: number; y: number; strength: number }[] {
  const points: { x: number; y: number; strength: number }[] = [];
  const threshold = 50; // Adjust based on image
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (edges[y][x] > threshold) {
        points.push({ x, y, strength: edges[y][x] });
      }
    }
  }
  
  return points.sort((a, b) => b.strength - a.strength);
}

// Select evenly distributed points from contour
function selectDistributedPoints(
  points: { x: number; y: number; strength: number }[],
  numPoints: number
): { x: number; y: number }[] {
  if (points.length <= numPoints) return points;
  
  const selected: { x: number; y: number }[] = [];
  const step = Math.floor(points.length / numPoints);
  
  for (let i = 0; i < numPoints; i++) {
    const idx = i * step;
    if (idx < points.length) {
      selected.push(points[idx]);
    }
  }
  
  return selected;
}

// Estimate depth based on pixel brightness/shading
function estimateDepthFromShading(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number
): number {
  const idx = (y * width + x) * 4;
  const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
  
  // Brighter areas are typically closer (higher z)
  // Darker areas are typically further (lower z)
  return brightness / 255;
}

// Apply warping transformation to a point
export function applyWarpTransformation(
  point: { x: number; y: number },
  warpPoints: WarpPoint[],
  warpStrength: number
): { x: number; y: number; scale: number } {
  if (warpPoints.length < 3) {
    return { ...point, scale: 1 };
  }
  
  const triangles = generateDelaunayTriangulation(warpPoints);
  
  // Find which triangle contains the point
  const containingTriangle = findContainingTriangle(point, triangles);
  
  if (!containingTriangle) {
    return { ...point, scale: 1 };
  }
  
  // Interpolate depth at this point
  const depth = interpolateDepth(point, containingTriangle.points);
  
  // Calculate perspective scaling
  const perspectiveScale = getPerspectiveScale(depth);
  
  // Apply warp strength
  const finalScale = 1 + (perspectiveScale - 1) * (warpStrength / 100);
  
  return {
    x: point.x,
    y: point.y,
    scale: finalScale
  };
}

// Find triangle containing a point
function findContainingTriangle(
  point: { x: number; y: number },
  triangles: MeshTriangle[]
): MeshTriangle | null {
  for (const triangle of triangles) {
    const barycentric = getBarycentricCoordinates(point, triangle.points);
    
    // Point is inside if all barycentric coordinates are positive
    if (barycentric.u >= 0 && barycentric.v >= 0 && barycentric.w >= 0) {
      return triangle;
    }
  }
  
  return null;
}

// Generate body shape presets
export const BODY_SHAPE_PRESETS = {
  arm: {
    id: 'arm',
    name: 'Arm (Cylindrical)',
    type: 'cylindrical' as const,
    description: 'Optimized for arm tattoos with cylindrical warping',
    warpPoints: [
      { x: 0.2, y: 0.3, z: 0.8 },
      { x: 0.8, y: 0.3, z: 0.2 },
      { x: 0.5, y: 0.5, z: 1.0 },
      { x: 0.2, y: 0.7, z: 0.8 },
      { x: 0.8, y: 0.7, z: 0.2 },
    ]
  },
  shoulder: {
    id: 'shoulder',
    name: 'Shoulder (Spherical)',
    type: 'spherical' as const,
    description: 'Optimized for shoulder tattoos with spherical warping',
    warpPoints: [
      { x: 0.3, y: 0.2, z: 0.9 },
      { x: 0.7, y: 0.2, z: 0.9 },
      { x: 0.5, y: 0.4, z: 1.0 },
      { x: 0.2, y: 0.6, z: 0.7 },
      { x: 0.8, y: 0.6, z: 0.7 },
      { x: 0.5, y: 0.8, z: 0.5 },
    ]
  },
  back: {
    id: 'back',
    name: 'Back (Planar)',
    type: 'planar' as const,
    description: 'Optimized for back tattoos with minimal warping',
    warpPoints: [
      { x: 0.2, y: 0.2, z: 0.9 },
      { x: 0.8, y: 0.2, z: 0.9 },
      { x: 0.2, y: 0.8, z: 0.9 },
      { x: 0.8, y: 0.8, z: 0.9 },
      { x: 0.5, y: 0.5, z: 1.0 },
    ]
  }
}; 
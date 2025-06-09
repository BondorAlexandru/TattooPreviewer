import { WarpPoint, MeshTriangle, BodyShapePreset } from '@/types';

// Height map interpolation using inverse distance weighting
export function interpolateHeight(x: number, y: number, warpPoints: WarpPoint[]): number {
  if (warpPoints.length === 0) return 0.5; // Default height
  
  let totalWeight = 0;
  let weightedHeight = 0;
  
  for (const point of warpPoints) {
    const dx = x - point.x;
    const dy = y - point.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If we're very close to a point, use its height directly
    if (distance < 0.001) {
      return point.z;
    }
    
    // Inverse squared distance weighting with falloff
    const weight = 1 / (distance * distance + 0.01);
    totalWeight += weight;
    weightedHeight += point.z * weight;
  }
  
  return weightedHeight / totalWeight;
}

// Calculate how the tattoo should be transformed based on terrain
export function calculateTerrainTransform(
  tattooPos: { x: number, y: number },
  tattooSize: { width: number, height: number },
  warpPoints: WarpPoint[],
  warpStrength: number
): {
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  offsetX: number;
  offsetY: number;
} {
  if (warpPoints.length === 0 || warpStrength === 0) {
    return {
      scaleX: 1,
      scaleY: 1,
      skewX: 0,
      skewY: 0,
      offsetX: 0,
      offsetY: 0
    };
  }
  
  // Sample height at key points around the tattoo
  const centerHeight = interpolateHeight(tattooPos.x, tattooPos.y, warpPoints);
  const leftHeight = interpolateHeight(tattooPos.x - tattooSize.width * 0.25, tattooPos.y, warpPoints);
  const rightHeight = interpolateHeight(tattooPos.x + tattooSize.width * 0.25, tattooPos.y, warpPoints);
  const topHeight = interpolateHeight(tattooPos.x, tattooPos.y - tattooSize.height * 0.25, warpPoints);
  const bottomHeight = interpolateHeight(tattooPos.x, tattooPos.y + tattooSize.height * 0.25, warpPoints);
  
  // Calculate the strength factor (0-1)
  const strength = warpStrength / 100;
  
  // Height differences create gradients
  const horizontalGradient = (rightHeight - leftHeight) * strength;
  const verticalGradient = (bottomHeight - topHeight) * strength;
  
  // Base scale from center height (higher = larger, like cloth stretching over a hill)
  const baseScale = 0.7 + (centerHeight * 0.6); // Range: 0.7 to 1.3
  const heightScale = 1 + (centerHeight - 0.5) * strength * 0.8;
  
  // Apply gradients as skew to simulate draping
  const skewX = horizontalGradient * 15; // Convert to degrees
  const skewY = verticalGradient * 15;
  
  // Slight position offset based on height (cloth sags in valleys, rises on hills)
  const offsetX = (centerHeight - 0.5) * strength * 10;
  const offsetY = (centerHeight - 0.5) * strength * 10;
  
  return {
    scaleX: baseScale * heightScale,
    scaleY: baseScale * heightScale,
    skewX: skewX,
    skewY: skewY,
    offsetX: offsetX,
    offsetY: offsetY
  };
}

// Create a visual height map for debugging
export function createHeightMapVisualization(
  width: number,
  height: number,
  warpPoints: WarpPoint[]
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const normalizedX = x / width;
      const normalizedY = y / height;
      const height_val = interpolateHeight(normalizedX, normalizedY, warpPoints);
      
      // Convert height to color (blue = low, red = high)
      const intensity = Math.floor(height_val * 255);
      const index = (y * width + x) * 4;
      
      imageData.data[index] = intensity; // Red
      imageData.data[index + 1] = 100; // Green
      imageData.data[index + 2] = 255 - intensity; // Blue
      imageData.data[index + 3] = 100; // Alpha
    }
  }
  
  return imageData;
}

// Remove old triangulation functions and replace with terrain visualization
export function generateTerrainMesh(warpPoints: WarpPoint[], gridSize: number = 20): {
  points: number[];
  colors: string[];
} {
  const points: number[] = [];
  const colors: string[] = [];
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = col / (gridSize - 1);
      const y = row / (gridSize - 1);
      const height = interpolateHeight(x, y, warpPoints);
      
      points.push(x, y);
      
      // Color based on height (green = low, red = high)
      const hue = height * 120; // 0 = red, 120 = green
      colors.push(`hsl(${120 - hue}, 70%, 50%)`);
    }
  }
  
  return { points, colors };
}

// Auto-detect warp points (simplified for terrain approach)
export function autoDetectWarpPoints(
  imageData: ImageData,
  maxPoints: number = 8
): Omit<WarpPoint, 'id'>[] {
  const { width, height, data } = imageData;
  const points: Omit<WarpPoint, 'id'>[] = [];
  
  // Simple grid-based detection with random heights for demo
  const gridSize = Math.ceil(Math.sqrt(maxPoints));
  
  for (let row = 0; row < gridSize && points.length < maxPoints; row++) {
    for (let col = 0; col < gridSize && points.length < maxPoints; col++) {
      const x = (col + 0.5) / gridSize;
      const y = (row + 0.5) / gridSize;
      
      // Assign random heights to create interesting terrain
      const z = 0.2 + Math.random() * 0.6;
      
      points.push({ x, y, z });
    }
  }
  
  return points;
}

// Body shape presets with height-based thinking
export const BODY_SHAPE_PRESETS: Record<string, BodyShapePreset> = {
  arm: {
    id: 'arm',
    name: 'Arm/Limb',
    type: 'cylindrical',
    description: 'Curved surface with muscle definition',
    warpPoints: [
      { x: 0.2, y: 0.3, z: 0.3 }, // Valley
      { x: 0.5, y: 0.4, z: 0.8 }, // Muscle peak
      { x: 0.8, y: 0.5, z: 0.4 }, // Side slope
      { x: 0.4, y: 0.7, z: 0.6 }, // Secondary muscle
    ]
  },
  shoulder: {
    id: 'shoulder',
    name: 'Shoulder',
    type: 'spherical',
    description: 'Rounded shoulder contour',
    warpPoints: [
      { x: 0.3, y: 0.2, z: 0.9 }, // Shoulder peak
      { x: 0.1, y: 0.5, z: 0.4 }, // Armpit valley
      { x: 0.6, y: 0.3, z: 0.7 }, // Upper arm
      { x: 0.5, y: 0.6, z: 0.5 }, // Chest transition
    ]
  },
  back: {
    id: 'back',
    name: 'Back',
    type: 'planar',
    description: 'Spine valley with muscle ridges',
    warpPoints: [
      { x: 0.5, y: 0.2, z: 0.3 }, // Spine valley top
      { x: 0.2, y: 0.4, z: 0.8 }, // Left muscle ridge
      { x: 0.8, y: 0.4, z: 0.8 }, // Right muscle ridge
      { x: 0.5, y: 0.6, z: 0.2 }, // Lower spine valley
      { x: 0.3, y: 0.8, z: 0.6 }, // Left lower back
      { x: 0.7, y: 0.8, z: 0.6 }, // Right lower back
    ]
  },
  chest: {
    id: 'chest',
    name: 'Chest',
    type: 'spherical',
    description: 'Pectoral muscle definition',
    warpPoints: [
      { x: 0.3, y: 0.3, z: 0.8 }, // Left pec peak
      { x: 0.7, y: 0.3, z: 0.8 }, // Right pec peak
      { x: 0.5, y: 0.2, z: 0.4 }, // Sternum valley
      { x: 0.5, y: 0.6, z: 0.6 }, // Lower chest
    ]
  },
  leg: {
    id: 'leg',
    name: 'Leg/Thigh',
    type: 'cylindrical',
    description: 'Curved leg musculature',
    warpPoints: [
      { x: 0.4, y: 0.2, z: 0.7 }, // Quad peak
      { x: 0.2, y: 0.5, z: 0.4 }, // Inner thigh valley
      { x: 0.8, y: 0.4, z: 0.6 }, // Outer thigh
      { x: 0.5, y: 0.8, z: 0.5 }, // Knee area
    ]
  }
}; 
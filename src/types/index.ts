// Core data structures for the Tattoo Preview App

export interface WarpPoint {
  id: string;
  x: number; // Position x (percentage-based 0-1)
  y: number; // Position y (percentage-based 0-1)
  z: number; // Depth/elevation (0.0 = farthest, 1.0 = closest)
  isLocked?: boolean;
}

export interface TattooState {
  id: string;
  imageUrl: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  skew: { x: number; y: number };
  opacity: number;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  // Aging effects
  sepia: number;
  fade: number;
  colorShift: number;
  // Blend mode for skin integration
  blendMode: string;
}

export interface BodyImageState {
  id: string;
  imageUrl: string;
  scale: number;
  position: { x: number; y: number };
}

export interface CanvasState {
  width: number;
  height: number;
  zoom: number;
  pan: { x: number; y: number };
}

export interface AppState {
  bodyImage: BodyImageState | null;
  tattoo: TattooState | null;
  warpPoints: WarpPoint[];
  canvas: CanvasState;
  warpStrength: number; // 0-100
  showMesh: boolean;
  showWarpPoints: boolean;
  isWarpingEnabled: boolean;
}

export interface MeshTriangle {
  points: [WarpPoint, WarpPoint, WarpPoint];
  centroid: { x: number; y: number; z: number };
}

export interface ImageUploadResult {
  url: string;
  width: number;
  height: number;
  file: File;
}

export interface BodyShapePreset {
  id: string;
  name: string;
  type: 'cylindrical' | 'spherical' | 'planar' | 'custom';
  warpPoints: Omit<WarpPoint, 'id'>[];
  description: string;
}

export interface TransformationHandle {
  type: 'scale' | 'rotate' | 'skew';
  position: { x: number; y: number };
  cursor: string;
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'webp';
  quality: number; // 0-100
  scale: number; // Pixel ratio multiplier
  includeOriginal: boolean;
} 
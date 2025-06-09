export interface TattooDesign {
  id: string;
  name: string;
  image: string;
  thumbnail: string;
}

export interface WarpPoint {
  x: number;
  y: number;
  z: number;
  id: string;
  type: "auto" | "manual";
}

export interface TattooState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface MeshLine {
  from: WarpPoint;
  to: WarpPoint;
}

export interface Position {
  x: number;
  y: number;
} 
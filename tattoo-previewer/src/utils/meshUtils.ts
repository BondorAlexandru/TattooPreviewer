import { WarpPoint, MeshLine } from '../types';

export const generateMeshLines = (warpPoints: WarpPoint[]): MeshLine[] => {
  if (warpPoints.length < 3) return [];
  
  const lines: MeshLine[] = [];
  for (let i = 0; i < warpPoints.length; i++) {
    for (let j = i + 1; j < warpPoints.length; j++) {
      const p1 = warpPoints[i];
      const p2 = warpPoints[j];
      const distance = Math.sqrt(
        Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
      );
      
      if (distance < 30) {
        lines.push({ from: p1, to: p2 });
      }
    }
  }
  return lines;
}; 
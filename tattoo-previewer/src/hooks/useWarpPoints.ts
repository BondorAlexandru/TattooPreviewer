import { useState, useRef, useEffect } from 'react';
import { WarpPoint } from '../types';
import { detectBodyEdges } from '../utils/imageProcessing';

export const useWarpPoints = (bodyImage: string | null, autoWarpEnabled: boolean) => {
  const [warpPoints, setWarpPoints] = useState<WarpPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-detect body edges when body image changes
  useEffect(() => {
    if (bodyImage && autoWarpEnabled && canvasRef.current) {
      const img = new window.Image();
      img.onload = () => {
        if (canvasRef.current) {
          const detectedPoints = detectBodyEdges(canvasRef.current, img);
          setWarpPoints(detectedPoints);
        }
      };
      img.src = bodyImage;
    }
  }, [bodyImage, autoWarpEnabled]);

  const addWarpPoint = (e: React.MouseEvent<HTMLDivElement>, containerRef: React.RefObject<HTMLDivElement | null>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newPoint: WarpPoint = {
      x,
      y,
      z: 0.8,
      id: `manual-${Date.now()}`,
      type: "manual",
    };
    setWarpPoints(prev => [...prev, newPoint]);
  };

  const deleteWarpPoint = (pointId: string) => {
    setWarpPoints(prev => prev.filter(p => p.id !== pointId));
    if (selectedPoint === pointId) {
      setSelectedPoint(null);
    }
  };

  const updateWarpPoint = (pointId: string, updates: Partial<WarpPoint>) => {
    setWarpPoints(prev =>
      prev.map(p => (p.id === pointId ? { ...p, ...updates } : p))
    );
  };

  const autoDetectEdges = () => {
    if (bodyImage && canvasRef.current) {
      const img = new window.Image();
      img.onload = () => {
        if (canvasRef.current) {
          const detectedPoints = detectBodyEdges(canvasRef.current, img);
          setWarpPoints(detectedPoints);
        }
      };
      img.src = bodyImage;
    }
  };

  const resetWarpPoints = () => {
    setWarpPoints([]);
    setSelectedPoint(null);
  };

  return {
    warpPoints,
    selectedPoint,
    setSelectedPoint,
    canvasRef,
    addWarpPoint,
    deleteWarpPoint,
    updateWarpPoint,
    autoDetectEdges,
    resetWarpPoints,
  };
}; 
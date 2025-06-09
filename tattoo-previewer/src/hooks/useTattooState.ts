import { useState } from 'react';
import { TattooState, Position } from '../types';

const INITIAL_TATTOO_STATE: TattooState = {
  x: 50,
  y: 50,
  scale: 0.3,
  rotation: 0,
};

export const useTattooState = () => {
  const [tattooState, setTattooState] = useState<TattooState>(INITIAL_TATTOO_STATE);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent, containerRef: React.RefObject<HTMLDivElement | null>) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;
    
    setTattooState(prev => ({
      ...prev,
      x: Math.max(0, Math.min(100, prev.x + deltaX)),
      y: Math.max(0, Math.min(100, prev.y + deltaY))
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const rotateTattoo = (angle: number) => {
    setTattooState(prev => ({
      ...prev,
      rotation: prev.rotation + angle,
    }));
  };

  const scaleTattoo = (factor: number) => {
    setTattooState(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(1, prev.scale * factor)),
    }));
  };

  return {
    tattooState,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    rotateTattoo,
    scaleTattoo,
  };
}; 
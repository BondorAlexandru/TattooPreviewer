'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  WarpPoint, 
  TattooState, 
  BodyImageState, 
} from '@/types';

interface TattooCanvasProps {
  bodyImage: BodyImageState | null;
  tattoo: TattooState | null;
  warpPoints: WarpPoint[];
  warpStrength: number;
  showMesh: boolean;
  showWarpPoints: boolean;
  isWarpingEnabled: boolean;
  onTattooUpdate: (tattoo: TattooState) => void;
  onWarpPointsUpdate: (points: WarpPoint[]) => void;
  onCanvasClick: (x: number, y: number) => void;
  onBodyImageUpdate: (bodyImage: BodyImageState) => void;
  selectedWarpPoint: string | null;
  onSelectedWarpPointChange: (pointId: string | null) => void;
  className?: string;
}

const KonvaCanvasRenderer = dynamic(() => import('./KonvaCanvasRenderer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Loading canvas...</div>
    </div>
  )
});

export default function TattooCanvas(props: TattooCanvasProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${props.className}`}>
        <div className="text-gray-500">Loading canvas...</div>
      </div>
    );
  }

  return <KonvaCanvasRenderer {...props} />;
} 
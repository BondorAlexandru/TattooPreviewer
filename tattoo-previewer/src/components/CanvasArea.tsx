import React from 'react';
import Image from "next/image";
import { TattooDesign, TattooState, WarpPoint as WarpPointType } from '../types';
import { WarpPoint } from './WarpPoint';
import { MeshVisualization } from './MeshVisualization';
import { TattooOverlay } from './TattooOverlay';
import { generateMeshLines } from '../utils/meshUtils';

interface CanvasAreaProps {
  bodyImage: string;
  selectedTattoo: TattooDesign | null;
  tattooState: TattooState;
  warpPoints: WarpPointType[];
  selectedPoint: string | null;
  showMesh: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onAddWarpPoint: (e: React.MouseEvent<HTMLDivElement>) => void;
  onSelectWarpPoint: (pointId: string) => void;
  onTattooMouseDown: (e: React.MouseEvent) => void;
  onTattooMouseMove: (e: React.MouseEvent) => void;
  onTattooMouseUp: () => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  bodyImage,
  selectedTattoo,
  tattooState,
  warpPoints,
  selectedPoint,
  showMesh,
  canvasRef,
  containerRef,
  onAddWarpPoint,
  onSelectWarpPoint,
  onTattooMouseDown,
  onTattooMouseMove,
  onTattooMouseUp,
}) => {
  const meshLines = generateMeshLines(warpPoints);

  return (
    <div className="h-full w-full relative bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div 
        ref={containerRef}
        className="h-full w-full relative cursor-crosshair"
        onClick={onAddWarpPoint}
        onMouseMove={onTattooMouseMove}
        onMouseUp={onTattooMouseUp}
      >
        {/* Body Image - Always fits container */}
        <Image
          src={bodyImage}
          alt="Body"
          fill
          className="object-contain pointer-events-none"
          sizes="100vw"
          priority
        />

        {/* Hidden canvas for edge detection */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Tattoo Overlay */}
        {selectedTattoo && (
          <TattooOverlay
            tattoo={selectedTattoo}
            tattooState={tattooState}
            onMouseDown={onTattooMouseDown}
          />
        )}

        {/* Mesh Visualization */}
        {showMesh && <MeshVisualization meshLines={meshLines} />}

        {/* Warp Points */}
        {warpPoints.map((point) => (
          <WarpPoint
            key={point.id}
            point={point}
            isSelected={selectedPoint === point.id}
            onSelect={onSelectWarpPoint}
          />
        ))}

        {/* Instructions */}
        <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg">
          <p className="text-sm">
            Click to add warp points • {warpPoints.length} points placed
          </p>
        </div>
      </div>
    </div>
  );
}; 
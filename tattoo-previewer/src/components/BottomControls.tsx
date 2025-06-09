import React from 'react';
import Image from "next/image";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Trash2,
} from "lucide-react";
import { TattooDesign, WarpPoint } from '../types';

interface BottomControlsProps {
  tattooDesigns: TattooDesign[];
  selectedTattoo: TattooDesign | null;
  selectedPoint: string | null;
  warpPoints: WarpPoint[];
  onSelectTattoo: (tattoo: TattooDesign) => void;
  onRotateTattoo: (angle: number) => void;
  onScaleTattoo: (factor: number) => void;
  onUpdateWarpPoint: (pointId: string, updates: Partial<WarpPoint>) => void;
  onDeleteWarpPoint: (pointId: string) => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  tattooDesigns,
  selectedTattoo,
  selectedPoint,
  warpPoints,
  onSelectTattoo,
  onRotateTattoo,
  onScaleTattoo,
  onUpdateWarpPoint,
  onDeleteWarpPoint,
}) => {
  const selectedPointData = warpPoints.find(p => p.id === selectedPoint);

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Tattoo Selection */}
        {tattooDesigns.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-300">
              Tattoos:
            </span>
            <div className="flex gap-3 overflow-x-auto">
              {tattooDesigns.map((tattoo) => (
                <button
                  key={tattoo.id}
                  onClick={() => onSelectTattoo(tattoo)}
                  className={`relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                    selectedTattoo?.id === tattoo.id
                      ? "ring-2 ring-blue-500 scale-110"
                      : "hover:scale-105 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={tattoo.thumbnail}
                    alt={tattoo.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tattoo Transform Controls */}
        {selectedTattoo && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onRotateTattoo(-15)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              <RotateCw className="w-4 h-4 transform scale-x-[-1]" />
            </button>
            <button
              onClick={() => onRotateTattoo(15)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => onScaleTattoo(1.1)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => onScaleTattoo(0.9)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Selected Point Controls */}
        {selectedPoint && selectedPointData && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">Point:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={selectedPointData.z}
              onChange={(e) =>
                onUpdateWarpPoint(selectedPoint, {
                  z: parseFloat(e.target.value),
                })
              }
              className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <button
              onClick={() => onDeleteWarpPoint(selectedPoint)}
              className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Status Info */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>
          Points: {warpPoints.length} (Auto:{" "}
          {warpPoints.filter((p) => p.type === "auto").length}, Manual:{" "}
          {warpPoints.filter((p) => p.type === "manual").length})
        </span>
        <span>
          Click to add points • Select points to adjust depth • Mesh shows 3D
          geometry
        </span>
      </div>
    </div>
  );
}; 
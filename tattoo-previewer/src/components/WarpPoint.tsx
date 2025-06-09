import React from 'react';
import { WarpPoint as WarpPointType } from '../types';

interface WarpPointProps {
  point: WarpPointType;
  isSelected: boolean;
  onSelect: (pointId: string) => void;
}

export const WarpPoint: React.FC<WarpPointProps> = ({ point, isSelected, onSelect }) => {
  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
        isSelected ? "z-20" : "z-10"
      }`}
      style={{
        left: `${point.x}%`,
        top: `${point.y}%`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(point.id);
      }}
    >
      <div
        className={`w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all ${
          point.type === "auto" ? "bg-blue-500" : "bg-orange-500"
        } ${
          isSelected
            ? "scale-150 ring-2 ring-yellow-400"
            : "hover:scale-125"
        }`}
        style={{
          opacity: point.z,
          transform: `scale(${0.8 + point.z * 0.4})`,
        }}
      />
      {/* 3D depth indicator */}
      <div
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs bg-black/70 text-white px-1 rounded pointer-events-none"
        style={{ opacity: isSelected ? 1 : 0 }}
      >
        z:{point.z.toFixed(1)}
      </div>
    </div>
  );
}; 
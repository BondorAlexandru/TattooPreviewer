import React from 'react';
import Image from "next/image";
import { TattooDesign, TattooState } from '../types';

interface TattooOverlayProps {
  tattoo: TattooDesign;
  tattooState: TattooState;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const TattooOverlay: React.FC<TattooOverlayProps> = ({
  tattoo,
  tattooState,
  onMouseDown,
}) => {
  return (
    <div
      className="absolute cursor-move select-none"
      style={{
        left: `${tattooState.x}%`,
        top: `${tattooState.y}%`,
        transform: `translate(-50%, -50%) scale(${tattooState.scale}) rotate(${tattooState.rotation}deg)`,
        transformOrigin: "center",
        opacity: 0.85,
        filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
      }}
      onMouseDown={onMouseDown}
    >
      <Image
        src={tattoo.image}
        alt="Tattoo"
        width={200}
        height={200}
        className="max-w-none pointer-events-none"
        draggable={false}
      />
    </div>
  );
}; 
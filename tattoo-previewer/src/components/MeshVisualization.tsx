import React from 'react';
import { MeshLine } from '../types';

interface MeshVisualizationProps {
  meshLines: MeshLine[];
}

export const MeshVisualization: React.FC<MeshVisualizationProps> = ({ meshLines }) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {meshLines.map((line, index) => (
        <line
          key={index}
          x1={`${line.from.x}%`}
          y1={`${line.from.y}%`}
          x2={`${line.to.x}%`}
          y2={`${line.to.y}%`}
          stroke="rgba(34, 197, 94, 0.6)"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      ))}
    </svg>
  );
}; 
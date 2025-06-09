import React from 'react';
import {
  Upload,
  Download,
  Wand2,
  Target,
  Grid3X3,
  RefreshCw,
} from "lucide-react";

interface ToolbarProps {
  autoWarpEnabled: boolean;
  showMesh: boolean;
  onToggleAutoWarp: () => void;
  onToggleShowMesh: () => void;
  onBodyImageUpload: (file: File) => void;
  onTattooUpload: (file: File) => void;
  onAutoDetectEdges: () => void;
  onResetWarpPoints: () => void;
  onDownload: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  autoWarpEnabled,
  showMesh,
  onToggleAutoWarp,
  onToggleShowMesh,
  onBodyImageUpload,
  onTattooUpload,
  onAutoDetectEdges,
  onResetWarpPoints,
  onDownload,
}) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold">Tattoo Preview</h1>
        
        <div className="flex items-center gap-3">
          {/* Body Image Upload */}
          <button
            onClick={() => document.getElementById("body-upload")?.click()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Body
          </button>
          <input
            id="body-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onBodyImageUpload(file);
            }}
          />

          {/* Tattoo Upload */}
          <button
            onClick={() => document.getElementById("tattoo-upload")?.click()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Add Tattoo
          </button>
          <input
            id="tattoo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onTattooUpload(file);
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Auto Edge Detection Toggle */}
        <button
          onClick={onToggleAutoWarp}
          className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
            autoWarpEnabled
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          Auto {autoWarpEnabled ? "ON" : "OFF"}
        </button>

        {/* Manual Edge Detection */}
        <button
          onClick={onAutoDetectEdges}
          className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <Target className="w-4 h-4" />
          Detect
        </button>

        {/* Mesh Visualizer Toggle */}
        <button
          onClick={onToggleShowMesh}
          className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
            showMesh
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
          Mesh
        </button>

        {/* Reset Points */}
        <button
          onClick={onResetWarpPoints}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>

        {/* Download */}
        <button
          onClick={onDownload}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  );
}; 
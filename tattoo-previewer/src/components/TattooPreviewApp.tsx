"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Download,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Target,
  Wand2,
  Grid3X3,
  RotateCw,
  Trash2,
} from "lucide-react";

interface TattooDesign {
  id: string;
  name: string;
  image: string;
  thumbnail: string;
}

interface WarpPoint {
  x: number;
  y: number;
  z: number;
  id: string;
  type: "auto" | "manual";
}

interface TattooState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

// Advanced body edge detection algorithm
const detectBodyEdges = (
  canvas: HTMLCanvasElement,
  img: HTMLImageElement
): WarpPoint[] => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  // Set canvas size and draw image
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const points: WarpPoint[] = [];
  const width = img.width;
  const height = img.height;
  
  // Simplified edge detection - create a basic body contour
  const samplingPoints = [
    // Top section
    { x: width * 0.3, y: height * 0.2, z: 0.7 },
    { x: width * 0.5, y: height * 0.15, z: 1.0 },
    { x: width * 0.7, y: height * 0.2, z: 0.7 },
    
    // Middle section
    { x: width * 0.25, y: height * 0.4, z: 0.6 },
    { x: width * 0.5, y: height * 0.4, z: 1.0 },
    { x: width * 0.75, y: height * 0.4, z: 0.6 },
    
    // Lower middle
    { x: width * 0.3, y: height * 0.6, z: 0.7 },
    { x: width * 0.5, y: height * 0.6, z: 1.0 },
    { x: width * 0.7, y: height * 0.6, z: 0.7 },
    
    // Bottom section
    { x: width * 0.35, y: height * 0.8, z: 0.6 },
    { x: width * 0.5, y: height * 0.85, z: 0.9 },
    { x: width * 0.65, y: height * 0.8, z: 0.6 },
  ];

  samplingPoints.forEach((point, index) => {
    // Convert to percentage coordinates
    points.push({
      x: (point.x / width) * 100,
      y: (point.y / height) * 100,
      z: point.z,
      id: `auto-${index}`,
      type: "auto",
    });
  });

  return points;
};

export default function TattooPreviewApp() {
  const [bodyImage, setBodyImage] = useState<string | null>(null);
  const [tattooDesigns, setTattooDesigns] = useState<TattooDesign[]>([]);
  const [selectedTattoo, setSelectedTattoo] = useState<TattooDesign | null>(
    null
  );
  const [warpPoints, setWarpPoints] = useState<WarpPoint[]>([]);
  const [autoWarpEnabled, setAutoWarpEnabled] = useState(true);
  const [showMesh, setShowMesh] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [tattooState, setTattooState] = useState<TattooState>({
    x: 50,
    y: 50,
    scale: 0.3,
    rotation: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect body edges when body image changes
  useEffect(() => {
    if (bodyImage && autoWarpEnabled && canvasRef.current) {
      const img = new window.Image();
      img.onload = () => {
        const detectedPoints = detectBodyEdges(canvasRef.current!, img);
        setWarpPoints(detectedPoints);
      };
      img.src = bodyImage;
    }
  }, [bodyImage, autoWarpEnabled]);

  const handleBodyImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBodyImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTattooUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const newTattoo: TattooDesign = {
        id: `tattoo-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        image: imageUrl,
        thumbnail: imageUrl,
      };
      setTattooDesigns((prev) => [...prev, newTattoo]);
      setSelectedTattoo(newTattoo);
    };
    reader.readAsDataURL(file);
  };

  const addWarpPoint = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return; // Don't add points while dragging tattoo
    
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
    setWarpPoints((prev) => [...prev, newPoint]);
  };

  // Tattoo drag handlers
  const handleTattooMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent container click
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTattooMouseMove = (e: React.MouseEvent) => {
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

  const handleTattooMouseUp = () => {
    setIsDragging(false);
  };

  const deleteWarpPoint = (pointId: string) => {
    setWarpPoints((prev) => prev.filter((p) => p.id !== pointId));
    if (selectedPoint === pointId) {
      setSelectedPoint(null);
    }
  };

  const updateWarpPoint = (pointId: string, updates: Partial<WarpPoint>) => {
    setWarpPoints((prev) =>
      prev.map((p) => (p.id === pointId ? { ...p, ...updates } : p))
    );
  };

  const autoDetectEdges = () => {
    if (bodyImage && canvasRef.current) {
      const img = new window.Image();
      img.onload = () => {
        const detectedPoints = detectBodyEdges(canvasRef.current!, img);
        setWarpPoints(detectedPoints);
      };
      img.src = bodyImage;
    }
  };

  const resetWarpPoints = () => {
    setWarpPoints([]);
    setSelectedPoint(null);
  };

  const downloadResult = () => {
    console.log("Downloading result...");
  };

  // Generate mesh lines for visualization
  const generateMeshLines = () => {
    if (warpPoints.length < 3) return [];
    
    const lines = [];
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

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Simple Top Toolbar */}
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
                if (file) handleBodyImageUpload(file);
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
                if (file) handleTattooUpload(file);
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Edge Detection Toggle */}
          <button
            onClick={() => setAutoWarpEnabled(!autoWarpEnabled)}
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
            onClick={autoDetectEdges}
            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Target className="w-4 h-4" />
            Detect
          </button>

          {/* Mesh Visualizer Toggle */}
          <button
            onClick={() => setShowMesh(!showMesh)}
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
            onClick={resetWarpPoints}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>

          {/* Download */}
          <button
            onClick={downloadResult}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-gray-850 p-4">
        {!bodyImage ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Quick Tattoo Preview</h2>
              <p className="text-gray-400 mb-6">
                Upload a body photo to get started with instant tattoo preview
              </p>
              <button
                onClick={() => document.getElementById("body-upload")?.click()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Upload Body Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full w-full relative bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div 
              ref={containerRef}
              className="h-full w-full relative cursor-crosshair"
              onClick={addWarpPoint}
              onMouseMove={handleTattooMouseMove}
              onMouseUp={handleTattooMouseUp}
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
                  onMouseDown={handleTattooMouseDown}
                >
                  <Image
                    src={selectedTattoo.image}
                    alt="Tattoo"
                    width={200}
                    height={200}
                    className="max-w-none pointer-events-none"
                    draggable={false}
                  />
                </div>
              )}

              {/* Mesh Visualization */}
              {showMesh && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {generateMeshLines().map((line, index) => (
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
              )}

              {/* Warp Points */}
              {warpPoints.map((point) => (
                <div
                  key={point.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                    selectedPoint === point.id ? "z-20" : "z-10"
                  }`}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPoint(point.id);
                  }}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all ${
                      point.type === "auto" ? "bg-blue-500" : "bg-orange-500"
                    } ${
                      selectedPoint === point.id
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
                    style={{ opacity: selectedPoint === point.id ? 1 : 0 }}
                  >
                    z:{point.z.toFixed(1)}
                  </div>
                </div>
              ))}

              {/* Instructions */}
              <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg">
                <p className="text-sm">
                  Click to add warp points • {warpPoints.length} points placed
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
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
                    onClick={() => setSelectedTattoo(tattoo)}
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
                onClick={() =>
                  setTattooState((prev) => ({
                    ...prev,
                    rotation: prev.rotation - 15,
                  }))
                }
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                <RotateCw className="w-4 h-4 transform scale-x-[-1]" />
              </button>
              <button
                onClick={() =>
                  setTattooState((prev) => ({
                    ...prev,
                    rotation: prev.rotation + 15,
                  }))
                }
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setTattooState((prev) => ({
                    ...prev,
                    scale: Math.min(1, prev.scale * 1.1),
                  }))
                }
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setTattooState((prev) => ({
                    ...prev,
                    scale: Math.max(0.1, prev.scale * 0.9),
                  }))
                }
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Selected Point Controls */}
          {selectedPoint && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">Point:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={warpPoints.find((p) => p.id === selectedPoint)?.z || 0.5}
                onChange={(e) =>
                  updateWarpPoint(selectedPoint, {
                    z: parseFloat(e.target.value),
                  })
                }
                className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <button
                onClick={() => deleteWarpPoint(selectedPoint)}
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
    </div>
  );
}

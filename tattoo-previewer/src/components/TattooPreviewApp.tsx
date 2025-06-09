"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MousePointer,
  Move,
  RotateCw,
  Crop,
  Layers,
  Palette,
  Brush,
  Eraser,
  Eye,
  EyeOff,
  Download,
  Save,
  FolderOpen,
  Image as ImageIcon,
  Settings,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Plus,
  Grid3X3,
  Cylinder,
  Circle,
  Box,
  ChevronLeft,
  ChevronRight,
  Play,
  Target,
} from "lucide-react";
import TattooCanvasWrapper from "./TattooCanvasWrapper";

type Tool =
  | "select"
  | "move"
  | "rotate"
  | "crop"
  | "brush"
  | "eraser"
  | "point-placement";
type ViewMode = "2d" | "3d";
type BodyShape = "cylinder" | "sphere" | "plane" | "custom";

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  type: "body" | "tattoo";
  image?: string;
}

interface TattooDesign {
  id: string;
  name: string;
  image: string;
  thumbnail: string;
}

interface BodyGeometry {
  shape: BodyShape;
  points: Array<{ x: number; y: number; z: number; id: string }>;
  surfaceNormal: { x: number; y: number; z: number };
  curvature: number;
}

export default function TattooPreviewApp() {
  const [bodyImage, setBodyImage] = useState<string | null>(null);
  const [tattooDesigns, setTattooDesigns] = useState<TattooDesign[]>([]);
  const [selectedTattoo, setSelectedTattoo] = useState<TattooDesign | null>(
    null
  );
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [viewMode, setViewMode] = useState<ViewMode>("2d");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [bodyGeometry, setBodyGeometry] = useState<BodyGeometry>({
    shape: "cylinder",
    points: [],
    surfaceNormal: { x: 0, y: 0, z: 1 },
    curvature: 0.3,
  });
  const [showWarpPoints, setShowWarpPoints] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const tools = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "move", icon: Move, label: "Move" },
    { id: "rotate", icon: RotateCw, label: "Rotate" },
    { id: "point-placement", icon: Target, label: "3D Points" },
    { id: "crop", icon: Crop, label: "Crop" },
    { id: "brush", icon: Brush, label: "Brush" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
  ];

  const bodyShapes = [
    { id: "cylinder", icon: Cylinder, label: "Arm/Leg (Cylinder)" },
    { id: "sphere", icon: Circle, label: "Shoulder (Sphere)" },
    { id: "plane", icon: Box, label: "Back/Chest (Plane)" },
    { id: "custom", icon: Grid3X3, label: "Custom Shape" },
  ];

  const handleBodyImageUpload = (imageUrl: string) => {
    setBodyImage(imageUrl);
    const newLayer: Layer = {
      id: "body-layer",
      name: "Body Photo",
      visible: true,
      opacity: 100,
      type: "body",
      image: imageUrl,
    };
    setLayers((prev) => [...prev.filter((l) => l.type !== "body"), newLayer]);
  };

  const handleTattooImageUpload = (file: File) => {
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
      if (!selectedTattoo) {
        setSelectedTattoo(newTattoo);
        addTattooLayer(newTattoo);
      }
    };
    reader.readAsDataURL(file);
  };

  const addTattooLayer = (tattoo: TattooDesign) => {
    const newLayer: Layer = {
      id: `tattoo-layer-${tattoo.id}`,
      name: tattoo.name,
      visible: true,
      opacity: 85,
      type: "tattoo",
      image: tattoo.image,
    };
    setLayers((prev) => [...prev.filter((l) => l.type !== "tattoo"), newLayer]);
  };

  const selectTattoo = (tattoo: TattooDesign) => {
    setSelectedTattoo(tattoo);
    addTattooLayer(tattoo);
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, opacity } : layer
      )
    );
  };

  const addWarpPoint = (x: number, y: number) => {
    if (activeTool !== "point-placement") return;

    const newPoint = {
      id: `point-${Date.now()}`,
      x,
      y,
      z: 0.5, // Default depth
    };
    setBodyGeometry((prev) => ({
      ...prev,
      points: [...prev.points, newPoint],
    }));
  };

  const removeWarpPoint = (pointId: string) => {
    setBodyGeometry((prev) => ({
      ...prev,
      points: prev.points.filter((p) => p.id !== pointId),
    }));
  };

  const navigateCarousel = (direction: "left" | "right") => {
    if (direction === "left") {
      setCarouselIndex((prev) => Math.max(0, prev - 1));
    } else {
      setCarouselIndex((prev) => Math.min(tattooDesigns.length - 3, prev + 1));
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Top Menu Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl">InkVision Pro</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-4 py-2.5 text-sm hover:bg-gray-700 rounded-lg transition-colors">
              File
            </button>
            <button className="px-4 py-2.5 text-sm hover:bg-gray-700 rounded-lg transition-colors">
              Edit
            </button>
            <button className="px-4 py-2.5 text-sm hover:bg-gray-700 rounded-lg transition-colors">
              View
            </button>
            <button className="px-4 py-2.5 text-sm hover:bg-gray-700 rounded-lg transition-colors">
              Layer
            </button>
            <button className="px-4 py-2.5 text-sm hover:bg-gray-700 rounded-lg transition-colors">
              3D
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="p-3 hover:bg-gray-700 rounded-lg transition-colors"
            title="Undo"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            className="p-3 hover:bg-gray-700 rounded-lg transition-colors"
            title="Redo"
          >
            <Redo className="w-5 h-5" />
          </button>
          <div className="w-px h-8 bg-gray-600 mx-3" />

          {/* View Mode Toggle */}
          <div className="flex bg-gray-700 rounded-lg overflow-hidden p-1">
            <button
              onClick={() => setViewMode("2d")}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                viewMode === "2d"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-300 hover:text-white hover:bg-gray-600"
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                viewMode === "3d"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-300 hover:text-white hover:bg-gray-600"
              }`}
            >
              3D
            </button>
          </div>

          <div className="w-px h-8 bg-gray-600 mx-3" />
          <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => document.getElementById("body-upload")?.click()}
            className="p-3 hover:bg-gray-700 rounded-lg transition-colors"
            title="Upload Body Photo"
          >
            <FolderOpen className="w-5 h-5" />
          </button>
          <input
            id="body-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  handleBodyImageUpload(e.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />

          <button
            className="p-3 hover:bg-gray-700 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-600 mx-3" />

          <div className="flex items-center gap-3 bg-gray-700/50 rounded-lg px-3 py-2">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(25, prev - 25))}
              className="p-2 hover:bg-gray-600 rounded-md transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm font-mono w-14 text-center font-medium">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(400, prev + 25))}
              className="p-2 hover:bg-gray-600 rounded-md transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-600 mx-3" />

          {/* Warp Points Toggle */}
          <button
            onClick={() => setShowWarpPoints(!showWarpPoints)}
            className={`p-3 rounded-lg transition-colors ${
              showWarpPoints ? "bg-blue-600 text-white shadow-md" : "hover:bg-gray-700"
            }`}
            title="Toggle 3D Warp Points"
          >
            <Target className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-3 hover:bg-gray-700 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-24 bg-gray-800 border-r border-gray-700 flex flex-col py-6">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as Tool)}
              className={`p-4 mx-3 mb-4 rounded-xl transition-all hover:bg-gray-700 ${
                activeTool === tool.id
                  ? "bg-blue-600 shadow-lg shadow-blue-600/25 scale-105"
                  : "bg-gray-700/50 hover:scale-105"
              }`}
              title={tool.label}
            >
              <tool.icon className="w-6 h-6" />
            </button>
          ))}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Body Canvas - Main Focus */}
          <div className="flex-1 bg-gray-850 p-8">
            <div className="h-full flex items-center justify-center">
              {!bodyImage ? (
                <div className="text-center max-w-lg">
                  <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-8">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                  <h2 className="text-3xl font-bold mb-6">Upload Body Photo</h2>
                  <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                    Start by uploading a body part photo where you want to place
                    the tattoo
                  </p>
                  <button
                    onClick={() =>
                      document.getElementById("body-upload")?.click()
                    }
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors text-lg font-medium"
                  >
                    Choose Body Photo
                  </button>
                </div>
              ) : (
                <div className="w-full h-full relative max-w-6xl">
                  {viewMode === "2d" ? (
                    <div className="w-full h-full bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
                      {selectedTattoo && (
                        <TattooCanvasWrapper
                          bodyImage={bodyImage}
                          tattooImage={selectedTattoo.image}
                          warpPoints={bodyGeometry.points}
                          showWarpPoints={showWarpPoints}
                          onPointClick={addWarpPoint}
                          activeTool={activeTool}
                          initialTattooScale={0.5}
                        />
                      )}
                      {!selectedTattoo && (
                        <div className="w-full h-full flex items-center justify-center relative p-8">
                          <Image
                            src={bodyImage}
                            alt="Body"
                            fill
                            className="object-contain rounded-lg"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    // 3D View for Point Placement
                    <div className="w-full h-full bg-gray-800 rounded-xl border border-gray-700 p-8">
                      <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-2xl font-semibold">
                            3D Point Placement
                          </h3>
                          <div className="flex items-center gap-3">
                            {bodyShapes.map((shape) => (
                              <button
                                key={shape.id}
                                onClick={() =>
                                  setBodyGeometry((prev) => ({
                                    ...prev,
                                    shape: shape.id as BodyShape,
                                  }))
                                }
                                className={`p-4 rounded-xl transition-colors ${
                                  bodyGeometry.shape === shape.id
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-700 hover:bg-gray-600"
                                }`}
                                title={shape.label}
                              >
                                <shape.icon className="w-5 h-5" />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-40 h-40 bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-6">
                              <Grid3X3 className="w-20 h-20 text-gray-400" />
                            </div>
                            <h4 className="text-2xl font-bold mb-4">
                              3D Body Mapping
                            </h4>
                            <p className="text-gray-400 mb-6 text-lg">
                              Define the {bodyGeometry.shape} shape for accurate
                              tattoo wrapping
                            </p>
                            <p className="text-sm text-gray-500">
                              Points placed: {bodyGeometry.points.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tattoo Carousel */}
          <div className="h-56 bg-gray-800 border-t border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-3">
                <Palette className="w-5 h-5" />
                Tattoo Designs ({tattooDesigns.length})
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    document.getElementById("tattoo-upload")?.click()
                  }
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Design
                </button>
                <input
                  id="tattoo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(handleTattooImageUpload);
                  }}
                />
              </div>
            </div>

            {tattooDesigns.length === 0 ? (
              <div className="h-36 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center">
                <div className="text-center p-6">
                  <Palette className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400 mb-1">No tattoo designs yet</p>
                  <p className="text-xs text-gray-500">
                    Upload some tattoo designs to get started
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6 h-36">
                <button
                  onClick={() => navigateCarousel("left")}
                  disabled={carouselIndex === 0}
                  className="p-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex-1 flex gap-4 overflow-hidden">
                  {tattooDesigns
                    .slice(carouselIndex, carouselIndex + 5)
                    .map((tattoo) => (
                      <div
                        key={tattoo.id}
                        onClick={() => selectTattoo(tattoo)}
                        className={`relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all ${
                          selectedTattoo?.id === tattoo.id
                            ? "ring-3 ring-blue-500 ring-offset-3 ring-offset-gray-800 transform scale-105"
                            : "hover:ring-2 hover:ring-gray-500 hover:ring-offset-2 hover:ring-offset-gray-800 hover:scale-102"
                        }`}
                      >
                        <Image
                          src={tattoo.thumbnail}
                          alt={tattoo.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {selectedTattoo?.id === tattoo.id && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <Play className="w-7 h-7 text-white" fill="white" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-xs text-white truncate font-medium">
                            {tattoo.name}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => navigateCarousel("right")}
                  disabled={carouselIndex >= tattooDesigns.length - 5}
                  className="p-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Properties & Layers */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Body Shape Configuration */}
          {viewMode === "3d" && (
            <div className="p-6 border-b border-gray-700">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-3">
                <Grid3X3 className="w-5 h-5" />
                Body Geometry
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">
                    Body Shape
                  </label>
                  <select
                    value={bodyGeometry.shape}
                    onChange={(e) =>
                      setBodyGeometry((prev) => ({
                        ...prev,
                        shape: e.target.value as BodyShape,
                      }))
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-sm"
                  >
                    <option value="cylinder">Arm/Leg (Cylinder)</option>
                    <option value="sphere">Shoulder (Sphere)</option>
                    <option value="plane">Back/Chest (Plane)</option>
                    <option value="custom">Custom Shape</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">
                      Surface Curvature
                    </label>
                    <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                      {(bodyGeometry.curvature * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={bodyGeometry.curvature}
                    onChange={(e) =>
                      setBodyGeometry((prev) => ({
                        ...prev,
                        curvature: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="text-sm text-gray-400 bg-gray-750 p-3 rounded-lg">
                  Control Points:{" "}
                  <span className="font-medium text-white">
                    {bodyGeometry.points.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Layers Panel */}
          <div className="p-6 border-b border-gray-700">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-3">
              <Layers className="w-5 h-5" />
              Layers
            </h3>
            <div className="space-y-3">
              {layers.map((layer) => (
                <div key={layer.id} className="bg-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{layer.name}</span>
                    <button
                      onClick={() => toggleLayerVisibility(layer.id)}
                      className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {layer.visible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 min-w-fit">
                      Opacity:
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={layer.opacity}
                      onChange={(e) =>
                        updateLayerOpacity(layer.id, parseInt(e.target.value))
                      }
                      className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-400 w-10 text-right">
                      {layer.opacity}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Warp Points List */}
          {showWarpPoints && bodyGeometry.points.length > 0 && (
            <div className="p-6 border-b border-gray-700">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-3">
                <Target className="w-5 h-5" />
                Warp Points
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {bodyGeometry.points.map((point, index) => (
                  <div
                    key={point.id}
                    className="flex items-center justify-between bg-gray-700 rounded-lg p-3"
                  >
                    <span className="text-sm font-medium">
                      Point {index + 1}
                    </span>
                    <button
                      onClick={() => removeWarpPoint(point.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-1 hover:bg-red-400/10 rounded transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Properties Panel */}
          <div className="p-6 flex-1">
            <h3 className="font-bold text-lg mb-6">Tattoo Properties</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  Blend Mode
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-sm">
                  <option>Normal</option>
                  <option>Multiply</option>
                  <option>Screen</option>
                  <option>Overlay</option>
                  <option>Soft Light</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  Warp Strength
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  Skin Adaptation
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="75"
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  Perspective Depth
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="30"
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-3 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-6">
          <span>Tool: {tools.find((t) => t.id === activeTool)?.label}</span>
          <span>View: {viewMode.toUpperCase()}</span>
          <span>Shape: {bodyGeometry.shape}</span>
        </div>
        <div className="flex items-center gap-6">
          <span>Zoom: {zoomLevel}%</span>
          <span>Points: {bodyGeometry.points.length}</span>
          <span>Designs: {tattooDesigns.length}</span>
        </div>
      </div>
    </div>
  );
}

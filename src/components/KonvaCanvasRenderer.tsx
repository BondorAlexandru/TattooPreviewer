'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Image, Circle, Line, Group } from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { 
  WarpPoint, 
  TattooState, 
  BodyImageState, 
  MeshTriangle 
} from '@/types';
import { 
  generateDelaunayTriangulation,
  applyWarpTransformation,
  autoDetectWarpPoints
} from '@/utils/warpAlgorithms';
import { 
  createCanvasFromImage,
  getImageDataFromCanvas
} from '@/utils/imageProcessing';
import { generateId, debounce, clamp } from '@/lib/utils';

interface KonvaCanvasRendererProps {
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
  className?: string;
}

export default function KonvaCanvasRenderer({
  bodyImage,
  tattoo,
  warpPoints,
  warpStrength,
  showMesh,
  showWarpPoints,
  isWarpingEnabled,
  onTattooUpdate,
  onWarpPointsUpdate,
  onCanvasClick,
  onBodyImageUpdate,
  className
}: KonvaCanvasRendererProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const bodyImageRef = useRef<Konva.Image>(null);
  const tattooImageRef = useRef<Konva.Image>(null);
  
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [bodyImageObj, setBodyImageObj] = useState<HTMLImageElement | null>(null);
  const [tattooImageObj, setTattooImageObj] = useState<HTMLImageElement | null>(null);
  const [meshTriangles, setMeshTriangles] = useState<MeshTriangle[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<'tattoo' | 'warpPoint' | null>(null);
  const [selectedWarpPoint, setSelectedWarpPoint] = useState<string | null>(null);

  // Load body image
  useEffect(() => {
    if (bodyImage?.imageUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setBodyImageObj(img);
        
        // Auto-scale to fit canvas exactly
        const scaleX = stageSize.width / img.width;
        const scaleY = stageSize.height / img.height;
        const scale = Math.min(scaleX, scaleY); // Fit exactly while maintaining aspect ratio
        
        // Update body image with calculated scale
        const updatedBodyImage: BodyImageState = {
          ...bodyImage,
          scale: scale
        };
        
        // Only update if scale has changed significantly
        if (Math.abs(bodyImage.scale - scale) > 0.01) {
          onBodyImageUpdate(updatedBodyImage);
        }
      };
      img.src = bodyImage.imageUrl;
    } else {
      setBodyImageObj(null);
    }
  }, [bodyImage?.imageUrl, stageSize]);

  // Load tattoo image
  useEffect(() => {
    if (tattoo?.imageUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setTattooImageObj(img);
      };
      img.src = tattoo.imageUrl;
    } else {
      setTattooImageObj(null);
    }
  }, [tattoo?.imageUrl]);

  // Update mesh triangulation when warp points change
  useEffect(() => {
    if (warpPoints.length >= 3) {
      const triangles = generateDelaunayTriangulation(warpPoints);
      setMeshTriangles(triangles);
    } else {
      setMeshTriangles([]);
    }
  }, [warpPoints]);

  // Auto-detect warp points when body image changes
  const handleAutoDetectWarpPoints = useCallback(async () => {
    if (!bodyImage?.imageUrl) return;

    try {
      const canvas = await createCanvasFromImage(bodyImage.imageUrl);
      const imageData = getImageDataFromCanvas(canvas);
      const detectedPoints = autoDetectWarpPoints(imageData, 12);
      
      const newWarpPoints: WarpPoint[] = detectedPoints.map(point => ({
        id: generateId(),
        ...point
      }));
      
      onWarpPointsUpdate(newWarpPoints);
    } catch (error) {
      console.error('Failed to auto-detect warp points:', error);
    }
  }, [bodyImage?.imageUrl, onWarpPointsUpdate]);

  // Debounced canvas resize handler
  const handleResize = useCallback(
    debounce(() => {
      const container = stageRef.current?.container();
      if (container) {
        const { offsetWidth, offsetHeight } = container.parentElement!;
        setStageSize({
          width: offsetWidth,
          height: offsetHeight
        });
      }
    }, 100),
    []
  );

  // Handle stage click for adding warp points or selecting tattoo
  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    
    if (clickedOnEmpty) {
      const pos = e.target.getStage()!.getPointerPosition()!;
      const relativePos = {
        x: pos.x / stageSize.width,
        y: pos.y / stageSize.height
      };
      
      // Add warp point if holding Shift
      if (e.evt.shiftKey && bodyImage) {
        const newWarpPoint: WarpPoint = {
          id: generateId(),
          x: clamp(relativePos.x, 0, 1),
          y: clamp(relativePos.y, 0, 1),
          z: 0.5 // Default depth
        };
        
        onWarpPointsUpdate([...warpPoints, newWarpPoint]);
      } else {
        onCanvasClick(pos.x, pos.y);
        setSelectedWarpPoint(null);
      }
    }
  }, [stageSize, bodyImage, warpPoints, onWarpPointsUpdate, onCanvasClick]);

  // Handle tattoo drag
  const handleTattooDragStart = useCallback(() => {
    setIsDragging(true);
    setDragTarget('tattoo');
  }, []);

  const handleTattooDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    setDragTarget(null);
    
    if (tattoo) {
      const newPos = e.target.position();
      const updatedTattoo: TattooState = {
        ...tattoo,
        position: {
          x: newPos.x / stageSize.width,
          y: newPos.y / stageSize.height
        }
      };
      onTattooUpdate(updatedTattoo);
    }
  }, [tattoo, stageSize, onTattooUpdate]);

  // Handle warp point drag
  const handleWarpPointDragStart = useCallback((pointId: string) => {
    setIsDragging(true);
    setDragTarget('warpPoint');
    setSelectedWarpPoint(pointId);
  }, []);

  const handleWarpPointDragEnd = useCallback((e: KonvaEventObject<DragEvent>, pointId: string) => {
    setIsDragging(false);
    setDragTarget(null);
    
    const newPos = e.target.position();
    const relativePos = {
      x: clamp(newPos.x / stageSize.width, 0, 1),
      y: clamp(newPos.y / stageSize.height, 0, 1)
    };
    
    const updatedWarpPoints = warpPoints.map(point =>
      point.id === pointId
        ? { ...point, x: relativePos.x, y: relativePos.y }
        : point
    );
    
    onWarpPointsUpdate(updatedWarpPoints);
  }, [warpPoints, stageSize, onWarpPointsUpdate]);

  // Calculate tattoo transformation with warping
  const getTattooTransform = useCallback(() => {
    if (!tattoo || !isWarpingEnabled || warpPoints.length < 3) {
      return {
        x: (tattoo?.position.x || 0) * stageSize.width,
        y: (tattoo?.position.y || 0) * stageSize.height,
        scaleX: tattoo?.scale || 1,
        scaleY: tattoo?.scale || 1,
        rotation: tattoo?.rotation || 0,
        skewX: tattoo?.skew.x || 0,
        skewY: tattoo?.skew.y || 0
      };
    }

    const warpResult = applyWarpTransformation(
      tattoo.position,
      warpPoints,
      warpStrength
    );

    return {
      x: warpResult.x * stageSize.width,
      y: warpResult.y * stageSize.height,
      scaleX: (tattoo.scale || 1) * warpResult.scale,
      scaleY: (tattoo.scale || 1) * warpResult.scale,
      rotation: tattoo.rotation || 0,
      skewX: tattoo.skew.x || 0,
      skewY: tattoo.skew.y || 0
    };
  }, [tattoo, isWarpingEnabled, warpPoints, warpStrength, stageSize]);

  // Render mesh visualization
  const renderMesh = useCallback(() => {
    if (!showMesh || meshTriangles.length === 0) return null;

    return meshTriangles.map((triangle, index) => {
      const points = triangle.points.flatMap(point => [
        point.x * stageSize.width,
        point.y * stageSize.height
      ]);
      
      // Add first point again to close the triangle
      points.push(points[0], points[1]);
      
      // Color based on depth (heat map)
      const avgDepth = triangle.centroid.z;
      const hue = (1 - avgDepth) * 120; // Green to red
      const color = `hsl(${hue}, 70%, 50%)`;

      return (
        <Line
          key={`mesh-${index}`}
          points={points}
          stroke={color}
          strokeWidth={1}
          opacity={0.3}
          listening={false}
        />
      );
    });
  }, [showMesh, meshTriangles, stageSize]);

  // Render warp points
  const renderWarpPoints = useCallback(() => {
    if (!showWarpPoints) return null;

    return warpPoints.map((point) => {
      const radius = 8 + (point.z * 12); // Size based on depth
      const isSelected = selectedWarpPoint === point.id;
      
      return (
        <Circle
          key={point.id}
          x={point.x * stageSize.width}
          y={point.y * stageSize.height}
          radius={radius}
          fill={isSelected ? '#ff6b6b' : '#4ecdc4'}
          stroke={isSelected ? '#ff4757' : '#00d2d3'}
          strokeWidth={2}
          opacity={0.8}
          shadowBlur={4}
          shadowColor="black"
          shadowOpacity={0.3}
          draggable={!point.isLocked}
          onDragStart={() => handleWarpPointDragStart(point.id)}
          onDragEnd={(e) => handleWarpPointDragEnd(e, point.id)}
          onClick={() => setSelectedWarpPoint(point.id)}
          onTap={() => setSelectedWarpPoint(point.id)}
          onMouseEnter={(e) => {
            e.target.getStage()!.container().style.cursor = 'pointer';
          }}
          onMouseLeave={(e) => {
            e.target.getStage()!.container().style.cursor = 'default';
          }}
        />
      );
    });
  }, [
    showWarpPoints,
    warpPoints,
    stageSize,
    selectedWarpPoint,
    handleWarpPointDragStart,
    handleWarpPointDragEnd
  ]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const tattooTransform = getTattooTransform();

  return (
    <div className={`w-full h-full relative ${className}`}>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onClick={handleStageClick}
        onTap={handleStageClick}
        className="border border-gray-200 rounded-lg bg-gray-50"
      >
        {/* Background Layer */}
        <Layer>
          {bodyImageObj && bodyImage && (
            <Image
              ref={bodyImageRef}
              image={bodyImageObj}
              x={bodyImage.position.x * stageSize.width}
              y={bodyImage.position.y * stageSize.height}
              scaleX={bodyImage.scale}
              scaleY={bodyImage.scale}
              listening={false}
            />
          )}
        </Layer>

        {/* Mesh Layer */}
        <Layer listening={false}>
          {renderMesh()}
        </Layer>

        {/* Tattoo Layer */}
        <Layer>
          {tattooImageObj && tattoo && (
            <Image
              ref={tattooImageRef}
              image={tattooImageObj}
              {...tattooTransform}
              opacity={tattoo.opacity}
              draggable={!isDragging || dragTarget === 'tattoo'}
              onDragStart={handleTattooDragStart}
              onDragEnd={handleTattooDragEnd}
              onMouseEnter={(e) => {
                e.target.getStage()!.container().style.cursor = 'move';
              }}
              onMouseLeave={(e) => {
                e.target.getStage()!.container().style.cursor = 'default';
              }}
              filters={[
                Konva.Filters.Brighten,
                Konva.Filters.Contrast,
                Konva.Filters.HSV,
                Konva.Filters.Blur
              ]}
              brightness={((tattoo.brightness - 100) / 100)}
              contrast={((tattoo.contrast - 100) / 100)}
              saturation={tattoo.saturation / 100}
              hue={tattoo.hue}
              blurRadius={tattoo.blur}
            />
          )}
        </Layer>

        {/* Warp Points Layer */}
        <Layer>
          {renderWarpPoints()}
        </Layer>
      </Stage>

      {/* Quick Actions */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleAutoDetectWarpPoints}
          disabled={!bodyImage}
          className="px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Auto-Detect Points
        </button>
        
        {selectedWarpPoint && (
          <button
            onClick={() => {
              const updatedPoints = warpPoints.filter(p => p.id !== selectedWarpPoint);
              onWarpPointsUpdate(updatedPoints);
              setSelectedWarpPoint(null);
            }}
            className="px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 shadow-lg"
          >
            Delete Point
          </button>
        )}
      </div>

      {/* Instructions */}
      {bodyImage && !tattoo && (
        <div className="absolute bottom-4 left-4 bg-black/75 text-white px-4 py-2 rounded-md text-sm">
          Upload a tattoo to get started
        </div>
      )}
      
      {bodyImage && tattoo && warpPoints.length === 0 && (
        <div className="absolute bottom-4 left-4 bg-black/75 text-white px-4 py-2 rounded-md text-sm">
          Hold Shift + Click to add warp points, or use Auto-Detect
        </div>
      )}
    </div>
  );
} 
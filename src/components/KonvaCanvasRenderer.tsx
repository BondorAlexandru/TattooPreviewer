'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Image, Circle, Line, Group } from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { 
  WarpPoint, 
  TattooState, 
  BodyImageState
} from '@/types';
import { 
  calculateTerrainTransform,
  generateTerrainMesh,
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
  selectedWarpPoint: string | null;
  onSelectedWarpPointChange: (pointId: string | null) => void;
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
  selectedWarpPoint,
  onSelectedWarpPointChange,
  className
}: KonvaCanvasRendererProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const bodyImageRef = useRef<Konva.Image>(null);
  const tattooImageRef = useRef<Konva.Image>(null);
  
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [bodyImageObj, setBodyImageObj] = useState<HTMLImageElement | null>(null);
  const [tattooImageObj, setTattooImageObj] = useState<HTMLImageElement | null>(null);
  const [terrainMesh, setTerrainMesh] = useState<{ points: number[]; colors: string[] }>({ points: [], colors: [] });
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<'tattoo' | 'warpPoint' | null>(null);

  // Force re-render when effects change
  const [effectsKey, setEffectsKey] = useState(0);

  useEffect(() => {
    if (tattoo) {
      setEffectsKey(prev => prev + 1);
    }
  }, [tattoo?.brightness, tattoo?.contrast, tattoo?.saturation, tattoo?.hue, tattoo?.blur]);

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
        setEffectsKey(prev => prev + 1); // Force effects refresh
      };
      img.src = tattoo.imageUrl;
    } else {
      setTattooImageObj(null);
    }
  }, [tattoo?.imageUrl]);

  // Update terrain mesh when warp points change
  useEffect(() => {
    if (warpPoints.length >= 1) {
      const mesh = generateTerrainMesh(warpPoints, 15);
      setTerrainMesh(mesh);
    } else {
      setTerrainMesh({ points: [], colors: [] });
    }
  }, [warpPoints]);

  // Handle warp point selection and management
  const handleWarpPointClick = useCallback((pointId: string, e: any) => {
    e.cancelBubble = true;
    onSelectedWarpPointChange(selectedWarpPoint === pointId ? null : pointId);
  }, [selectedWarpPoint, onSelectedWarpPointChange]);

  const addWarpPoint = useCallback((x: number, y: number) => {
    const newWarpPoint: WarpPoint = {
      id: generateId(),
      x: clamp(x / stageSize.width, 0, 1),
      y: clamp(y / stageSize.height, 0, 1),
      z: 0.5
    };
    onWarpPointsUpdate([...warpPoints, newWarpPoint]);
    onSelectedWarpPointChange(newWarpPoint.id);
  }, [warpPoints, stageSize, onWarpPointsUpdate, onSelectedWarpPointChange]);

  const removeWarpPoint = useCallback((pointId: string) => {
    const updatedPoints = warpPoints.filter(p => p.id !== pointId);
    onWarpPointsUpdate(updatedPoints);
    onSelectedWarpPointChange(null);
  }, [warpPoints, onWarpPointsUpdate, onSelectedWarpPointChange]);

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
      onSelectedWarpPointChange(null);
    } catch (error) {
      console.error('Failed to auto-detect warp points:', error);
    }
  }, [bodyImage?.imageUrl, onWarpPointsUpdate, onSelectedWarpPointChange]);

  // Handle stage click for adding warp points or selecting tattoo
  const handleStageClick = useCallback((e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    
    if (clickedOnEmpty) {
      const pos = e.target.getStage()!.getPointerPosition()!;
      
      // Add warp point if holding Shift
      if (e.evt.shiftKey && bodyImage) {
        addWarpPoint(pos.x, pos.y);
      } else {
        onCanvasClick(pos.x, pos.y);
        onSelectedWarpPointChange(null);
      }
    }
  }, [bodyImage, addWarpPoint, onCanvasClick, onSelectedWarpPointChange]);

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
  const handleWarpPointDragEnd = useCallback((e: any, pointId: string) => {
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

  // Calculate tattoo transformation with TERRAIN-BASED warping
  const getTattooTransform = useCallback(() => {
    if (!tattoo) {
      return {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        skewX: 0,
        skewY: 0
      };
    }

    let transform = {
      x: tattoo.position.x * stageSize.width,
      y: tattoo.position.y * stageSize.height,
      scaleX: tattoo.scale || 1,
      scaleY: tattoo.scale || 1,
      rotation: tattoo.rotation || 0,
      skewX: tattoo.skew.x || 0,
      skewY: tattoo.skew.y || 0
    };

    // Apply terrain warping if enabled
    if (isWarpingEnabled && warpPoints.length >= 1 && warpStrength > 0) {
      try {
        const terrainTransform = calculateTerrainTransform(
          tattoo.position,
          { width: 0.2, height: 0.2 }, // Approximate tattoo size in normalized coords
          warpPoints,
          warpStrength
        );

        // Apply terrain transformation
        transform.scaleX *= terrainTransform.scaleX;
        transform.scaleY *= terrainTransform.scaleY;
        transform.skewX += terrainTransform.skewX;
        transform.skewY += terrainTransform.skewY;
        transform.x += terrainTransform.offsetX;
        transform.y += terrainTransform.offsetY;
        
        console.log('Terrain warp applied:', terrainTransform);
      } catch (error) {
        console.error('Terrain transformation error:', error);
      }
    }

    return transform;
  }, [tattoo, isWarpingEnabled, warpPoints, warpStrength, stageSize]);

  // Render terrain mesh visualization
  const renderMesh = useCallback(() => {
    if (!showMesh || terrainMesh.points.length === 0) return null;

    const lines = [];
    const gridSize = 15; // Should match the gridSize used in generateTerrainMesh
    
    // Draw horizontal lines
    for (let row = 0; row < gridSize; row++) {
      const points = [];
      for (let col = 0; col < gridSize; col++) {
        const index = row * gridSize + col;
        if (index * 2 + 1 < terrainMesh.points.length) {
          points.push(
            terrainMesh.points[index * 2] * stageSize.width,
            terrainMesh.points[index * 2 + 1] * stageSize.height
          );
        }
      }
      if (points.length > 2) {
        lines.push(
          <Line
            key={`h-${row}`}
            points={points}
            stroke={terrainMesh.colors[row * gridSize] || '#666'}
            strokeWidth={1}
            opacity={0.4}
            listening={false}
          />
        );
      }
    }
    
    // Draw vertical lines
    for (let col = 0; col < gridSize; col++) {
      const points = [];
      for (let row = 0; row < gridSize; row++) {
        const index = row * gridSize + col;
        if (index * 2 + 1 < terrainMesh.points.length) {
          points.push(
            terrainMesh.points[index * 2] * stageSize.width,
            terrainMesh.points[index * 2 + 1] * stageSize.height
          );
        }
      }
      if (points.length > 2) {
        lines.push(
          <Line
            key={`v-${col}`}
            points={points}
            stroke={terrainMesh.colors[col] || '#666'}
            strokeWidth={1}
            opacity={0.4}
            listening={false}
          />
        );
      }
    }

    return lines;
  }, [showMesh, terrainMesh, stageSize]);

  // Render warp points with proper selection
  const renderWarpPoints = useCallback(() => {
    if (!showWarpPoints) return null;

    return warpPoints.map((point) => {
      const radius = 6 + (point.z * 8); // Size based on depth
      const isSelected = selectedWarpPoint === point.id;
      
      return (
        <Circle
          key={point.id}
          x={point.x * stageSize.width}
          y={point.y * stageSize.height}
          radius={radius}
          fill={isSelected ? '#ff6b6b' : `hsl(${(1-point.z)*120}, 70%, 60%)`}
          stroke={isSelected ? '#ff4757' : '#ffffff'}
          strokeWidth={isSelected ? 3 : 2}
          opacity={0.9}
          shadowBlur={4}
          shadowColor="black"
          shadowOpacity={0.3}
          draggable={!point.isLocked}
          onDragStart={() => {
            setIsDragging(true);
            setDragTarget('warpPoint');
            onSelectedWarpPointChange(point.id);
          }}
          onDragEnd={(e) => handleWarpPointDragEnd(e, point.id)}
          onClick={(e) => handleWarpPointClick(point.id, e)}
          onTap={(e) => handleWarpPointClick(point.id, e)}
          onMouseEnter={(e) => {
            e.target.getStage()!.container().style.cursor = 'pointer';
          }}
          onMouseLeave={(e) => {
            e.target.getStage()!.container().style.cursor = 'default';
          }}
        />
      );
    });
  }, [showWarpPoints, warpPoints, stageSize, selectedWarpPoint, handleWarpPointClick, handleWarpPointDragEnd, onSelectedWarpPointChange]);

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
              key={`tattoo-${effectsKey}`}
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
              filters={[Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSV, Konva.Filters.Blur]}
              brightness={(tattoo.brightness - 100) / 100}
              contrast={(tattoo.contrast - 100) / 100}
              saturation={tattoo.saturation / 100}
              hue={tattoo.hue}
              blurRadius={tattoo.blur}
              cache={{}}
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
              removeWarpPoint(selectedWarpPoint);
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
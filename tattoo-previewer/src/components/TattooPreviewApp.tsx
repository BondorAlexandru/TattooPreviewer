"use client";

import { useState, useRef } from "react";
import { TattooDesign } from '../types';
import { handleFileUpload } from '../utils/imageProcessing';
import { useTattooState } from '../hooks/useTattooState';
import { useWarpPoints } from '../hooks/useWarpPoints';
import { Toolbar } from './Toolbar';
import { EmptyState } from './EmptyState';
import { CanvasArea } from './CanvasArea';
import { BottomControls } from './BottomControls';

export default function TattooPreviewApp() {
  const [bodyImage, setBodyImage] = useState<string | null>(null);
  const [tattooDesigns, setTattooDesigns] = useState<TattooDesign[]>([]);
  const [selectedTattoo, setSelectedTattoo] = useState<TattooDesign | null>(null);
  const [autoWarpEnabled, setAutoWarpEnabled] = useState(true);
  const [showMesh, setShowMesh] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    tattooState,
    isDragging,
    handleMouseDown: handleTattooMouseDown,
    handleMouseMove: handleTattooMouseMove,
    handleMouseUp: handleTattooMouseUp,
    rotateTattoo,
    scaleTattoo,
  } = useTattooState();

  const {
    warpPoints,
    selectedPoint,
    setSelectedPoint,
    canvasRef,
    addWarpPoint,
    deleteWarpPoint,
    updateWarpPoint,
    autoDetectEdges,
    resetWarpPoints,
  } = useWarpPoints(bodyImage, autoWarpEnabled);

  const handleBodyImageUpload = async (file: File) => {
    try {
      const imageUrl = await handleFileUpload(file);
      setBodyImage(imageUrl);
    } catch (error) {
      console.error('Error uploading body image:', error);
    }
  };

  const handleTattooUpload = async (file: File) => {
    try {
      const imageUrl = await handleFileUpload(file);
      const newTattoo: TattooDesign = {
        id: `tattoo-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        image: imageUrl,
        thumbnail: imageUrl,
      };
      setTattooDesigns(prev => [...prev, newTattoo]);
      setSelectedTattoo(newTattoo);
    } catch (error) {
      console.error('Error uploading tattoo:', error);
    }
  };

  const handleAddWarpPoint = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return; // Don't add points while dragging tattoo
    addWarpPoint(e, containerRef);
  };

  const handleTattooMouseMoveWrapper = (e: React.MouseEvent) => {
    handleTattooMouseMove(e, containerRef);
  };

  const downloadResult = () => {
    console.log("Downloading result...");
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Toolbar */}
      <Toolbar
        autoWarpEnabled={autoWarpEnabled}
        showMesh={showMesh}
        onToggleAutoWarp={() => setAutoWarpEnabled(!autoWarpEnabled)}
        onToggleShowMesh={() => setShowMesh(!showMesh)}
        onBodyImageUpload={handleBodyImageUpload}
        onTattooUpload={handleTattooUpload}
        onAutoDetectEdges={autoDetectEdges}
        onResetWarpPoints={resetWarpPoints}
        onDownload={downloadResult}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 bg-gray-850 p-4">
        {!bodyImage ? (
          <EmptyState onBodyImageUpload={handleBodyImageUpload} />
        ) : (
          <CanvasArea
            bodyImage={bodyImage}
            selectedTattoo={selectedTattoo}
            tattooState={tattooState}
            warpPoints={warpPoints}
            selectedPoint={selectedPoint}
            showMesh={showMesh}
            canvasRef={canvasRef}
            containerRef={containerRef}
            onAddWarpPoint={handleAddWarpPoint}
            onSelectWarpPoint={setSelectedPoint}
            onTattooMouseDown={handleTattooMouseDown}
            onTattooMouseMove={handleTattooMouseMoveWrapper}
            onTattooMouseUp={handleTattooMouseUp}
          />
        )}
      </div>

      {/* Bottom Controls */}
      <BottomControls
        tattooDesigns={tattooDesigns}
        selectedTattoo={selectedTattoo}
        selectedPoint={selectedPoint}
        warpPoints={warpPoints}
        onSelectTattoo={setSelectedTattoo}
        onRotateTattoo={rotateTattoo}
        onScaleTattoo={scaleTattoo}
        onUpdateWarpPoint={updateWarpPoint}
        onDeleteWarpPoint={deleteWarpPoint}
      />
    </div>
  );
}

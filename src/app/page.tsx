'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import TattooCanvas from '@/components/TattooCanvas';
import TattooSidebar from '@/components/TattooSidebar';
import { 
  AppState, 
  TattooState, 
  BodyImageState, 
  WarpPoint, 
  ExportOptions 
} from '@/types';
import { exportCanvas, downloadBlob } from '@/utils/imageProcessing';
import { generateId } from '@/lib/utils';

export default function TattooPreviewApp() {
  // Application state
  const [appState, setAppState] = useState<AppState>({
    bodyImage: null,
    tattoo: null,
    warpPoints: [],
    canvas: {
      width: 800,
      height: 600,
      zoom: 1,
      pan: { x: 0, y: 0 }
    },
    warpStrength: 50,
    showMesh: false,
    showWarpPoints: true,
    isWarpingEnabled: false
  });

  const [selectedWarpPoint, setSelectedWarpPoint] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update body image
  const handleBodyImageUpdate = useCallback((bodyImage: BodyImageState) => {
    setAppState(prev => ({
      ...prev,
      bodyImage,
      // Reset warp points when body image changes
      warpPoints: []
    }));
  }, []);

  // Update tattoo
  const handleTattooUpdate = useCallback((tattoo: TattooState) => {
    setAppState(prev => ({
      ...prev,
      tattoo
    }));
  }, []);

  // Update warp points
  const handleWarpPointsUpdate = useCallback((warpPoints: WarpPoint[]) => {
    setAppState(prev => ({
      ...prev,
      warpPoints
    }));
  }, []);

  // Update warp strength
  const handleWarpStrengthChange = useCallback((warpStrength: number) => {
    setAppState(prev => ({
      ...prev,
      warpStrength
    }));
  }, []);

  // Toggle mesh visibility
  const handleShowMeshChange = useCallback((showMesh: boolean) => {
    setAppState(prev => ({
      ...prev,
      showMesh
    }));
  }, []);

  // Toggle warp points visibility
  const handleShowWarpPointsChange = useCallback((showWarpPoints: boolean) => {
    setAppState(prev => ({
      ...prev,
      showWarpPoints
    }));
  }, []);

  // Toggle warping enabled
  const handleWarpingEnabledChange = useCallback((isWarpingEnabled: boolean) => {
    setAppState(prev => ({
      ...prev,
      isWarpingEnabled
    }));
  }, []);

  // Handle canvas click
  const handleCanvasClick = useCallback((x: number, y: number) => {
    console.log(`Canvas clicked at: ${x}, ${y}`);
    // Could be used for additional interactions
  }, []);

  // Export functionality
  const handleExport = useCallback(async (options: ExportOptions) => {
    try {
      // In a real implementation, you would capture the Konva stage as canvas
      // For now, we'll simulate the export
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `tattoo-preview-${timestamp}.${options.format}`;
      
      // This would normally export from the Konva stage
      console.log('Export requested with options:', options);
      
      // Simulate export by creating a simple canvas
      const canvas = document.createElement('canvas');
      canvas.width = 800 * options.scale;
      canvas.height = 600 * options.scale;
      const ctx = canvas.getContext('2d')!;
      
      // Fill with placeholder content
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#333';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Tattoo Preview Export', canvas.width / 2, canvas.height / 2);
      
      const blob = await exportCanvas(canvas, options);
      downloadBlob(blob, filename);
      
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, []);

  // Add sample warp point for demo
  const addSampleWarpPoint = useCallback(() => {
    const newPoint: WarpPoint = {
      id: generateId(),
      x: Math.random(),
      y: Math.random(),
      z: Math.random()
    };
    
    setAppState(prev => ({
      ...prev,
      warpPoints: [...prev.warpPoints, newPoint]
    }));
  }, []);

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <TattooSidebar
        bodyImage={appState.bodyImage}
        tattoo={appState.tattoo}
        warpPoints={appState.warpPoints}
        warpStrength={appState.warpStrength}
        showMesh={appState.showMesh}
        showWarpPoints={appState.showWarpPoints}
        isWarpingEnabled={appState.isWarpingEnabled}
        onBodyImageUpdate={handleBodyImageUpdate}
        onTattooUpdate={handleTattooUpdate}
        onWarpPointsUpdate={handleWarpPointsUpdate}
        onWarpStrengthChange={handleWarpStrengthChange}
        onShowMeshChange={handleShowMeshChange}
        onShowWarpPointsChange={handleShowWarpPointsChange}
        onWarpingEnabledChange={handleWarpingEnabledChange}
        onExport={handleExport}
        selectedWarpPoint={selectedWarpPoint}
        className="z-10"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tattoo Preview Studio
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Professional 3D tattoo placement and preview tool
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status indicators */}
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${appState.bodyImage ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-gray-600">
                  Body: {appState.bodyImage ? 'Loaded' : 'None'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${appState.tattoo ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-gray-600">
                  Tattoo: {appState.tattoo ? 'Loaded' : 'None'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${appState.warpPoints.length > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <span className="text-gray-600">
                  Points: {appState.warpPoints.length}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Canvas Area */}
        <main className="flex-1 p-6">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <TattooCanvas
              bodyImage={appState.bodyImage}
              tattoo={appState.tattoo}
              warpPoints={appState.warpPoints}
              warpStrength={appState.warpStrength}
              showMesh={appState.showMesh}
              showWarpPoints={appState.showWarpPoints}
              isWarpingEnabled={appState.isWarpingEnabled}
              onTattooUpdate={handleTattooUpdate}
              onWarpPointsUpdate={handleWarpPointsUpdate}
              onCanvasClick={handleCanvasClick}
              onBodyImageUpdate={handleBodyImageUpdate}
              selectedWarpPoint={selectedWarpPoint}
              onSelectedWarpPointChange={setSelectedWarpPoint}
              className="w-full h-full"
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>Ready for professional tattoo preview</span>
              {appState.isWarpingEnabled && (
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                  3D Warping Active
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <span>Canvas: {appState.canvas.width} × {appState.canvas.height}</span>
              <span>Zoom: {Math.round(appState.canvas.zoom * 100)}%</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

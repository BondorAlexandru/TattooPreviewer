'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import * as Slider from '@radix-ui/react-slider';
import * as Switch from '@radix-ui/react-switch';
import * as Select from '@radix-ui/react-select';
import * as Tooltip from '@radix-ui/react-tooltip';
import { 
  Upload, 
  Image as ImageIcon, 
  Settings, 
  Palette, 
  Grid3X3,
  Download,
  RotateCw,
  Move,
  ZoomIn,
  Eye,
  Sparkles,
  ChevronDown,
  X,
  Menu
} from 'lucide-react';
import { TattooState, BodyImageState, WarpPoint, ExportOptions, BodyShapePreset } from '@/types';
import { BODY_SHAPE_PRESETS } from '@/utils/warpAlgorithms';
import { handleImageUpload, exportCanvas, downloadBlob } from '@/utils/imageProcessing';
import { formatNumber, clamp, cn } from '@/lib/utils';

interface TattooSidebarProps {
  bodyImage: BodyImageState | null;
  tattoo: TattooState | null;
  warpPoints: WarpPoint[];
  warpStrength: number;
  showMesh: boolean;
  showWarpPoints: boolean;
  isWarpingEnabled: boolean;
  onBodyImageUpdate: (bodyImage: BodyImageState) => void;
  onTattooUpdate: (tattoo: TattooState) => void;
  onWarpPointsUpdate: (points: WarpPoint[]) => void;
  onWarpStrengthChange: (strength: number) => void;
  onShowMeshChange: (show: boolean) => void;
  onShowWarpPointsChange: (show: boolean) => void;
  onWarpingEnabledChange: (enabled: boolean) => void;
  onExport: (options: ExportOptions) => void;
  selectedWarpPoint: string | null;
  className?: string;
}

export default function TattooSidebar({
  bodyImage,
  tattoo,
  warpPoints,
  warpStrength,
  showMesh,
  showWarpPoints,
  isWarpingEnabled,
  onBodyImageUpdate,
  onTattooUpdate,
  onWarpPointsUpdate,
  onWarpStrengthChange,
  onShowMeshChange,
  onShowWarpPointsChange,
  onWarpingEnabledChange,
  onExport,
  selectedWarpPoint,
  className
}: TattooSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [isUploading, setIsUploading] = useState(false);

  // Handle body image upload
  const handleBodyImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await handleImageUpload(file);
      
      const newBodyImage: BodyImageState = {
        id: Date.now().toString(),
        imageUrl: result.url,
        scale: 1, // Will be calculated in canvas component
        position: { x: 0, y: 0 }
      };
      onBodyImageUpdate(newBodyImage);
    } catch (error) {
      console.error('Failed to upload body image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle tattoo upload
  const handleTattooUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await handleImageUpload(file);
      const newTattoo: TattooState = {
        id: Date.now().toString(),
        imageUrl: result.url,
        position: { x: 0.5, y: 0.5 },
        scale: 1,
        rotation: 0,
        skew: { x: 0, y: 0 },
        opacity: 1,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        blur: 0,
        sepia: 0,
        fade: 0,
        colorShift: 0,
        blendMode: 'normal'
      };
      onTattooUpdate(newTattoo);
      setActiveTab('transform');
    } catch (error) {
      console.error('Failed to upload tattoo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      if (activeTab === 'upload') {
        handleBodyImageUpload(imageFile);
      } else {
        handleTattooUpload(imageFile);
      }
    }
  };

  // Apply body shape preset
  const applyBodyShapePreset = (preset: BodyShapePreset) => {
    const newWarpPoints: WarpPoint[] = preset.warpPoints.map((point, index) => ({
      id: `preset-${preset.id}-${index}`,
      ...point
    }));
    onWarpPointsUpdate(newWarpPoints);
  };

  const updateTattoo = (updates: Partial<TattooState>) => {
    if (tattoo) {
      onTattooUpdate({ ...tattoo, ...updates });
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Tattoo Preview
        </h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          {/* Tab List */}
          <Tabs.List className="flex border-b border-gray-200">
            <Tabs.Trigger
              value="upload"
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors",
                activeTab === 'upload'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <Upload size={16} className="mx-auto mb-1" />
              Upload
            </Tabs.Trigger>
            
            <Tabs.Trigger
              value="transform"
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors",
                activeTab === 'transform'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              disabled={!tattoo}
            >
              <Move size={16} className="mx-auto mb-1" />
              Transform
            </Tabs.Trigger>
            
            <Tabs.Trigger
              value="effects"
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors",
                activeTab === 'effects'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              disabled={!tattoo}
            >
              <Palette size={16} className="mx-auto mb-1" />
              Effects
            </Tabs.Trigger>
            
            <Tabs.Trigger
              value="warp"
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors",
                activeTab === 'warp'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <Grid3X3 size={16} className="mx-auto mb-1" />
              3D Warp
            </Tabs.Trigger>
          </Tabs.List>

          {/* Upload Tab */}
          <Tabs.Content value="upload" className="p-4 space-y-6">
            {/* Body Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Image
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleBodyImageUpload(file);
                  };
                  input.click();
                }}
              >
                {bodyImage ? (
                  <div className="space-y-2">
                    <img
                      src={bodyImage.imageUrl}
                      alt="Body"
                      className="w-20 h-20 object-cover mx-auto rounded-lg"
                    />
                    <p className="text-sm text-green-600">Body image loaded</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon size={48} className="mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {isUploading ? 'Uploading...' : 'Drop body image here or click to browse'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tattoo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tattoo Design
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleTattooUpload(file);
                  };
                  input.click();
                }}
              >
                {tattoo ? (
                  <div className="space-y-2">
                    <img
                      src={tattoo.imageUrl}
                      alt="Tattoo"
                      className="w-20 h-20 object-cover mx-auto rounded-lg"
                    />
                    <p className="text-sm text-green-600">Tattoo loaded</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Sparkles size={48} className="mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {isUploading ? 'Uploading...' : 'Drop tattoo design here or click to browse'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Tabs.Content>

          {/* Transform Tab */}
          <Tabs.Content value="transform" className="p-4 space-y-6">
            {tattoo && (
              <>
                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Position
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">X</label>
                      <Slider.Root
                        value={[tattoo.position.x * 100]}
                        onValueChange={([value]) => 
                          updateTattoo({ position: { ...tattoo.position, x: value / 100 } })
                        }
                        max={100}
                        step={1}
                        className="relative flex items-center select-none touch-none w-full h-5"
                      >
                        <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                          <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:shadow-xl" />
                      </Slider.Root>
                      <span className="text-xs text-gray-500">{formatNumber(tattoo.position.x * 100, 0)}%</span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Y</label>
                      <Slider.Root
                        value={[tattoo.position.y * 100]}
                        onValueChange={([value]) => 
                          updateTattoo({ position: { ...tattoo.position, y: value / 100 } })
                        }
                        max={100}
                        step={1}
                        className="relative flex items-center select-none touch-none w-full h-5"
                      >
                        <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                          <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:shadow-xl" />
                      </Slider.Root>
                      <span className="text-xs text-gray-500">{formatNumber(tattoo.position.y * 100, 0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Scale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Scale: {formatNumber(tattoo.scale * 100, 0)}%
                  </label>
                  <Slider.Root
                    value={[tattoo.scale * 100]}
                    onValueChange={([value]) => updateTattoo({ scale: value / 100 })}
                    min={10}
                    max={300}
                    step={5}
                    className="relative flex items-center select-none touch-none w-full h-5"
                  >
                    <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                      <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:shadow-xl" />
                  </Slider.Root>
                </div>

                {/* Rotation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rotation: {formatNumber(tattoo.rotation, 0)}°
                  </label>
                  <Slider.Root
                    value={[tattoo.rotation]}
                    onValueChange={([value]) => updateTattoo({ rotation: value })}
                    min={-180}
                    max={180}
                    step={1}
                    className="relative flex items-center select-none touch-none w-full h-5"
                  >
                    <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                      <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:shadow-xl" />
                  </Slider.Root>
                </div>

                {/* Skew */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Skew
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">X: {formatNumber(tattoo.skew.x, 0)}°</label>
                      <Slider.Root
                        value={[tattoo.skew.x]}
                        onValueChange={([value]) => 
                          updateTattoo({ skew: { ...tattoo.skew, x: value } })
                        }
                        min={-45}
                        max={45}
                        step={1}
                        className="relative flex items-center select-none touch-none w-full h-5"
                      >
                        <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                          <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:shadow-xl" />
                      </Slider.Root>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Y: {formatNumber(tattoo.skew.y, 0)}°</label>
                      <Slider.Root
                        value={[tattoo.skew.y]}
                        onValueChange={([value]) => 
                          updateTattoo({ skew: { ...tattoo.skew, y: value } })
                        }
                        min={-45}
                        max={45}
                        step={1}
                        className="relative flex items-center select-none touch-none w-full h-5"
                      >
                        <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                          <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:shadow-xl" />
                      </Slider.Root>
                    </div>
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Opacity: {formatNumber(tattoo.opacity * 100, 0)}%
                  </label>
                  <Slider.Root
                    value={[tattoo.opacity * 100]}
                    onValueChange={([value]) => updateTattoo({ opacity: value / 100 })}
                    min={0}
                    max={100}
                    step={5}
                    className="relative flex items-center select-none touch-none w-full h-5"
                  >
                    <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                      <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:shadow-xl" />
                  </Slider.Root>
                </div>
              </>
            )}
          </Tabs.Content>

          {/* Effects Tab */}
          <Tabs.Content value="effects" className="p-4 space-y-6">
            {tattoo && (
              <>
                {/* Basic Effects */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Basic Effects</h3>
                  
                  {/* Brightness */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Brightness: {formatNumber(tattoo.brightness, 0)}%
                    </label>
                    <Slider.Root
                      value={[tattoo.brightness]}
                      onValueChange={([value]) => updateTattoo({ brightness: value })}
                      min={0}
                      max={200}
                      step={5}
                      className="relative flex items-center select-none touch-none w-full h-5"
                    >
                      <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                        <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg" />
                    </Slider.Root>
                  </div>

                  {/* Contrast */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Contrast: {formatNumber(tattoo.contrast, 0)}%
                    </label>
                    <Slider.Root
                      value={[tattoo.contrast]}
                      onValueChange={([value]) => updateTattoo({ contrast: value })}
                      min={0}
                      max={200}
                      step={5}
                      className="relative flex items-center select-none touch-none w-full h-5"
                    >
                      <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                        <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg" />
                    </Slider.Root>
                  </div>

                  {/* Saturation */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Saturation: {formatNumber(tattoo.saturation, 0)}%
                    </label>
                    <Slider.Root
                      value={[tattoo.saturation]}
                      onValueChange={([value]) => updateTattoo({ saturation: value })}
                      min={0}
                      max={200}
                      step={5}
                      className="relative flex items-center select-none touch-none w-full h-5"
                    >
                      <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                        <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg" />
                    </Slider.Root>
                  </div>

                  {/* Hue */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Hue: {formatNumber(tattoo.hue, 0)}°
                    </label>
                    <Slider.Root
                      value={[tattoo.hue]}
                      onValueChange={([value]) => updateTattoo({ hue: value })}
                      min={-180}
                      max={180}
                      step={5}
                      className="relative flex items-center select-none touch-none w-full h-5"
                    >
                      <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                        <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg" />
                    </Slider.Root>
                  </div>

                  {/* Blur */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Blur: {formatNumber(tattoo.blur, 1)}px
                    </label>
                    <Slider.Root
                      value={[tattoo.blur]}
                      onValueChange={([value]) => updateTattoo({ blur: value })}
                      min={0}
                      max={10}
                      step={0.1}
                      className="relative flex items-center select-none touch-none w-full h-5"
                    >
                      <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                        <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg" />
                    </Slider.Root>
                  </div>
                </div>

                {/* Aging Effects */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Aging Effects</h3>
                  
                  {/* Sepia */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Sepia: {formatNumber(tattoo.sepia, 0)}%
                    </label>
                    <Slider.Root
                      value={[tattoo.sepia]}
                      onValueChange={([value]) => updateTattoo({ sepia: value })}
                      min={0}
                      max={100}
                      step={5}
                      className="relative flex items-center select-none touch-none w-full h-5"
                    >
                      <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                        <Slider.Range className="absolute bg-amber-500 rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-amber-500 rounded-full shadow-lg" />
                    </Slider.Root>
                  </div>

                  {/* Fade */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Fade: {formatNumber(tattoo.fade, 0)}%
                    </label>
                    <Slider.Root
                      value={[tattoo.fade]}
                      onValueChange={([value]) => updateTattoo({ fade: value })}
                      min={0}
                      max={100}
                      step={5}
                      className="relative flex items-center select-none touch-none w-full h-5"
                    >
                      <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                        <Slider.Range className="absolute bg-gray-500 rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-gray-500 rounded-full shadow-lg" />
                    </Slider.Root>
                  </div>
                </div>
              </>
            )}
          </Tabs.Content>

          {/* 3D Warp Tab */}
          <Tabs.Content value="warp" className="p-4 space-y-6">
            {/* Enable 3D Warping */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Enable 3D Warping
              </label>
              <Switch.Root
                checked={isWarpingEnabled}
                onCheckedChange={onWarpingEnabledChange}
                className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-500 transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform translate-x-0.5 data-[state=checked]:translate-x-5" />
              </Switch.Root>
            </div>

            {/* Warp Strength */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Warp Strength: {formatNumber(warpStrength, 0)}%
              </label>
              <Slider.Root
                value={[warpStrength]}
                onValueChange={([value]) => onWarpStrengthChange(value)}
                min={0}
                max={100}
                step={5}
                disabled={!isWarpingEnabled}
                className="relative flex items-center select-none touch-none w-full h-5"
              >
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                  <Slider.Range className="absolute bg-purple-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-purple-500 rounded-full shadow-lg disabled:opacity-50" />
              </Slider.Root>
            </div>

            {/* Visualization Controls */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Visualization</h3>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Show Mesh</label>
                <Switch.Root
                  checked={showMesh}
                  onCheckedChange={onShowMeshChange}
                  className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-green-500 transition-colors"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform translate-x-0.5 data-[state=checked]:translate-x-5" />
                </Switch.Root>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Show Warp Points</label>
                <Switch.Root
                  checked={showWarpPoints}
                  onCheckedChange={onShowWarpPointsChange}
                  className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-cyan-500 transition-colors"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform translate-x-0.5 data-[state=checked]:translate-x-5" />
                </Switch.Root>
              </div>
            </div>

            {/* Body Shape Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Body Shape Presets
              </label>
              <div className="space-y-2">
                {Object.values(BODY_SHAPE_PRESETS).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyBodyShapePreset(preset)}
                    className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-gray-500">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Warp Points Info */}
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <div className="font-medium mb-1">Warp Points: {warpPoints.length}</div>
              <div className="text-xs">
                • Hold Shift + Click to add points<br/>
                • Drag points to adjust position<br/>
                • Click point to select/delete
              </div>
            </div>

            {/* Selected Warp Point Controls */}
            {warpPoints.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Point Controls</h3>
                
                {selectedWarpPoint ? (
                  <>
                    {/* Point Depth/Height Control */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Selected Point Depth: {formatNumber((warpPoints.find(p => p.id === selectedWarpPoint)?.z || 0.5) * 100, 0)}%
                      </label>
                      <Slider.Root
                        value={[((warpPoints.find(p => p.id === selectedWarpPoint)?.z || 0.5) * 100)]}
                        onValueChange={([value]) => {
                          const updatedPoints = warpPoints.map(point =>
                            point.id === selectedWarpPoint
                              ? { ...point, z: value / 100 }
                              : point
                          );
                          onWarpPointsUpdate(updatedPoints);
                        }}
                        min={0}
                        max={100}
                        step={5}
                        className="relative flex items-center select-none touch-none w-full h-5"
                      >
                        <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                          <Slider.Range className="absolute bg-purple-500 rounded-full h-full" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-purple-500 rounded-full shadow-lg" />
                      </Slider.Root>
                      <div className="text-xs text-gray-500 mt-1">
                        0% = Far (back), 100% = Close (front)
                      </div>
                    </div>

                    {/* Quick Depth Presets */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Quick Depth</label>
                      <div className="flex gap-2">
                        {[
                          { label: 'Back', value: 0.2 },
                          { label: 'Mid', value: 0.5 },
                          { label: 'Front', value: 0.8 }
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => {
                              const updatedPoints = warpPoints.map(point =>
                                point.id === selectedWarpPoint
                                  ? { ...point, z: preset.value }
                                  : point
                              );
                              onWarpPointsUpdate(updatedPoints);
                            }}
                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Click a warp point to adjust its depth
                  </div>
                )}

                {/* Add/Remove Points */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Point Management</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Clear all points
                        onWarpPointsUpdate([]);
                      }}
                      className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => {
                        // Add point at center
                        const newPoint: WarpPoint = {
                          id: Date.now().toString(),
                          x: 0.5,
                          y: 0.5,
                          z: 0.5
                        };
                        onWarpPointsUpdate([...warpPoints, newPoint]);
                      }}
                      className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                    >
                      Add Center
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {/* Export Section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => onExport({
            format: 'png',
            quality: 90,
            scale: 2,
            includeOriginal: false
          })}
          disabled={!bodyImage || !tattoo}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={16} />
          Export High-Res
        </button>
      </div>
    </div>
  );

  if (isCollapsed) {
    return (
      <div className={cn("w-16 bg-white border-r border-gray-200", className)}>
        <div className="p-4">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 320 }}
      exit={{ width: 0 }}
      className={cn("w-80 flex-shrink-0", className)}
    >
      <Tooltip.Provider>
        {sidebarContent}
      </Tooltip.Provider>
    </motion.div>
  );
} 
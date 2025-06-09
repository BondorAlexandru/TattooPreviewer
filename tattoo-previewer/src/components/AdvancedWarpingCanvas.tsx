'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { RotateCcw, Download, Sliders, Eye, EyeOff } from 'lucide-react'
import Konva from 'konva'

// Import Konva components dynamically
const Stage = dynamic(() => import('react-konva').then(mod => ({ default: mod.Stage })), { ssr: false })
const Layer = dynamic(() => import('react-konva').then(mod => ({ default: mod.Layer })), { ssr: false })
const KonvaImage = dynamic(() => import('react-konva').then(mod => ({ default: mod.Image })), { ssr: false })
const Group = dynamic(() => import('react-konva').then(mod => ({ default: mod.Group })), { ssr: false })

interface AdvancedWarpingCanvasProps {
  bodyImage: string
  tattooImage: string
}

interface WarpPoint {
  x: number
  y: number
  z: number // Depth for 3D perspective
}

interface BodyGeometry {
  controlPoints: WarpPoint[]
  surfaceNormal: { x: number; y: number; z: number }
  curvature: number
}

export default function AdvancedWarpingCanvas({ 
  bodyImage, 
  tattooImage 
}: AdvancedWarpingCanvasProps) {
  const [bodyImg, setBodyImg] = useState<HTMLImageElement | null>(null)
  const [tattooImg, setTattooImg] = useState<HTMLImageElement | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [warpStrength, setWarpStrength] = useState(0.5)
  const [perspectiveDepth, setPerspectiveDepth] = useState(0.3)
  const [showControlPoints, setShowControlPoints] = useState(false)
  const [bodyGeometry, setBodyGeometry] = useState<BodyGeometry>({
    controlPoints: [],
    surfaceNormal: { x: 0, y: 0, z: 1 },
    curvature: 0.2
  })
  
  const stageRef = useRef<Konva.Stage>(null)
  const tattooRef = useRef<Konva.Image>(null)

  useEffect(() => {
    if (bodyImage) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setBodyImg(img)
        const aspectRatio = img.width / img.height
        if (aspectRatio > 1) {
          setCanvasSize({ width: 800, height: 800 / aspectRatio })
        } else {
          setCanvasSize({ width: 600 * aspectRatio, height: 600 })
        }
        // Generate initial control points for body geometry
        generateBodyGeometry(img.width, img.height)
      }
      img.src = bodyImage
    }
  }, [bodyImage])

  useEffect(() => {
    if (tattooImage) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setTattooImg(img)
      }
      img.src = tattooImage
    }
  }, [tattooImage])

  const generateBodyGeometry = (width: number, height: number) => {
    // Generate control points based on common body part geometries
    const points: WarpPoint[] = [
      { x: width * 0.2, y: height * 0.3, z: 0.8 }, // Upper left
      { x: width * 0.8, y: height * 0.3, z: 0.9 }, // Upper right
      { x: width * 0.5, y: height * 0.5, z: 1.0 }, // Center (closest)
      { x: width * 0.3, y: height * 0.7, z: 0.7 }, // Lower left
      { x: width * 0.7, y: height * 0.7, z: 0.8 }, // Lower right
    ]

    setBodyGeometry({
      controlPoints: points,
      surfaceNormal: { x: 0.1, y: 0.2, z: 0.97 }, // Slight angle
      curvature: 0.3
    })
  }

  // Apply 3D perspective warping to tattoo
  const applyBodyWarp = useCallback(() => {
    if (!tattooRef.current || bodyGeometry.controlPoints.length === 0) return

    const tattooNode = tattooRef.current
    
    // Calculate perspective distortion based on control points
    const centerPoint = bodyGeometry.controlPoints[2] // Center point
    const depthScale = centerPoint.z * perspectiveDepth + (1 - perspectiveDepth)
    
    // Apply curvature-based skewing
    const curvatureX = Math.sin(warpStrength * Math.PI) * bodyGeometry.curvature * 20
    const curvatureY = Math.cos(warpStrength * Math.PI) * bodyGeometry.curvature * 10
    
    // Transform the tattoo to match body geometry
    tattooNode.scaleX(depthScale * (1 + warpStrength * 0.2))
    tattooNode.scaleY(depthScale * (1 - warpStrength * 0.1))
    tattooNode.skewX(curvatureX)
    tattooNode.skewY(curvatureY)
    
    // Add depth-based opacity and shadow
    tattooNode.opacity(0.85 - (1 - depthScale) * 0.3)
    tattooNode.shadowBlur(10 + warpStrength * 15)
    tattooNode.shadowOffset({ 
      x: curvatureX * 0.3, 
      y: curvatureY * 0.3 + warpStrength * 5 
    })
    
    tattooNode.getLayer()?.batchDraw()
  }, [warpStrength, perspectiveDepth, bodyGeometry])

  // Apply warping when parameters change
  useEffect(() => {
    applyBodyWarp()
  }, [applyBodyWarp])

  const downloadWarpedImage = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({ 
        pixelRatio: 2,
        quality: 1
      })
      const link = document.createElement('a')
      link.download = 'warped-tattoo-preview.png'
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const resetSettings = () => {
    setWarpStrength(0.5)
    setPerspectiveDepth(0.3)
    if (bodyImg) {
      generateBodyGeometry(bodyImg.width, bodyImg.height)
    }
  }

  return (
    <div className="h-full flex bg-gray-900 text-white">
      {/* Canvas Area */}
      <div className="flex-1 p-4 flex items-center justify-center bg-gray-850">
        <div className="relative">
          <Stage
            ref={stageRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="border border-gray-600 rounded-lg shadow-lg"
          >
            <Layer>
              {/* Body Image */}
              {bodyImg && (
                <KonvaImage
                  image={bodyImg}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  listening={false}
                />
              )}
              
              {/* Warped Tattoo */}
              <Group>
                {tattooImg && (
                  <KonvaImage
                    ref={tattooRef}
                    image={tattooImg}
                    x={canvasSize.width * 0.3}
                    y={canvasSize.height * 0.3}
                    width={tattooImg.width * 0.5}
                    height={tattooImg.height * 0.5}
                    // Apply custom filter for warping effect
                    filters={[Konva.Filters.Blur]}
                    blurRadius={warpStrength * 2}
                    opacity={0.85}
                    shadowColor="rgba(0,0,0,0.3)"
                    shadowBlur={10}
                    shadowOffset={{ x: 2, y: 2 }}
                  />
                )}
              </Group>
            </Layer>
          </Stage>
          
          {/* Control Points Overlay */}
          {showControlPoints && (
            <div className="absolute inset-0 pointer-events-none">
              {bodyGeometry.controlPoints.map((point, index) => (
                <div
                  key={index}
                  className="absolute w-2 h-2 bg-blue-500 rounded-full border border-white shadow-md"
                  style={{
                    left: (point.x / (bodyImg?.width || 1)) * canvasSize.width - 4,
                    top: (point.y / (bodyImg?.height || 1)) * canvasSize.height - 4,
                    transform: `scale(${point.z})`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Controls */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sliders className="w-5 h-5" />
              3D Warping
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowControlPoints(!showControlPoints)}
                className={`p-2 rounded transition-colors ${
                  showControlPoints ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title="Toggle Control Points"
              >
                {showControlPoints ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="p-4 space-y-6 flex-1">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">Warp Strength</label>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                {(warpStrength * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={warpStrength}
              onChange={(e) => setWarpStrength(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">Perspective Depth</label>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                {(perspectiveDepth * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={perspectiveDepth}
              onChange={(e) => setPerspectiveDepth(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">Body Curvature</label>
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
              onChange={(e) => setBodyGeometry(prev => ({ ...prev, curvature: parseFloat(e.target.value) }))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          <button
            onClick={resetSettings}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Settings
          </button>
          <button
            onClick={downloadWarpedImage}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Image
          </button>
        </div>

        {/* Info Panel */}
        <div className="p-4 bg-gray-750 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Advanced Warping</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Uses 3D perspective transformation and body geometry mapping for realistic tattoo placement. 
            Control points indicate surface depth and curvature.
          </p>
        </div>
      </div>
    </div>
  )
}

// Custom CSS for styled range inputs
const styles = `
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 0 2px 0 #1f2937;
  transition: background .15s ease-in-out;
}

.slider::-webkit-slider-thumb:hover {
  background: #2563eb;
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
} 
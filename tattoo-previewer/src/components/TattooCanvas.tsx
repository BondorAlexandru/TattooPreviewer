'use client'

import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Group, Transformer, Circle } from 'react-konva'
import { RotateCcw, Download, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'
import Konva from 'konva'

interface WarpPoint {
  x: number
  y: number
  z: number
  id: string
}

interface TattooCanvasProps {
  bodyImage: string
  tattooImage: string
  warpPoints?: WarpPoint[]
  showWarpPoints?: boolean
  onPointClick?: (x: number, y: number) => void
  activeTool?: string
  initialTattooScale?: number
}

export default function TattooCanvas({ 
  bodyImage, 
  tattooImage,
  warpPoints = [],
  showWarpPoints = false,
  onPointClick,
  activeTool = 'select',
  initialTattooScale = 0.5
}: TattooCanvasProps) {
  const [bodyImg, setBodyImg] = useState<HTMLImageElement | null>(null)
  const [tattooImg, setTattooImg] = useState<HTMLImageElement | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [tattooPosition, setTattooPosition] = useState({ x: 100, y: 100 })
  const [tattooScale, setTattooScale] = useState({ x: initialTattooScale, y: initialTattooScale })
  const [tattooRotation, setTattooRotation] = useState(0)
  const [selectedTattoo, setSelectedTattoo] = useState(false)
  
  const stageRef = useRef<Konva.Stage>(null)
  const tattooRef = useRef<Konva.Image>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    // Load body image
    if (bodyImage) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setBodyImg(img)
        // Adjust canvas size based on image aspect ratio
        const aspectRatio = img.width / img.height
        if (aspectRatio > 1) {
          setCanvasSize({ width: 800, height: 800 / aspectRatio })
        } else {
          setCanvasSize({ width: 600 * aspectRatio, height: 600 })
        }
      }
      img.src = bodyImage
    }
  }, [bodyImage])

  useEffect(() => {
    // Load tattoo image
    if (tattooImage) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setTattooImg(img)
        // Set initial position to center of canvas
        setTattooPosition({ 
          x: canvasSize.width * 0.3, 
          y: canvasSize.height * 0.3 
        })
      }
      img.src = tattooImage
    }
  }, [tattooImage, canvasSize])

  useEffect(() => {
    // Reset scale when initialTattooScale changes
    setTattooScale({ x: initialTattooScale, y: initialTattooScale })
  }, [initialTattooScale])

  useEffect(() => {
    // Update transformer when tattoo is selected
    if (selectedTattoo && transformerRef.current && tattooRef.current) {
      transformerRef.current.nodes([tattooRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    } else if (transformerRef.current) {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [selectedTattoo])

  const handleTattooClick = () => {
    if (activeTool === 'select') {
      setSelectedTattoo(!selectedTattoo)
    }
  }

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Handle point placement in 3D mode
    if (activeTool === 'point-placement' && onPointClick) {
      const stage = e.target.getStage()
      if (stage) {
        const pos = stage.getPointerPosition()
        if (pos) {
          onPointClick(pos.x, pos.y)
        }
      }
      return
    }

    // Deselect tattoo if clicking on stage
    if (e.target === e.target.getStage()) {
      setSelectedTattoo(false)
    }
  }

  const handleTattooTransform = () => {
    if (tattooRef.current) {
      const node = tattooRef.current
      setTattooPosition({ x: node.x(), y: node.y() })
      setTattooScale({ x: node.scaleX(), y: node.scaleY() })
      setTattooRotation(node.rotation())
    }
  }

  const resetTattoo = () => {
    setTattooPosition({ x: canvasSize.width * 0.3, y: canvasSize.height * 0.3 })
    setTattooScale({ x: initialTattooScale, y: initialTattooScale })
    setTattooRotation(0)
    setSelectedTattoo(false)
  }

  const rotateTattoo = (direction: number) => {
    setTattooRotation(prev => prev + (direction * 15))
  }

  const scaleTattoo = (factor: number) => {
    setTattooScale(prev => ({
      x: Math.max(0.1, Math.min(3, prev.x * factor)),
      y: Math.max(0.1, Math.min(3, prev.y * factor))
    }))
  }

  const downloadImage = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = 'tattoo-preview.png'
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Control Panel */}
      <div className="flex items-center justify-between gap-6 p-4 bg-gray-700 border-b border-gray-600">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-300">Transform:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => rotateTattoo(-1)}
              className="p-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              title="Rotate Left"
            >
              <RotateCcw className="w-4 h-4 text-gray-300" />
            </button>
            <button
              onClick={() => rotateTattoo(1)}
              className="p-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              title="Rotate Right"
            >
              <RotateCw className="w-4 h-4 text-gray-300" />
            </button>
            <button
              onClick={() => scaleTattoo(1.1)}
              className="p-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              title="Scale Up"
            >
              <ZoomIn className="w-4 h-4 text-gray-300" />
            </button>
            <button
              onClick={() => scaleTattoo(0.9)}
              className="p-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              title="Scale Down"
            >
              <ZoomOut className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={resetTattoo}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg text-sm transition-colors font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={downloadImage}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-850">
        <div className="relative">
          <Stage
            ref={stageRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onClick={handleStageClick}
            className="border border-gray-600 rounded-xl shadow-2xl bg-gray-800"
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
              
              {/* Tattoo Image */}
              <Group>
                {tattooImg && (
                  <KonvaImage
                    ref={tattooRef}
                    image={tattooImg}
                    x={tattooPosition.x}
                    y={tattooPosition.y}
                    scaleX={tattooScale.x}
                    scaleY={tattooScale.y}
                    rotation={tattooRotation}
                    draggable={activeTool === 'select' || activeTool === 'move'}
                    onClick={handleTattooClick}
                    onDragEnd={handleTattooTransform}
                    onTransformEnd={handleTattooTransform}
                    shadowColor="rgba(0,0,0,0.3)"
                    shadowBlur={5}
                    shadowOffset={{ x: 2, y: 2 }}
                    opacity={0.85}
                  />
                )}
                
                {/* Transformer for tattoo */}
                {selectedTattoo && (
                  <Transformer
                    ref={transformerRef}
                    keepRatio={false}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                    boundBoxFunc={(oldBox, newBox) => {
                      // Prevent negative scaling
                      if (newBox.width < 10 || newBox.height < 10) {
                        return oldBox
                      }
                      return newBox
                    }}
                  />
                )}
              </Group>
            </Layer>
            
            {/* Warp Points Layer */}
            {showWarpPoints && (
              <Layer>
                {warpPoints.map((point) => (
                  <Circle
                    key={point.id}
                    x={point.x}
                    y={point.y}
                    radius={8}
                    fill="rgba(59, 130, 246, 0.8)"
                    stroke="white"
                    strokeWidth={2}
                    shadowColor="rgba(0,0,0,0.5)"
                    shadowBlur={4}
                    listening={false}
                  />
                ))}
              </Layer>
            )}
          </Stage>
          
          {/* Instructions Overlay */}
          {activeTool === 'point-placement' && (
            <div className="absolute top-6 left-6 bg-gray-900/90 backdrop-blur-sm text-white p-4 rounded-xl border border-gray-600 shadow-lg">
              <p className="text-sm font-medium">Click on the body to place 3D warp points</p>
            </div>
          )}
          
          {!selectedTattoo && tattooImg && activeTool === 'select' && (
            <div className="absolute bottom-6 left-6 bg-gray-900/90 backdrop-blur-sm text-white p-4 rounded-xl border border-gray-600 shadow-lg">
              <p className="text-sm font-medium">Click on the tattoo to select and transform it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
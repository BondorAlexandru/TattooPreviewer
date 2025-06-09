'use client'

import dynamic from 'next/dynamic'

interface WarpPoint {
  x: number
  y: number
  z: number
  id: string
}

interface TattooCanvasWrapperProps {
  bodyImage: string
  tattooImage: string
  warpPoints?: WarpPoint[]
  showWarpPoints?: boolean
  bodyShape?: 'cylinder' | 'sphere' | 'plane' | 'custom'
  onPointClick?: (x: number, y: number) => void
  activeTool?: string
  initialTattooScale?: number
}

const TattooCanvas = dynamic(() => import('./TattooCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-800 rounded-lg border border-gray-700">
      <div className="text-center">
        <div className="animate-spin mx-auto w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full mb-4" />
        <p className="text-gray-400">Loading canvas...</p>
      </div>
    </div>
  )
})

export default function TattooCanvasWrapper({ 
  bodyImage, 
  tattooImage, 
  warpPoints = [],
  showWarpPoints = false,
  bodyShape = 'plane',
  onPointClick,
  activeTool = 'select',
  initialTattooScale = 0.5
}: TattooCanvasWrapperProps) {
  return (
    <TattooCanvas 
      bodyImage={bodyImage} 
      tattooImage={tattooImage}
      warpPoints={warpPoints}
      showWarpPoints={showWarpPoints}
      bodyShape={bodyShape}
      onPointClick={onPointClick}
      activeTool={activeTool}
      initialTattooScale={initialTattooScale}
    />
  )
} 
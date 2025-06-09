'use client'

import { useState, useRef, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { X, Check, Upload } from 'lucide-react'

interface ImageUploadAreaProps {
  title: string
  description: string
  icon: ReactNode
  onImageUpload: (imageUrl: string) => void
  uploadedImage: string | null
  acceptedTypes: string
}

export default function ImageUploadArea({
  title,
  description,
  icon,
  onImageUpload,
  uploadedImage,
  acceptedTypes
}: ImageUploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    
    setIsUploading(true)
    
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onImageUpload(result)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading file:', error)
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    onImageUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-white/70 leading-relaxed">{description}</p>
      </div>
      
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-700 group
          ${isDragOver 
            ? 'bg-gradient-to-br from-yellow-500/20 via-yellow-400/10 to-orange-500/20 border-2 border-yellow-400/50 shadow-2xl shadow-yellow-500/25' 
            : uploadedImage 
              ? 'bg-gradient-to-br from-emerald-500/20 via-teal-400/10 to-green-500/20 border-2 border-emerald-400/50 shadow-2xl shadow-emerald-500/25' 
              : 'bg-gradient-to-br from-slate-800/50 via-slate-700/30 to-slate-800/50 border-2 border-slate-600/30 hover:border-yellow-400/50 hover:shadow-2xl hover:shadow-yellow-500/20'
          }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="relative p-12">
          {uploadedImage ? (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div 
                className="w-full h-64 bg-cover bg-center rounded-2xl border-2 border-white/20 shadow-xl relative overflow-hidden"
                style={{ backgroundImage: `url(${uploadedImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <motion.div 
                className="flex items-center justify-center gap-3 text-emerald-400"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <span className="font-semibold text-lg">Perfect! Image uploaded successfully</span>
              </motion.div>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage()
                }}
                className="inline-flex items-center gap-3 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-xl transition-all font-medium backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
                Remove & try another
              </motion.button>
            </motion.div>
          ) : isUploading ? (
            <motion.div 
              className="space-y-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="relative">
                <div className="w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-yellow-500/30" />
                  <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin" />
                </div>
              </div>
              <p className="text-white/80 text-xl font-medium">Processing your image...</p>
              <div className="w-32 h-2 bg-slate-700 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-pulse" />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-8 text-center"
              animate={{ 
                y: isDragOver ? -10 : 0,
                scale: isDragOver ? 1.05 : 1 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Icon with glow effect */}
              <motion.div 
                className="relative"
                animate={{ 
                  rotateY: isDragOver ? 180 : 0,
                  scale: isDragOver ? 1.2 : 1 
                }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-24 h-24 mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl blur-xl" />
                  <div className="relative w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center border border-slate-600/50">
                    {icon}
                  </div>
                </div>
              </motion.div>
              
              {/* Text content */}
              <div>
                <motion.p 
                  className="text-2xl font-bold text-white mb-4"
                  animate={{ color: isDragOver ? '#FCD34D' : '#FFFFFF' }}
                >
                  {isDragOver ? '✨ Drop it like it\'s hot!' : '📸 Drag & drop your image here'}
                </motion.p>
                <p className="text-white/60 text-lg mb-2">
                  or click to browse your files
                </p>
                <p className="text-white/40 text-sm">
                  PNG, JPG, JPEG • Max 10MB
                </p>
              </div>
              
              {/* Upload button */}
              <motion.div 
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/25"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="w-6 h-6" />
                <span>Choose File</span>
              </motion.div>
              
              {/* Decorative elements */}
              <div className="flex justify-center gap-2 opacity-30">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
} 
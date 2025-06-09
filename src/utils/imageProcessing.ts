import { ImageUploadResult, ExportOptions } from '@/types';

// Supported image formats
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Handle image file upload and validation
export async function handleImageUpload(file: File): Promise<ImageUploadResult> {
  // Validate file type
  if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
    throw new Error('Unsupported file format. Please use JPG, PNG, or WebP.');
  }
  
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size too large. Please use files under 10MB.');
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          url: e.target?.result as string,
          width: img.width,
          height: img.height,
          file
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

// Resize image while maintaining aspect ratio
export function resizeImage(
  sourceCanvas: HTMLCanvasElement,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  const { width: srcWidth, height: srcHeight } = sourceCanvas;
  
  // Calculate new dimensions
  let { width, height } = calculateAspectRatioFit(
    srcWidth,
    srcHeight,
    maxWidth,
    maxHeight
  );
  
  canvas.width = width;
  canvas.height = height;
  
  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(sourceCanvas, 0, 0, width, height);
  
  return canvas;
}

// Calculate dimensions that fit within bounds while maintaining aspect ratio
export function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  
  return {
    width: srcWidth * ratio,
    height: srcHeight * ratio
  };
}

// Create canvas from image URL
export async function createCanvasFromImage(imageUrl: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

// Extract ImageData from canvas for processing
export function getImageDataFromCanvas(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d')!;
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Apply filters to canvas
export function applyFiltersToCanvas(
  canvas: HTMLCanvasElement,
  filters: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
    sepia?: number;
    blur?: number;
  }
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  
  // Build CSS filter string
  const filterParts: string[] = [];
  
  if (filters.brightness !== undefined) {
    filterParts.push(`brightness(${filters.brightness}%)`);
  }
  
  if (filters.contrast !== undefined) {
    filterParts.push(`contrast(${filters.contrast}%)`);
  }
  
  if (filters.saturation !== undefined) {
    filterParts.push(`saturate(${filters.saturation}%)`);
  }
  
  if (filters.hue !== undefined) {
    filterParts.push(`hue-rotate(${filters.hue}deg)`);
  }
  
  if (filters.sepia !== undefined) {
    filterParts.push(`sepia(${filters.sepia}%)`);
  }
  
  if (filters.blur !== undefined) {
    filterParts.push(`blur(${filters.blur}px)`);
  }
  
  if (filterParts.length > 0) {
    ctx.filter = filterParts.join(' ');
  }
  
  return canvas;
}

// Export canvas with options
export async function exportCanvas(
  canvas: HTMLCanvasElement,
  options: ExportOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create high-resolution canvas if scale > 1
    let exportCanvas = canvas;
    
    if (options.scale > 1) {
      exportCanvas = document.createElement('canvas');
      const ctx = exportCanvas.getContext('2d')!;
      
      exportCanvas.width = canvas.width * options.scale;
      exportCanvas.height = canvas.height * options.scale;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.scale(options.scale, options.scale);
      ctx.drawImage(canvas, 0, 0);
    }
    
    const mimeType = `image/${options.format}`;
    const quality = options.quality / 100;
    
    exportCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to export canvas'));
        }
      },
      mimeType,
      quality
    );
  });
}

// Create download link for blob
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Convert blob to data URL
export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    
    reader.readAsDataURL(blob);
  });
}

// Validate image has transparency (for tattoo images)
export function hasTransparency(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Check alpha channel
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      return true;
    }
  }
  
  return false;
}

// Remove background from image (simple algorithm)
export function removeBackground(
  canvas: HTMLCanvasElement,
  tolerance: number = 10
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Sample background color from corners
  const cornerColors = [
    [data[0], data[1], data[2]], // Top-left
    [data[(canvas.width - 1) * 4], data[(canvas.width - 1) * 4 + 1], data[(canvas.width - 1) * 4 + 2]], // Top-right
    [data[(canvas.height - 1) * canvas.width * 4], data[(canvas.height - 1) * canvas.width * 4 + 1], data[(canvas.height - 1) * canvas.width * 4 + 2]], // Bottom-left
  ];
  
  // Use most common corner color as background
  const bgColor = cornerColors[0]; // Simplified - use top-left
  
  // Remove pixels similar to background color
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const distance = Math.sqrt(
      Math.pow(r - bgColor[0], 2) +
      Math.pow(g - bgColor[1], 2) +
      Math.pow(b - bgColor[2], 2)
    );
    
    if (distance < tolerance) {
      data[i + 3] = 0; // Make transparent
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// Create texture pattern for mesh visualization
export function createMeshTexture(
  width: number,
  height: number,
  color: string = '#00ff00'
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = width;
  canvas.height = height;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  
  // Draw grid pattern
  const gridSize = 20;
  
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  return canvas;
} 
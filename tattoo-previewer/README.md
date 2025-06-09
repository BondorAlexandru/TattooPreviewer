# TattooPreview

A modern, user-friendly web application for visualizing tattoos on body parts using advanced image manipulation techniques.

## Features

- **Image Upload**: Easy drag-and-drop interface for uploading body part photos and tattoo designs
- **Real-time Preview**: Interactive canvas for positioning and adjusting tattoos
- **Advanced Transformation**: Rotate, scale, and position tattoos with precision
- **3D Body Geometry**: Intelligent warping to follow body contours (basic implementation)
- **Export Functionality**: Download high-quality preview images
- **Modern UI**: Clean, minimalist design with smooth animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tattoo-previewer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### Step 1: Upload Body Part Image
- Click or drag and drop a photo of the body area where you want the tattoo
- Supported formats: PNG, JPG, JPEG
- For best results, use high-resolution images with good lighting

### Step 2: Upload Tattoo Design
- Upload your tattoo design image
- PNG files with transparent backgrounds work best
- Vector designs converted to PNG provide the cleanest results

### Step 3: Preview and Adjust
- Click "Preview Tattoo" to see the combined result
- Click on the tattoo to select it for editing
- Use the transformation handles to:
  - **Move**: Drag the tattoo to reposition
  - **Resize**: Drag corner handles to scale
  - **Rotate**: Use the rotation handle or toolbar buttons
- Fine-tune with the toolbar controls

### Step 4: Export
- Click "Download" to save your preview as a high-resolution PNG

## Technical Features

### Image Processing
- Client-side image processing using HTML5 Canvas
- Konva.js for advanced 2D canvas manipulation
- Real-time transformation with smooth animations

### 3D Geometry (Basic Implementation)
- Body contour detection for natural tattoo placement
- Perspective adjustment based on body angles
- Adaptive scaling for curved surfaces

### User Experience
- Framer Motion animations for smooth interactions
- Responsive design with Tailwind CSS
- Accessibility-focused design patterns
- Progressive enhancement

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Canvas**: Konva.js + React-Konva
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── app/
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
└── components/
    ├── TattooPreviewApp.tsx    # Main app component
    ├── Header.tsx              # Navigation header
    ├── ImageUploadArea.tsx     # Drag & drop upload
    └── TattooCanvas.tsx        # Canvas manipulation
```

## Future Enhancements

- [ ] Advanced 3D body mapping with depth perception
- [ ] Machine learning for automatic tattoo placement
- [ ] Multiple tattoo support on single body part
- [ ] Skin tone adjustment and color matching
- [ ] Social sharing functionality
- [ ] Tattoo artist collaboration features
- [ ] Mobile app version with camera integration
- [ ] AR preview using device camera

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please contact [your-email@example.com] or open an issue on GitHub.

---

Built with ❤️ for the tattoo community

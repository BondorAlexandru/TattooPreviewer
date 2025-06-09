# Tattoo Preview Studio

A professional web application for previewing tattoos on body parts with realistic 3D warping and deformation based on body topography. Built with Next.js 15, TypeScript, and advanced canvas manipulation using Konva.js.

## 🚀 Features

### Core Functionality
- **Drag & Drop Image Upload**: Support for JPG, PNG, and WebP formats
- **Interactive Canvas**: Real-time tattoo positioning and transformation
- **3D Warping Engine**: Advanced mesh-based deformation for realistic placement
- **Professional Controls**: Comprehensive transformation and effect tools

### 3D Topography System
- **Auto-Detection**: Intelligent body contour detection using edge detection algorithms
- **Manual Placement**: Click-to-add custom warp points with depth control
- **Mesh Visualization**: Heat map rendering showing surface depth
- **Body Shape Presets**: Pre-configured settings for arms, shoulders, and back

### Advanced Effects
- **Basic Adjustments**: Brightness, contrast, saturation, hue, blur
- **Aging Simulation**: Sepia, fade, and color shift effects for realistic aging
- **Transformation Tools**: Scale, rotate, skew with precise control
- **Opacity & Blending**: Multiple blend modes for skin integration

### Professional Features
- **High-Resolution Export**: 2x pixel ratio export for professional use
- **Responsive Design**: Mobile-friendly interface with collapsible sidebars
- **Real-time Preview**: Instant visual feedback during manipulation
- **Performance Optimized**: Debounced updates and efficient canvas rendering

## 🛠 Technology Stack

- **Framework**: Next.js 15 with TypeScript
- **Canvas**: Konva.js + React-Konva for 2D manipulation
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd tattoo-previewer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000`

## 🎯 Usage Guide

### Getting Started
1. **Upload Body Image**: Drag and drop or click to upload a body part photo
2. **Upload Tattoo Design**: Add your tattoo design (preferably with transparent background)
3. **Position Tattoo**: Drag the tattoo to desired location on the body
4. **Add Warp Points**: Use "Auto-Detect" or hold Shift + Click to manually add points

### 3D Warping Workflow
1. **Enable 3D Warping**: Toggle the switch in the 3D Warp tab
2. **Adjust Warp Strength**: Control the intensity of deformation (0-100%)
3. **Fine-tune Points**: Drag warp points to adjust body contours
4. **Preview Results**: Use mesh visualization to verify accuracy

### Transformation Controls
- **Position**: Precise X/Y positioning with percentage-based values
- **Scale**: Resize from 10% to 300% with 5% increments
- **Rotation**: Full 360° rotation with 1° precision
- **Skew**: X/Y skewing for perspective adjustments

### Effects & Aging
- **Color Adjustments**: Brightness, contrast, saturation, hue control
- **Blur Effects**: 0-10px blur for depth simulation
- **Aging Effects**: Sepia and fade for tattoo aging simulation

### Export Options
- **Format**: PNG, JPG, or WebP
- **Quality**: 0-100% compression control
- **Scale**: Export at 2x resolution for high-quality prints
- **Filename**: Automatic timestamping for version control

## 🎨 Body Shape Presets

### Cylindrical (Arms/Legs)
Optimized for tubular body parts with wrapping deformation around curved surfaces.

### Spherical (Shoulders/Joints)
Designed for rounded areas like shoulders with multi-directional curvature.

### Planar (Back/Chest)
Minimal warping for flat surfaces with subtle depth variations.

## 🔧 Advanced Features

### Warp Point Management
- **Auto-Detection**: Uses Sobel edge detection and brightness analysis
- **Manual Control**: Shift + Click to add, drag to reposition
- **Depth Control**: Z-axis positioning (0.0 = far, 1.0 = close)
- **Selection**: Click points to select/delete

### Mesh Triangulation
- **Delaunay Algorithm**: Optimal triangle generation for smooth interpolation
- **Barycentric Coordinates**: Precise depth interpolation within triangles
- **Real-time Updates**: Instant mesh recalculation on point changes

### Performance Optimization
- **Canvas Caching**: Pre-rendered static elements
- **Debounced Updates**: Smooth real-time manipulation
- **Memory Management**: Proper image disposal and cleanup

## 🎛 Keyboard Shortcuts

- `Shift + Click`: Add warp point
- `Click & Drag`: Move tattoo or warp points
- `Esc`: Deselect all elements

## 📱 Mobile Support

The application is fully responsive and supports touch interactions:
- Touch drag for repositioning
- Pinch zoom for detailed work
- Collapsible sidebar for screen space

## 🔒 Browser Compatibility

- **Chrome**: 90+ (Recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🎯 Use Cases

### Tattoo Artists
- Client consultations and design placement
- Portfolio demonstration
- Design iteration and approval

### Tattoo Enthusiasts
- Placement visualization before commitment
- Design experimentation
- Size and position optimization

### Design Agencies
- Mock-up creation for campaigns
- Product visualization
- Creative concept development

## 🚀 Performance Tips

1. **Image Size**: Keep images under 10MB for optimal performance
2. **Warp Points**: Use 8-15 points for best balance of accuracy and performance
3. **Browser**: Use Chrome or Edge for best canvas performance
4. **Memory**: Close unused tabs when working with large images

## 🐛 Troubleshooting

### Common Issues

**Images not loading**: Ensure file format is JPG, PNG, or WebP under 10MB

**Slow performance**: Reduce image size or number of warp points

**Export not working**: Check browser permissions for file downloads

**Warp points not visible**: Toggle "Show Warp Points" in the 3D Warp tab

## 🔮 Future Enhancements

- Real-time collaboration features
- Cloud storage integration
- Advanced lighting simulation
- Skin texture overlays
- Batch processing capabilities
- AI-powered placement suggestions

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 💬 Support

For questions or support, please open an issue on the GitHub repository.

---

Built with ❤️ for the tattoo community

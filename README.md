# Sun Glow Festival Builder

An interactive 3D festival builder using Three.js that allows users to design and visualize a large-scale music festival site in a 400-acre open field farm setting.

## Features

- **First-person walking mode** with smooth WASD movement and mouse look controls
- **God Mode** toggle to switch into a top-down or free-fly camera for object manipulation
- **Object manipulation** with snapping functionality (grid-based)
- **Prefab 3D objects** for festival elements:
  - 4 music stages (main stage, side stage, DJ booth, speaker stacks)
  - Attractions (Ferris wheel, food stands, art installations)
  - Camping areas (tents, RVs, toilets)
  - Infrastructure (fences, roads, signs, flags)
- **Save and load** different festival layout configurations
- **Minimap** for quick navigation across large areas
- **Asset management system** to browse and place new elements

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/festival-builder.git
cd festival-builder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

### Controls

- **WASD**: Move in first-person mode
- **Mouse**: Look around in first-person mode
- **TAB**: Toggle between Play Mode and God Mode
- **ESC**: Exit pointer lock (first-person mode)

### God Mode Controls

- **WASD**: Move horizontally
- **Q/E**: Move up/down
- **Mouse**: Look around (drag to look)
- **Click**: Select/place objects
- **Delete**: Remove selected object
- **R**: Rotate selected object

### Building Your Festival

1. Press **TAB** to enter God Mode
2. Select objects from the panel on the right
3. Click to place objects in the scene
4. Use the object controls to manipulate placed objects
5. Press **TAB** again to enter Play Mode and walk around your festival

## Deployment

### Local Build

To build the project for production:

```bash
npm run build
```

This will create a `dist` directory with the built files.

### GitHub Pages Deployment

This project is set up for automatic deployment to GitHub Pages:

1. Fork or clone this repository
2. Push your changes to the `main` branch
3. GitHub Actions will automatically build and deploy to the `gh-pages` branch
4. Your site will be available at `https://yourusername.github.io/festival-builder/`

You can also manually deploy to GitHub Pages:

```bash
# Build the project
npm run build

# Create a gh-pages branch
git checkout -b gh-pages

# Add the dist directory
git add dist -f

# Commit the changes
git commit -m "Deploy to GitHub Pages"

# Push to the gh-pages branch
git push origin gh-pages
```

## Technical Details

The application is built using:

- **Three.js** for 3D rendering
- **Cannon.js** for physics
- **Vite** for development and building

## Project Structure

```
festival-builder/
├── src/                  # Source files
│   ├── controls/         # Custom controls
│   ├── festival-builder.js # Main application logic
│   ├── main.js           # Entry point
│   └── style.css         # Styles
├── index.html            # Main HTML file
├── package.json          # Dependencies and scripts
└── vite.config.js        # Vite configuration
```

## Recent Updates

- Disabled camera roll (tilt left/right) in both Play Mode and God Mode for improved navigation
- Prevented camera movement when dragging objects in God Mode
- Added keyboard UI for better control visualization
- Configured for GitHub Pages deployment

## License

This project is licensed under the MIT License - see the LICENSE file for details.

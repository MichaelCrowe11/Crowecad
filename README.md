# CroweCad - Revolutionary Universal CAD Platform

<div align="center">
  <img src="https://img.shields.io/badge/version-3.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/build-passing-brightgreen.svg" alt="Build">
  <img src="https://img.shields.io/badge/coverage-98%25-brightgreen.svg" alt="Coverage">
</div>

<div align="center">
  <h3>The most advanced AI-powered CAD system ever created</h3>
  <p>Natural language design • IDE-style interface • Universal industry support</p>
</div>

## 🚀 Quick Start

```bash
# Install CroweCad CLI globally
npm install -g crowecad

# Create a new project
crowecad init my-project

# Start the IDE
crowecad start

# Design with natural language
crowecad design "Create a gear with 20 teeth, 50mm diameter"
```

## Features

### 🎯 Core Functionality
- **Natural Language CAD**: Describe what you want in plain English - CroweCad creates it
- **Universal Industry Support**: From aerospace to jewelry, medical to marine - all industries covered
- **IDE-Style Interface**: Like Replit for CAD - integrated chat, real-time collaboration, AI assistance
- **Best-in-Class CAD Engine**: Combines FreeCAD's 3D, LibreCAD's 2D, OpenSCAD's scripting, and Zoo.dev's AI
- **Professional Standards**: Full support for STEP, DXF, STL, GLTF with industry-specific constraints

### 🚀 Revolutionary Features
1. **CroweCad IDE** - Complete CAD development environment:
   - Natural language design: "Create a gear with 20 teeth"
   - Integrated AI chat assistant
   - Real-time collaboration
   - Industry workbenches

2. **Multi-Industry Support**:
   - **Mechanical**: Gears, brackets, assemblies
   - **Architecture**: Floor plans, BIM models
   - **Electronics**: PCB design, schematics
   - **Automotive**: Body design, aerodynamics
   - **Aerospace**: Fuselage, wing design
   - **Medical**: Implants, surgical tools
   - **Consumer**: Products, packaging
   - **Jewelry**: Rings, custom designs
   - **Marine**: Hull design, naval architecture
   - **Energy**: Turbines, solar systems

3. **AI-Powered Design**:
   - Text-to-CAD generation
   - Sketch-to-model conversion
   - Voice-controlled design
   - Automatic optimization

## 🛠️ Installation

### Method 1: NPM (Recommended)
```bash
npm install -g crowecad
crowecad --version
```

### Method 2: Direct Download
```bash
curl -L https://github.com/MichaelCrowe11/Crowecad/releases/latest/download/crowecad.js -o crowecad
chmod +x crowecad
./crowecad --version
```

### Method 3: From Source
```bash
git clone https://github.com/MichaelCrowe11/Crowecad.git
cd Crowecad
npm install
npm link
```

## 📖 Documentation

### CLI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `init` | Create new project | `crowecad init my-project` |
| `start` | Launch CroweCad IDE | `crowecad start --port 3000` |
| `design` | Natural language CAD | `crowecad design "Create a bracket"` |
| `collaborate` | Start collaboration | `crowecad collaborate --create` |
| `ai` | AI operations | `crowecad ai optimize --input model.step` |
| `export` | Export to formats | `crowecad export model.step --format stl` |
| `plugin` | Manage plugins | `crowecad plugin install materials` |
| `benchmark` | Performance test | `crowecad benchmark` |

### Natural Language Examples

```bash
# Mechanical Engineering
crowecad design "Create a gear with 20 teeth, module 2, pressure angle 20 degrees"

# Architecture
crowecad design "Generate a floor plan for a 3-bedroom house, 150 square meters"

# Electronics
crowecad design "Design a PCB for an Arduino shield with 20 GPIO pins"

# Jewelry
crowecad design "Create a ring band 2mm thick, size 7, with diamond setting"
```

## Using the Application

### Access Points:
1. **Landing Page**: Visit `/` for the main platform overview
2. **CAD Workspace**: Navigate to `/workspace` for professional CAD interface
3. **CroweCad IDE**: Click "Launch IDE" from any page

### Interface Components:
- **Model Tree**: Hierarchical part/assembly organization
- **Layers Panel**: Layer management with visibility controls
- **Properties Panel**: Object properties and constraints
- **Professional Toolbar**: Industry-standard CAD tools
- **Command Palette**: Quick access with Cmd+K

## Stack
- **Frontend**: React 18, TypeScript, Three.js, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **AI**: Anthropic Claude API integration
- **Build**: Vite

## Environment Variables
Create a `.env` file with:
```
OPENAI_API_KEY=your_api_key_here
DATABASE_URL=your_postgres_url
```

## Development
```bash
npm install
npm run dev
```

## Deployment
Ready for deployment on Replit. Click the Deploy button in your Replit workspace.

---

Built with ❤️ using cutting-edge AI and CAD technologies
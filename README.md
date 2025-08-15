# CroweCad - Revolutionary Universal CAD Platform

The most advanced AI-powered CAD system ever created. Natural language design, IDE-style interface, and support for every industry imaginable.

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

## How to Push to GitHub

### Step 1: Create a GitHub Repository
1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., "mycology-facility-designer")
3. Don't initialize with README (we already have one)

### Step 2: Push from Terminal
Open the Shell in Replit and run these commands:

```bash
# Configure git (if not already done)
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"

# Initialize repository (if needed)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Advanced mycology facility designer with CAD engine"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

If you get an error about 'main' branch, try:
```bash
git branch -M main
git push -u origin main
```

### Step 3: Authentication
GitHub may ask for authentication. Use one of these methods:
1. **Personal Access Token** (recommended):
   - Go to GitHub Settings → Developer Settings → Personal Access Tokens
   - Generate a new token with 'repo' permissions
   - Use the token as your password when prompted

2. **GitHub CLI**: 
   ```bash
   gh auth login
   ```

## Using the Application

### Access the CAD Features:
1. Click **"Open Crowe CAD Engine"** button (blue button in left sidebar)
2. Click **"Show Live Demo"** button to see the simulation

### Main Interface Areas:
- **Left Sidebar**: Voice control, command interface, CAD tools
- **Center Canvas**: Facility design area with drag-drop equipment
- **Right Panel**: Properties and configuration
- **Top Ribbon**: Professional CAD toolbar

## Stack
- **Frontend**: React 18, TypeScript, Three.js, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **AI**: Anthropic Claude API integration
- **Build**: Vite

## Environment Variables
Create a `.env` file with:
```
ANTHROPIC_API_KEY=your_api_key_here
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
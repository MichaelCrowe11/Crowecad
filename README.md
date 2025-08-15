# Mycology Facility Designer - Advanced CAD System

A comprehensive facility design application for mycology (mushroom cultivation) operations with professional AutoCAD-style interface and AI-powered capabilities.

## Features

### 🎯 Core Functionality
- **Professional CAD Engine**: Based on industry-leading patterns from JSketcher, dxf-viewer, and OpenJSCAD
- **AI-Powered Design**: Genetic algorithm-based Crowe Logic with quantum consciousness states
- **Real-time 3D Visualization**: Three.js/WebGL rendering with parametric design
- **Advanced Import/Export**: Full DXF support, PDF blueprint import, vision analysis
- **Enterprise Integration**: Batch reporting for ERP, MES, LIMS, SCADA systems

### 🚀 Key Components
1. **Crowe CAD Engine** - Professional AutoCAD-style interface with:
   - Smart dimensioning and constraints
   - Pattern recognition and auto-snap
   - Assembly prediction
   - Real-time collaboration

2. **AI Optimization Panel** - Multi-factor facility analysis:
   - Extended thinking patterns
   - Sub-agents for cost optimization
   - Automated evaluations
   - Prompt caching for performance

3. **Interactive Demo** - Live facility simulation with real-time metrics

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
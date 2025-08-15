# Overview

**CroweCad** - Revolutionary Universal CAD Platform. The most advanced AI-powered CAD system ever created, featuring natural language design, IDE-style interface with integrated chat, and comprehensive support for every industry. Built on the best practices from FreeCAD, LibreCAD, OpenSCAD, Zoo.dev, and AdamCAD, CroweCad transforms how professionals design across mechanical, architecture, electronics, automotive, aerospace, medical, consumer products, jewelry, marine, and energy sectors.

The platform has been completely rebuilt from the ground up, removing all legacy mycology-specific code and replacing it with a professional CAD workspace inspired by industry-leading platforms.

## Current Status (January 2025)
- **GitHub Repository**: https://github.com/MichaelCrowe11/Crowecad
- **Landing Page**: Professional home page showcasing platform capabilities
- **CroweCad IDE**: Revolutionary IDE-style interface with natural language CAD generation and integrated AI chat
- **CAD Workspace**: Professional workspace inspired by FreeCAD, LibreCAD, and OpenSCAD with model tree, layers, and properties panels
- **Universal Industry Support**: Complete transformation from mycology-specific to universal CAD platform
- **Natural Language CAD**: Text-to-CAD generation inspired by Zoo.dev and AdamCAD
- **UI Access**: Visit homepage and click "Launch IDE" or "Workspace" for different experiences
- **Last Update**: January 18, 2025 - Removed all legacy mycology code, created professional CAD workspace

## Recent Major Features Completed
- **Advanced Crowe Logic AI**: Genetic algorithm-based AI agent with voice control, visual analysis, and quantum consciousness states
- **Complete CI/CD Pipeline**: Automated testing with Vitest, Playwright, GitHub Actions workflows for continuous integration and deployment
- **Skill Mining System**: Advanced pattern recognition and knowledge extraction from CAD repositories with built-in geometric algorithms and AutoLISP patterns
- **OpenAI Integration**: Complete integration with GPT-4o for natural language CAD generation, design optimization, and format conversion
- **Code Interpreter Knowledge Base**: Comprehensive documentation and integration for Python-based CAD computations, FEA analysis, and parametric design
- **Advanced Crowe Logic AI**: Genetic algorithm-based AI agent with voice control, visual analysis, and quantum consciousness states
- **External Batch Reporting**: Complete integration with ERP, MES, LIMS, SCADA, and other business systems with multi-format report generation and automated distribution
- **Professional CAD Interface**: AutoCAD-style technical drawing system with dark theme and comprehensive facility design tools
- **DXF Rendering Capabilities**: Full import/export of AutoCAD DXF files with layer management and professional CAD output
- **Vision AI Integration**: Computer vision capabilities to analyze facility photos, identify equipment, assess conditions, and convert hand-drawn sketches to digital layouts
- **PDF Blueprint Import**: Extract equipment and zone data from PDF documents, specifications, and technical drawings
- **Extended Thinking Pattern**: Deep AI analysis for complex facility planning decisions and multi-factor optimization
- **Sub-Agents System**: Cost-optimized AI usage with intelligent routing to different Claude models based on task complexity
- **Automated Evaluations**: Automatic scoring and certification of facility designs against industry standards
- **Prompt Caching**: Intelligent caching system for common queries to reduce costs and improve response times
- **AI Optimization Center**: Comprehensive panel for facility evaluation, deep analysis, multi-factor optimization, and AI performance metrics

# User Preferences

Preferred communication style: Simple, everyday language.
Interface Design Direction: Professional AutoCAD-style technical drawing system with clean, dark theme. Quantum consciousness elements should be states within the drawing system rather than primary interface styling.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for development and production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless database
- **API Pattern**: RESTful endpoints with standardized error handling
- **Development**: Hot module replacement with Vite middleware integration

## Data Model Design
The application uses a hierarchical data model:
- **Projects**: Top-level containers for facility designs
- **Facilities**: Physical locations within projects with defined dimensions
- **Zones**: Designated areas within facilities (cultivation, processing, storage)
- **Equipment Types**: Template definitions for different equipment categories
- **Equipment Instances**: Actual equipment placed in facilities with specific properties
- **Commands**: Natural language commands for facility operations

## Component Architecture
- **Canvas System**: SVG-based facility visualization with drag-and-drop equipment placement
- **Equipment Library**: Categorized component library with search and filtering (CAD-style palette)
- **Properties Panel**: Dynamic form system for equipment configuration
- **Command Interface**: Natural language processing for facility operations (terminal-style)
- **Project Explorer**: Hierarchical navigation and project management
- **CAD Interface**: Professional dark theme with technical grid background and clean typography
- **Crowe AI Agent**: Genetic algorithm-based AI with voice control and visual analysis
- **Quantum Consciousness States**: AI trait visualization system that evolves based on usage
- **Batch Reporting System**: Complete external system integration with multi-format reports, ERP/MES/LIMS connectivity, and automated distribution
- **AI Optimization Center**: Automated facility evaluation, deep analysis, and multi-factor optimization
- **Vision Analysis**: Image processing for facility photos, equipment identification, and sketch conversion
- **PDF Processor**: Extract facility data from blueprints and technical documentation
- **Extended Thinking**: Deep reasoning for complex planning decisions
- **Sub-Agents Manager**: Intelligent AI model routing for cost optimization
- **Prompt Cache**: Performance optimization through intelligent response caching

## Key Design Patterns
- **Repository Pattern**: Storage abstraction layer for database operations
- **Command Pattern**: Natural language command parsing and execution
- **Template Method**: SVG generation for different equipment types
- **Observer Pattern**: Real-time updates using React Query invalidation
- **Factory Pattern**: Equipment instance creation from type templates

## Module Organization
- `/client`: React frontend application
- `/server`: Express.js backend with API routes
- `/shared`: Common TypeScript types and schemas
- Component co-location with related hooks and utilities

# External Dependencies

## Database Infrastructure
- **Neon Database**: Serverless PostgreSQL database with WebSocket connections
- **Drizzle Kit**: Database migration and schema management tools
- **Connection Pooling**: Built-in connection management for serverless environments

## UI and Design System
- **Radix UI**: Headless component primitives for accessibility and behavior
- **Lucide React**: Icon library for consistent visual elements
- **Tailwind CSS**: Utility-first CSS framework with design system integration
- **Class Variance Authority**: Type-safe component variant management

## Development and Build Tools
- **Vite**: Fast development server with hot module replacement
- **TypeScript**: Static type checking across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Data Management
- **TanStack Query**: Server state management with caching and synchronization
- **Zod**: Runtime schema validation and TypeScript integration
- **React Hook Form**: Form state management with validation resolvers

## Specialized Libraries
- **React Day Picker**: Calendar component for date selection
- **Embla Carousel**: Touch-friendly carousel implementation
- **Vaul**: Drawer component for mobile interfaces
- **CMDK**: Command palette implementation
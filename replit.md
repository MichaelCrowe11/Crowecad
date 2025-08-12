# Overview

This is a facility design application for mycology (mushroom cultivation) operations. The application enables users to create, manage, and visualize biotechnology facilities with specialized equipment like bioreactors, environmental controls, and processing equipment. Users can design facility layouts, place equipment instances, manage zones, and execute commands through a natural language interface.

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
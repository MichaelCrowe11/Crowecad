/**
 * CroweCad Professional Toolbar
 * AutoCAD-style toolbar with all essential tools
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import {
  MousePointer,
  Move,
  Rotate3D,
  Square,
  Circle,
  Minus,
  Pentagon,
  Box,
  Layers,
  Ruler,
  Grid3x3,
  Crosshair,
  Magnet,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Maximize,
  Save,
  Undo2,
  Redo2,
  Copy,
  ClipboardPaste,
  Scissors,
  Trash2,
  FileText,
  Wrench,
  Palette,
  Package,
  Sparkles,
  ChevronDown,
  MoreVertical,
  Settings,
  Triangle,
  Hexagon,
  Star,
  Heart,
  Zap,
  PenTool,
  Type,
  Eraser,
  Pipette,
  Hand,
  Anchor,
  GitMerge,
  Combine,
  Divide,
  Slice,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  RotateCcw,
  Shuffle,
  Ungroup,
  Group,
  BringToFront,
  SendToBack,
  MoveUp,
  MoveDown,
  Gauge,
  Activity,
  Target,
  Compass,
  Map,
  Navigation,
  Flag,
  Pin,
  MapPin,
  Milestone,
  Signpost,
  Route,
  Footprints,
  Bike,
  Car,
  Train,
  Plane,
  Ship,
  Rocket,
  Globe,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Droplet,
  Flame,
  Snowflake,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  Tablet,
  Watch,
  Speaker,
  Headphones,
  Camera,
  Video,
  Mic,
  Wifi,
  Bluetooth,
  Battery,
  BatteryCharging,
  Power,
  Plug,
  Zap as Lightning
} from 'lucide-react';

interface ProfessionalToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onAction?: (action: string, data?: any) => void;
}

export function ProfessionalToolbar({ activeTool, onToolChange, onAction }: ProfessionalToolbarProps) {
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [orthoEnabled, setOrthoEnabled] = useState(false);
  const [layersVisible, setLayersVisible] = useState(true);

  const handleAction = (action: string, data?: any) => {
    onAction?.(action, data);
  };

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select (S)', shortcut: 'S' },
    { id: 'move', icon: Move, label: 'Move (M)', shortcut: 'M' },
    { id: 'rotate', icon: Rotate3D, label: 'Rotate (R)', shortcut: 'R' },
    { id: 'scale', icon: Maximize, label: 'Scale (SC)', shortcut: 'SC' },
  ];

  const drawTools = [
    { id: 'line', icon: Minus, label: 'Line (L)', shortcut: 'L' },
    { id: 'polyline', icon: Route, label: 'Polyline (PL)', shortcut: 'PL' },
    { id: 'rectangle', icon: Square, label: 'Rectangle (REC)', shortcut: 'REC' },
    { id: 'circle', icon: Circle, label: 'Circle (C)', shortcut: 'C' },
    { id: 'arc', icon: Anchor, label: 'Arc (A)', shortcut: 'A' },
    { id: 'polygon', icon: Pentagon, label: 'Polygon (POL)', shortcut: 'POL' },
    { id: 'ellipse', icon: Circle, label: 'Ellipse (EL)', shortcut: 'EL' },
    { id: 'spline', icon: Route, label: 'Spline (SPL)', shortcut: 'SPL' },
  ];

  const modifyTools = [
    { id: 'trim', icon: Scissors, label: 'Trim (TR)', shortcut: 'TR' },
    { id: 'extend', icon: Maximize, label: 'Extend (EX)', shortcut: 'EX' },
    { id: 'offset', icon: Copy, label: 'Offset (O)', shortcut: 'O' },
    { id: 'fillet', icon: GitMerge, label: 'Fillet (F)', shortcut: 'F' },
    { id: 'chamfer', icon: Triangle, label: 'Chamfer (CHA)', shortcut: 'CHA' },
    { id: 'mirror', icon: FlipHorizontal, label: 'Mirror (MI)', shortcut: 'MI' },
    { id: 'array', icon: Grid3x3, label: 'Array (AR)', shortcut: 'AR' },
  ];

  const shapes3D = [
    { id: 'box', icon: Box, label: 'Box' },
    { id: 'cylinder', icon: Circle, label: 'Cylinder' },
    { id: 'sphere', icon: Circle, label: 'Sphere' },
    { id: 'cone', icon: Triangle, label: 'Cone' },
    { id: 'torus', icon: Circle, label: 'Torus' },
    { id: 'pyramid', icon: Triangle, label: 'Pyramid' },
  ];

  return (
    <div className="bg-background border-b px-2 py-1">
      <TooltipProvider delayDuration={300}>
        {/* Primary Toolbar */}
        <div className="flex items-center gap-1 mb-1">
          {/* File Operations */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleAction('save')}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Save (Ctrl+S)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleAction('undo')}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleAction('redo')}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Edit Operations */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleAction('cut')}
                >
                  <Scissors className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Cut (Ctrl+X)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleAction('copy')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Copy (Ctrl+C)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleAction('paste')}
                >
                  <ClipboardPaste className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Paste (Ctrl+V)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleAction('delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Delete (Del)</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Selection Tools */}
          <div className="flex items-center gap-1">
            {tools.map(tool => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button 
                    variant={activeTool === tool.id ? "default" : "ghost"}
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => onToolChange(tool.id)}
                  >
                    <tool.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{tool.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Drawing Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Square className="h-4 w-4 mr-1" />
                Draw
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {drawTools.map(tool => (
                <DropdownMenuItem 
                  key={tool.id}
                  onClick={() => onToolChange(tool.id)}
                >
                  <tool.icon className="h-4 w-4 mr-2" />
                  {tool.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Modify Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Wrench className="h-4 w-4 mr-1" />
                Modify
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {modifyTools.map(tool => (
                <DropdownMenuItem 
                  key={tool.id}
                  onClick={() => onToolChange(tool.id)}
                >
                  <tool.icon className="h-4 w-4 mr-2" />
                  {tool.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 3D Shapes Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Box className="h-4 w-4 mr-1" />
                3D
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>3D Primitives</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {shapes3D.map(shape => (
                <DropdownMenuItem 
                  key={shape.id}
                  onClick={() => handleAction('insert-3d', shape.id)}
                >
                  <shape.icon className="h-4 w-4 mr-2" />
                  {shape.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>3D Operations</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleAction('extrude')}>
                <Box className="h-4 w-4 mr-2" />
                Extrude
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('revolve')}>
                <Rotate3D className="h-4 w-4 mr-2" />
                Revolve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('sweep')}>
                <Wind className="h-4 w-4 mr-2" />
                Sweep
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('loft')}>
                <Layers className="h-4 w-4 mr-2" />
                Loft
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* AI Tools */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={() => handleAction('ai-generate')}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  AI
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">AI Generate</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex-1" />

          {/* View Controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={gridEnabled}
                  onPressedChange={setGridEnabled}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">Toggle Grid (F7)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={snapEnabled}
                  onPressedChange={setSnapEnabled}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Magnet className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">Toggle Snap (F9)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={orthoEnabled}
                  onPressedChange={setOrthoEnabled}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Crosshair className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">Ortho Mode (F8)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={layersVisible}
                  onPressedChange={setLayersVisible}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Layers className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">Toggle Layers</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleAction('zoom-in')}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Zoom In</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleAction('zoom-out')}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Zoom Out</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleAction('zoom-fit')}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Zoom to Fit</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
          <span>X: 0.00</span>
          <span>Y: 0.00</span>
          <span>Z: 0.00</span>
          <Separator orientation="vertical" className="h-3" />
          <span className={gridEnabled ? 'text-primary' : ''}>GRID</span>
          <span className={snapEnabled ? 'text-primary' : ''}>SNAP</span>
          <span className={orthoEnabled ? 'text-primary' : ''}>ORTHO</span>
          <div className="flex-1" />
          <span>Ready</span>
        </div>
      </TooltipProvider>
    </div>
  );
}
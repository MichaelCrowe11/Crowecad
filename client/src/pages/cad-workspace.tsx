/**
 * CroweCad Professional CAD Workspace
 * Inspired by FreeCAD, LibreCAD, OpenSCAD, and modern CAD platforms
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import { Slider } from '@/components/ui/slider';
import { CroweCadIDE } from '@/components/crowecad-ide';
import { ProfessionalToolbar } from '@/components/professional-toolbar';
import { CommandPalette } from '@/components/command-palette';
import { useToast } from '@/hooks/use-toast';
import {
  Box,
  Circle,
  Square,
  Triangle,
  Pentagon,
  Hexagon,
  Star,
  Layers,
  Grid3x3,
  Ruler,
  Move,
  Rotate3D,
  MousePointer,
  ZoomIn,
  ZoomOut,
  Maximize,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  FileText,
  FolderOpen,
  Save,
  Download,
  Upload,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Code2,
  Terminal,
  Package,
  Cpu,
  GitBranch,
  Database,
  Cloud,
  Share2,
  Users,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Copy,
  Trash2,
  Edit,
  Home,
  ArrowLeft,
  Command,
  Keyboard
} from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  objects: any[];
}

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'part' | 'assembly' | 'sketch' | 'operation';
  icon: any;
  children?: TreeNode[];
  expanded?: boolean;
}

export function CadWorkspace() {
  const [activeTool, setActiveTool] = useState('select');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showIDE, setShowIDE] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [orthoMode, setOrthoMode] = useState(false);
  const [currentView, setCurrentView] = useState('top');
  const [zoom, setZoom] = useState(100);
  const [layers, setLayers] = useState<Layer[]>([
    { id: '1', name: 'Layer 0', visible: true, locked: false, color: '#ffffff', objects: [] },
    { id: '2', name: 'Construction', visible: true, locked: false, color: '#00ff00', objects: [] },
    { id: '3', name: 'Dimensions', visible: true, locked: false, color: '#ffff00', objects: [] },
  ]);
  const [selectedLayer, setSelectedLayer] = useState('1');
  const [modelTree, setModelTree] = useState<TreeNode[]>([
    {
      id: '1',
      name: 'Assembly1',
      type: 'assembly',
      icon: Package,
      expanded: true,
      children: [
        { id: '2', name: 'Part1', type: 'part', icon: Box },
        { id: '3', name: 'Part2', type: 'part', icon: Box },
        { id: '4', name: 'Sketch1', type: 'sketch', icon: Square },
      ]
    }
  ]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Initialize Three.js or Canvas rendering
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Draw grid
        if (gridEnabled) {
          drawGrid(ctx);
        }
        // Draw axes
        drawAxes(ctx);
      }
    }
  }, [gridEnabled, zoom]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current!;
    const gridSize = 20 * (zoom / 100);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const drawAxes = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // X axis (red)
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();
    
    // Y axis (green)
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();
  };

  const handleAction = (action: string, data?: any) => {
    console.log('Action:', action, data);
    switch (action) {
      case 'save':
        toast({ title: "Saved", description: "Project saved successfully" });
        break;
      case 'export':
        toast({ title: "Export", description: "Select export format" });
        break;
      case 'ai-generate':
        setShowIDE(true);
        break;
      default:
        console.log('Unhandled action:', action);
    }
  };

  const TreeItem = ({ node, depth = 0 }: { node: TreeNode; depth?: number }) => {
    const [expanded, setExpanded] = useState(node.expanded || false);
    const Icon = node.icon;
    
    return (
      <div>
        <div 
          className="flex items-center gap-1 py-1 px-2 hover:bg-accent rounded cursor-pointer"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {node.children && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          )}
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{node.name}</span>
        </div>
        {expanded && node.children && (
          <div>
            {node.children.map(child => (
              <TreeItem key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (showIDE) {
    return <CroweCadIDE projectId="workspace" onClose={() => setShowIDE(false)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Command Palette */}
      <CommandPalette 
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        onCommand={handleAction}
      />

      {/* Header */}
      <div className="border-b bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.location.href = '/'}>
            <Home className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">CroweCad Workspace</h1>
          <span className="text-sm text-muted-foreground">Untitled.step</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowCommandPalette(true)}>
            <Keyboard className="h-4 w-4 mr-1" />
            Cmd+K
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowIDE(true)}>
            <Terminal className="h-4 w-4 mr-1" />
            IDE
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Professional Toolbar */}
      <ProfessionalToolbar 
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onAction={handleAction}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar - Model Tree */}
        <div className="w-64 border-r bg-card">
          <Tabs defaultValue="model" className="h-full flex flex-col">
            <TabsList className="m-2">
              <TabsTrigger value="model" className="flex-1">Model</TabsTrigger>
              <TabsTrigger value="layers" className="flex-1">Layers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="model" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Model Tree</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {modelTree.map(node => (
                    <TreeItem key={node.id} node={node} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="layers" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {layers.map(layer => (
                    <div 
                      key={layer.id}
                      className={`flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer ${
                        selectedLayer === layer.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedLayer(layer.id)}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLayers(layers.map(l => 
                            l.id === layer.id ? { ...l, visible: !l.visible } : l
                          ));
                        }}
                      >
                        {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLayers(layers.map(l => 
                            l.id === layer.id ? { ...l, locked: !l.locked } : l
                          ));
                        }}
                      >
                        {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      </Button>
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="text-sm flex-1">{layer.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col bg-slate-950">
          {/* View Controls */}
          <div className="border-b bg-card/50 backdrop-blur px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select value={currentView} onValueChange={setCurrentView}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="front">Front</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="iso">Isometric</SelectItem>
                  <SelectItem value="perspective">Perspective</SelectItem>
                </SelectContent>
              </Select>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Toggle pressed={gridEnabled} onPressedChange={setGridEnabled} size="sm">
                <Grid3x3 className="h-4 w-4" />
              </Toggle>
              <Toggle pressed={snapEnabled} onPressedChange={setSnapEnabled} size="sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </Toggle>
              <Toggle pressed={orthoMode} onPressedChange={setOrthoMode} size="sm">
                <Ruler className="h-4 w-4" />
              </Toggle>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(10, zoom - 10))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(500, zoom + 10))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(100)}>
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <canvas 
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
            />
            
            {/* Coordinate Display */}
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur px-3 py-2 rounded text-xs font-mono">
              <span className="text-red-500">X: 0.00</span>
              <span className="text-green-500 ml-3">Y: 0.00</span>
              <span className="text-blue-500 ml-3">Z: 0.00</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l bg-card">
          <Tabs defaultValue="properties" className="h-full flex flex-col">
            <TabsList className="m-2">
              <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
              <TabsTrigger value="constraints" className="flex-1">Constraints</TabsTrigger>
              <TabsTrigger value="params" className="flex-1">Parameters</TabsTrigger>
            </TabsList>
            
            <TabsContent value="properties" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <div>
                    <Label className="text-sm">Object Type</Label>
                    <p className="text-sm text-muted-foreground">Select an object</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="pos-x">Position X</Label>
                      <Input id="pos-x" type="number" placeholder="0.00" />
                    </div>
                    <div>
                      <Label htmlFor="pos-y">Position Y</Label>
                      <Input id="pos-y" type="number" placeholder="0.00" />
                    </div>
                    <div>
                      <Label htmlFor="pos-z">Position Z</Label>
                      <Input id="pos-z" type="number" placeholder="0.00" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="rot-x">Rotation X</Label>
                      <Input id="rot-x" type="number" placeholder="0°" />
                    </div>
                    <div>
                      <Label htmlFor="rot-y">Rotation Y</Label>
                      <Input id="rot-y" type="number" placeholder="0°" />
                    </div>
                    <div>
                      <Label htmlFor="rot-z">Rotation Z</Label>
                      <Input id="rot-z" type="number" placeholder="0°" />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="constraints" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">No constraints applied</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Constraint
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="params" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  <div>
                    <Label>Length</Label>
                    <Input type="number" placeholder="100.00" />
                  </div>
                  <div>
                    <Label>Width</Label>
                    <Input type="number" placeholder="50.00" />
                  </div>
                  <div>
                    <Label>Height</Label>
                    <Input type="number" placeholder="25.00" />
                  </div>
                  <div>
                    <Label>Material</Label>
                    <Select defaultValue="steel">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="steel">Steel</SelectItem>
                        <SelectItem value="aluminum">Aluminum</SelectItem>
                        <SelectItem value="plastic">Plastic</SelectItem>
                        <SelectItem value="wood">Wood</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t bg-card px-4 py-1 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className={gridEnabled ? 'text-primary' : 'text-muted-foreground'}>GRID</span>
          <span className={snapEnabled ? 'text-primary' : 'text-muted-foreground'}>SNAP</span>
          <span className={orthoMode ? 'text-primary' : 'text-muted-foreground'}>ORTHO</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Objects: 3</span>
          <span>Vertices: 248</span>
          <span>Faces: 124</span>
        </div>
        <span className="text-muted-foreground">Ready</span>
      </div>
    </div>
  );
}
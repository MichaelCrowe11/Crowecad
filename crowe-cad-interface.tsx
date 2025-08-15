import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Pentagon,
  Layers,
  Grid3x3,
  Move,
  RotateCw,
  Scale,
  Ruler,
  MousePointer,
  ZoomIn,
  ZoomOut,
  Maximize,
  Copy,
  Scissors,
  Clipboard,
  Undo,
  Redo,
  Save,
  FileInput,
  FileOutput,
  Settings,
  Cpu,
  Zap,
  GitBranch,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Magnet,
  Crosshair,
  PenTool,
  Type,
  Eraser,
  Pipette,
  Database,
  Cloud,
  Users,
  Bot,
  Sparkles,
  Brain,
  Activity,
  BarChart3
} from "lucide-react";
import { croweCADEngine } from "@/lib/crowe-cad-engine";
import { useToast } from "@/hooks/use-toast";

interface CroweCADInterfaceProps {
  facilityId?: string;
  onDesignComplete?: (design: any) => void;
}

export function CroweCADInterface({ facilityId, onDesignComplete }: CroweCADInterfaceProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [currentLayer, setCurrentLayer] = useState<string>('0');
  const [snapSettings, setSnapSettings] = useState({
    grid: true,
    object: true,
    angle: true,
    distance: 0.1
  });
  const [aiFeatures, setAiFeatures] = useState({
    optimization: true,
    autoConstraints: true,
    smartDimensions: true,
    patternRecognition: true,
    assemblyPrediction: true
  });
  const [designStats, setDesignStats] = useState({
    entities: 0,
    constraints: 0,
    layers: 4,
    fileSize: '0 KB'
  });
  const { toast } = useToast();

  // Initialize CAD engine
  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      engineRef.current = croweCADEngine.initialize(canvasRef.current);
      
      // Handle resize
      const handleResize = () => {
        if (engineRef.current && canvasRef.current) {
          engineRef.current.handleResize(
            canvasRef.current.clientWidth,
            canvasRef.current.clientHeight
          );
        }
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (engineRef.current) {
          engineRef.current.dispose();
        }
      };
    }
  }, []);

  // Drawing tools
  const drawingTools = [
    { id: 'select', icon: MousePointer, name: 'Select' },
    { id: 'line', icon: PenTool, name: 'Line' },
    { id: 'rectangle', icon: Square, name: 'Rectangle' },
    { id: 'circle', icon: Circle, name: 'Circle' },
    { id: 'polygon', icon: Pentagon, name: 'Polygon' },
    { id: 'arc', icon: GitBranch, name: 'Arc' },
    { id: 'spline', icon: GitBranch, name: 'Spline' },
    { id: 'text', icon: Type, name: 'Text' },
    { id: 'dimension', icon: Ruler, name: 'Dimension' },
    { id: 'erase', icon: Eraser, name: 'Erase' }
  ];

  // Modification tools
  const modifyTools = [
    { id: 'move', icon: Move, name: 'Move', action: () => console.log('Move') },
    { id: 'rotate', icon: RotateCw, name: 'Rotate', action: () => console.log('Rotate') },
    { id: 'scale', icon: Scale, name: 'Scale', action: () => console.log('Scale') },
    { id: 'copy', icon: Copy, name: 'Copy', action: () => console.log('Copy') },
    { id: 'mirror', icon: GitBranch, name: 'Mirror', action: () => console.log('Mirror') },
    { id: 'array', icon: Grid3x3, name: 'Array', action: () => console.log('Array') },
    { id: 'trim', icon: Scissors, name: 'Trim', action: () => console.log('Trim') },
    { id: 'extend', icon: Maximize, name: 'Extend', action: () => console.log('Extend') }
  ];

  // AI Actions
  const aiActions = [
    {
      id: 'optimize',
      name: 'Optimize Design',
      icon: Zap,
      action: async () => {
        toast({
          title: "AI Optimization",
          description: "Analyzing and optimizing design parameters..."
        });
        // Trigger AI optimization
      }
    },
    {
      id: 'constraints',
      name: 'Auto Constraints',
      icon: Lock,
      action: async () => {
        if (engineRef.current) {
          await engineRef.current.solveConstraints();
          toast({
            title: "Constraints Applied",
            description: "AI has automatically applied geometric constraints"
          });
        }
      }
    },
    {
      id: 'patterns',
      name: 'Detect Patterns',
      icon: Grid3x3,
      action: async () => {
        if (engineRef.current) {
          const patterns = await engineRef.current.detectPatterns();
          toast({
            title: "Pattern Detection",
            description: `Found ${patterns.linear.length} linear, ${patterns.circular.length} circular patterns`
          });
        }
      }
    },
    {
      id: 'assembly',
      name: 'Assembly Assist',
      icon: Database,
      action: async () => {
        toast({
          title: "Assembly Assistant",
          description: "AI is analyzing parts for assembly suggestions..."
        });
      }
    }
  ];

  return (
    <div className="flex h-full bg-[#1e1e1e]">
      {/* Left Toolbar - Drawing Tools */}
      <div className="w-16 bg-[#2d2d30] border-r border-[#3e3e42] p-2">
        <TooltipProvider>
          <div className="space-y-1">
            {drawingTools.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={selectedTool === tool.id ? "secondary" : "ghost"}
                    className={`w-12 h-12 ${
                      selectedTool === tool.id 
                        ? 'bg-[#094771] hover:bg-[#0e5a8e]' 
                        : 'hover:bg-[#3e3e42]'
                    }`}
                    onClick={() => setSelectedTool(tool.id)}
                  >
                    <tool.icon className="w-5 h-5 text-[#cccccc]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tool.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar - Modification & View Tools */}
        <div className="h-14 bg-[#2d2d30] border-b border-[#3e3e42] flex items-center px-4 gap-2">
          <div className="flex gap-1">
            {modifyTools.map((tool) => (
              <TooltipProvider key={tool.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-[#3e3e42]"
                      onClick={tool.action}
                    >
                      <tool.icon className="w-4 h-4 text-[#cccccc]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tool.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          <div className="h-6 w-px bg-[#3e3e42]" />

          {/* View Controls */}
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="hover:bg-[#3e3e42]">
              <ZoomIn className="w-4 h-4 text-[#cccccc]" />
            </Button>
            <Button size="sm" variant="ghost" className="hover:bg-[#3e3e42]">
              <ZoomOut className="w-4 h-4 text-[#cccccc]" />
            </Button>
            <Button size="sm" variant="ghost" className="hover:bg-[#3e3e42]">
              <Maximize className="w-4 h-4 text-[#cccccc]" />
            </Button>
          </div>

          <div className="h-6 w-px bg-[#3e3e42]" />

          {/* Snap Settings */}
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={snapSettings.grid ? "secondary" : "ghost"}
                    className={snapSettings.grid ? "bg-[#094771]" : ""}
                    onClick={() => setSnapSettings(s => ({ ...s, grid: !s.grid }))}
                  >
                    <Grid3x3 className="w-4 h-4 text-[#cccccc]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Snap to Grid</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={snapSettings.object ? "secondary" : "ghost"}
                    className={snapSettings.object ? "bg-[#094771]" : ""}
                    onClick={() => setSnapSettings(s => ({ ...s, object: !s.object }))}
                  >
                    <Magnet className="w-4 h-4 text-[#cccccc]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Object Snap</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex-1" />

          {/* AI Features Toggle */}
          <div className="flex gap-2">
            {aiActions.map((action) => (
              <TooltipProvider key={action.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-[#3e3e42] gap-2"
                      onClick={action.action}
                    >
                      <action.icon className="w-4 h-4 text-[#00b4d8]" />
                      <span className="text-xs text-[#cccccc]">{action.name}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI-Powered {action.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-[#1e1e1e]">
          <div 
            ref={canvasRef}
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(62, 62, 66, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(62, 62, 66, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '10px 10px'
            }}
          />

          {/* Status Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#007acc] flex items-center px-4 text-white text-xs">
            <div className="flex gap-4">
              <span>X: 0.000</span>
              <span>Y: 0.000</span>
              <span>Z: 0.000</span>
            </div>
            <div className="flex-1" />
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Layer: {currentLayer}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {designStats.entities} entities
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {designStats.constraints} constraints
              </span>
              <span className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                AI: Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Properties & AI */}
      <div className="w-80 bg-[#252526] border-l border-[#3e3e42] p-4">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#3e3e42]">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            <Card className="bg-[#1e1e1e] border-[#3e3e42]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#cccccc]">Object Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-[#969696]">Type</Label>
                  <Input 
                    value="No selection" 
                    disabled 
                    className="bg-[#3e3e42] border-[#3e3e42] text-[#cccccc]"
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#969696]">Layer</Label>
                  <Input 
                    value={currentLayer} 
                    className="bg-[#3e3e42] border-[#3e3e42] text-[#cccccc]"
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#969696]">Color</Label>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-[#00ff00] rounded" />
                    <Input 
                      value="#00ff00" 
                      className="bg-[#3e3e42] border-[#3e3e42] text-[#cccccc]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layers" className="space-y-4">
            <Card className="bg-[#1e1e1e] border-[#3e3e42]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#cccccc]">Layer Manager</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['0', 'construction', 'dimensions', 'annotations'].map((layer) => (
                  <div
                    key={layer}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      currentLayer === layer ? 'bg-[#094771]' : 'hover:bg-[#3e3e42]'
                    }`}
                    onClick={() => setCurrentLayer(layer)}
                  >
                    <span className="text-sm text-[#cccccc]">{layer}</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="w-6 h-6">
                        <Eye className="w-3 h-3 text-[#cccccc]" />
                      </Button>
                      <Button size="icon" variant="ghost" className="w-6 h-6">
                        <Lock className="w-3 h-3 text-[#cccccc]" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card className="bg-[#1e1e1e] border-[#3e3e42]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#cccccc] flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#00b4d8]" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(aiFeatures).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-xs text-[#969696] capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Button
                      size="sm"
                      variant={enabled ? "secondary" : "ghost"}
                      className={enabled ? "bg-[#094771]" : ""}
                      onClick={() => setAiFeatures(f => ({ ...f, [key as keyof typeof aiFeatures]: !f[key as keyof typeof aiFeatures] }))}
                    >
                      {enabled ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                ))}

                <div className="pt-3 border-t border-[#3e3e42]">
                  <Button className="w-full bg-[#00b4d8] hover:bg-[#0090b8] text-white">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Run AI Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1e1e1e] border-[#3e3e42]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#cccccc]">Design Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#969696]">Optimization Score</span>
                    <span className="text-[#00ff00]">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#969696]">Constraint Violations</span>
                    <span className="text-[#ffcc00]">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#969696]">Pattern Efficiency</span>
                    <span className="text-[#00ff00]">High</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#969696]">Assembly Ready</span>
                    <span className="text-[#00ff00]">Yes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
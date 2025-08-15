import { useState } from "react";
import { 
  MousePointer2,
  Square,
  Circle,
  Hexagon,
  Triangle,
  PenTool,
  Type,
  Ruler,
  Move,
  RotateCw,
  Copy,
  Scissors,
  Trash2,
  Grid3x3,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Home,
  Package,
  FileUp,
  FileDown,
  Beaker,
  Camera,
  Sparkles,
  Wind,
  Factory,
  Database,
  Thermometer,
  Droplets,
  Zap,
  Activity,
  Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RibbonToolbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onToolSelect?: (tool: string) => void;
}

export function RibbonToolbar({ 
  activeTab = "home",
  onTabChange,
  onToolSelect 
}: RibbonToolbarProps) {
  const [selectedTool, setSelectedTool] = useState<string>("select");

  const handleToolClick = (tool: string) => {
    setSelectedTool(tool);
    onToolSelect?.(tool);
  };

  const ToolButton = ({ 
    icon: Icon, 
    label, 
    tool,
    shortcut 
  }: { 
    icon: any; 
    label: string; 
    tool: string;
    shortcut?: string;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={selectedTool === tool ? "secondary" : "ghost"}
            size="sm"
            className="h-16 w-16 flex-col gap-1 p-2"
            onClick={() => handleToolClick(tool)}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px]">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
          {shortcut && (
            <p className="text-xs text-muted-foreground">{shortcut}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="ribbon-toolbar">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="ribbon-tabs">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="insert">Insert</TabsTrigger>
          <TabsTrigger value="annotate">Annotate</TabsTrigger>
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="data">Data Exchange</TabsTrigger>
        </TabsList>

        <div className="ribbon-content">
          <TabsContent value="home" className="ribbon-panel">
            {/* Selection Tools */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Selection</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={MousePointer2} label="Select" tool="select" shortcut="S" />
                <ToolButton icon={Move} label="Move" tool="move" shortcut="M" />
                <ToolButton icon={RotateCw} label="Rotate" tool="rotate" shortcut="R" />
              </div>
            </div>

            <Separator orientation="vertical" className="h-16 mx-2" />

            {/* Modify Tools */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Modify</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={Copy} label="Copy" tool="copy" shortcut="Ctrl+C" />
                <ToolButton icon={Scissors} label="Cut" tool="cut" shortcut="Ctrl+X" />
                <ToolButton icon={Trash2} label="Delete" tool="delete" shortcut="Del" />
              </div>
            </div>

            <Separator orientation="vertical" className="h-16 mx-2" />

            {/* Draw Tools */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Draw</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={Square} label="Rectangle" tool="rectangle" shortcut="Shift+R" />
                <ToolButton icon={Circle} label="Circle" tool="circle" shortcut="C" />
                <ToolButton icon={PenTool} label="Line" tool="line" shortcut="L" />
              </div>
            </div>

            <Separator orientation="vertical" className="h-16 mx-2" />

            {/* Layers */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Layers</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={Layers} label="Layers" tool="layers" shortcut="Ctrl+L" />
                <ToolButton icon={Eye} label="Show" tool="show" />
                <ToolButton icon={Lock} label="Lock" tool="lock" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insert" className="ribbon-panel">
            {/* Shapes */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Shapes</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={Square} label="Rectangle" tool="insert-rect" />
                <ToolButton icon={Circle} label="Circle" tool="insert-circle" />
                <ToolButton icon={Triangle} label="Triangle" tool="insert-triangle" />
                <ToolButton icon={Hexagon} label="Hexagon" tool="insert-hexagon" />
              </div>
            </div>

            <Separator orientation="vertical" className="h-16 mx-2" />

            {/* Equipment Types */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Equipment</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={Beaker} label="Bioreactor" tool="insert-bioreactor" />
                <ToolButton icon={Wind} label="HVAC" tool="insert-hvac" />
                <ToolButton icon={Factory} label="Processing" tool="insert-processing" />
                <ToolButton icon={Package} label="Storage" tool="insert-storage" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="annotate" className="ribbon-panel">
            {/* Text Tools */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Text</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={Type} label="Text" tool="text" shortcut="T" />
                <ToolButton icon={Ruler} label="Dimension" tool="dimension" shortcut="D" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="view" className="ribbon-panel">
            {/* Zoom Tools */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Zoom</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={ZoomIn} label="Zoom In" tool="zoom-in" shortcut="+" />
                <ToolButton icon={ZoomOut} label="Zoom Out" tool="zoom-out" shortcut="-" />
                <ToolButton icon={Maximize2} label="Fit" tool="zoom-fit" shortcut="F" />
                <ToolButton icon={Home} label="Home" tool="zoom-home" shortcut="H" />
              </div>
            </div>

            <Separator orientation="vertical" className="h-16 mx-2" />

            {/* Display */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Display</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={Grid3x3} label="Grid" tool="toggle-grid" shortcut="G" />
                <ToolButton icon={Layers} label="Layers" tool="view-layers" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="ribbon-panel">
            {/* Equipment Categories */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Bioreactors</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={Beaker} label="Stirred" tool="eq-stirred" />
                <ToolButton icon={Beaker} label="Airlift" tool="eq-airlift" />
                <ToolButton icon={Beaker} label="Packed" tool="eq-packed" />
              </div>
            </div>

            <Separator orientation="vertical" className="h-16 mx-2" />

            {/* Environmental */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Environmental</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={Thermometer} label="Temperature" tool="eq-temp" />
                <ToolButton icon={Droplets} label="Humidity" tool="eq-humidity" />
                <ToolButton icon={Wind} label="Airflow" tool="eq-airflow" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="ribbon-panel">
            {/* Analysis Tools */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Analysis</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={Activity} label="Performance" tool="analyze-perf" />
                <ToolButton icon={Workflow} label="Flow" tool="analyze-flow" />
                <ToolButton icon={Zap} label="Energy" tool="analyze-energy" />
                <ToolButton icon={Database} label="Data" tool="analyze-data" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="ribbon-panel">
            {/* Import/Export Tools */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Import</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={FileUp} label="Import DXF" tool="import-dxf" />
                <ToolButton icon={FileUp} label="Import SVG" tool="import-svg" />
                <ToolButton icon={FileUp} label="Import DWG" tool="import-dwg" />
              </div>
            </div>

            <Separator orientation="vertical" className="h-16 mx-2" />

            {/* Export Tools */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Export</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={FileDown} label="Export DXF" tool="export-dxf" />
                <ToolButton icon={FileDown} label="Export SVG" tool="export-svg" />
                <ToolButton icon={FileDown} label="Export PDF" tool="export-pdf" />
                <ToolButton icon={FileDown} label="Export PNG" tool="export-png" />
              </div>
            </div>

            <Separator orientation="vertical" className="h-16 mx-2" />

            {/* Vision Analysis Tools */}
            <div className="ribbon-group">
              <div className="ribbon-group-label">Vision AI</div>
              <div className="ribbon-group-tools">
                <ToolButton icon={Eye} label="Analyze Image" tool="vision-analyze" />
                <ToolButton icon={Camera} label="Photo to CAD" tool="vision-photo" />
                <ToolButton icon={Sparkles} label="Sketch to CAD" tool="vision-sketch" />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
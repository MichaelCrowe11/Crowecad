import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Wrench,
  Ruler,
  Calculator,
  Zap,
  Gauge,
  Settings,
  Target,
  TrendingUp,
  BarChart3,
  Layers,
  Grid3X3,
  Move3D,
  RotateCw,
  Copy,
  Scissors,
  Undo,
  Redo,
  Search,
  Filter,
  Maximize,
  Minimize,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedToolsPanelProps {
  facilityId: string;
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  onParameterChange: (parameter: string, value: any) => void;
}

export function EnhancedToolsPanel({ 
  facilityId, 
  selectedTool, 
  onToolSelect, 
  onParameterChange 
}: EnhancedToolsPanelProps) {
  const [precisionMode, setPrecisionMode] = useState(true);
  const [snapDistance, setSnapDistance] = useState([10]);
  const [gridSize, setGridSize] = useState([20]);
  const [rotationStep, setRotationStep] = useState([15]);
  const [measurementUnit, setMeasurementUnit] = useState("meters");
  const [visibilityLayers, setVisibilityLayers] = useState({
    equipment: true,
    zones: true,
    grid: true,
    annotations: true,
    connections: false
  });
  const { toast } = useToast();

  const tools = [
    { id: "select", name: "Select", icon: Target, category: "basic" },
    { id: "move", name: "Move", icon: Move3D, category: "transform" },
    { id: "rotate", name: "Rotate", icon: RotateCw, category: "transform" },
    { id: "copy", name: "Copy", icon: Copy, category: "edit" },
    { id: "delete", name: "Delete", icon: Scissors, category: "edit" },
    { id: "measure", name: "Measure", icon: Ruler, category: "analysis" },
    { id: "area", name: "Area", icon: Grid3X3, category: "analysis" },
    { id: "align", name: "Align", icon: Layers, category: "precision" },
    { id: "distribute", name: "Distribute", icon: BarChart3, category: "precision" },
  ];

  const handleToolSelect = (toolId: string) => {
    onToolSelect(toolId);
    toast({
      title: "Tool Selected",
      description: `Active: ${tools.find(t => t.id === toolId)?.name}`,
    });
  };

  const handleParameterChange = (parameter: string, value: any) => {
    onParameterChange(parameter, value);
    
    switch (parameter) {
      case 'snapDistance':
        setSnapDistance([value]);
        break;
      case 'gridSize':
        setGridSize([value]);
        break;
      case 'rotationStep':
        setRotationStep([value]);
        break;
    }
  };

  const toggleLayer = (layer: string) => {
    setVisibilityLayers(prev => ({
      ...prev,
      [layer]: !prev[layer as keyof typeof prev]
    }));
    onParameterChange(`layer_${layer}`, !visibilityLayers[layer as keyof typeof visibilityLayers]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          Enhanced Tools & Precision
        </CardTitle>
        <CardDescription>
          Professional CAD tools with precision controls
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="precision">Precision</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {tools.map(tool => (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? "default" : "outline"}
                  size="sm"
                  className="flex flex-col h-12 gap-1"
                  onClick={() => handleToolSelect(tool.id)}
                >
                  <tool.icon className="w-4 h-4" />
                  <span className="text-xs">{tool.name}</span>
                </Button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Actions</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Undo className="w-3 h-3" />
                  Undo
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Redo className="w-3 h-3" />
                  Redo
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Search className="w-3 h-3" />
                  Find
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-3 h-3" />
                  Filter
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Precision Tab */}
          <TabsContent value="precision" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Precision Mode</Label>
              <Badge variant={precisionMode ? "default" : "outline"}>
                {precisionMode ? "ON" : "OFF"}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Snap Distance: {snapDistance[0]}px</Label>
                <Slider
                  value={snapDistance}
                  onValueChange={(value) => handleParameterChange('snapDistance', value[0])}
                  max={50}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Grid Size: {gridSize[0]}px</Label>
                <Slider
                  value={gridSize}
                  onValueChange={(value) => handleParameterChange('gridSize', value[0])}
                  max={100}
                  min={5}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Rotation Step: {rotationStep[0]}°</Label>
                <Slider
                  value={rotationStep}
                  onValueChange={(value) => handleParameterChange('rotationStep', value[0])}
                  max={90}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Measurement Unit</Label>
                <Select value={measurementUnit} onValueChange={setMeasurementUnit}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meters">Meters</SelectItem>
                    <SelectItem value="feet">Feet</SelectItem>
                    <SelectItem value="inches">Inches</SelectItem>
                    <SelectItem value="millimeters">Millimeters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Layers Tab */}
          <TabsContent value="layers" className="space-y-4">
            <div className="space-y-3">
              {Object.entries(visibilityLayers).map(([layer, visible]) => (
                <div key={layer} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {visible ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <Label className="capitalize">{layer}</Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLayer(layer)}
                  >
                    {visible ? "Hide" : "Show"}
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Maximize className="w-3 h-3" />
                Show All
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Minimize className="w-3 h-3" />
                Hide All
              </Button>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="flex flex-col h-12 gap-1">
                <Calculator className="w-4 h-4" />
                <span className="text-xs">Calculate</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-12 gap-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Analyze</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-12 gap-1">
                <Gauge className="w-4 h-4" />
                <span className="text-xs">Measure</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-12 gap-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs">Validate</span>
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Measurements</Label>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Area:</span>
                  <span className="font-mono">1,200 m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equipment Count:</span>
                  <span className="font-mono">24 items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zone Coverage:</span>
                  <span className="font-mono">85%</span>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full gap-2">
              <BarChart3 className="w-3 h-3" />
              Generate Report
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
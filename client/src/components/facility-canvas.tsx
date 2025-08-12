import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MousePointer, 
  Hand, 
  ZoomIn, 
  ZoomOut,
  Undo2,
  Redo2,
  Play,
  Download,
  CheckCircle
} from "lucide-react";
import { useFacilityZones, useFacilityEquipment, useCreateEquipment } from "@/hooks/use-facility";
import { useToast } from "@/hooks/use-toast";
import { generateEquipmentSVG, generateZoneSVG, generateGridSVG, snapToGrid, type Point } from "@/lib/svg-utils";
import type { EquipmentType, EquipmentInstance, Zone } from "@shared/schema";

interface FacilityCanvasProps {
  facilityId: string;
  selectedEquipment: EquipmentInstance | null;
  onEquipmentSelect: (equipment: EquipmentInstance | null) => void;
  onEquipmentDrop?: (equipmentType: EquipmentType, position: Point) => void;
}

type Tool = 'select' | 'pan' | 'zoom';

export function FacilityCanvas({ 
  facilityId, 
  selectedEquipment, 
  onEquipmentSelect,
  onEquipmentDrop 
}: FacilityCanvasProps) {
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [zoom, setZoom] = useState(75);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 });
  
  const svgRef = useRef<SVGSVGElement>(null);
  const { toast } = useToast();

  const { data: zones = [] } = useFacilityZones(facilityId);
  const { data: equipment = [] } = useFacilityEquipment(facilityId);
  const createEquipment = useCreateEquipment();

  const handleToolChange = (tool: Tool) => {
    setCurrentTool(tool);
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(200, prev + 25));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(25, prev - 25));
  };

  const handleFitView = () => {
    setZoom(75);
    setViewBox({ x: 0, y: 0, width: 1200, height: 800 });
  };

  const getMousePosition = useCallback((event: React.MouseEvent<SVGSVGElement>): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    
    return {
      x: (event.clientX - rect.left) * scaleX + viewBox.x,
      y: (event.clientY - rect.top) * scaleY + viewBox.y,
    };
  }, [viewBox]);

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    const position = getMousePosition(event);
    setDragStart(position);
    
    if (currentTool === 'pan') {
      setIsPanning(true);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!dragStart) return;
    
    if (isPanning && currentTool === 'pan') {
      const current = getMousePosition(event);
      const deltaX = dragStart.x - current.x;
      const deltaY = dragStart.y - current.y;
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      
      setDragStart(current);
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
    setIsPanning(false);
  };

  const handleEquipmentClick = (event: React.MouseEvent, equipmentItem: EquipmentInstance) => {
    event.stopPropagation();
    if (currentTool === 'select') {
      onEquipmentSelect(equipmentItem);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (currentTool === 'select' && !isPanning) {
      onEquipmentSelect(null);
    }
  };

  const handleDrop = useCallback(async (event: React.DragEvent<SVGSVGElement>) => {
    event.preventDefault();
    
    try {
      const equipmentTypeData = event.dataTransfer.getData('application/json');
      if (!equipmentTypeData) return;
      
      const equipmentType: EquipmentType = JSON.parse(equipmentTypeData);
      const dropPosition = getMousePosition(event as any);
      const snappedPosition = snapToGrid(dropPosition);
      
      await createEquipment.mutateAsync({
        facilityId,
        equipmentTypeId: equipmentType.id,
        name: `${equipmentType.name} ${Date.now()}`,
        x: String(snappedPosition.x),
        y: String(snappedPosition.y),
        rotation: '0',
        scale: '1.0',
        properties: equipmentType.defaultProperties || {},
      });
      
      toast({
        title: "Equipment Added",
        description: `${equipmentType.name} has been added to the facility.`,
      });
      
      onEquipmentDrop?.(equipmentType, snappedPosition);
    } catch (error) {
      toast({
        title: "Failed to Add Equipment",
        description: "Could not add equipment to the facility.",
        variant: "destructive",
      });
    }
  }, [facilityId, createEquipment, getMousePosition, toast, onEquipmentDrop]);

  const handleDragOver = (event: React.DragEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const generateFacilitySVG = () => {
    const gridSVG = generateGridSVG(viewBox.width, viewBox.height);
    
    const zonesSVG = zones.map(zone => 
      generateZoneSVG({
        id: zone.id,
        name: zone.name,
        type: zone.type,
        x: parseFloat(zone.x),
        y: parseFloat(zone.y),
        width: parseFloat(zone.width),
        height: parseFloat(zone.height),
        color: zone.color || '#1976D2',
      })
    ).join('');
    
    const equipmentSVG = equipment.map((item: any) => 
      generateEquipmentSVG({
        id: item.id,
        type: item.equipmentType?.category || 'equipment',
        position: { x: parseFloat(item.x), y: parseFloat(item.y) },
        rotation: parseFloat(item.rotation || '0'),
        scale: parseFloat(item.scale || '1'),
        properties: { name: item.name, ...(item.properties || {}) },
      })
    ).join('');
    
    const selectionSVG = selectedEquipment ? `
      <rect 
        x="${parseFloat(selectedEquipment.x) - 30}" 
        y="${parseFloat(selectedEquipment.y) - 30}" 
        width="60" 
        height="60" 
        fill="none" 
        stroke="#FF6B35" 
        stroke-width="2" 
        stroke-dasharray="5,5"
      >
        <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite"/>
      </rect>
    ` : '';
    
    return `${gridSVG}${zonesSVG}${equipmentSVG}${selectionSVG}`;
  };

  return (
    <main className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* View Controls */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={currentTool === 'select' ? 'default' : 'outline'}
              onClick={() => handleToolChange('select')}
              data-testid="button-select-tool"
            >
              <MousePointer className="w-4 h-4 mr-1" />
              Select
            </Button>
            <Button
              size="sm"
              variant={currentTool === 'pan' ? 'default' : 'outline'}
              onClick={() => handleToolChange('pan')}
              data-testid="button-pan-tool"
            >
              <Hand className="w-4 h-4 mr-1" />
              Pan
            </Button>
            <Button
              size="sm"
              variant={currentTool === 'zoom' ? 'default' : 'outline'}
              onClick={() => handleToolChange('zoom')}
              data-testid="button-zoom-tool"
            >
              <ZoomIn className="w-4 h-4 mr-1" />
              Zoom
            </Button>
          </div>
          
          <div className="border-l border-gray-300 h-6"></div>
          
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" onClick={handleZoomOut} data-testid="button-zoom-out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Badge variant="outline" className="px-2 py-1 text-xs" data-testid="text-zoom-level">
              {zoom}%
            </Badge>
            <Button size="sm" variant="ghost" onClick={handleZoomIn} data-testid="button-zoom-in">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleFitView} data-testid="button-fit-view">
              Fit
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Action Buttons */}
          <Button size="sm" variant="outline" data-testid="button-undo">
            <Undo2 className="w-4 h-4 mr-1" />
            Undo
          </Button>
          <Button size="sm" variant="outline" data-testid="button-redo">
            <Redo2 className="w-4 h-4 mr-1" />
            Redo
          </Button>
          
          <div className="border-l border-gray-300 h-6"></div>
          
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-generate"
          >
            <Play className="w-4 h-4 mr-2" />
            Generate
          </Button>
          <Button size="sm" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-gray-50">
        <div className="absolute inset-0" style={{ cursor: currentTool === 'pan' ? 'grab' : 'default' }}>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            className="absolute inset-0"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleCanvasClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            data-testid="svg-facility-canvas"
          >
            <g dangerouslySetInnerHTML={{ __html: generateFacilitySVG() }} />
            
            {/* Equipment click handlers */}
            {equipment.map((item: any) => (
              <g key={item.id}>
                <rect
                  x={parseFloat(item.x) - 30}
                  y={parseFloat(item.y) - 30}
                  width="60"
                  height="60"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => handleEquipmentClick(e as any, item)}
                  data-testid={`equipment-clickable-${item.id}`}
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Status Message */}
        <Card className="absolute top-4 left-4 max-w-sm">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-900">Layout Generated</div>
                <div className="text-xs text-gray-600">
                  Facility layout optimized for production capacity
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Overlay */}
        {createEquipment.isPending && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <div className="text-lg font-medium text-gray-900">Adding Equipment...</div>
              <div className="text-sm text-gray-600">Processing placement request</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

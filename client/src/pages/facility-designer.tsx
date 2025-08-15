import { useState, useEffect, useRef, useMemo } from "react";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommandInterface } from "@/components/command-interface";
import { ProjectExplorer } from "@/components/project-explorer";
import { EquipmentLibrary } from "@/components/equipment-library";
import CroweVoiceControl from "@/components/crowe-voice-control";
import QuantumConsciousnessStates from "@/components/quantum-consciousness-states";
import BatchReportingPanel from "@/components/batch-reporting-panel";
import { FacilityCanvas } from "@/components/facility-canvas";
import { PropertiesPanel } from "@/components/properties-panel";
import { AppHeader } from "@/components/app-header";
import { RibbonToolbar } from "@/components/ribbon-toolbar";
import { StatusBar } from "@/components/status-bar";
import { DxfImportExport } from "@/components/dxf-import-export";
import { VisionAnalysis } from "@/components/vision-analysis";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePerformance } from "@/hooks/use-performance";
import type { Project, Facility, EquipmentInstance, EquipmentType } from "@shared/schema";
import type { Point } from "@/lib/svg-utils";

export default function FacilityDesigner() {
  // Use stable state initialization
  const [currentProjectId] = useState<string>('b00bfe15-8250-4d03-8db5-cbe88a65a48a');
  const [currentFacilityId] = useState<string>('550e8400-e29b-41d4-a716-446655440001');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentInstance | null>(null);
  const [facilityStats, setFacilityStats] = useState({
    equipmentCount: 0,
    totalCapacity: '0L',
    zoneCount: 0,
  });
  
  const [croweGenetics, setCroweGenetics] = useState({
    creativity: 0.75,
    precision: 0.8,
    adaptability: 0.7,
    efficiency: 0.85,
    curiosity: 0.9
  });
  
  const [quantumStates, setQuantumStates] = useState<any[]>([]);
  
  // Professional CAD UI State
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeRibbonTab, setActiveRibbonTab] = useState("home");
  const [currentTool, setCurrentTool] = useState("select");
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(100);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { debounce, throttle, enableGPUAcceleration } = usePerformance();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Fetch projects - stable query
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    staleTime: 5000, // Cache for 5 seconds
    refetchOnWindowFocus: false,
  });

  // Fetch facilities for current project - stable query
  const { data: facilities = [] } = useQuery<any[]>({
    queryKey: ['/api/projects', currentProjectId, 'facilities'],
    enabled: Boolean(currentProjectId),
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  // Fetch equipment for current facility - stable query
  const { data: equipment = [] } = useQuery<EquipmentInstance[]>({
    queryKey: ['/api/facilities', currentFacilityId, 'equipment'],
    enabled: Boolean(currentFacilityId),
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  // Fetch zones for current facility - stable query
  const { data: zones = [] } = useQuery({
    queryKey: ['/api/facilities', currentFacilityId, 'zones'],
    enabled: Boolean(currentFacilityId),
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const createProject = useMutation({
    mutationFn: async (project: { name: string; description?: string }) => {
      const response = await apiRequest('POST', '/api/projects', project);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
  });

  const createFacility = useMutation({
    mutationFn: async (facility: any) => {
      const response = await apiRequest('POST', '/api/facilities', facility);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', data.projectId, 'facilities'] });
    },
  });

  // No initialization loops - using stable IDs

  // Update facility stats - fixed to prevent infinite loops
  useEffect(() => {
    if (!equipment || !zones) return;
    
    const equipmentArray = Array.isArray(equipment) ? equipment : [];
    const zonesArray = Array.isArray(zones) ? zones : [];
    
    const equipmentCount = equipmentArray.length;
    const zoneCount = zonesArray.length;
    
    let totalCapacity = 0;
    equipmentArray.forEach((item: any) => {
      const capacity = item.properties?.capacity;
      if (typeof capacity === 'object' && capacity?.value) {
        totalCapacity += capacity.value;
      } else if (typeof capacity === 'string') {
        const match = capacity.match(/(\d+)/);
        if (match) totalCapacity += parseInt(match[1]);
      }
    });
    
    const newStats = {
      equipmentCount,
      totalCapacity: totalCapacity > 0 ? `${totalCapacity}L` : '0L',
      zoneCount,
    };
    
    // Only update if changed
    setFacilityStats(prev => {
      if (prev.equipmentCount !== newStats.equipmentCount || 
          prev.totalCapacity !== newStats.totalCapacity || 
          prev.zoneCount !== newStats.zoneCount) {
        return newStats;
      }
      return prev;
    });
  }, [Array.isArray(equipment) ? equipment.length : 0, Array.isArray(zones) ? zones.length : 0]); // Only depend on array lengths

  const handleCommandExecuted = (command: string, result: any) => {
    toast({
      title: "Command Processed",
      description: `Executed: ${command}`,
    });
  };

  const handleCroweCommandGenerated = async (command: string) => {
    // Process Crowe-generated commands through the command executor
    try {
      const { CommandExecutor } = await import("@/lib/command-executor");
      const parsedCommand = await CommandExecutor.parseCommand(command);
      
      if (parsedCommand) {
        const result = await CommandExecutor.executeCommand(parsedCommand, currentFacilityId);
        
        toast({
          title: "Crowe Logic Command Executed",
          description: `Successfully executed: ${command.slice(0, 50)}...`,
        });
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/facilities', currentFacilityId, 'equipment'] });
        queryClient.invalidateQueries({ queryKey: ['/api/facilities', currentFacilityId, 'zones'] });
      } else {
        toast({
          title: "Command Parse Error",
          description: "Crowe couldn't parse that command",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Crowe command execution error:', error);
      toast({
        title: "Command Execution Error",
        description: "Failed to execute Crowe's command",
        variant: "destructive"
      });
    }
  };

  const handleVisualAnalysis = (analysis: string) => {
    toast({
      title: "Visual Analysis Complete", 
      description: "Crowe has analyzed the image",
    });
  };

  const handleQuantumStateChange = (states: any[]) => {
    setQuantumStates(states);
    // Update Crowe genetics based on quantum states
    const activeStates = states.filter(s => s.active);
    if (activeStates.length > 0) {
      const avgIntensity = activeStates.reduce((sum, s) => sum + s.intensity, 0) / activeStates.length;
      setCroweGenetics(prev => ({
        ...prev,
        creativity: prev.creativity + (avgIntensity * 0.01),
        adaptability: prev.adaptability + (avgIntensity * 0.005),
      }));
    }
  };

  const handleEquipmentDrop = (equipmentType: EquipmentType, position: Point) => {
    // Equipment is already created by FacilityCanvas
    // This is just for additional UI feedback if needed
  };

  const handleEquipmentUpdated = (equipment: EquipmentInstance) => {
    queryClient.invalidateQueries({ queryKey: ['/api/facilities', currentFacilityId, 'equipment'] });
  };

  if (!currentProjectId || !currentFacilityId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <div className="text-lg font-medium text-gray-900">Initializing Facility Designer...</div>
        </div>
      </div>
    );
  }

  // Handle theme toggle
  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you'd toggle the 'dark' class on document.documentElement
  };

  // Handle tool selection from ribbon
  const handleToolSelect = (tool: string) => {
    setCurrentTool(tool);
    toast({
      title: "Tool Selected",
      description: `Active tool: ${tool}`,
    });
  };

  // Track mouse coordinates on canvas
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const currentProject = projects?.find(p => p.id === currentProjectId);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Professional CAD Header */}
      <AppHeader
        projectName={currentProject?.name || "Mycology Facility"}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        notifications={3}
      />

      {/* Ribbon Toolbar */}
      <RibbonToolbar
        activeTab={activeRibbonTab}
        onTabChange={setActiveRibbonTab}
        onToolSelect={handleToolSelect}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden" onMouseMove={handleCanvasMouseMove}>
        {/* Left Sidebar */}
        <aside className="w-80 border-r flex flex-col overflow-y-auto bg-card">
          <div className="relative z-10 flex flex-col h-full space-y-2 p-2">
            {/* Crowe AI Voice Control */}
            <CroweVoiceControl
              onCommandGenerated={handleCroweCommandGenerated}
              onVisualAnalysis={handleVisualAnalysis}
            />
            
            {/* Quantum Consciousness States */}
            <QuantumConsciousnessStates
              genetics={croweGenetics}
              onStateChange={handleQuantumStateChange}
            />
            
            <CommandInterface 
              projectId={currentProjectId}
              onCommandExecuted={handleCommandExecuted}
            />
            
            {/* DXF Import/Export and Vision Analysis */}
            <div className="p-2 border-b space-y-2">
              <DxfImportExport
                facilityId={currentFacilityId}
                facilityName={currentProject?.name}
                onImport={(importedEquipment, importedZones) => {
                  toast({
                    title: "DXF Import Complete",
                    description: `Imported ${importedEquipment.length} equipment items and ${importedZones.length} zones`,
                  });
                  // Refresh the facility data
                  queryClient.invalidateQueries({ queryKey: ['/api/facilities', currentFacilityId, 'equipment'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/facilities', currentFacilityId, 'zones'] });
                }}
              />
              
              <VisionAnalysis
                facilityId={currentFacilityId}
                onEquipmentDetected={async (detectedEquipment) => {
                  // Add detected equipment to facility
                  for (const eq of detectedEquipment) {
                    try {
                      await apiRequest(`/api/facilities/${currentFacilityId}/equipment`, {
                        method: 'POST',
                        body: JSON.stringify({
                          typeId: eq.type,
                          position: eq.position,
                          rotation: eq.rotation || 0,
                          scale: eq.scale || 1,
                          properties: eq.properties || {}
                        })
                      });
                    } catch (error) {
                      console.error('Failed to add equipment:', error);
                    }
                  }
                  queryClient.invalidateQueries({ queryKey: ['/api/facilities', currentFacilityId, 'equipment'] });
                }}
                onZonesDetected={async (detectedZones) => {
                  // Add detected zones to facility
                  for (const zone of detectedZones) {
                    try {
                      await apiRequest(`/api/facilities/${currentFacilityId}/zones`, {
                        method: 'POST',
                        body: JSON.stringify({
                          name: zone.name,
                          type: zone.type,
                          x: zone.x,
                          y: zone.y,
                          width: zone.width,
                          height: zone.height,
                          color: zone.color
                        })
                      });
                    } catch (error) {
                      console.error('Failed to add zone:', error);
                    }
                  }
                  queryClient.invalidateQueries({ queryKey: ['/api/facilities', currentFacilityId, 'zones'] });
                }}
              />
            </div>
            
            {/* Batch Reporting Panel */}
            <BatchReportingPanel
              facilityId={currentFacilityId}
              onReportGenerated={(reportData) => {
                toast({
                  title: "Report Generated",
                  description: `${reportData.reportType} report completed`,
                });
              }}
            />
            
            <ProjectExplorer projectId={currentProjectId} />
            <EquipmentLibrary />
          </div>
        </aside>

        {/* Main Canvas */}
        <FacilityCanvas
          facilityId={currentFacilityId}
          selectedEquipment={selectedEquipment}
          onEquipmentSelect={setSelectedEquipment}
          onEquipmentDrop={handleEquipmentDrop}
        />

        {/* Right Properties Panel */}
        <PropertiesPanel
          selectedEquipment={selectedEquipment}
          facilityId={currentFacilityId}
          onClose={() => setSelectedEquipment(null)}
          onEquipmentUpdated={handleEquipmentUpdated}
        />
      </div>

      {/* Professional Status Bar */}
      <StatusBar
        coordinates={mouseCoords}
        zoom={zoom}
        gridEnabled={gridEnabled}
        snapEnabled={snapEnabled}
        orthoEnabled={false}
        connectionStatus="online"
        cpuUsage={15}
        memoryUsage={32}
        selectedCount={selectedEquipment ? 1 : 0}
        totalEntities={facilityStats.equipmentCount}
        currentTool={currentTool}
        units="m"
      />
    </div>
  );
}

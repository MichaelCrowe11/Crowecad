import { useState, useEffect, useRef } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col cad-grid-bg">
      {/* Header */}
      <header className="cad-toolbar border-b border-gray-700 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <img src="@assets/crowe-avatar.png" alt="Crowe Logic" className="w-8 h-8 rounded-md object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                CROWE CAD - Mycology Designer
              </h1>
              <p className="text-xs text-gray-400">
                Professional Facility Design System
              </p>
            </div>
          </div>
          <div className="border-l border-gray-600 pl-4">
            <span className="text-sm font-bold text-blue-400">PRO</span>
            <div className="text-xs text-gray-400 font-mono">v2.1.0</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-900 rounded border border-green-700">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-300 font-medium">Online</span>
          </div>
          
          <Button size="sm" variant="ghost" className="relative text-gray-300 hover:text-white hover:bg-gray-700">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center p-0">
              3
            </Badge>
          </Button>
          
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-600">
            <div className="text-right">
              <span className="text-sm font-medium text-white">Admin User</span>
              <div className="text-xs text-gray-400">Licensed Engineer</div>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded overflow-hidden">
              <img src="@assets/crowe-avatar.png" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar */}
        <aside className="w-80 cad-panel border-r border-gray-700 flex flex-col overflow-y-auto">
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

      {/* Status Bar */}
      <footer className="cad-toolbar border-t border-gray-700 px-6 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-gray-300">
            <span>Equipment:</span>
            <span className="font-bold text-blue-400" data-testid="text-equipment-count">
              {facilityStats.equipmentCount}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <span>Capacity:</span>
            <span className="font-bold text-green-400" data-testid="text-total-capacity">
              {facilityStats.totalCapacity}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <span>Zones:</span>
            <span className="font-bold text-yellow-400" data-testid="text-zone-count">
              {facilityStats.zoneCount}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>System Ready</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Coords:</span>
            <span className="font-mono text-blue-400">0,0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

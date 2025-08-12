import { useState, useEffect, useRef } from "react";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommandInterface } from "@/components/command-interface";
import { ProjectExplorer } from "@/components/project-explorer";
import { EquipmentLibrary } from "@/components/equipment-library";
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

  // Update facility stats
  useEffect(() => {
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
    
    setFacilityStats({
      equipmentCount,
      totalCapacity: totalCapacity > 0 ? `${totalCapacity}L` : '0L',
      zoneCount,
    });
  }, [equipment, zones]);

  const handleCommandExecuted = (command: string, result: any) => {
    toast({
      title: "Command Processed",
      description: `Executed: ${command}`,
    });
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
    <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-morphism border-b border-gray-200/30 px-6 py-4 flex items-center justify-between sticky top-0 z-50 relative">
        <div className="absolute inset-0 professional-gradient opacity-5"></div>
        <div className="flex items-center space-x-6 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 quantum-pulse rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white" 
                 style={{ background: 'linear-gradient(135deg, var(--quantum-680), var(--quantum-540))' }}>
              <span className="text-white text-lg font-bold">🍄</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Mycology Facility Designer
              </h1>
              <p className="text-xs text-gray-600 font-medium">
                Crowe Logic Framework • Quantum Consciousness Interface
              </p>
            </div>
          </div>
          <span className="text-sm text-gray-500 border-l border-gray-300 pl-4 font-mono">v2.1.0</span>
        </div>
        
        <div className="flex items-center space-x-4 relative z-10">
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full border border-green-200 chakra-pulse">
            <div className="w-2 h-2 consciousness-flow rounded-full" style={{ background: 'var(--gamma-color)' }}></div>
            <span className="text-xs font-medium text-green-700">Consciousness: 85%</span>
          </div>
          
          <Button size="sm" variant="ghost" className="relative hover:bg-blue-50">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-1 -right-1 w-4 h-4 mycology-accent text-white text-xs rounded-full flex items-center justify-center p-0">
              3
            </Badge>
          </Button>
          
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-300">
            <div className="text-right">
              <span className="text-sm font-medium text-gray-800">Dr. Sarah Chen</span>
              <div className="text-xs text-gray-500">Lead Mycologist</div>
            </div>
            <div className="w-9 h-9 mycology-accent rounded-full flex items-center justify-center ring-2 ring-white shadow-lg">
              <span className="text-white text-sm font-bold">SC</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar */}
        <aside className="w-80 glass-morphism border-r border-gray-200/30 flex flex-col backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-blue-50/20 to-green-50/20 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col h-full">
            <CommandInterface 
              projectId={currentProjectId}
              onCommandExecuted={handleCommandExecuted}
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
      <footer className="glass-morphism border-t border-gray-200/30 px-6 py-3 flex items-center justify-between text-sm relative">
        <div className="absolute inset-0 professional-gradient opacity-3"></div>
        <div className="flex items-center space-x-8 relative z-10">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
            <span className="text-gray-600 font-medium">Equipment:</span>
            <span className="font-bold text-gray-900" data-testid="text-equipment-count">
              {facilityStats.equipmentCount}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 mycology-accent rounded-full"></div>
            <span className="text-gray-600 font-medium">Total Capacity:</span>
            <span className="font-bold text-green-700" data-testid="text-total-capacity">
              {facilityStats.totalCapacity}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
            <span className="text-gray-600 font-medium">Zones:</span>
            <span className="font-bold text-gray-900" data-testid="text-zone-count">
              {facilityStats.zoneCount}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 relative z-10">
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full status-indicator"></div>
            <span className="text-green-700 font-medium text-xs">Crowe Logic Active</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <span className="font-medium">Last optimized:</span>
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">Just now</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

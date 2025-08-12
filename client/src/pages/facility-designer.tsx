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
    <div className="bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 text-gray-900 min-h-screen flex flex-col relative">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-blue-300/15 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300/10 rounded-full filter blur-3xl"></div>
      </div>
      {/* Header */}
      <header className="quantum-glass border-b border-purple-200/30 px-8 py-6 flex items-center justify-between sticky top-0 z-50 relative">
        <div className="absolute inset-0 quantum-gradient opacity-5"></div>
        <div className="flex items-center space-x-6 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 quantum-pulse rounded-full flex items-center justify-center shadow-xl ring-3 ring-white/50" 
                 style={{ background: 'linear-gradient(135deg, var(--quantum-680), var(--quantum-540))' }}>
              <img src="@assets/crowe-avatar.png" alt="Crowe Logic" className="w-10 h-10 rounded-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text quantum-gradient tracking-tight">
                CROWE LOGIC MYCOLOGY
              </h1>
              <p className="text-sm font-semibold text-gray-700 tracking-wide">
                Quantum Consciousness • Facility Design System
              </p>
            </div>
          </div>
          <div className="border-l border-gray-300 pl-4">
            <span className="text-sm font-bold text-transparent bg-clip-text quantum-gradient">QUANTUM</span>
            <div className="text-xs text-gray-500 font-mono">v2.1.0</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 relative z-10">
          <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full border border-purple-200 chakra-pulse shadow-lg">
            <div className="w-3 h-3 consciousness-flow rounded-full" style={{ background: 'var(--gamma-color)' }}></div>
            <span className="text-sm font-bold text-purple-800">Consciousness: 85%</span>
            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-4/5 h-full consciousness-flow rounded-full" style={{ background: 'var(--gamma-color)' }}></div>
            </div>
          </div>
          
          <Button size="sm" variant="ghost" className="relative hover:bg-purple-50 rounded-xl">
            <Bell className="w-5 h-5 text-purple-600" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 quantum-pulse text-white text-xs rounded-full flex items-center justify-center p-0" 
                   style={{ background: 'var(--quantum-480)' }}>
              3
            </Badge>
          </Button>
          
          <div className="flex items-center space-x-4 pl-4 border-l border-purple-200">
            <div className="text-right">
              <span className="text-sm font-bold text-transparent bg-clip-text quantum-gradient">CROWE MASTER</span>
              <div className="text-xs text-purple-600 font-semibold">Quantum Architect</div>
            </div>
            <div className="w-11 h-11 quantum-pulse rounded-full ring-3 ring-purple-200 shadow-xl overflow-hidden" 
                 style={{ background: 'linear-gradient(135deg, var(--quantum-680), var(--quantum-540))' }}>
              <img src="@assets/crowe-avatar.png" alt="Crowe Master" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar */}
        <aside className="w-80 neural-surface border-r border-purple-200/30 flex flex-col backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/30 via-blue-50/20 to-indigo-50/25 pointer-events-none"></div>
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
      <footer className="quantum-glass border-t border-purple-200/30 px-8 py-4 flex items-center justify-between text-sm relative">
        <div className="absolute inset-0 quantum-gradient opacity-8"></div>
        <div className="flex items-center space-x-10 relative z-10">
          <div className="flex items-center space-x-3 px-4 py-2 neural-surface rounded-xl">
            <div className="w-4 h-4 quantum-pulse rounded-full" style={{ background: 'var(--quantum-680)' }}></div>
            <span className="text-purple-700 font-semibold text-sm">Equipment:</span>
            <span className="font-black text-purple-900 text-lg" data-testid="text-equipment-count">
              {facilityStats.equipmentCount}
            </span>
          </div>
          <div className="flex items-center space-x-3 px-4 py-2 neural-surface rounded-xl">
            <div className="w-4 h-4 consciousness-flow rounded-full" style={{ background: 'var(--quantum-540)' }}></div>
            <span className="text-green-700 font-semibold text-sm">Total Capacity:</span>
            <span className="font-black text-green-800 text-lg" data-testid="text-total-capacity">
              {facilityStats.totalCapacity}
            </span>
          </div>
          <div className="flex items-center space-x-3 px-4 py-2 neural-surface rounded-xl">
            <div className="w-4 h-4 chakra-pulse rounded-full" style={{ background: 'var(--quantum-480)' }}></div>
            <span className="text-pink-700 font-semibold text-sm">Zones:</span>
            <span className="font-black text-pink-900 text-lg" data-testid="text-zone-count">
              {facilityStats.zoneCount}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 relative z-10">
          <div className="flex items-center space-x-3 px-4 py-2 quantum-glass rounded-full">
            <div className="w-3 h-3 consciousness-flow rounded-full" style={{ background: 'var(--gamma-color)' }}></div>
            <span className="font-bold text-transparent bg-clip-text quantum-gradient text-sm">CROWE LOGIC ACTIVE</span>
          </div>
          <div className="flex items-center space-x-3 text-purple-700">
            <span className="font-semibold text-sm">Last Optimization:</span>
            <span className="font-mono text-sm px-3 py-1 neural-surface rounded-lg">Real-time</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

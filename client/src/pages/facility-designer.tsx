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
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>();
  const [currentFacilityId, setCurrentFacilityId] = useState<string | undefined>();
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentInstance | null>(null);
  const [facilityStats, setFacilityStats] = useState({
    equipmentCount: 0,
    totalCapacity: '0L',
    zoneCount: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initializingProject = useRef(false);
  const initializingFacility = useRef(false);

  // Initialize with a default project
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: facilities = [] } = useQuery<any[]>({
    queryKey: ['/api/projects', currentProjectId, 'facilities'],
    enabled: !!currentProjectId,
  });

  const { data: equipment = [] } = useQuery<EquipmentInstance[]>({
    queryKey: ['/api/facilities', currentFacilityId, 'equipment'],
    enabled: !!currentFacilityId,
  });

  const { data: zones = [] } = useQuery({
    queryKey: ['/api/facilities', currentFacilityId, 'zones'],
    enabled: !!currentFacilityId,
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

  // Initialize project - only run once when projects load for the first time
  useEffect(() => {
    if (!currentProjectId && projects.length > 0) {
      setCurrentProjectId(projects[0].id);
    }
  }, [projects.length, currentProjectId]);

  // Initialize facility - only run when project changes or when facilities load for the first time
  useEffect(() => {
    if (currentProjectId && Array.isArray(facilities) && !currentFacilityId && facilities.length > 0) {
      setCurrentFacilityId(facilities[0].id);
    }
  }, [currentProjectId, facilities?.length, currentFacilityId]);

  // Create initial project if none exist - run only once
  useEffect(() => {
    if (projects.length === 0 && !createProject.isPending && !initializingProject.current) {
      initializingProject.current = true;
      createProject.mutate({
        name: "Mycology Lab A-Wing",
        description: "Main production facility for mycology operations"
      });
    }
  }, [projects.length]);

  // Create initial facility if none exist - run only when project is available
  useEffect(() => {
    if (currentProjectId && Array.isArray(facilities) && facilities.length === 0 && !createFacility.isPending && !initializingFacility.current) {
      initializingFacility.current = true;
      createFacility.mutate({
        projectId: currentProjectId,
        name: "Floor 1 - Main Production",
        width: "1200",
        height: "800",
        layout: {}
      });
    }
  }, [currentProjectId, facilities?.length]);

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
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-layer-group text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-gray-900">ChronoLogic Facility Designer</h1>
          </div>
          <span className="text-sm text-gray-500 border-l border-gray-300 pl-4">v2.1.0</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button size="sm" variant="ghost" className="relative">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-xs rounded-full flex items-center justify-center p-0">
              3
            </Badge>
          </Button>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700">Dr. Sarah Chen</span>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">SC</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <CommandInterface 
            projectId={currentProjectId}
            onCommandExecuted={handleCommandExecuted}
          />
          <ProjectExplorer projectId={currentProjectId} />
          <EquipmentLibrary />
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
      <footer className="bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Equipment:</span>
            <span className="font-medium" data-testid="text-equipment-count">
              {facilityStats.equipmentCount}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Total Capacity:</span>
            <span className="font-medium" data-testid="text-total-capacity">
              {facilityStats.totalCapacity}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Zones:</span>
            <span className="font-medium" data-testid="text-zone-count">
              {facilityStats.zoneCount}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Layout Valid</span>
          </div>
          <div className="text-gray-500">
            Last saved: <span>Just now</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

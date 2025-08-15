import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { 
  Facility, 
  Zone, 
  EquipmentInstance, 
  InsertFacility, 
  InsertZone, 
  InsertEquipmentInstance 
} from "@shared/schema";

export function useFacility(facilityId: string | undefined) {
  return useQuery({
    queryKey: ['/api/facilities', facilityId],
    enabled: !!facilityId,
  });
}

export function useFacilityZones(facilityId: string | undefined) {
  return useQuery<Zone[]>({
    queryKey: ['/api/facilities', facilityId, 'zones'],
    enabled: !!facilityId,
  });
}

export function useFacilityEquipment(facilityId: string | undefined) {
  return useQuery<EquipmentInstance[]>({
    queryKey: ['/api/facilities', facilityId, 'equipment'],
    enabled: !!facilityId,
  });
}

export function useCreateFacility() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (facility: InsertFacility) => {
      const response = await apiRequest('POST', '/api/facilities', facility);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', data.projectId, 'facilities'] });
    },
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (zone: InsertZone) => {
      const response = await apiRequest('POST', '/api/zones', zone);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/facilities', data.facilityId, 'zones'] });
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertZone> }) => {
      const response = await apiRequest('PATCH', `/api/zones/${id}`, updates);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/facilities', data.facilityId, 'zones'] });
    },
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (equipment: InsertEquipmentInstance) => {
      const response = await apiRequest('POST', '/api/equipment', equipment);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/facilities', data.facilityId, 'equipment'] });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertEquipmentInstance> }) => {
      const response = await apiRequest('PATCH', `/api/equipment/${id}`, updates);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/facilities', data.facilityId, 'equipment'] });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, facilityId }: { id: string; facilityId: string }) => {
      await apiRequest('DELETE', `/api/equipment/${id}`);
      return { id, facilityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/facilities', data.facilityId, 'equipment'] });
    },
  });
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Settings, Layers } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";

interface ProjectExplorerProps {
  projectId: string | undefined;
  onProjectSelect?: (projectId: string) => void;
}

export function ProjectExplorer({ projectId, onProjectSelect }: ProjectExplorerProps) {
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
  });

  const { data: facilities = [] } = useQuery<any[]>({
    queryKey: ['/api/projects', projectId, 'facilities'],
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="p-4 border-b border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-4 border-b border-gray-200">
        <div className="text-sm text-gray-500">No project selected</div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Current Project</h3>
        <Button size="sm" variant="ghost" className="p-1 h-auto">
          <Settings className="w-4 h-4 text-primary" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <FolderOpen className="w-4 h-4 text-primary" />
          <span className="font-medium" data-testid="text-project-name">
            {project.name}
          </span>
        </div>

        {project.description && (
          <div className="text-xs text-gray-600 ml-6">
            {project.description}
          </div>
        )}

        {Array.isArray(facilities) && facilities.length > 0 && (
          <div className="ml-6 space-y-1 text-xs">
            {facilities.map((facility: any, index: number) => (
              <div 
                key={facility.id} 
                className="flex items-center space-x-2"
                data-testid={`facility-${index}`}
              >
                <Layers className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">{facility.name}</span>
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {facility.width}×{facility.height}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {(!Array.isArray(facilities) || facilities.length === 0) && (
          <div className="ml-6 text-xs text-gray-400">
            No facilities created yet
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
        Last saved: {new Date(project.lastSaved || project.updatedAt || '').toLocaleString()}
      </div>
    </div>
  );
}

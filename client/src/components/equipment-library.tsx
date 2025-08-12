import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Plus, 
  Search,
  ChevronDown, 
  ChevronRight,
  FlaskConical, 
  Thermometer, 
  Settings, 
  Warehouse,
  GripVertical
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { EquipmentType } from "@shared/schema";

interface EquipmentLibraryProps {
  onEquipmentDrag?: (equipmentType: EquipmentType) => void;
}

interface EquipmentCategory {
  name: string;
  icon: any;
  types: EquipmentType[];
  expanded: boolean;
}

const CATEGORY_ICONS = {
  bioreactor: FlaskConical,
  environmental: Thermometer,
  processing: Settings,
  storage: Warehouse,
} as const;

export function EquipmentLibrary({ onEquipmentDrag }: EquipmentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Record<string, boolean>>({
    bioreactor: true,
    environmental: false,
    processing: false,
    storage: false,
  });

  const { data: equipmentTypes = [], isLoading } = useQuery<EquipmentType[]>({
    queryKey: ['/api/equipment-types'],
  });

  const filteredTypes = equipmentTypes.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categorizedTypes = filteredTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, EquipmentType[]>);

  const toggleCategory = (category: string) => {
    setCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleDragStart = (e: React.DragEvent, equipmentType: EquipmentType) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(equipmentType));
    onEquipmentDrag?.(equipmentType);
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-100 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto sidebar-section">
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm">Equipment Library</h3>
            <p className="text-xs text-gray-400">Mycology components</p>
          </div>
          <Button size="sm" variant="ghost" className="p-1 h-auto text-gray-400 hover:text-white hover:bg-gray-700">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Equipment */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/60 backdrop-blur-sm border-gray-200 focus:bg-white focus:border-green-300 transition-all"
            placeholder="Search equipment..."
            data-testid="input-search-equipment"
          />
        </div>

        {/* Equipment Categories */}
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {Object.entries(categorizedTypes).map(([categoryName, types]) => {
              const IconComponent = CATEGORY_ICONS[categoryName as keyof typeof CATEGORY_ICONS] || Settings;
              const isExpanded = categories[categoryName];
              
              return (
                <Collapsible 
                  key={categoryName}
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(categoryName)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-left p-3 h-auto hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 rounded-lg transition-all border border-transparent hover:border-green-200/50"
                      data-testid={`button-toggle-${categoryName}`}
                    >
                      <span className="flex items-center space-x-3 text-sm font-medium text-gray-800">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-md flex items-center justify-center">
                          <IconComponent className="w-3 h-3 text-white" />
                        </div>
                        <span className="capitalize font-semibold">{categoryName}</span>
                        <Badge variant="outline" className="text-xs bg-white/80 border-green-200">
                          {types.length}
                        </Badge>
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-green-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="ml-6 mt-2">
                    <div className="space-y-2">
                      {types.map((equipmentType) => (
                        <div
                          key={equipmentType.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, equipmentType)}
                          className={cn(
                            "equipment-item bg-gray-50 p-3 rounded-lg cursor-grab transition-all duration-200",
                            "hover:bg-gray-100 hover:shadow-sm hover:-translate-y-0.5",
                            "active:cursor-grabbing"
                          )}
                          data-testid={`equipment-${equipmentType.id}`}
                          data-equipment-type={equipmentType.category}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <div className={cn(
                                "w-8 h-8 rounded flex items-center justify-center flex-shrink-0",
                                categoryName === 'bioreactor' && "bg-blue-100",
                                categoryName === 'environmental' && "bg-purple-100",
                                categoryName === 'processing' && "bg-orange-100",
                                categoryName === 'storage' && "bg-green-100"
                              )}>
                                <IconComponent className={cn(
                                  "w-4 h-4",
                                  categoryName === 'bioreactor' && "text-primary",
                                  categoryName === 'environmental' && "text-purple-600",
                                  categoryName === 'processing' && "text-orange-600",
                                  categoryName === 'storage' && "text-green-600"
                                )} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {equipmentType.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {(equipmentType.defaultProperties as any)?.capacity || 'Custom capacity'}
                                </div>
                              </div>
                            </div>
                            
                            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>

          {Object.keys(categorizedTypes).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No equipment found</p>
              <p className="text-xs text-gray-400">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

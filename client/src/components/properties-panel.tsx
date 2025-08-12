import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  X, 
  Save, 
  Copy, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Plug,
  FlaskConical
} from "lucide-react";
import { useUpdateEquipment, useDeleteEquipment } from "@/hooks/use-facility";
import { useToast } from "@/hooks/use-toast";
import type { EquipmentInstance, EquipmentType } from "@shared/schema";

interface PropertiesPanelProps {
  selectedEquipment: (EquipmentInstance & { equipmentType?: EquipmentType }) | null;
  facilityId: string;
  onClose: () => void;
  onEquipmentUpdated?: (equipment: EquipmentInstance) => void;
}

export function PropertiesPanel({ 
  selectedEquipment, 
  facilityId,
  onClose, 
  onEquipmentUpdated 
}: PropertiesPanelProps) {
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();
  
  const updateEquipment = useUpdateEquipment();
  const deleteEquipment = useDeleteEquipment();

  useEffect(() => {
    if (selectedEquipment) {
      setFormData({
        name: selectedEquipment.name,
        x: selectedEquipment.x,
        y: selectedEquipment.y,
        rotation: selectedEquipment.rotation,
        scale: selectedEquipment.scale,
        properties: selectedEquipment.properties || {},
      });
    }
  }, [selectedEquipment]);

  if (!selectedEquipment) {
    return (
      <aside className="w-80 bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FlaskConical className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Select equipment to view properties</p>
        </div>
      </aside>
    );
  }

  const handleSave = async () => {
    try {
      await updateEquipment.mutateAsync({
        id: selectedEquipment.id,
        updates: {
          name: formData.name,
          x: String(formData.x),
          y: String(formData.y),
          rotation: String(formData.rotation),
          scale: String(formData.scale),
          properties: formData.properties,
        }
      });
      
      toast({
        title: "Equipment Updated",
        description: "Equipment properties have been saved successfully.",
      });
      
      onEquipmentUpdated?.(selectedEquipment);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update equipment properties.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      try {
        await deleteEquipment.mutateAsync({
          id: selectedEquipment.id,
          facilityId
        });
        
        toast({
          title: "Equipment Deleted",
          description: "Equipment has been removed from the facility.",
        });
        
        onClose();
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete equipment.",
          variant: "destructive",
        });
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePropertyChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      properties: {
        ...prev.properties,
        [key]: value
      }
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'configured':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Properties</h3>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onClose}
            className="p-1 h-auto"
            data-testid="button-close-properties"
          >
            <X className="w-4 h-4 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Equipment Details */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Equipment Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base" data-testid="text-equipment-name">
                    {selectedEquipment.equipmentType?.name || 'Equipment'}
                  </CardTitle>
                  <p className="text-sm text-gray-500" data-testid="text-equipment-id">
                    ID: {selectedEquipment.id.substring(0, 8)}...
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-xs">
                {getStatusIcon(selectedEquipment.status || 'configured')}
                <span className="text-gray-600">
                  Status: <span className="font-medium capitalize">{selectedEquipment.status || 'Configured'}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Basic Properties */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Basic Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="equipment-name" className="text-xs font-medium">Name</Label>
                <Input
                  id="equipment-name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-8 text-sm"
                  data-testid="input-equipment-name"
                />
              </div>

              {/* Dynamic Properties from Equipment Type */}
              {selectedEquipment.equipmentType?.defaultProperties && (
                <div className="space-y-3">
                  {Object.entries(selectedEquipment.equipmentType.defaultProperties as Record<string, any>).map(([key, defaultValue]) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-xs font-medium capitalize">
                        {String(key).replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          value={formData.properties[key] || defaultValue || ''}
                          onChange={(e) => handlePropertyChange(key, e.target.value)}
                          className="flex-1 h-8 text-sm"
                          data-testid={`input-property-${key}`}
                        />
                        {key.includes('capacity') && (
                          <Select
                            value={formData.properties[`${key}Unit`] || 'L'}
                            onValueChange={(value) => handlePropertyChange(`${key}Unit`, value)}
                          >
                            <SelectTrigger className="w-16 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="L">L</SelectItem>
                              <SelectItem value="mL">mL</SelectItem>
                              <SelectItem value="gal">gal</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Position & Orientation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Position & Orientation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">X Position</Label>
                  <Input
                    type="number"
                    value={formData.x || ''}
                    onChange={(e) => handleInputChange('x', parseFloat(e.target.value))}
                    className="h-8 text-sm"
                    data-testid="input-x-position"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Y Position</Label>
                  <Input
                    type="number"
                    value={formData.y || ''}
                    onChange={(e) => handleInputChange('y', parseFloat(e.target.value))}
                    className="h-8 text-sm"
                    data-testid="input-y-position"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Rotation</Label>
                  <Input
                    type="number"
                    value={formData.rotation || ''}
                    onChange={(e) => handleInputChange('rotation', parseFloat(e.target.value))}
                    className="h-8 text-sm"
                    data-testid="input-rotation"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Scale</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.scale || ''}
                    onChange={(e) => handleInputChange('scale', parseFloat(e.target.value))}
                    className="h-8 text-sm"
                    data-testid="input-scale"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connections */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Inlet 1</span>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    <Plug className="w-3 h-3 mr-1" />
                    Connect
                  </Button>
                </div>
                
                {Array.isArray(selectedEquipment.connections) && 
                 selectedEquipment.connections.length > 0 && (
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm text-gray-700">Outlet 1</span>
                    <Badge variant="secondary" className="text-xs">
                      Connected
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Control</span>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    <Plug className="w-3 h-3 mr-1" />
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Equipment placement valid</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Clearance requirements met</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-700">Consider ventilation proximity</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button 
          onClick={handleSave}
          disabled={updateEquipment.isPending}
          className="w-full"
          data-testid="button-save-equipment"
        >
          <Save className="w-4 h-4 mr-2" />
          Update Equipment
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              // TODO: Implement duplicate functionality
              toast({
                title: "Feature Coming Soon",
                description: "Equipment duplication will be available soon.",
              });
            }}
            data-testid="button-duplicate-equipment"
          >
            <Copy className="w-4 h-4 mr-1" />
            Duplicate
          </Button>
          
          <Button 
            variant="destructive" 
            className="flex-1"
            onClick={handleDelete}
            disabled={deleteEquipment.isPending}
            data-testid="button-delete-equipment"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </aside>
  );
}

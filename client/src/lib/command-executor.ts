import { apiRequest } from "@/lib/queryClient";

export interface CADCommand {
  type: 'CREATE' | 'MOVE' | 'MODIFY' | 'DELETE' | 'CREATE_ZONE';
  target: string;
  parameters: Record<string, any>;
  position?: { x: number; y: number };
}

export class CommandExecutor {
  static async parseCommand(commandText: string): Promise<CADCommand | null> {
    const text = commandText.toUpperCase().trim();
    
    // CREATE commands
    if (text.includes('CREATE')) {
      const equipmentTypeMatch = text.match(/CREATE\s+(\w+)/);
      const positionMatch = text.match(/AT\s+(\d+),\s*(\d+)/);
      const propertiesMatch = text.match(/WITH\s+(.+)/);
      
      if (equipmentTypeMatch) {
        const command: CADCommand = {
          type: 'CREATE',
          target: equipmentTypeMatch[1].toLowerCase(),
          parameters: {}
        };
        
        if (positionMatch) {
          command.position = {
            x: parseInt(positionMatch[1]),
            y: parseInt(positionMatch[2])
          };
        }
        
        if (propertiesMatch) {
          const props = propertiesMatch[1].split(',');
          props.forEach(prop => {
            const [key, value] = prop.split('=');
            if (key && value) {
              command.parameters[key.trim()] = value.trim();
            }
          });
        }
        
        return command;
      }
    }
    
    // MOVE commands
    if (text.includes('MOVE')) {
      const targetMatch = text.match(/MOVE\s+(\w+)/);
      const positionMatch = text.match(/TO\s+(\d+),\s*(\d+)/);
      
      if (targetMatch && positionMatch) {
        return {
          type: 'MOVE',
          target: targetMatch[1],
          parameters: {},
          position: {
            x: parseInt(positionMatch[1]),
            y: parseInt(positionMatch[2])
          }
        };
      }
    }
    
    // MODIFY commands
    if (text.includes('MODIFY')) {
      const targetMatch = text.match(/MODIFY\s+(\w+)/);
      const propertiesMatch = text.match(/SET\s+(.+)/);
      
      if (targetMatch && propertiesMatch) {
        const command: CADCommand = {
          type: 'MODIFY',
          target: targetMatch[1],
          parameters: {}
        };
        
        const props = propertiesMatch[1].split(',');
        props.forEach(prop => {
          const [key, value] = prop.split('=');
          if (key && value) {
            command.parameters[key.trim()] = value.trim();
          }
        });
        
        return command;
      }
    }
    
    // DELETE commands
    if (text.includes('DELETE')) {
      const targetMatch = text.match(/DELETE\s+(\w+)/);
      
      if (targetMatch) {
        return {
          type: 'DELETE',
          target: targetMatch[1],
          parameters: {}
        };
      }
    }
    
    // CREATE_ZONE commands
    if (text.includes('CREATE_ZONE')) {
      const nameMatch = text.match(/CREATE_ZONE\s+(\w+)/);
      const boundsMatch = text.match(/FROM\s+(\d+),\s*(\d+)\s+TO\s+(\d+),\s*(\d+)/);
      
      if (nameMatch && boundsMatch) {
        return {
          type: 'CREATE_ZONE',
          target: nameMatch[1],
          parameters: {
            x1: parseInt(boundsMatch[1]),
            y1: parseInt(boundsMatch[2]),
            x2: parseInt(boundsMatch[3]),
            y2: parseInt(boundsMatch[4])
          }
        };
      }
    }
    
    return null;
  }
  
  static async executeCommand(command: CADCommand, facilityId: string): Promise<any> {
    try {
      switch (command.type) {
        case 'CREATE':
          return await CommandExecutor.createEquipment(command, facilityId);
        case 'MOVE':
          return await CommandExecutor.moveEquipment(command, facilityId);
        case 'MODIFY':
          return await CommandExecutor.modifyEquipment(command, facilityId);
        case 'DELETE':
          return await CommandExecutor.deleteEquipment(command, facilityId);
        case 'CREATE_ZONE':
          return await CommandExecutor.createZone(command, facilityId);
        default:
          throw new Error(`Unknown command type: ${command.type}`);
      }
    } catch (error) {
      console.error('Command execution error:', error);
      throw error;
    }
  }
  
  private static async createEquipment(command: CADCommand, facilityId: string): Promise<any> {
    // First, find the equipment type
    const typesResponse = await apiRequest('GET', '/api/equipment-types');
    const types = await typesResponse.json();
    const equipmentType = types.find((t: any) => 
      t.name.toLowerCase().includes(command.target) || 
      t.category.toLowerCase().includes(command.target)
    );
    
    if (!equipmentType) {
      throw new Error(`Equipment type not found: ${command.target}`);
    }
    
    const equipmentData = {
      facilityId,
      equipmentTypeId: equipmentType.id,
      position: command.position || { x: 100, y: 100 },
      properties: { ...equipmentType.properties, ...command.parameters }
    };
    
    const response = await apiRequest('POST', '/api/equipment', equipmentData);
    return response.json();
  }
  
  private static async moveEquipment(command: CADCommand, facilityId: string): Promise<any> {
    // Find equipment by name or ID
    const equipmentResponse = await apiRequest('GET', `/api/facilities/${facilityId}/equipment`);
    const equipment = await equipmentResponse.json();
    const targetEquipment = equipment.find((eq: any) => 
      eq.id === command.target || 
      eq.name?.toLowerCase().includes(command.target.toLowerCase())
    );
    
    if (!targetEquipment) {
      throw new Error(`Equipment not found: ${command.target}`);
    }
    
    const updateData = {
      position: command.position
    };
    
    const response = await apiRequest('PATCH', `/api/equipment/${targetEquipment.id}`, updateData);
    return response.json();
  }
  
  private static async modifyEquipment(command: CADCommand, facilityId: string): Promise<any> {
    // Find equipment by name or ID
    const equipmentResponse = await apiRequest('GET', `/api/facilities/${facilityId}/equipment`);
    const equipment = await equipmentResponse.json();
    const targetEquipment = equipment.find((eq: any) => 
      eq.id === command.target || 
      eq.name?.toLowerCase().includes(command.target.toLowerCase())
    );
    
    if (!targetEquipment) {
      throw new Error(`Equipment not found: ${command.target}`);
    }
    
    const updateData = {
      properties: { ...targetEquipment.properties, ...command.parameters }
    };
    
    const response = await apiRequest('PATCH', `/api/equipment/${targetEquipment.id}`, updateData);
    return response.json();
  }
  
  private static async deleteEquipment(command: CADCommand, facilityId: string): Promise<any> {
    // Find equipment by name or ID
    const equipmentResponse = await apiRequest('GET', `/api/facilities/${facilityId}/equipment`);
    const equipment = await equipmentResponse.json();
    const targetEquipment = equipment.find((eq: any) => 
      eq.id === command.target || 
      eq.name?.toLowerCase().includes(command.target.toLowerCase())
    );
    
    if (!targetEquipment) {
      throw new Error(`Equipment not found: ${command.target}`);
    }
    
    const response = await apiRequest('DELETE', `/api/equipment/${targetEquipment.id}`);
    return response.json();
  }
  
  private static async createZone(command: CADCommand, facilityId: string): Promise<any> {
    const zoneData = {
      facilityId,
      name: command.target,
      type: 'general',
      bounds: {
        x: command.parameters.x1,
        y: command.parameters.y1,
        width: command.parameters.x2 - command.parameters.x1,
        height: command.parameters.y2 - command.parameters.y1
      }
    };
    
    const response = await apiRequest('POST', '/api/zones', zoneData);
    return response.json();
  }
}

export default CommandExecutor;
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedEquipmentTypes } from "./seed";
import collaborationManager from "./collaboration";
import { 
  insertProjectSchema,
  insertFacilitySchema,
  insertZoneSchema,
  insertEquipmentInstanceSchema,
  insertCommandSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize equipment types on startup
  await seedEquipmentTypes();

  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.listProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid project data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create project" });
      }
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const updates = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, updates);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid project data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update project" });
      }
    }
  });

  // Facilities
  app.get("/api/projects/:projectId/facilities", async (req, res) => {
    try {
      const facilities = await storage.getFacilitiesByProject(req.params.projectId);
      res.json(facilities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch facilities" });
    }
  });

  app.post("/api/facilities", async (req, res) => {
    try {
      const facilityData = insertFacilitySchema.parse(req.body);
      const facility = await storage.createFacility(facilityData);
      res.status(201).json(facility);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid facility data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create facility" });
      }
    }
  });

  app.get("/api/facilities/:id", async (req, res) => {
    try {
      const facility = await storage.getFacility(req.params.id);
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }
      res.json(facility);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch facility" });
    }
  });

  // Zones
  app.get("/api/facilities/:facilityId/zones", async (req, res) => {
    try {
      const zones = await storage.getZonesByFacility(req.params.facilityId);
      res.json(zones);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch zones" });
    }
  });

  app.post("/api/zones", async (req, res) => {
    try {
      const zoneData = insertZoneSchema.parse(req.body);
      const zone = await storage.createZone(zoneData);
      res.status(201).json(zone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid zone data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create zone" });
      }
    }
  });

  app.patch("/api/zones/:id", async (req, res) => {
    try {
      const updates = insertZoneSchema.partial().parse(req.body);
      const zone = await storage.updateZone(req.params.id, updates);
      res.json(zone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid zone data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update zone" });
      }
    }
  });

  app.delete("/api/zones/:id", async (req, res) => {
    try {
      await storage.deleteZone(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete zone" });
    }
  });

  // Equipment Types
  app.get("/api/equipment-types", async (req, res) => {
    try {
      const equipmentTypes = await storage.listEquipmentTypes();
      res.json(equipmentTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment types" });
    }
  });

  // Equipment Instances
  app.get("/api/facilities/:facilityId/equipment", async (req, res) => {
    try {
      const equipment = await storage.getEquipmentInstancesByFacility(req.params.facilityId);
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.post("/api/equipment", async (req, res) => {
    try {
      const equipmentData = insertEquipmentInstanceSchema.parse(req.body);
      const equipment = await storage.createEquipmentInstance(equipmentData);
      res.status(201).json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid equipment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create equipment" });
      }
    }
  });

  app.patch("/api/equipment/:id", async (req, res) => {
    try {
      const updates = insertEquipmentInstanceSchema.partial().parse(req.body);
      const equipment = await storage.updateEquipmentInstance(req.params.id, updates);
      res.json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid equipment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update equipment" });
      }
    }
  });

  app.delete("/api/equipment/:id", async (req, res) => {
    try {
      await storage.deleteEquipmentInstance(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete equipment" });
    }
  });

  // Commands
  app.post("/api/commands", async (req, res) => {
    try {
      const commandData = insertCommandSchema.parse(req.body);
      const command = await storage.createCommand(commandData);
      
      // Process the command based on its type
      let result: any = { message: 'Command processed successfully' };
      let status = 'success';
      
      try {
        // Simple command processing - in a real implementation this would be more sophisticated
        const commandText = command.command.toLowerCase();
        
        if (commandText.includes('create') && commandText.includes('zone')) {
          result = { 
            message: 'Zone creation command processed',
            action: 'create_zone',
            parameters: extractParameters(command.command)
          };
        } else if (commandText.includes('create') && commandText.includes('bioreactor')) {
          result = { 
            message: 'Bioreactor creation command processed',
            action: 'create_equipment',
            equipment_type: 'bioreactor',
            parameters: extractParameters(command.command)
          };
        } else if (commandText.includes('place') && commandText.includes('equipment')) {
          result = { 
            message: 'Equipment placement command processed',
            action: 'place_equipment',
            parameters: extractParameters(command.command)
          };
        } else {
          result = { 
            message: 'Command syntax recognized but not implemented yet',
            action: 'unknown',
            suggestion: 'Try: create bioreactor --capacity=500L or create zone --name=cultivation'
          };
        }
      } catch (error) {
        status = 'error';
        result = { message: 'Failed to process command', error: (error as Error).message };
      }
      
      const processedCommand = await storage.updateCommand(command.id, {
        status,
        result
      });
      
      res.status(201).json(processedCommand);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid command data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to process command" });
      }
    }
  });

  app.get("/api/projects/:projectId/commands", async (req, res) => {
    try {
      const commands = await storage.getCommandsByProject(req.params.projectId);
      res.json(commands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch commands" });
    }
  });

  // Batch Reporting API Routes
  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { templateId, facilityId, parameters } = req.body;
      
      // Mock report generation
      const reportData = {
        id: `report_${Date.now()}`,
        facilityId,
        templateId,
        generatedAt: new Date().toISOString(),
        status: 'generated',
        downloadUrl: `/api/reports/download/${facilityId}_${Date.now()}`,
        parameters: parameters || {}
      };

      res.json(reportData);
    } catch (error) {
      res.status(400).json({ error: 'Failed to generate report' });
    }
  });

  app.get("/api/reports/download/:reportId", async (req, res) => {
    try {
      const { reportId } = req.params;
      const format = req.query.format as string || 'pdf';
      
      // Generate mock report content
      let reportContent = '';
      let contentType = 'text/plain';
      
      switch (format.toLowerCase()) {
        case 'pdf':
          reportContent = `Mock PDF Report Content for ${reportId}`;
          contentType = 'application/pdf';
          break;
        case 'csv':
          reportContent = `Report ID,Generated At,Status\n${reportId},${new Date().toISOString()},Complete`;
          contentType = 'text/csv';
          break;
        case 'json':
          reportContent = JSON.stringify({
            reportId,
            generatedAt: new Date().toISOString(),
            status: 'complete',
            data: { message: 'Mock report data' }
          }, null, 2);
          contentType = 'application/json';
          break;
        default:
          reportContent = `Mock report content for ${reportId}`;
      }
      
      const filename = `${reportId}.${format}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', contentType);
      res.send(reportContent);
    } catch (error) {
      res.status(404).json({ error: 'Report not found' });
    }
  });

  app.post("/api/external-systems", async (req, res) => {
    try {
      const system = req.body;
      
      // Mock external system configuration
      res.json({ 
        success: true, 
        message: 'External system configured successfully',
        systemId: system.id 
      });
    } catch (error) {
      res.status(400).json({ error: 'Failed to configure external system' });
    }
  });

  app.post("/api/external-systems/:systemId/test", async (req, res) => {
    try {
      const { systemId } = req.params;
      
      // Mock connection test
      const testResult = {
        systemId,
        connected: true,
        latency: Math.floor(Math.random() * 200) + 50,
        lastTested: new Date().toISOString(),
        status: 'healthy'
      };

      res.json(testResult);
    } catch (error) {
      res.status(500).json({ error: 'Connection test failed' });
    }
  });

  app.post("/api/reports/:reportId/send/:systemId", async (req, res) => {
    try {
      const { reportId, systemId } = req.params;
      
      // Mock report sending
      const sendResult = {
        reportId,
        systemId,
        sent: true,
        sentAt: new Date().toISOString(),
        externalId: `ext_${Date.now()}`,
        status: 'delivered'
      };

      res.json(sendResult);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send report' });
    }
  });

  app.get("/api/reports/analytics", async (req, res) => {
    try {
      const { facilityId, timeframe = '30d' } = req.query;
      
      // Mock analytics data
      const analytics = {
        facilityId,
        timeframe,
        generatedAt: new Date().toISOString(),
        metrics: {
          totalReports: Math.floor(Math.random() * 100) + 50,
          successRate: Math.floor(Math.random() * 10) + 90,
          averageGenerationTime: Math.floor(Math.random() * 30) + 15,
          popularTemplates: [
            { name: 'Facility Overview', count: Math.floor(Math.random() * 20) + 10 },
            { name: 'Equipment Performance', count: Math.floor(Math.random() * 15) + 8 },
            { name: 'Production Metrics', count: Math.floor(Math.random() * 12) + 5 }
          ],
          externalSystemUsage: [
            { systemName: 'ERP System', reports: Math.floor(Math.random() * 25) + 10 },
            { systemName: 'LIMS', reports: Math.floor(Math.random() * 15) + 5 },
            { systemName: 'Quality Management', reports: Math.floor(Math.random() * 10) + 3 }
          ]
        }
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve analytics' });
    }
  });

  // OpenAI-powered CAD operations
  // Dynamically import and use OpenAI routes if API key is available
  if (process.env.OPENAI_API_KEY) {
    const openaiRouter = (await import('./routes/openai')).default;
    app.use('/api/openai', openaiRouter);
    app.use('/api/crowecad', openaiRouter); // Also available under /api/crowecad
  }

  const httpServer = createServer(app);
  
  // Initialize collaboration WebSocket server
  collaborationManager.initialize(httpServer);
  
  return httpServer;
}

function extractParameters(command: string): Record<string, any> {
  const parameters: Record<string, any> = {};
  const paramRegex = /--(\w+)=([^\s]+)/g;
  let match;
  
  while ((match = paramRegex.exec(command)) !== null) {
    const [, key, value] = match;
    // Try to parse as number if it looks like one
    if (/^\d+(\.\d+)?[A-Za-z]*$/.test(value)) {
      const numMatch = value.match(/^(\d+(?:\.\d+)?)([A-Za-z]*)$/);
      if (numMatch) {
        const [, numPart, unit] = numMatch;
        parameters[key] = unit ? { value: parseFloat(numPart), unit } : parseFloat(numPart);
      } else {
        parameters[key] = value;
      }
    } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
      parameters[key] = value.toLowerCase() === 'true';
    } else {
      parameters[key] = value;
    }
  }
  
  return parameters;
}

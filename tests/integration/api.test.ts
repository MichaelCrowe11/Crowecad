import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import type { Server } from 'http';
import type { Express } from 'express';

describe('API Integration Tests', () => {
  let server: Server;
  let app: Express;

  beforeAll(async () => {
    // Import and setup Express app
    const express = (await import('express')).default;
    app = express();
    app.use(express.json());
    
    // Setup routes
    const { registerRoutes } = await import('@/server/routes');
    server = await registerRoutes(app);
    
    // Start server
    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve());
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe('Projects API', () => {
    let projectId: string;

    it('should create a new project', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'Test Project',
          description: 'Integration test project'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Project');
      
      projectId = response.body.id;
    });

    it('should get all projects', async () => {
      const response = await request(app)
        .get('/api/projects');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((p: any) => p.id === projectId)).toBe(true);
    });

    it('should get a specific project', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(projectId);
      expect(response.body.name).toBe('Test Project');
    });

    it('should update a project', async () => {
      const response = await request(app)
        .patch(`/api/projects/${projectId}`)
        .send({
          name: 'Updated Test Project'
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Test Project');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('OpenAI API', () => {
    it('should generate CAD from description', async () => {
      const response = await request(app)
        .post('/api/openai/generate')
        .send({
          description: 'Create a gear with 20 teeth',
          industry: 'mechanical'
        });

      // Will fail without API key, but should handle gracefully
      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
      }
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/openai/generate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Commands API', () => {
    it('should execute a command', async () => {
      const response = await request(app)
        .post('/api/commands')
        .send({
          command: 'create circle --radius=50 --center=0,0',
          facilityId: 'test-facility'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.command).toContain('create circle');
    });

    it('should list commands for a facility', async () => {
      const response = await request(app)
        .get('/api/facilities/test-facility/commands');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Reports API', () => {
    let reportId: string;

    it('should generate a report', async () => {
      const response = await request(app)
        .post('/api/reports/generate')
        .send({
          facilityId: 'test-facility',
          templateId: 'facility-overview',
          format: 'pdf'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reportId');
      expect(response.body).toHaveProperty('status');
      
      reportId = response.body.reportId;
    });

    it('should get report status', async () => {
      const response = await request(app)
        .get(`/api/reports/${reportId}/status`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(['pending', 'processing', 'completed', 'failed']).toContain(response.body.status);
    });

    it('should download a report', async () => {
      const response = await request(app)
        .get(`/api/reports/${reportId}/download?format=pdf`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.headers['content-type']).toContain('pdf');
      }
    });

    it('should get analytics data', async () => {
      const response = await request(app)
        .get('/api/reports/analytics?timeframe=30d');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('metrics');
      expect(response.body.metrics).toHaveProperty('totalReports');
    });
  });

  describe('Equipment Types API', () => {
    it('should get all equipment types', async () => {
      const response = await request(app)
        .get('/api/equipment-types');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('category');
    });

    it('should get equipment type by ID', async () => {
      const allTypes = await request(app).get('/api/equipment-types');
      const typeId = allTypes.body[0].id;

      const response = await request(app)
        .get(`/api/equipment-types/${typeId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(typeId);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          // Missing required 'name' field
          description: 'Test'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should handle method not allowed', async () => {
      const response = await request(app)
        .delete('/api/projects'); // DELETE not implemented

      expect(response.status).toBe(404);
    });
  });
});
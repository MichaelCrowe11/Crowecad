import { describe, it, expect, beforeEach } from 'vitest';
import { CroweCadSkillMiner } from '@/lib/skill-miner';

describe('CroweCadSkillMiner', () => {
  let skillMiner: CroweCadSkillMiner;

  beforeEach(() => {
    skillMiner = new CroweCadSkillMiner();
  });

  describe('Skill Management', () => {
    it('should initialize with built-in skills', () => {
      const skills = skillMiner.searchSkills('');
      expect(skills.length).toBeGreaterThan(0);
    });

    it('should add a new skill', () => {
      const newSkill = {
        id: 'test-skill',
        name: 'Test Skill',
        category: 'drawing' as const,
        description: 'A test skill',
        implementation: 'function test() {}',
        language: 'javascript',
        keywords: ['test'],
        confidence: 0.8,
        usage_count: 0
      };

      skillMiner.addSkill(newSkill);
      const found = skillMiner.searchSkills('test');
      
      expect(found).toContainEqual(expect.objectContaining({
        id: 'test-skill',
        name: 'Test Skill'
      }));
    });

    it('should categorize functions correctly', () => {
      const skills = skillMiner.searchSkills('draw');
      expect(skills.every(s => s.category === 'drawing' || s.keywords.includes('draw'))).toBe(true);
    });
  });

  describe('Geometric Algorithms', () => {
    it('should find line intersection algorithm', () => {
      const skills = skillMiner.searchSkills('intersection', 'geometric_algorithms');
      const lineIntersection = skills.find(s => s.name === 'lineIntersection');
      
      expect(lineIntersection).toBeDefined();
      expect(lineIntersection?.implementation).toContain('function lineIntersection');
    });

    it('should find circle-line intersection algorithm', () => {
      const skills = skillMiner.searchSkills('circle', 'geometric_algorithms');
      const circleLineIntersection = skills.find(s => s.name === 'circleLineIntersection');
      
      expect(circleLineIntersection).toBeDefined();
      expect(circleLineIntersection?.implementation).toContain('discriminant');
    });

    it('should find offset polyline algorithm', () => {
      const skills = skillMiner.searchSkills('offset', 'geometric_algorithms');
      const offsetPolyline = skills.find(s => s.name === 'offsetPolyline');
      
      expect(offsetPolyline).toBeDefined();
      expect(offsetPolyline?.implementation).toContain('normals');
    });
  });

  describe('Code Extraction', () => {
    it('should extract JavaScript functions', async () => {
      const code = `
        function calculateArea(width, height) {
          return width * height;
        }
        
        function drawRectangle(x, y, width, height) {
          // Drawing logic
        }
      `;

      const extracted = await skillMiner.extractSkillsFromCode(code, 'javascript');
      
      expect(extracted).toHaveLength(2);
      expect(extracted[0].name).toBe('calculateArea');
      expect(extracted[0].category).toBe('calculation');
      expect(extracted[1].name).toBe('drawRectangle');
      expect(extracted[1].category).toBe('drawing');
    });

    it('should extract Python functions', async () => {
      const code = `
        def rotate_point(x, y, angle):
            import math
            cos_a = math.cos(angle)
            sin_a = math.sin(angle)
            return x * cos_a - y * sin_a, x * sin_a + y * cos_a
        
        def scale_geometry(points, factor):
            return [(p[0] * factor, p[1] * factor) for p in points]
      `;

      const extracted = await skillMiner.extractSkillsFromCode(code, 'python');
      
      expect(extracted).toHaveLength(2);
      expect(extracted[0].name).toBe('rotate_point');
      expect(extracted[0].category).toBe('transformation');
      expect(extracted[1].name).toBe('scale_geometry');
      expect(extracted[1].category).toBe('transformation');
    });

    it('should extract AutoLISP functions', async () => {
      const code = `
        (defun c:drawcircle (/ center radius)
          (setq center (getpoint "\\nSpecify center point: "))
          (setq radius (getdist center "\\nSpecify radius: "))
          (command "circle" center radius)
          (princ)
        )
      `;

      const extracted = await skillMiner.extractSkillsFromCode(code, 'lisp');
      
      expect(extracted).toHaveLength(1);
      expect(extracted[0].name).toBe('c:drawcircle');
      expect(extracted[0].language).toBe('lisp');
    });
  });

  describe('Search and Recommendation', () => {
    it('should search skills by query', () => {
      const results = skillMiner.searchSkills('gear');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('Gear');
    });

    it('should filter by category', () => {
      const results = skillMiner.searchSkills('', 'autolisp_patterns');
      
      expect(results.every(s => s.category === 'autolisp_patterns')).toBe(true);
    });

    it('should calculate match scores correctly', () => {
      const results = skillMiner.searchSkills('draw circle');
      
      expect(results[0].confidence).toBeGreaterThan(0.5);
      expect(results).toContainEqual(
        expect.objectContaining({
          keywords: expect.arrayContaining(['circle'])
        })
      );
    });

    it('should provide context-based recommendations', () => {
      const recommendations = skillMiner.getRecommendations('I need to draw and measure');
      
      expect(recommendations.some(r => r.category === 'drawing')).toBe(true);
      expect(recommendations.some(r => r.category === 'calculation')).toBe(true);
    });
  });

  describe('Usage Tracking', () => {
    it('should update usage count', () => {
      const skillId = 'autolisp-draw-circle';
      const initialSkills = skillMiner.searchSkills('draw circle');
      const initialSkill = initialSkills.find(s => s.id === skillId);
      const initialCount = initialSkill?.usage_count || 0;

      skillMiner.recordUsage(skillId, true);
      
      const updatedSkills = skillMiner.searchSkills('draw circle');
      const updatedSkill = updatedSkills.find(s => s.id === skillId);
      
      expect(updatedSkill?.usage_count).toBe(initialCount + 1);
    });

    it('should adjust confidence on success', () => {
      const skillId = 'autolisp-draw-circle';
      const initialSkills = skillMiner.searchSkills('draw circle');
      const initialSkill = initialSkills.find(s => s.id === skillId);
      const initialConfidence = initialSkill?.confidence || 0;

      skillMiner.recordUsage(skillId, true);
      
      const updatedSkills = skillMiner.searchSkills('draw circle');
      const updatedSkill = updatedSkills.find(s => s.id === skillId);
      
      expect(updatedSkill?.confidence).toBeGreaterThanOrEqual(initialConfidence);
    });

    it('should decrease confidence on failure', () => {
      const skillId = 'autolisp-draw-circle';
      const initialSkills = skillMiner.searchSkills('draw circle');
      const initialSkill = initialSkills.find(s => s.id === skillId);
      const initialConfidence = initialSkill?.confidence || 1;

      skillMiner.recordUsage(skillId, false);
      
      const updatedSkills = skillMiner.searchSkills('draw circle');
      const updatedSkill = updatedSkills.find(s => s.id === skillId);
      
      expect(updatedSkill?.confidence).toBeLessThanOrEqual(initialConfidence);
      expect(updatedSkill?.confidence).toBeGreaterThanOrEqual(0.1);
    });
  });

  describe('Database Import/Export', () => {
    it('should export database', () => {
      const exported = skillMiner.exportDatabase();
      
      expect(exported).toHaveProperty('skills');
      expect(exported).toHaveProperty('algorithms');
      expect(exported).toHaveProperty('patterns');
      expect(Array.isArray(exported.skills)).toBe(true);
      expect(Array.isArray(exported.algorithms)).toBe(true);
    });

    it('should import database', () => {
      const testData = {
        skills: [{
          id: 'imported-skill',
          name: 'Imported Skill',
          category: 'drawing' as const,
          description: 'An imported skill',
          implementation: 'function imported() {}',
          language: 'javascript',
          keywords: ['imported'],
          confidence: 0.9,
          usage_count: 5
        }],
        algorithms: [],
        patterns: []
      };

      skillMiner.importDatabase(testData);
      const found = skillMiner.searchSkills('imported');
      
      expect(found).toContainEqual(expect.objectContaining({
        id: 'imported-skill',
        name: 'Imported Skill'
      }));
    });

    it('should preserve existing data when importing', () => {
      const initialCount = skillMiner.searchSkills('').length;
      
      const testData = {
        skills: [{
          id: 'new-imported',
          name: 'New Import',
          category: 'drawing' as const,
          description: 'New',
          implementation: 'function new() {}',
          language: 'javascript',
          keywords: ['new'],
          confidence: 0.9,
          usage_count: 0
        }],
        algorithms: [],
        patterns: []
      };

      skillMiner.importDatabase(testData);
      const finalCount = skillMiner.searchSkills('').length;
      
      expect(finalCount).toBe(initialCount + 1);
    });
  });
});
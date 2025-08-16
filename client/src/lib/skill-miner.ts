/**
 * CroweCad Skill Mining System
 * Learns and extracts CAD patterns from various sources
 */

interface CADSkill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  implementation: string;
  language: string;
  keywords: string[];
  repository?: string;
  confidence: number;
  usage_count: number;
  embedding?: number[];
}

type SkillCategory = 
  | 'geometric_algorithms'
  | 'autolisp_patterns'
  | 'spatial_operations'
  | 'cad_commands'
  | 'parametric_templates'
  | 'drawing'
  | 'calculation'
  | 'transformation'
  | 'selection'
  | 'modification';

interface GeometricAlgorithm {
  name: string;
  type: 'intersection' | 'tangent' | 'perpendicular' | 'parallel' | 'offset' | 'transform';
  inputs: string[];
  outputs: string[];
  implementation: string;
  complexity: 'O(1)' | 'O(n)' | 'O(n²)' | 'O(n log n)';
}

export class CroweCadSkillMiner {
  private skills: Map<string, CADSkill> = new Map();
  private algorithms: Map<string, GeometricAlgorithm> = new Map();
  private patterns: Map<string, any> = new Map();

  constructor() {
    this.initializeBuiltInSkills();
  }

  /**
   * Initialize with built-in CAD skills and algorithms
   */
  private initializeBuiltInSkills() {
    // Core geometric algorithms
    this.addGeometricAlgorithm({
      name: 'lineIntersection',
      type: 'intersection',
      inputs: ['line1', 'line2'],
      outputs: ['point'],
      complexity: 'O(1)',
      implementation: `
function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 0.0001) return null; // Parallel lines
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    };
  }
  return null;
}`
    });

    this.addGeometricAlgorithm({
      name: 'circleLineIntersection',
      type: 'intersection',
      inputs: ['circle', 'line'],
      outputs: ['points'],
      complexity: 'O(1)',
      implementation: `
function circleLineIntersection(cx, cy, r, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const fx = x1 - cx;
  const fy = y1 - cy;
  
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return []; // No intersection
  
  const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
  const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);
  
  const points = [];
  if (t1 >= 0 && t1 <= 1) {
    points.push({ x: x1 + t1 * dx, y: y1 + t1 * dy });
  }
  if (t2 >= 0 && t2 <= 1 && Math.abs(t2 - t1) > 0.0001) {
    points.push({ x: x1 + t2 * dx, y: y1 + t2 * dy });
  }
  return points;
}`
    });

    this.addGeometricAlgorithm({
      name: 'offsetPolyline',
      type: 'offset',
      inputs: ['polyline', 'distance'],
      outputs: ['polyline'],
      complexity: 'O(n)',
      implementation: `
function offsetPolyline(points, distance) {
  const offsetPoints = [];
  
  for (let i = 0; i < points.length; i++) {
    const prev = points[i - 1] || points[points.length - 1];
    const curr = points[i];
    const next = points[i + 1] || points[0];
    
    // Calculate normals
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const n1x = -dy1 / len1;
    const n1y = dx1 / len1;
    
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const n2x = -dy2 / len2;
    const n2y = dx2 / len2;
    
    // Average normal
    const nx = (n1x + n2x) / 2;
    const ny = (n1y + n2y) / 2;
    const nlen = Math.sqrt(nx * nx + ny * ny);
    
    // Scale by distance
    const scale = distance / nlen;
    offsetPoints.push({
      x: curr.x + nx * scale,
      y: curr.y + ny * scale
    });
  }
  
  return offsetPoints;
}`
    });

    // AutoLISP patterns
    this.addSkill({
      id: 'autolisp-draw-circle',
      name: 'Draw Circle (AutoLISP)',
      category: 'autolisp_patterns',
      description: 'Draw a circle with specified center and radius',
      language: 'lisp',
      keywords: ['circle', 'draw', 'geometry'],
      confidence: 1.0,
      usage_count: 0,
      implementation: `
(defun c:drawcircle (/ center radius)
  (setq center (getpoint "\\nSpecify center point: "))
  (setq radius (getdist center "\\nSpecify radius: "))
  (command "circle" center radius)
  (princ)
)`
    });

    this.addSkill({
      id: 'autolisp-offset-entity',
      name: 'Offset Entity (AutoLISP)',
      category: 'autolisp_patterns',
      description: 'Offset selected entity by specified distance',
      language: 'lisp',
      keywords: ['offset', 'modify', 'distance'],
      confidence: 1.0,
      usage_count: 0,
      implementation: `
(defun c:offsetent (/ ent dist side)
  (setq ent (entsel "\\nSelect entity to offset: "))
  (setq dist (getdist "\\nSpecify offset distance: "))
  (setq side (getpoint "\\nSpecify side to offset: "))
  (command "offset" dist ent side "")
  (princ)
)`
    });

    // Parametric templates
    this.addSkill({
      id: 'parametric-gear',
      name: 'Parametric Gear Generator',
      category: 'parametric_templates',
      description: 'Generate involute gear profile with parameters',
      language: 'javascript',
      keywords: ['gear', 'parametric', 'mechanical'],
      confidence: 1.0,
      usage_count: 0,
      implementation: `
function generateGear(teeth, module, pressureAngle = 20) {
  const pitchDiameter = teeth * module;
  const baseDiameter = pitchDiameter * Math.cos(pressureAngle * Math.PI / 180);
  const addendum = module;
  const dedendum = 1.25 * module;
  
  const points = [];
  const angleStep = (2 * Math.PI) / teeth;
  
  for (let i = 0; i < teeth; i++) {
    const angle = i * angleStep;
    // Generate involute curve for tooth profile
    const toothProfile = generateInvolute(baseDiameter / 2, angle);
    points.push(...toothProfile);
  }
  
  return { points, metadata: { teeth, module, pitchDiameter } };
}`
    });
  }

  /**
   * Add a geometric algorithm to the knowledge base

    // Basic drawing and calculation skills to support recommendations
    this.addSkill({
      id: 'draw-rectangle-js',
      name: 'drawRectangle',
      category: 'drawing',
      description: 'Draw a rectangle with given position and size',
      language: 'javascript',
      keywords: ['draw', 'rectangle', 'shape'],
      confidence: 0.9,
      usage_count: 0,
      implementation: `
function drawRectangle(x, y, width, height, ctx) {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.stroke();
}`
    });

    this.addSkill({
      id: 'calculate-area-js',
      name: 'calculateArea',
      category: 'calculation',
      description: 'Calculate rectangular area',
      language: 'javascript',
      keywords: ['calculate', 'area', 'measure'],
      confidence: 0.9,
      usage_count: 0,
      implementation: `
function calculateArea(width, height) {
  return width * height;
}`
    });

   */
  addGeometricAlgorithm(algorithm: GeometricAlgorithm) {
    this.algorithms.set(algorithm.name, algorithm);
    
    // Also add as a skill
    this.addSkill({
      id: `algo-${algorithm.name}`,
      name: algorithm.name,
      category: 'geometric_algorithms',
      description: `${algorithm.type} algorithm: ${algorithm.inputs.join(', ')} -> ${algorithm.outputs.join(', ')}`,
      language: 'javascript',
      keywords: [algorithm.type, ...algorithm.inputs, ...algorithm.outputs],
      confidence: 1.0,
      usage_count: 0,
      implementation: algorithm.implementation
    });
  }

  /**
   * Add a CAD skill to the knowledge base
   */
  addSkill(skill: CADSkill) {
    this.skills.set(skill.id, skill);
  }

  /**
   * Extract skills from code snippet
   */
  async extractSkillsFromCode(code: string, language: string): Promise<CADSkill[]> {
    const extractedSkills: CADSkill[] = [];
    
    // Pattern matching for different languages
    const patterns = {
      javascript: {
        function: /function\s+(\w+)\s*\((.*?)\)\s*{/g,
        class: /class\s+(\w+)\s*{/g,
        method: /(\w+)\s*\((.*?)\)\s*{/g
      },
      python: {
        function: /def\s+(\w+)\s*\((.*?)\):/g,
        class: /class\s+(\w+).*?:/g,
        method: /def\s+(\w+)\s*\(self.*?\):/g
      },
      lisp: {
        function: /\(defun\s+([^\s]+)\s*\((.*?)\)/g,
        macro: /\(defmacro\s+([^\s]+)\s*\((.*?)\)/g
      }
    };

    const langPatterns = patterns[language as keyof typeof patterns];
    if (!langPatterns) return extractedSkills;

    // Extract functions
    for (const [type, pattern] of Object.entries(langPatterns)) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const [fullMatch, name, params] = match;
        const category = this.categorizeFunction(name);
        
        extractedSkills.push({
          id: `extracted-${name}-${Date.now()}`,
          name,
          category,
          description: `Extracted ${type}: ${name}`,
          language,
          keywords: this.extractKeywords(name, params || ''),
          confidence: 0.7,
          usage_count: 0,
          implementation: this.extractFunctionBody(code, match.index)
        });
      }
    }

    return extractedSkills;
  }

  /**
   * Categorize function based on name and content
   */
  private categorizeFunction(name: string): SkillCategory {
    const lowerName = name.toLowerCase();
    
    const categories: Record<string, string[]> = {
      drawing: ['draw', 'line', 'circle', 'arc', 'poly', 'rect', 'ellipse'],
      calculation: ['calc', 'angle', 'dist', 'area', 'length', 'volume', 'measure'],
      transformation: ['move', 'rotate', 'scale', 'mirror', 'offset', 'translate', 'transform'],
      selection: ['select', 'pick', 'get', 'find', 'filter', 'query'],
      modification: ['trim', 'extend', 'fillet', 'chamfer', 'split', 'join', 'merge'],
      geometric_algorithms: ['intersect', 'tangent', 'perpendicular', 'parallel', 'project'],
      parametric_templates: ['parametric', 'template', 'generate', 'create']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => lowerName.includes(kw))) {
        return category as SkillCategory;
      }
    }

    return 'cad_commands';
  }

  /**
   * Extract keywords from function name and parameters
   */
  private extractKeywords(name: string, params: string): string[] {
    const keywords = new Set<string>();
    
    // From name
    const nameWords = name.split(/(?=[A-Z])|_/).filter(w => w.length > 2);
    nameWords.forEach(w => keywords.add(w.toLowerCase()));
    
    // From params
    const paramWords = params.split(/[,\s]+/).filter(w => w.length > 2);
    paramWords.forEach(w => keywords.add(w.toLowerCase()));
    
    return Array.from(keywords);
  }

  /**
   * Extract function body from code
   */
  private extractFunctionBody(code: string, startIndex: number): string {
    let depth = 0;
    let inFunction = false;
    let endIndex = startIndex;
    
    for (let i = startIndex; i < code.length && i < startIndex + 2000; i++) {
      if (code[i] === '{' || code[i] === '(') {
        depth++;
        inFunction = true;
      } else if (code[i] === '}' || code[i] === ')') {
        depth--;
        if (inFunction && depth === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }
    
    return code.substring(startIndex, endIndex);
  }

  /**
   * Search for skills by query
   */
  searchSkills(query: string, category?: SkillCategory): CADSkill[] {
    const results: CADSkill[] = [];
    const queryLower = query.toLowerCase();
    
    for (const skill of Array.from(this.skills.values())) {
      if (category && skill.category !== category) continue;
      
      const matchScore = this.calculateMatchScore(skill, queryLower);
      if (matchScore > 0.3) {
        results.push({ ...skill, confidence: matchScore });
      }
    }
    
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate match score between skill and query
   */
  private calculateMatchScore(skill: CADSkill, query: string): number {
    let score = 0;
    
    // Name match
    if (skill.name.toLowerCase().includes(query)) score += 0.5;
    
    // Keyword matches
    const queryWords = query.split(/\s+/);
    for (const word of queryWords) {
      if (skill.keywords.some(kw => kw.includes(word))) {
        score += 0.2;
      }
    }
    
    // Description match
    if (skill.description.toLowerCase().includes(query)) score += 0.3;
    
    // Boost by usage
    
    
    return Math.min(1.0, score);
  }

  /**
   * Get recommended skills based on context
   */
  getRecommendations(context: string): CADSkill[] {
    const recommendations: CADSkill[] = [];
    
    // Analyze context for relevant keywords
    const contextLower = context.toLowerCase();
    const relevantCategories = new Set<SkillCategory>();
    
    if (contextLower.includes('draw') || contextLower.includes('create')) {
      relevantCategories.add('drawing');
    }
    if (contextLower.includes('measure') || contextLower.includes('calculate')) {
      relevantCategories.add('calculation');
    }
    if (contextLower.includes('move') || contextLower.includes('rotate')) {
      relevantCategories.add('transformation');
    }
    
    // Get top skills from relevant categories
    for (const category of Array.from(relevantCategories)) {
      const categorySkills = Array.from(this.skills.values())
        .filter(s => s.category === category)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
      
      recommendations.push(...categorySkills);
    }
    
    return recommendations;
  }

  /**
   * Learn from user interaction
   */
  recordUsage(skillId: string, success: boolean) {
    const skill = this.skills.get(skillId);
    if (skill) {
      skill.usage_count++;
      if (success) {
        skill.confidence = Math.min(1.0, skill.confidence + 0.05);
      } else {
        skill.confidence = Math.max(0.1, skill.confidence - 0.1);
      }
    }
  }

  /**
   * Export skills database
   */
  exportDatabase(): any {
    return {
      skills: Array.from(this.skills.values()),
      algorithms: Array.from(this.algorithms.values()),
      patterns: Array.from(this.patterns.entries())
    };
  }

  /**
   * Import skills database
   */
  importDatabase(data: any) {
    if (data.skills) {
      data.skills.forEach((skill: CADSkill) => {
        this.skills.set(skill.id, skill);
      });
    }
    if (data.algorithms) {
      data.algorithms.forEach((algo: GeometricAlgorithm) => {
        this.algorithms.set(algo.name, algo);
      });
    }
    if (data.patterns) {
      data.patterns.forEach(([key, value]: [string, any]) => {
        this.patterns.set(key, value);
      });
    }
  }
}

// Export singleton instance
export const skillMiner = new CroweCadSkillMiner();
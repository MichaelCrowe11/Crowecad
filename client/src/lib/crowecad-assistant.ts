/**
 * CroweCad Assistant Client
 * Integrates OpenAI Assistant API with skill mining for intelligent CAD operations
 */

import { skillMiner } from './skill-miner';

interface AssistantResponse {
  response: string;
  threadId: string;
  relevantSkills: Array<{
    name: string;
    category: string;
  }>;
}

interface GenerationResponse {
  code: string;
  format: string;
  relevantSkills: Array<{
    name: string;
    category: string;
    confidence: number;
  }>;
}

interface ImageAnalysisResponse {
  analysis: string;
  suggestedOperations: Array<{
    name: string;
    category: string;
    implementation: string;
  }>;
}

import { SYSTEM_CAD_ASSISTANT, SYSTEM_SOFTWARE_ENGINEER } from '@/lib/agents/prompt-presets';

export class CroweCadAssistant {
  private threadId: string | null = null;
  private apiEndpoint = '/api/openai';
  
  constructor() {
    this.initializeLocalSkills();
  }

  /**
   * Initialize local skill database
   */
  private initializeLocalSkills() {
    // Skills are already initialized in skillMiner singleton
    console.log('CroweCad Assistant initialized with skill database');
  }

  /**
   * Process a CAD request using the assistant
   */
  async processRequest(
    message: string,
    category?: string
  ): Promise<AssistantResponse> {
    try {
      const response = await fetch(`${this.apiEndpoint}/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          threadId: this.threadId,
          category
        })
      });

      if (!response.ok) {
        throw new Error('Assistant request failed');
      }

      const result = await response.json();
      
      // Store thread ID for conversation continuity
      if (result.data.threadId) {
        this.threadId = result.data.threadId;
      }

      return result.data;
    } catch (error) {
      console.error('Assistant error:', error);
      throw error;
    }
  }

  /**
   * Generate CAD code from description
   */
  async generateCAD(
    description: string,
    options: {
      industry?: string;
      format?: 'dxf' | 'step' | 'stl' | 'obj';
      parameters?: Record<string, any>;
    } = {}
  ): Promise<GenerationResponse> {
    try {
      const response = await fetch(`${this.apiEndpoint}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          ...options, system: SYSTEM_CAD_ASSISTANT
        })
      });

      if (!response.ok) {
        throw new Error('CAD generation failed');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Generation error:', error);
      throw error;
    }
  }

  /**
   * Analyze image for CAD generation
   */
  async analyzeImage(
    imageBase64: string,
    prompt?: string
  ): Promise<ImageAnalysisResponse> {
    try {
      const response = await fetch(`${this.apiEndpoint}/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          prompt
        })
      });

      if (!response.ok) {
        throw new Error('Image analysis failed');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }

  /**
   * Execute code with Code Interpreter
   */
  async executeCode(
    code: string,
    description: string
  ): Promise<any> {
    try {
      const response = await fetch(`${this.apiEndpoint}/code-interpreter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          description
        })
      });

      if (!response.ok) {
        throw new Error('Code execution failed');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Code execution error:', error);
      throw error;
    }
  }

  /**
   * Get skill recommendations
   */
  async getRecommendations(context: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context })
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const result = await response.json();
      return result.data.recommendations;
    } catch (error) {
      console.error('Recommendations error:', error);
      
      // Fallback to local recommendations
      return skillMiner.getRecommendations(context);
    }
  }

  /**
   * Search skills database
   */
  async searchSkills(
    query: string,
    category?: string
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({ q: query });
      if (category) params.append('category', category);

      const response = await fetch(
        `${this.apiEndpoint}/skills/search?${params}`
      );

      if (!response.ok) {
        throw new Error('Skill search failed');
      }

      const result = await response.json();
      return result.data.results;
    } catch (error) {
      console.error('Skill search error:', error);
      
      // Fallback to local search
      return skillMiner.searchSkills(query, category as any);
    }
  }

  /**
   * Generate AutoLISP code
   */
  generateAutoLISP(operation: string, parameters: any): string {
    // Search for relevant AutoLISP patterns
    const patterns = skillMiner.searchSkills(operation, 'autolisp_patterns');
    
    if (patterns.length > 0) {
      // Use the best matching pattern as template
      const template = patterns[0].implementation;
      
      // Replace parameters in template
      let code = template;
      for (const [key, value] of Object.entries(parameters)) {
        code = code.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(value));
      }
      
      return code;
    }
    
    // Generate basic AutoLISP structure
    return `(defun c:${operation} ()
  ; Generated by CroweCad Assistant
  ${this.generateAutoLISPBody(operation, parameters)}
  (princ)
)`;
  }

  /**
   * Generate AutoLISP function body
   */
  private generateAutoLISPBody(operation: string, parameters: any): string {
    const operationMap: Record<string, (params: any) => string> = {
      'circle': (p) => `(command "circle" '(${p.x || 0} ${p.y || 0}) ${p.radius || 10})`,
      'line': (p) => `(command "line" '(${p.x1 || 0} ${p.y1 || 0}) '(${p.x2 || 10} ${p.y2 || 10}) "")`,
      'rectangle': (p) => `(command "rectangle" '(${p.x1 || 0} ${p.y1 || 0}) '(${p.x2 || 10} ${p.y2 || 10}))`,
      'arc': (p) => `(command "arc" '(${p.cx || 0} ${p.cy || 0}) '(${p.sx || 10} ${p.sy || 0}) '(${p.ex || 0} ${p.ey || 10}))`,
      'offset': (p) => `(command "offset" ${p.distance || 5} (entsel) '(${p.x || 0} ${p.y || 0}) "")`,
      'mirror': (p) => `(command "mirror" (ssget) "" '(${p.x1 || 0} ${p.y1 || 0}) '(${p.x2 || 10} ${p.y2 || 0}) "N")`,
      'rotate': (p) => `(command "rotate" (ssget) "" '(${p.cx || 0} ${p.cy || 0}) ${p.angle || 90})`,
      'scale': (p) => `(command "scale" (ssget) "" '(${p.cx || 0} ${p.cy || 0}) ${p.factor || 2})`
    };

    const generator = operationMap[operation.toLowerCase()];
    if (generator) {
      return generator(parameters);
    }

    return `; TODO: Implement ${operation}`;
  }

  /**
   * Calculate geometry using learned algorithms
   */
  calculateGeometry(
    calculationType: 'intersection' | 'tangent' | 'angle' | 'distance' | 'area',
    entities: any[]
  ): any {
    // Search for relevant geometric algorithms
    const algorithms = skillMiner.searchSkills(
      calculationType,
      'geometric_algorithms'
    );

    if (algorithms.length > 0) {
      // Execute the algorithm
      try {
        const func = new Function('entities', algorithms[0].implementation + '\nreturn result;');
        return func(entities);
      } catch (error) {
        console.error('Algorithm execution error:', error);
      }
    }

    // Fallback calculations
    switch (calculationType) {
      case 'distance':
        if (entities.length >= 2) {
          const dx = entities[1].x - entities[0].x;
          const dy = entities[1].y - entities[0].y;
          return Math.sqrt(dx * dx + dy * dy);
        }
        break;
      
      case 'angle':
        if (entities.length >= 2) {
          const dx = entities[1].x - entities[0].x;
          const dy = entities[1].y - entities[0].y;
          return Math.atan2(dy, dx) * 180 / Math.PI;
        }
        break;
      
      case 'area':
        if (entities.length >= 3) {
          // Shoelace formula for polygon area
          let area = 0;
          for (let i = 0; i < entities.length; i++) {
            const j = (i + 1) % entities.length;
            area += entities[i].x * entities[j].y;
            area -= entities[j].x * entities[i].y;
          }
          return Math.abs(area) / 2;
        }
        break;
    }

    return null;
  }

  /**
   * Reset conversation thread
   */
  resetThread() {
    this.threadId = null;
  }

  /**
   * Get conversation history
   */
  getThreadId(): string | null {
    return this.threadId;
  }
}

// Export singleton instance
export const croweCadAssistant = new CroweCadAssistant();
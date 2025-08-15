import Anthropic from '@anthropic-ai/sdk';

/*
Sub-Agents Pattern from Anthropic Cookbook
Use different Claude models for cost optimization
*/

type ModelType = 'haiku' | 'sonnet' | 'opus';

interface TaskComplexity {
  simple: ModelType;
  moderate: ModelType;
  complex: ModelType;
  critical: ModelType;
}

export class SubAgentsManager {
  private anthropic: Anthropic;
  private taskComplexity: TaskComplexity = {
    simple: 'haiku',
    moderate: 'haiku',
    complex: 'sonnet',
    critical: 'sonnet' // Using sonnet for critical as it's our best available model
  };

  private modelMap = {
    haiku: 'claude-3-haiku-20240307',
    sonnet: 'claude-sonnet-4-20250514',
    opus: 'claude-3-opus-20240229'
  };

  constructor(apiKey?: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY || 'placeholder',
      dangerouslyAllowBrowser: true
    });
  }

  /**
   * Route task to appropriate model based on complexity
   */
  async routeTask(
    task: string,
    complexity: keyof TaskComplexity = 'moderate'
  ): Promise<string> {
    const model = this.modelMap[this.taskComplexity[complexity]];
    
    try {
      const response = await this.anthropic.messages.create({
        model,
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: task
        }]
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error(`Sub-agent error (${complexity}):`, error);
      return '';
    }
  }

  /**
   * Simple queries handled by Haiku
   */
  async simpleQuery(query: string): Promise<string> {
    return this.routeTask(query, 'simple');
  }

  /**
   * Equipment identification with moderate complexity
   */
  async identifyEquipment(description: string): Promise<{
    type: string;
    category: string;
    properties: Record<string, any>;
  }> {
    const task = `
Identify this equipment for a mycology facility:
${description}

Respond in JSON format:
{
  "type": "equipment type",
  "category": "category",
  "properties": {}
}
`;

    const response = await this.routeTask(task, 'moderate');
    try {
      return JSON.parse(response);
    } catch {
      return { type: 'unknown', category: 'processing', properties: {} };
    }
  }

  /**
   * Complex analysis using Sonnet
   */
  async complexAnalysis(data: any, analysisType: string): Promise<any> {
    const task = `
Perform ${analysisType} analysis on this data:
${JSON.stringify(data, null, 2)}

Provide comprehensive analysis with insights and recommendations.
`;

    return this.routeTask(task, 'complex');
  }

  /**
   * Batch processing with cost optimization
   */
  async batchProcess(
    tasks: Array<{ task: string; complexity: keyof TaskComplexity }>
  ): Promise<string[]> {
    // Group tasks by complexity for efficient processing
    const grouped = tasks.reduce((acc, { task, complexity }) => {
      if (!acc[complexity]) acc[complexity] = [];
      acc[complexity].push(task);
      return acc;
    }, {} as Record<string, string[]>);

    const results: string[] = [];

    // Process each group with appropriate model
    for (const [complexity, taskList] of Object.entries(grouped)) {
      for (const task of taskList) {
        const result = await this.routeTask(task, complexity as keyof TaskComplexity);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Hierarchical processing - Haiku filters, Sonnet analyzes
   */
  async hierarchicalProcess(
    data: any[],
    filterCriteria: string,
    analysisType: string
  ): Promise<{
    filtered: any[];
    analysis: string;
  }> {
    // Step 1: Use Haiku for filtering (cheap)
    const filterTask = `
Filter this data based on: ${filterCriteria}
Data: ${JSON.stringify(data)}
Return JSON array of items that match.
`;

    const filterResult = await this.routeTask(filterTask, 'simple');
    let filtered = [];
    
    try {
      filtered = JSON.parse(filterResult);
    } catch {
      filtered = data; // Fallback to all data if parsing fails
    }

    // Step 2: Use Sonnet for detailed analysis (expensive, but on filtered data)
    const analysisTask = `
Perform ${analysisType} on this filtered data:
${JSON.stringify(filtered)}
`;

    const analysis = await this.routeTask(analysisTask, 'complex');

    return { filtered, analysis };
  }

  /**
   * Cost estimation for tasks
   */
  estimateCost(tasks: Array<{ complexity: keyof TaskComplexity; tokens: number }>): {
    totalCost: number;
    breakdown: Record<string, number>;
  } {
    // Approximate costs per 1M tokens (example rates)
    const costPerMillion = {
      haiku: 0.25,
      sonnet: 3.00,
      opus: 15.00
    };

    const breakdown: Record<string, number> = {};
    let totalCost = 0;

    tasks.forEach(({ complexity, tokens }) => {
      const model = this.taskComplexity[complexity];
      const cost = (tokens / 1000000) * costPerMillion[model];
      
      if (!breakdown[model]) breakdown[model] = 0;
      breakdown[model] += cost;
      totalCost += cost;
    });

    return { totalCost, breakdown };
  }

  /**
   * Intelligent task routing based on content
   */
  async intelligentRoute(content: string): Promise<{
    model: string;
    response: string;
    estimatedCost: number;
  }> {
    // Analyze task complexity
    const keywords = {
      simple: ['list', 'count', 'name', 'identify', 'basic'],
      moderate: ['analyze', 'compare', 'evaluate', 'describe'],
      complex: ['optimize', 'design', 'strategy', 'comprehensive', 'detailed']
    };

    let complexity: keyof TaskComplexity = 'simple';
    
    for (const [level, words] of Object.entries(keywords)) {
      if (words.some(word => content.toLowerCase().includes(word))) {
        complexity = level as keyof TaskComplexity;
      }
    }

    const response = await this.routeTask(content, complexity);
    const model = this.taskComplexity[complexity];
    const estimatedCost = this.estimateCost([{ complexity, tokens: content.length + response.length }]).totalCost;

    return { model, response, estimatedCost };
  }
}

export const subAgents = new SubAgentsManager();
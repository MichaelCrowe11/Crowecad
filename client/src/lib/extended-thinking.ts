import OpenAI from 'openai';

/*
Extended Thinking Pattern from Anthropic Cookbook
Allows AI to think deeply about complex facility planning decisions
*/

const DEFAULT_MODEL_STR = "gpt-3.5-turbo";

export interface ThinkingResult {
  decision: string;
  reasoning: string[];
  alternatives: string[];
  risks: string[];
  recommendations: string[];
  confidence: number;
}

export class ExtendedThinking {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || import.meta.env.VITE_OPENAI_API_KEY || 'placeholder',
      dangerouslyAllowBrowser: true
    });
  }

  /**
   * Deep analysis for facility layout optimization
   */
  async analyzeFacilityLayout(
    facilityData: any,
    requirements: string[]
  ): Promise<ThinkingResult> {
    const prompt = `
You are an expert mycology facility designer. Analyze this facility deeply and provide comprehensive recommendations.

Facility Data:
${JSON.stringify(facilityData, null, 2)}

Requirements:
${requirements.join('\n')}

Think through:
1. Current layout efficiency
2. Workflow optimization opportunities
3. Contamination risk factors
4. Space utilization
5. Growth capacity
6. Cost implications
7. Regulatory compliance
8. Future scalability

Provide your analysis in this JSON format:
{
  "decision": "primary recommendation",
  "reasoning": ["detailed reasoning points"],
  "alternatives": ["alternative approaches"],
  "risks": ["potential risks to consider"],
  "recommendations": ["specific actionable recommendations"],
  "confidence": 0.0-1.0
}

Take your time to think through all aspects thoroughly.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Extended thinking error:', error);
      return {
        decision: "Unable to complete analysis",
        reasoning: [],
        alternatives: [],
        risks: [],
        recommendations: [],
        confidence: 0
      };
    }
  }

  /**
   * Complex multi-factor optimization
   */
  async optimizeMultipleFactors(
    factors: {
      cost: number;
      efficiency: number;
      safety: number;
      scalability: number;
      sustainability: number;
    },
    constraints: string[]
  ): Promise<{
    optimizedValues: typeof factors;
    tradeoffs: string[];
    priorityOrder: string[];
  }> {
    const prompt = `
Optimize these facility factors while considering constraints:

Current Factors:
- Cost Index: ${factors.cost}/100
- Efficiency: ${factors.efficiency}/100
- Safety: ${factors.safety}/100
- Scalability: ${factors.scalability}/100
- Sustainability: ${factors.sustainability}/100

Constraints:
${constraints.join('\n')}

Think through:
1. Which factors can be improved without affecting others
2. What tradeoffs are necessary
3. Priority order for optimization
4. Realistic target values

Provide optimization in JSON format:
{
  "optimizedValues": {
    "cost": number,
    "efficiency": number,
    "safety": number,
    "scalability": number,
    "sustainability": number
  },
  "tradeoffs": ["list of necessary tradeoffs"],
  "priorityOrder": ["factors in priority order"]
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Multi-factor optimization error:', error);
      return {
        optimizedValues: factors,
        tradeoffs: [],
        priorityOrder: Object.keys(factors)
      };
    }
  }

  /**
   * Compliance checking with deep analysis
   */
  async checkCompliance(
    facilityDesign: any,
    standards: string[]
  ): Promise<{
    compliant: boolean;
    violations: string[];
    recommendations: string[];
    certificationReady: boolean;
  }> {
    const prompt = `
Perform deep compliance analysis for this mycology facility:

Facility Design:
${JSON.stringify(facilityDesign, null, 2)}

Standards to Check:
${standards.join('\n')}

Analyze thoroughly:
1. Equipment placement compliance
2. Zone separation requirements
3. Environmental control standards
4. Safety regulations
5. Documentation requirements
6. Certification readiness

Provide analysis in JSON format:
{
  "compliant": boolean,
  "violations": ["list of violations found"],
  "recommendations": ["fixes for violations"],
  "certificationReady": boolean
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Compliance check error:', error);
      return {
        compliant: false,
        violations: ["Unable to complete compliance check"],
        recommendations: [],
        certificationReady: false
      };
    }
  }

  /**
   * Strategic planning with long-term thinking
   */
  async strategicPlanning(
    currentState: any,
    goals: string[],
    timeframe: string
  ): Promise<{
    phases: Array<{
      phase: number;
      duration: string;
      goals: string[];
      actions: string[];
      investments: string[];
      expectedOutcome: string;
    }>;
    totalInvestment: string;
    roi: string;
    risks: string[];
  }> {
    const prompt = `
Create a strategic plan for facility development:

Current State:
${JSON.stringify(currentState, null, 2)}

Goals:
${goals.join('\n')}

Timeframe: ${timeframe}

Think through:
1. Phased approach to achieve goals
2. Resource requirements per phase
3. Risk mitigation strategies
4. ROI projections
5. Critical success factors

Provide strategic plan in JSON format with phases, investments, and expected outcomes.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 3000,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Strategic planning error:', error);
      return {
        phases: [],
        totalInvestment: "Unknown",
        roi: "Unknown",
        risks: []
      };
    }
  }
}

export const extendedThinking = new ExtendedThinking();
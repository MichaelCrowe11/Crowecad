import { subAgents } from './sub-agents';

/*
Automated Evaluation System from Anthropic Cookbook
Automatically evaluate and score facility designs
*/

export interface EvaluationCriteria {
  name: string;
  weight: number;
  description: string;
  scoreRange: [number, number];
}

export interface EvaluationResult {
  overallScore: number;
  scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'none';
}

export class AutomatedEvaluations {
  private criteria: EvaluationCriteria[] = [
    {
      name: 'efficiency',
      weight: 0.25,
      description: 'Workflow efficiency and space utilization',
      scoreRange: [0, 100]
    },
    {
      name: 'safety',
      weight: 0.30,
      description: 'Contamination control and safety measures',
      scoreRange: [0, 100]
    },
    {
      name: 'scalability',
      weight: 0.15,
      description: 'Ability to scale production',
      scoreRange: [0, 100]
    },
    {
      name: 'compliance',
      weight: 0.20,
      description: 'Regulatory compliance and standards',
      scoreRange: [0, 100]
    },
    {
      name: 'sustainability',
      weight: 0.10,
      description: 'Environmental impact and resource efficiency',
      scoreRange: [0, 100]
    }
  ];

  /**
   * Evaluate facility design automatically
   */
  async evaluateFacility(facilityData: any): Promise<EvaluationResult> {
    const scores: Record<string, number> = {};
    const evaluations: string[] = [];

    // Evaluate each criterion
    for (const criterion of this.criteria) {
      const score = await this.evaluateCriterion(facilityData, criterion);
      scores[criterion.name] = score;
      evaluations.push(`${criterion.name}: ${score}/100`);
    }

    // Calculate weighted overall score
    const overallScore = this.criteria.reduce((total, criterion) => {
      return total + (scores[criterion.name] * criterion.weight);
    }, 0);

    // Determine strengths and weaknesses
    const strengths = Object.entries(scores)
      .filter(([_, score]) => score >= 80)
      .map(([name, score]) => `Strong ${name} (${score}/100)`);

    const weaknesses = Object.entries(scores)
      .filter(([_, score]) => score < 60)
      .map(([name, score]) => `Improve ${name} (${score}/100)`);

    // Generate suggestions
    const suggestions = await this.generateSuggestions(facilityData, scores);

    // Determine certification level
    const certificationLevel = this.determineCertificationLevel(overallScore);

    return {
      overallScore: Math.round(overallScore),
      scores,
      strengths,
      weaknesses,
      suggestions,
      certificationLevel
    };
  }

  /**
   * Evaluate a specific criterion
   */
  private async evaluateCriterion(
    facilityData: any,
    criterion: EvaluationCriteria
  ): Promise<number> {
    const prompt = `
Evaluate this facility's ${criterion.name}:
${criterion.description}

Facility Data:
- Equipment count: ${facilityData.equipment?.length || 0}
- Zones: ${facilityData.zones?.length || 0}
- Total area: ${facilityData.area || 'unknown'}

Score from ${criterion.scoreRange[0]} to ${criterion.scoreRange[1]}.
Return only the numeric score.
`;

    const response = await subAgents.simpleQuery(prompt);
    const score = parseInt(response.match(/\d+/)?.[0] || '50');
    return Math.min(Math.max(score, criterion.scoreRange[0]), criterion.scoreRange[1]);
  }

  /**
   * Generate improvement suggestions
   */
  private async generateSuggestions(
    facilityData: any,
    scores: Record<string, number>
  ): Promise<string[]> {
    const lowScores = Object.entries(scores)
      .filter(([_, score]) => score < 70)
      .map(([name, score]) => `${name}: ${score}`);

    if (lowScores.length === 0) {
      return ['Maintain current excellence', 'Consider advanced automation'];
    }

    const prompt = `
Generate 3-5 specific suggestions to improve these facility aspects:
${lowScores.join(', ')}

Return as JSON array of strings.
`;

    const response = await subAgents.routeTask(prompt, 'moderate');
    try {
      return JSON.parse(response);
    } catch {
      return ['Improve workflow efficiency', 'Enhance safety measures', 'Optimize space usage'];
    }
  }

  /**
   * Determine certification level based on score
   */
  private determineCertificationLevel(score: number): EvaluationResult['certificationLevel'] {
    if (score >= 90) return 'platinum';
    if (score >= 80) return 'gold';
    if (score >= 70) return 'silver';
    if (score >= 60) return 'bronze';
    return 'none';
  }

  /**
   * Compare two facility designs
   */
  async compareFacilities(
    facility1: any,
    facility2: any
  ): Promise<{
    winner: 'facility1' | 'facility2' | 'tie';
    comparison: Record<string, { facility1: number; facility2: number; winner: string }>;
    recommendation: string;
  }> {
    const eval1 = await this.evaluateFacility(facility1);
    const eval2 = await this.evaluateFacility(facility2);

    const comparison: Record<string, any> = {};
    
    for (const criterion of this.criteria) {
      const score1 = eval1.scores[criterion.name];
      const score2 = eval2.scores[criterion.name];
      comparison[criterion.name] = {
        facility1: score1,
        facility2: score2,
        winner: score1 > score2 ? 'facility1' : score2 > score1 ? 'facility2' : 'tie'
      };
    }

    const winner = eval1.overallScore > eval2.overallScore ? 'facility1' :
                   eval2.overallScore > eval1.overallScore ? 'facility2' : 'tie';

    const recommendation = await this.generateComparison(eval1, eval2, winner);

    return { winner, comparison, recommendation };
  }

  /**
   * Generate comparison recommendation
   */
  private async generateComparison(
    eval1: EvaluationResult,
    eval2: EvaluationResult,
    winner: string
  ): Promise<string> {
    const prompt = `
Based on these facility evaluations:
Facility 1: Score ${eval1.overallScore}, Certification: ${eval1.certificationLevel}
Facility 2: Score ${eval2.overallScore}, Certification: ${eval2.certificationLevel}
Winner: ${winner}

Provide a brief recommendation (1-2 sentences).
`;

    return subAgents.simpleQuery(prompt);
  }

  /**
   * Track evaluation history
   */
  private evaluationHistory: Array<{
    timestamp: Date;
    facilityId: string;
    score: number;
    certification: string;
  }> = [];

  /**
   * Save evaluation to history
   */
  saveEvaluation(facilityId: string, result: EvaluationResult): void {
    this.evaluationHistory.push({
      timestamp: new Date(),
      facilityId,
      score: result.overallScore,
      certification: result.certificationLevel
    });
  }

  /**
   * Get improvement trend
   */
  getImprovementTrend(facilityId: string): {
    trend: 'improving' | 'declining' | 'stable';
    averageImprovement: number;
    history: Array<{ timestamp: Date; score: number }>;
  } {
    const history = this.evaluationHistory
      .filter(e => e.facilityId === facilityId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (history.length < 2) {
      return { trend: 'stable', averageImprovement: 0, history: [] };
    }

    const scores = history.map(h => h.score);
    const improvements = [];
    
    for (let i = 1; i < scores.length; i++) {
      improvements.push(scores[i] - scores[i - 1]);
    }

    const averageImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;
    
    const trend = averageImprovement > 2 ? 'improving' :
                  averageImprovement < -2 ? 'declining' : 'stable';

    return {
      trend,
      averageImprovement: Math.round(averageImprovement * 10) / 10,
      history: history.map(h => ({ timestamp: h.timestamp, score: h.score }))
    };
  }
}

export const evaluations = new AutomatedEvaluations();
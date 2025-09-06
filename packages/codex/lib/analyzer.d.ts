export interface AnalysisResult {
    issues: Array<{
        type: string;
        severity: 'error' | 'warning' | 'info';
        message: string;
        line?: number;
        column?: number;
        context?: string;
        suggestion?: string;
    }>;
    suggestions: string[];
    metrics?: {
        complexity: number;
        lines: number;
        functions: number;
        classes: number;
    };
    fixedCode?: string;
}
export declare class CodeAnalyzer {
    private engine;
    private eslint;
    constructor(engine: any);
    analyze(code: string, options?: any): Promise<AnalysisResult>;
    private calculateMetrics;
    private performStaticAnalysis;
    private performSecurityAnalysis;
    private performPerformanceAnalysis;
    private applyFixes;
}
//# sourceMappingURL=analyzer.d.ts.map
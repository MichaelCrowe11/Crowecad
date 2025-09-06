import { CodexConfig } from './config.js';
export interface CodexOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    provider?: 'openai' | 'anthropic' | 'auto';
}
export interface GenerateOptions extends CodexOptions {
    type: string;
    prompt: string;
    language?: string;
    template?: string;
}
export interface AnalyzeOptions extends CodexOptions {
    type?: 'quality' | 'security' | 'performance';
    filePath?: string;
    autoFix?: boolean;
}
export interface RefactorOptions extends CodexOptions {
    target?: 'clean' | 'optimize' | 'modernize';
    filePath?: string;
}
export interface ExplainOptions extends CodexOptions {
    detail?: 'brief' | 'normal' | 'detailed';
    filePath?: string;
}
export interface ConvertOptions extends CodexOptions {
    from?: string;
    to: string;
    filePath?: string;
}
export interface TestOptions extends CodexOptions {
    framework?: 'jest' | 'mocha' | 'vitest';
    coverage?: 'basic' | 'comprehensive';
    filePath?: string;
}
export interface ChatOptions extends CodexOptions {
    context?: string;
    history?: Array<{
        role: string;
        content: string;
    }>;
}
export declare class CodexEngine {
    private config;
    private openai?;
    private anthropic?;
    private analyzer;
    private generator;
    private templates;
    private aiProvider;
    constructor(config?: CodexConfig);
    private initializeProviders;
    generate(options: GenerateOptions): Promise<{
        code: string;
        metadata?: any;
    }>;
    analyze(code: string, options?: AnalyzeOptions): Promise<any>;
    refactor(code: string, options?: RefactorOptions): Promise<{
        code: string;
        changes?: string[];
    }>;
    explain(code: string, options?: ExplainOptions): Promise<{
        summary: string;
        details?: any;
    }>;
    convert(code: string, options: ConvertOptions): Promise<{
        code: string;
        warnings?: string[];
    }>;
    generateTests(code: string, options?: TestOptions): Promise<{
        code: string;
        coverage?: any;
    }>;
    chat(message: string, options?: ChatOptions): Promise<string>;
    processCommand(command: string): Promise<string>;
    private detectIntent;
    private buildGeneratePrompt;
    private buildRefactorPrompt;
    private buildExplainPrompt;
    private buildConvertPrompt;
    private buildTestPrompt;
    private extractCode;
    private extractJson;
    private extractChanges;
    private extractWarnings;
    private parseExplanation;
    private estimateCoverage;
}
//# sourceMappingURL=engine.d.ts.map
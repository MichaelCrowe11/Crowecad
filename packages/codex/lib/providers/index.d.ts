import { CodexConfig } from '../config.js';
export interface CompletionOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    provider?: 'openai' | 'anthropic' | 'auto';
}
export declare class AIProvider {
    private openai?;
    private anthropic?;
    private config;
    constructor(config: CodexConfig);
    private initializeProviders;
    complete(prompt: string, options?: CompletionOptions): Promise<string>;
    chat(messages: Array<{
        role: string;
        content: string;
    }>, options?: CompletionOptions): Promise<string>;
    private selectProvider;
    private completeWithOpenAI;
    private completeWithAnthropic;
    private chatWithOpenAI;
    private chatWithAnthropic;
    private mapOpenAIModel;
    private mapAnthropicModel;
}
//# sourceMappingURL=index.d.ts.map
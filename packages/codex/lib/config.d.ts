export interface CodexConfig {
    provider?: 'openai' | 'anthropic' | 'both';
    openaiKey?: string;
    anthropicKey?: string;
    defaultModel?: string;
    temperature?: number;
    maxTokens?: number;
    telemetry?: boolean;
    templates?: string;
    cache?: boolean;
    cacheDir?: string;
}
export declare class ConfigManager {
    private static configPath;
    private static explorer;
    static load(): Promise<CodexConfig>;
    static save(config: CodexConfig): Promise<void>;
    static getDefault(): CodexConfig;
    static validate(config: CodexConfig): Promise<{
        valid: boolean;
        errors: string[];
    }>;
}
//# sourceMappingURL=config.d.ts.map
import { cosmiconfigSync } from 'cosmiconfig';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

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

export class ConfigManager {
  private static configPath = path.join(os.homedir(), '.codexrc.json');
  private static explorer = cosmiconfigSync('codex');

  static async load(): Promise<CodexConfig> {
    // Try to load from various sources
    const result = this.explorer.search();
    
    if (result) {
      return result.config;
    }

    // Try home directory config
    if (await fs.pathExists(this.configPath)) {
      return await fs.readJson(this.configPath);
    }

    // Check environment variables
    const envConfig: CodexConfig = {};
    
    if (process.env.OPENAI_API_KEY) {
      envConfig.openaiKey = process.env.OPENAI_API_KEY;
      envConfig.provider = 'openai';
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      envConfig.anthropicKey = process.env.ANTHROPIC_API_KEY;
      envConfig.provider = envConfig.provider ? 'both' : 'anthropic';
    }
    
    if (process.env.CODEX_MODEL) {
      envConfig.defaultModel = process.env.CODEX_MODEL;
    }

    return envConfig;
  }

  static async save(config: CodexConfig): Promise<void> {
    await fs.writeJson(this.configPath, config, { spaces: 2 });
  }

  static getDefault(): CodexConfig {
    return {
      provider: 'openai',
      defaultModel: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      telemetry: true,
      cache: true,
      cacheDir: path.join(os.tmpdir(), 'codex-cache')
    };
  }

  static async validate(config: CodexConfig): Promise<{valid: boolean; errors: string[]}> {
    const errors: string[] = [];

    if (!config.provider) {
      errors.push('No AI provider configured');
    }

    if (config.provider === 'openai' || config.provider === 'both') {
      if (!config.openaiKey) {
        errors.push('OpenAI API key is required');
      }
    }

    if (config.provider === 'anthropic' || config.provider === 'both') {
      if (!config.anthropicKey) {
        errors.push('Anthropic API key is required');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { CodexConfig } from '../config.js';

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  provider?: 'openai' | 'anthropic' | 'auto';
}

export class AIProvider {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private config: CodexConfig;

  constructor(config: CodexConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders() {
    if (this.config.openaiKey) {
      this.openai = new OpenAI({
        apiKey: this.config.openaiKey
      });
    }

    if (this.config.anthropicKey) {
      this.anthropic = new Anthropic({
        apiKey: this.config.anthropicKey
      });
    }
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<string> {
    const provider = this.selectProvider(options);
    const model = options.model || this.config.defaultModel || 'gpt-4';
    const temperature = options.temperature ?? this.config.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? this.config.maxTokens ?? 2000;

    if (provider === 'anthropic' && this.anthropic) {
      return this.completeWithAnthropic(prompt, model, temperature, maxTokens);
    } else if (this.openai) {
      return this.completeWithOpenAI(prompt, model, temperature, maxTokens);
    } else {
      throw new Error('No AI provider configured. Please run "codex config" to set up.');
    }
  }

  async chat(messages: Array<{role: string; content: string}>, options: CompletionOptions = {}): Promise<string> {
    const provider = this.selectProvider(options);
    const model = options.model || this.config.defaultModel || 'gpt-4';
    const temperature = options.temperature ?? this.config.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? this.config.maxTokens ?? 2000;

    if (provider === 'anthropic' && this.anthropic) {
      return this.chatWithAnthropic(messages, model, temperature, maxTokens);
    } else if (this.openai) {
      return this.chatWithOpenAI(messages, model, temperature, maxTokens);
    } else {
      throw new Error('No AI provider configured');
    }
  }

  private selectProvider(options: CompletionOptions): 'openai' | 'anthropic' {
    if (options.provider && options.provider !== 'auto') {
      return options.provider;
    }

    // Auto-select based on model name
    const model = options.model || this.config.defaultModel || '';
    if (model.includes('claude')) {
      return 'anthropic';
    } else if (model.includes('gpt')) {
      return 'openai';
    }

    // Fall back to configured provider
    if (this.config.provider === 'anthropic' || 
        (this.config.provider === 'both' && this.anthropic)) {
      return 'anthropic';
    }

    return 'openai';
  }

  private async completeWithOpenAI(
    prompt: string, 
    model: string, 
    temperature: number, 
    maxTokens: number
  ): Promise<string> {
    try {
      const completion = await this.openai!.chat.completions.create({
        model: this.mapOpenAIModel(model),
        messages: [
          {
            role: 'system',
            content: 'You are Codex, an expert AI coding assistant. Generate clean, efficient, and well-documented code.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  private async completeWithAnthropic(
    prompt: string,
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    try {
      const message = await this.anthropic!.messages.create({
        model: this.mapAnthropicModel(model),
        max_tokens: maxTokens,
        temperature,
        system: 'You are Codex, an expert AI coding assistant. Generate clean, efficient, and well-documented code.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return message.content[0]?.type === 'text' ? message.content[0].text : '';
    } catch (error: any) {
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  private async chatWithOpenAI(
    messages: Array<{role: string; content: string}>,
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    try {
      const completion = await this.openai!.chat.completions.create({
        model: this.mapOpenAIModel(model),
        messages: messages as any,
        temperature,
        max_tokens: maxTokens
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  private async chatWithAnthropic(
    messages: Array<{role: string; content: string}>,
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    try {
      // Convert to Anthropic format
      const anthropicMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })) as any;

      const systemMessage = messages.find(m => m.role === 'system');

      const message = await this.anthropic!.messages.create({
        model: this.mapAnthropicModel(model),
        max_tokens: maxTokens,
        temperature,
        system: systemMessage?.content || 'You are Codex, an expert AI coding assistant.',
        messages: anthropicMessages
      });

      return message.content[0]?.type === 'text' ? message.content[0].text : '';
    } catch (error: any) {
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  private mapOpenAIModel(model: string): string {
    const modelMap: Record<string, string> = {
      'gpt-4': 'gpt-4-turbo-preview',
      'gpt-4-turbo': 'gpt-4-turbo-preview',
      'gpt-3.5': 'gpt-3.5-turbo',
      'gpt-3.5-turbo': 'gpt-3.5-turbo'
    };

    return modelMap[model] || model;
  }

  private mapAnthropicModel(model: string): string {
    const modelMap: Record<string, string> = {
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-sonnet-20240229',
      'claude-3-haiku': 'claude-3-haiku-20240307',
      'claude': 'claude-3-sonnet-20240229'
    };

    return modelMap[model] || model;
  }
}
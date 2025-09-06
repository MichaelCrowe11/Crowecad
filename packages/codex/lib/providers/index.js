import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
export class AIProvider {
    openai;
    anthropic;
    config;
    constructor(config) {
        this.config = config;
        this.initializeProviders();
    }
    initializeProviders() {
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
    async complete(prompt, options = {}) {
        const provider = this.selectProvider(options);
        const model = options.model || this.config.defaultModel || 'gpt-4';
        const temperature = options.temperature ?? this.config.temperature ?? 0.7;
        const maxTokens = options.maxTokens ?? this.config.maxTokens ?? 2000;
        if (provider === 'anthropic' && this.anthropic) {
            return this.completeWithAnthropic(prompt, model, temperature, maxTokens);
        }
        else if (this.openai) {
            return this.completeWithOpenAI(prompt, model, temperature, maxTokens);
        }
        else {
            throw new Error('No AI provider configured. Please run "codex config" to set up.');
        }
    }
    async chat(messages, options = {}) {
        const provider = this.selectProvider(options);
        const model = options.model || this.config.defaultModel || 'gpt-4';
        const temperature = options.temperature ?? this.config.temperature ?? 0.7;
        const maxTokens = options.maxTokens ?? this.config.maxTokens ?? 2000;
        if (provider === 'anthropic' && this.anthropic) {
            return this.chatWithAnthropic(messages, model, temperature, maxTokens);
        }
        else if (this.openai) {
            return this.chatWithOpenAI(messages, model, temperature, maxTokens);
        }
        else {
            throw new Error('No AI provider configured');
        }
    }
    selectProvider(options) {
        if (options.provider && options.provider !== 'auto') {
            return options.provider;
        }
        // Auto-select based on model name
        const model = options.model || this.config.defaultModel || '';
        if (model.includes('claude')) {
            return 'anthropic';
        }
        else if (model.includes('gpt')) {
            return 'openai';
        }
        // Fall back to configured provider
        if (this.config.provider === 'anthropic' ||
            (this.config.provider === 'both' && this.anthropic)) {
            return 'anthropic';
        }
        return 'openai';
    }
    async completeWithOpenAI(prompt, model, temperature, maxTokens) {
        try {
            const completion = await this.openai.chat.completions.create({
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
        }
        catch (error) {
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }
    async completeWithAnthropic(prompt, model, temperature, maxTokens) {
        try {
            const message = await this.anthropic.messages.create({
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
        }
        catch (error) {
            throw new Error(`Anthropic API error: ${error.message}`);
        }
    }
    async chatWithOpenAI(messages, model, temperature, maxTokens) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: this.mapOpenAIModel(model),
                messages: messages,
                temperature,
                max_tokens: maxTokens
            });
            return completion.choices[0]?.message?.content || '';
        }
        catch (error) {
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }
    async chatWithAnthropic(messages, model, temperature, maxTokens) {
        try {
            // Convert to Anthropic format
            const anthropicMessages = messages
                .filter(m => m.role !== 'system')
                .map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            }));
            const systemMessage = messages.find(m => m.role === 'system');
            const message = await this.anthropic.messages.create({
                model: this.mapAnthropicModel(model),
                max_tokens: maxTokens,
                temperature,
                system: systemMessage?.content || 'You are Codex, an expert AI coding assistant.',
                messages: anthropicMessages
            });
            return message.content[0]?.type === 'text' ? message.content[0].text : '';
        }
        catch (error) {
            throw new Error(`Anthropic API error: ${error.message}`);
        }
    }
    mapOpenAIModel(model) {
        const modelMap = {
            'gpt-4': 'gpt-4-turbo-preview',
            'gpt-4-turbo': 'gpt-4-turbo-preview',
            'gpt-3.5': 'gpt-3.5-turbo',
            'gpt-3.5-turbo': 'gpt-3.5-turbo'
        };
        return modelMap[model] || model;
    }
    mapAnthropicModel(model) {
        const modelMap = {
            'claude-3-opus': 'claude-3-opus-20240229',
            'claude-3-sonnet': 'claude-3-sonnet-20240229',
            'claude-3-haiku': 'claude-3-haiku-20240307',
            'claude': 'claude-3-sonnet-20240229'
        };
        return modelMap[model] || model;
    }
}
//# sourceMappingURL=index.js.map
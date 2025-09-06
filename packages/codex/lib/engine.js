import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { AIProvider } from './providers/index.js';
import { ConfigManager } from './config.js';
import { CodeAnalyzer } from './analyzer.js';
import { CodeGenerator } from './generator.js';
import { TemplateManager } from './templates.js';
export class CodexEngine {
    config;
    openai;
    anthropic;
    analyzer;
    generator;
    templates;
    aiProvider;
    constructor(config) {
        this.config = config || ConfigManager.getDefault();
        this.initializeProviders();
        this.analyzer = new CodeAnalyzer(this);
        this.generator = new CodeGenerator(this);
        this.templates = new TemplateManager();
        this.aiProvider = new AIProvider(this.config);
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
    async generate(options) {
        const template = options.template ?
            await this.templates.getTemplate(options.template) :
            await this.templates.getDefaultTemplate(options.type);
        const prompt = this.buildGeneratePrompt(options, template);
        const response = await this.aiProvider.complete(prompt, options);
        return {
            code: this.extractCode(response),
            metadata: {
                model: options.model || this.config.defaultModel,
                tokens: response.length,
                time: Date.now()
            }
        };
    }
    async analyze(code, options = {}) {
        return this.analyzer.analyze(code, options);
    }
    async refactor(code, options = {}) {
        const prompt = this.buildRefactorPrompt(code, options);
        const response = await this.aiProvider.complete(prompt, options);
        return {
            code: this.extractCode(response),
            changes: this.extractChanges(response)
        };
    }
    async explain(code, options = {}) {
        const prompt = this.buildExplainPrompt(code, options);
        const response = await this.aiProvider.complete(prompt, options);
        return this.parseExplanation(response);
    }
    async convert(code, options) {
        const prompt = this.buildConvertPrompt(code, options);
        const response = await this.aiProvider.complete(prompt, options);
        return {
            code: this.extractCode(response),
            warnings: this.extractWarnings(response)
        };
    }
    async generateTests(code, options = {}) {
        const prompt = this.buildTestPrompt(code, options);
        const response = await this.aiProvider.complete(prompt, options);
        return {
            code: this.extractCode(response),
            coverage: this.estimateCoverage(code, response)
        };
    }
    async chat(message, options = {}) {
        const messages = [
            ...(options.history || []),
            { role: 'user', content: message }
        ];
        if (options.context) {
            messages.unshift({
                role: 'system',
                content: `Context code:\n${options.context}`
            });
        }
        return this.aiProvider.chat(messages, options);
    }
    async processCommand(command) {
        // Natural language command processing
        const intent = await this.detectIntent(command);
        switch (intent.action) {
            case 'generate':
                const genResult = await this.generate({
                    type: intent.type || 'function',
                    prompt: intent.prompt || command,
                    language: intent.language || 'typescript'
                });
                return genResult.code;
            case 'explain':
                const explainResult = await this.explain(intent.code || command, {
                    detail: 'normal'
                });
                return explainResult.summary;
            default:
                return await this.chat(command);
        }
    }
    async detectIntent(command) {
        const prompt = `Analyze this command and extract the intent:
    Command: "${command}"
    
    Return JSON with:
    - action: (generate, explain, refactor, analyze, convert, test, chat)
    - type: (if applicable: function, class, component, etc.)
    - language: (if mentioned)
    - prompt: (the actual request)
    `;
        const response = await this.aiProvider.complete(prompt, {
            model: 'gpt-3.5-turbo',
            temperature: 0
        });
        try {
            return JSON.parse(this.extractJson(response));
        }
        catch {
            return { action: 'chat', prompt: command };
        }
    }
    buildGeneratePrompt(options, template) {
        const base = template || `Generate ${options.type} code in ${options.language || 'TypeScript'}.`;
        return `${base}

Requirements: ${options.prompt}

Rules:
1. Write clean, production-ready code
2. Include proper error handling
3. Add helpful comments
4. Follow best practices for ${options.language || 'TypeScript'}
5. Make it type-safe if applicable

Generate the code:`;
    }
    buildRefactorPrompt(code, options) {
        const target = options.target || 'clean';
        const goals = {
            clean: 'Clean code principles, remove duplication, improve naming',
            optimize: 'Performance optimization, reduce complexity, improve efficiency',
            modernize: 'Use modern syntax, update deprecated patterns, improve type safety'
        };
        return `Refactor this code with focus on: ${goals[target]}

Original code:
\`\`\`
${code}
\`\`\`

Provide the refactored code and list the changes made.`;
    }
    buildExplainPrompt(code, options) {
        const detail = options.detail || 'normal';
        const instructions = {
            brief: 'Provide a one-sentence summary',
            normal: 'Explain the purpose and key logic',
            detailed: 'Provide comprehensive explanation with all details'
        };
        return `Explain this code (${instructions[detail]}):

\`\`\`
${code}
\`\`\``;
    }
    buildConvertPrompt(code, options) {
        return `Convert this ${options.from || 'code'} to ${options.to}:

\`\`\`
${code}
\`\`\`

Maintain the same functionality and include any necessary imports or setup.`;
    }
    buildTestPrompt(code, options) {
        const framework = options.framework || 'vitest';
        const coverage = options.coverage || 'comprehensive';
        return `Generate ${coverage} unit tests for this code using ${framework}:

\`\`\`
${code}
\`\`\`

Include:
- Happy path tests
- Edge cases
- Error scenarios
- Mocking where appropriate`;
    }
    extractCode(response) {
        // Extract code from markdown code blocks
        const codeBlockMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
        if (codeBlockMatch) {
            return codeBlockMatch[1].trim();
        }
        // If no code block, try to extract code-like content
        const lines = response.split('\n');
        const codeLines = lines.filter(line => line.includes('{') || line.includes('}') ||
            line.includes('function') || line.includes('class') ||
            line.includes('const') || line.includes('let') ||
            line.includes('import') || line.includes('export'));
        return codeLines.length > 0 ? codeLines.join('\n') : response;
    }
    extractJson(response) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        return jsonMatch ? jsonMatch[0] : '{}';
    }
    extractChanges(response) {
        const changes = [];
        const lines = response.split('\n');
        lines.forEach(line => {
            if (line.match(/^[-*•]\s+/)) {
                changes.push(line.replace(/^[-*•]\s+/, ''));
            }
        });
        return changes;
    }
    extractWarnings(response) {
        const warnings = [];
        const lines = response.split('\n');
        lines.forEach(line => {
            if (line.toLowerCase().includes('warning') ||
                line.toLowerCase().includes('note') ||
                line.toLowerCase().includes('caution')) {
                warnings.push(line);
            }
        });
        return warnings;
    }
    parseExplanation(response) {
        const lines = response.split('\n');
        const summary = lines[0] || response;
        const details = {};
        let currentSection = '';
        lines.forEach(line => {
            if (line.match(/^#+\s+/)) {
                currentSection = line.replace(/^#+\s+/, '');
                details[currentSection] = '';
            }
            else if (currentSection && line.trim()) {
                details[currentSection] += line + '\n';
            }
        });
        return {
            summary,
            details: Object.keys(details).length > 0 ? details : undefined
        };
    }
    estimateCoverage(originalCode, testCode) {
        // Simple heuristic-based coverage estimation
        const functions = (originalCode.match(/function\s+\w+/g) || []).length;
        const testedFunctions = (testCode.match(/test\(|it\(|describe\(/g) || []).length;
        const branches = (originalCode.match(/if\s*\(|switch\s*\(|case\s+/g) || []).length;
        const testedBranches = (testCode.match(/expect\(/g) || []).length;
        return {
            functions: Math.min(100, Math.round((testedFunctions / Math.max(1, functions)) * 100)),
            branches: Math.min(100, Math.round((testedBranches / Math.max(1, branches)) * 100)),
            lines: Math.min(100, Math.round((testCode.split('\n').length / originalCode.split('\n').length) * 100))
        };
    }
}
//# sourceMappingURL=engine.js.map
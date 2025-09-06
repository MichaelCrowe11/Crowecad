import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { AIProvider } from './providers/index.js';
import { ConfigManager, CodexConfig } from './config.js';
import { CodeAnalyzer } from './analyzer.js';
import { CodeGenerator } from './generator.js';
import { TemplateManager } from './templates.js';

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
  history?: Array<{role: string, content: string}>;
}

export class CodexEngine {
  private config: CodexConfig;
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private analyzer: CodeAnalyzer;
  private generator: CodeGenerator;
  private templates: TemplateManager;
  private aiProvider: AIProvider;

  constructor(config?: CodexConfig) {
    this.config = config || ConfigManager.getDefault();
    this.initializeProviders();
    this.analyzer = new CodeAnalyzer(this);
    this.generator = new CodeGenerator(this);
    this.templates = new TemplateManager();
    this.aiProvider = new AIProvider(this.config);
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

  async generate(options: GenerateOptions): Promise<{code: string; metadata?: any}> {
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

  async analyze(code: string, options: AnalyzeOptions = {}): Promise<any> {
    return this.analyzer.analyze(code, options);
  }

  async refactor(code: string, options: RefactorOptions = {}): Promise<{code: string; changes?: string[]}> {
    const prompt = this.buildRefactorPrompt(code, options);
    const response = await this.aiProvider.complete(prompt, options);
    
    return {
      code: this.extractCode(response),
      changes: this.extractChanges(response)
    };
  }

  async explain(code: string, options: ExplainOptions = {}): Promise<{summary: string; details?: any}> {
    const prompt = this.buildExplainPrompt(code, options);
    const response = await this.aiProvider.complete(prompt, options);
    
    return this.parseExplanation(response);
  }

  async convert(code: string, options: ConvertOptions): Promise<{code: string; warnings?: string[]}> {
    const prompt = this.buildConvertPrompt(code, options);
    const response = await this.aiProvider.complete(prompt, options);
    
    return {
      code: this.extractCode(response),
      warnings: this.extractWarnings(response)
    };
  }

  async generateTests(code: string, options: TestOptions = {}): Promise<{code: string; coverage?: any}> {
    const prompt = this.buildTestPrompt(code, options);
    const response = await this.aiProvider.complete(prompt, options);
    
    return {
      code: this.extractCode(response),
      coverage: this.estimateCoverage(code, response)
    };
  }

  async chat(message: string, options: ChatOptions = {}): Promise<string> {
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

  async processCommand(command: string): Promise<string> {
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

  private async detectIntent(command: string): Promise<any> {
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
    } catch {
      return { action: 'chat', prompt: command };
    }
  }

  private buildGeneratePrompt(options: GenerateOptions, template?: string): string {
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

  private buildRefactorPrompt(code: string, options: RefactorOptions): string {
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

  private buildExplainPrompt(code: string, options: ExplainOptions): string {
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

  private buildConvertPrompt(code: string, options: ConvertOptions): string {
    return `Convert this ${options.from || 'code'} to ${options.to}:

\`\`\`
${code}
\`\`\`

Maintain the same functionality and include any necessary imports or setup.`;
  }

  private buildTestPrompt(code: string, options: TestOptions): string {
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

  private extractCode(response: string): string {
    // Extract code from markdown code blocks
    const codeBlockMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    
    // If no code block, try to extract code-like content
    const lines = response.split('\n');
    const codeLines = lines.filter(line => 
      line.includes('{') || line.includes('}') || 
      line.includes('function') || line.includes('class') ||
      line.includes('const') || line.includes('let') ||
      line.includes('import') || line.includes('export')
    );
    
    return codeLines.length > 0 ? codeLines.join('\n') : response;
  }

  private extractJson(response: string): string {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : '{}';
  }

  private extractChanges(response: string): string[] {
    const changes: string[] = [];
    const lines = response.split('\n');
    
    lines.forEach(line => {
      if (line.match(/^[-*•]\s+/)) {
        changes.push(line.replace(/^[-*•]\s+/, ''));
      }
    });
    
    return changes;
  }

  private extractWarnings(response: string): string[] {
    const warnings: string[] = [];
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

  private parseExplanation(response: string): {summary: string; details?: any} {
    const lines = response.split('\n');
    const summary = lines[0] || response;
    
    const details: any = {};
    let currentSection = '';
    
    lines.forEach(line => {
      if (line.match(/^#+\s+/)) {
        currentSection = line.replace(/^#+\s+/, '');
        details[currentSection] = '';
      } else if (currentSection && line.trim()) {
        details[currentSection] += line + '\n';
      }
    });
    
    return {
      summary,
      details: Object.keys(details).length > 0 ? details : undefined
    };
  }

  private estimateCoverage(originalCode: string, testCode: string): any {
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
/**
 * Cursor CAD Assistant - Real-time CAD script assistance powered by Cursor AI
 * Provides intelligent code completion, debugging, and format translation for CAD languages
 */

interface CursorConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface CADLanguage {
  name: string;
  extensions: string[];
  syntax: string;
  examples: string[];
}

interface ScriptAnalysis {
  errors: Array<{
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  suggestions: Array<{
    line: number;
    suggestion: string;
    code: string;
  }>;
  performance: {
    complexity: 'low' | 'medium' | 'high';
    estimatedTime: number;
    optimizations: string[];
  };
}

interface TranslationResult {
  success: boolean;
  targetCode: string;
  warnings: string[];
  mappings: Array<{
    sourceLine: number;
    targetLine: number;
  }>;
}

export class CursorCADAssistant {
  private apiKey: string;
  private baseUrl = 'https://api.cursor.sh/v1';
  private supportedLanguages: Map<string, CADLanguage>;
  private codeCache: Map<string, string> = new Map();
  private analysisCache: Map<string, ScriptAnalysis> = new Map();

  constructor(config: CursorConfig) {
    this.apiKey = config.apiKey || import.meta.env.VITE_CURSOR_API_KEY || '';
    
    // Initialize supported CAD languages
    this.supportedLanguages = new Map([
      ['autolisp', {
        name: 'AutoLISP',
        extensions: ['.lsp', '.vlx'],
        syntax: 'lisp',
        examples: [
          '(defun c:DrawCircle () (command "CIRCLE" "0,0" "10"))',
          '(setq radius (getreal "Enter radius: "))'
        ]
      }],
      ['openscad', {
        name: 'OpenSCAD',
        extensions: ['.scad'],
        syntax: 'c-like',
        examples: [
          'cylinder(h=20, r=10, center=true);',
          'difference() { cube(20); sphere(15); }'
        ]
      }],
      ['python-freecad', {
        name: 'Python (FreeCAD)',
        extensions: ['.py', '.FCMacro'],
        syntax: 'python',
        examples: [
          'Part.makeBox(10, 10, 10)',
          'Draft.makeCircle(radius=5)'
        ]
      }],
      ['jscad', {
        name: 'JavaScript CAD',
        extensions: ['.js', '.jscad'],
        syntax: 'javascript',
        examples: [
          'const { cube, sphere } = jscad.primitives',
          'return union(cube({ size: 10 }), sphere({ radius: 5 }))'
        ]
      }],
      ['gcode', {
        name: 'G-Code',
        extensions: ['.gcode', '.nc'],
        syntax: 'gcode',
        examples: [
          'G00 X10 Y10 Z5',
          'G01 X20 Y20 F100'
        ]
      }]
    ]);
  }

  /**
   * Get real-time code suggestions as user types
   */
  async getCodeSuggestions(
    code: string,
    language: string,
    cursorPosition: { line: number; column: number }
  ): Promise<string[]> {
    if (!this.apiKey) {
      console.warn('Cursor API key not configured');
      return this.getFallbackSuggestions(code, language, cursorPosition);
    }

    const langConfig = this.supportedLanguages.get(language.toLowerCase());
    if (!langConfig) {
      return [];
    }

    try {
      const prompt = this.buildSuggestionPrompt(code, langConfig, cursorPosition);
      
      const response = await fetch(`${this.baseUrl}/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'cursor-fast',
          prompt: prompt,
          max_tokens: 150,
          temperature: 0.3,
          stop: ['\n\n', ';', '}']
        })
      });

      if (!response.ok) {
        throw new Error(`Cursor API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseSuggestions(data.choices[0].text);
    } catch (error) {
      console.error('Error getting code suggestions:', error);
      return this.getFallbackSuggestions(code, language, cursorPosition);
    }
  }

  /**
   * Analyze CAD script for errors and optimizations
   */
  async analyzeScript(code: string, language: string): Promise<ScriptAnalysis> {
    // Check cache first
    const cacheKey = `${language}:${code}`;
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    const analysis: ScriptAnalysis = {
      errors: [],
      suggestions: [],
      performance: {
        complexity: 'low',
        estimatedTime: 0,
        optimizations: []
      }
    };

    if (!this.apiKey) {
      return this.getBasicAnalysis(code, language);
    }

    try {
      const prompt = this.buildAnalysisPrompt(code, language);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a CAD script analyzer specializing in ${language}. Analyze the code for errors, suggest improvements, and evaluate performance.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      const analysisResult = this.parseAnalysis(data.choices[0].message.content);
      
      // Cache the result
      this.analysisCache.set(cacheKey, analysisResult);
      
      return analysisResult;
    } catch (error) {
      console.error('Error analyzing script:', error);
      return this.getBasicAnalysis(code, language);
    }
  }

  /**
   * Translate CAD script between different languages
   */
  async translateScript(
    code: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationResult> {
    const sourceLang = this.supportedLanguages.get(sourceLanguage.toLowerCase());
    const targetLang = this.supportedLanguages.get(targetLanguage.toLowerCase());

    if (!sourceLang || !targetLang) {
      return {
        success: false,
        targetCode: '',
        warnings: ['Unsupported language combination'],
        mappings: []
      };
    }

    if (!this.apiKey) {
      return this.getBasicTranslation(code, sourceLang, targetLang);
    }

    try {
      const prompt = this.buildTranslationPrompt(code, sourceLang, targetLang);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert CAD script translator. Translate ${sourceLang.name} code to ${targetLang.name} while preserving functionality and optimizing for the target language.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseTranslation(data.choices[0].message.content);
    } catch (error) {
      console.error('Error translating script:', error);
      return this.getBasicTranslation(code, sourceLang, targetLang);
    }
  }

  /**
   * Fix common CAD script errors automatically
   */
  async autoFixErrors(code: string, language: string): Promise<string> {
    const analysis = await this.analyzeScript(code, language);
    
    if (analysis.errors.length === 0) {
      return code;
    }

    let fixedCode = code;
    const lines = code.split('\n');

    // Apply fixes in reverse order to maintain line numbers
    analysis.errors.sort((a, b) => b.line - a.line);

    for (const error of analysis.errors) {
      if (error.severity === 'error') {
        // Find appropriate fix based on error type
        const fix = await this.getErrorFix(error, lines[error.line - 1], language);
        if (fix) {
          lines[error.line - 1] = fix;
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Get performance optimization suggestions
   */
  async optimizeScript(code: string, language: string): Promise<string> {
    const analysis = await this.analyzeScript(code, language);
    
    if (analysis.performance.optimizations.length === 0) {
      return code;
    }

    // Apply optimizations
    let optimizedCode = code;
    
    for (const optimization of analysis.performance.optimizations) {
      optimizedCode = await this.applyOptimization(optimizedCode, optimization, language);
    }

    return optimizedCode;
  }

  /**
   * Generate CAD script from natural language description
   */
  async generateFromDescription(description: string, language: string): Promise<string> {
    const langConfig = this.supportedLanguages.get(language.toLowerCase());
    if (!langConfig) {
      return `// Unsupported language: ${language}`;
    }

    if (!this.apiKey) {
      return this.getTemplateCode(description, langConfig);
    }

    try {
      const prompt = `Generate ${langConfig.name} code for: ${description}\n\nExamples:\n${langConfig.examples.join('\n')}`;
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a CAD script generator for ${langConfig.name}. Generate clean, efficient, and well-commented code.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatGeneratedCode(data.choices[0].message.content, langConfig);
    } catch (error) {
      console.error('Error generating script:', error);
      return this.getTemplateCode(description, langConfig);
    }
  }

  // Helper methods
  private buildSuggestionPrompt(code: string, lang: CADLanguage, cursor: { line: number; column: number }): string {
    const lines = code.split('\n');
    const currentLine = lines[cursor.line - 1] || '';
    const prefix = currentLine.substring(0, cursor.column);
    const context = lines.slice(Math.max(0, cursor.line - 5), cursor.line).join('\n');
    
    return `Language: ${lang.name}\nContext:\n${context}\nCurrent line: ${prefix}\nSuggest completions:`;
  }

  private buildAnalysisPrompt(code: string, language: string): string {
    return `Analyze this ${language} CAD script for:
1. Syntax errors
2. Logic errors
3. Performance issues
4. Best practice violations

Code:
${code}

Provide analysis in JSON format with errors, suggestions, and performance metrics.`;
  }

  private buildTranslationPrompt(code: string, source: CADLanguage, target: CADLanguage): string {
    return `Translate this ${source.name} code to ${target.name}:

Source Code:
${code}

Target Language Examples:
${target.examples.join('\n')}

Provide the translated code with line mappings and any warnings about functionality differences.`;
  }

  private parseSuggestions(text: string): string[] {
    return text.split('\n')
      .filter(line => line.trim())
      .slice(0, 5);
  }

  private parseAnalysis(text: string): ScriptAnalysis {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(text);
      return parsed;
    } catch {
      // Fallback to basic parsing
      return {
        errors: [],
        suggestions: [],
        performance: {
          complexity: 'medium',
          estimatedTime: 1000,
          optimizations: []
        }
      };
    }
  }

  private parseTranslation(text: string): TranslationResult {
    // Extract code blocks and metadata
    const codeMatch = text.match(/```[\w]*\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1] : text;
    
    return {
      success: true,
      targetCode: code,
      warnings: [],
      mappings: []
    };
  }

  private async getErrorFix(error: any, line: string, language: string): Promise<string | null> {
    // Implement common error fixes for each language
    switch (language.toLowerCase()) {
      case 'autolisp':
        if (error.message.includes('parenthesis')) {
          return this.balanceParentheses(line);
        }
        break;
      case 'openscad':
        if (error.message.includes('semicolon')) {
          return line.trimEnd() + ';';
        }
        break;
      case 'python-freecad':
        if (error.message.includes('indentation')) {
          return '    ' + line.trimStart();
        }
        break;
    }
    return null;
  }

  private balanceParentheses(line: string): string {
    let openCount = (line.match(/\(/g) || []).length;
    let closeCount = (line.match(/\)/g) || []).length;
    
    if (openCount > closeCount) {
      return line + ')'.repeat(openCount - closeCount);
    } else if (closeCount > openCount) {
      return '('.repeat(closeCount - openCount) + line;
    }
    
    return line;
  }

  private async applyOptimization(code: string, optimization: string, language: string): Promise<string> {
    // Apply specific optimizations based on the suggestion
    return code; // Placeholder - would implement specific optimizations
  }

  private formatGeneratedCode(code: string, lang: CADLanguage): string {
    // Format the generated code according to language conventions
    return code.trim();
  }

  // Fallback methods when API is not available
  private getFallbackSuggestions(code: string, language: string, cursor: any): string[] {
    const lang = this.supportedLanguages.get(language.toLowerCase());
    if (!lang) return [];
    
    // Return basic suggestions based on language
    return lang.examples.slice(0, 3);
  }

  private getBasicAnalysis(code: string, language: string): ScriptAnalysis {
    const lines = code.split('\n');
    const errors: any[] = [];
    
    // Basic syntax checking
    switch (language.toLowerCase()) {
      case 'autolisp':
        lines.forEach((line, index) => {
          const openParens = (line.match(/\(/g) || []).length;
          const closeParens = (line.match(/\)/g) || []).length;
          if (openParens !== closeParens) {
            errors.push({
              line: index + 1,
              column: 0,
              message: 'Unbalanced parentheses',
              severity: 'error'
            });
          }
        });
        break;
        
      case 'openscad':
        lines.forEach((line, index) => {
          if (line.trim() && !line.trim().startsWith('//') && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
            errors.push({
              line: index + 1,
              column: line.length,
              message: 'Missing semicolon',
              severity: 'warning'
            });
          }
        });
        break;
    }
    
    return {
      errors,
      suggestions: [],
      performance: {
        complexity: lines.length > 100 ? 'high' : lines.length > 50 ? 'medium' : 'low',
        estimatedTime: lines.length * 10,
        optimizations: []
      }
    };
  }

  private getBasicTranslation(code: string, source: CADLanguage, target: CADLanguage): TranslationResult {
    // Basic template-based translation
    return {
      success: false,
      targetCode: `// Manual translation required from ${source.name} to ${target.name}`,
      warnings: ['Automatic translation not available without API key'],
      mappings: []
    };
  }

  private getTemplateCode(description: string, lang: CADLanguage): string {
    // Return a basic template based on the description
    const templates: Record<string, string> = {
      'autolisp': `; ${description}\n(defun c:CustomCommand ()\n  ; Add your code here\n  (princ "Command executed")\n  (princ)\n)`,
      'openscad': `// ${description}\nmodule custom_part() {\n  // Add your geometry here\n  cube([10, 10, 10]);\n}\n\ncustom_part();`,
      'python-freecad': `# ${description}\nimport FreeCAD\nimport Part\n\n# Add your code here\nbox = Part.makeBox(10, 10, 10)\nPart.show(box)`,
      'jscad': `// ${description}\nconst { cube } = require('@jscad/modeling').primitives;\n\nconst main = () => {\n  // Add your geometry here\n  return cube({ size: 10 });\n};\n\nmodule.exports = { main };`
    };
    
    return templates[lang.name.toLowerCase()] || `// ${description}`;
  }
}

// Export singleton instance
export const cursorAssistant = new CursorCADAssistant({
  apiKey: import.meta.env.VITE_CURSOR_API_KEY || ''
});
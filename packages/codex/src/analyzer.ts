import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { ESLint } from 'eslint';

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

export class CodeAnalyzer {
  private engine: any;
  private eslint: ESLint;

  constructor(engine: any) {
    this.engine = engine;
    this.eslint = new ESLint({
      useEslintrc: false,
      overrideConfig: {
        languageOptions: {
          ecmaVersion: 2022,
          sourceType: 'module',
          parserOptions: {
            ecmaFeatures: {
              jsx: true
            }
          }
        },
        rules: {
          'no-unused-vars': 'warn',
          'no-console': 'warn',
          'no-debugger': 'error',
          'no-duplicate-imports': 'error',
          'prefer-const': 'warn'
        }
      }
    } as any);
  }

  async analyze(code: string, options: any = {}): Promise<AnalysisResult> {
    const issues: AnalysisResult['issues'] = [];
    const suggestions: string[] = [];
    let metrics: AnalysisResult['metrics'];

    try {
      // Parse the code
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
        errorRecovery: true
      });

      // Calculate metrics
      metrics = this.calculateMetrics(ast);

      // Perform static analysis
      this.performStaticAnalysis(ast, issues, suggestions);

      // Run ESLint
      if (options.type === 'quality' || !options.type) {
        const lintResults = await this.eslint.lintText(code);
        for (const result of lintResults) {
          for (const message of result.messages) {
            issues.push({
              type: 'lint',
              severity: message.severity === 2 ? 'error' : 'warning',
              message: message.message,
              line: message.line,
              column: message.column,
              suggestion: message.fix ? 'Auto-fixable' : undefined
            });
          }
        }
      }

      // Security analysis
      if (options.type === 'security') {
        this.performSecurityAnalysis(code, issues);
      }

      // Performance analysis  
      if (options.type === 'performance') {
        this.performPerformanceAnalysis(ast, issues, suggestions);
      }

      // Apply fixes if requested
      let fixedCode: string | undefined;
      if (options.autoFix && issues.some(i => i.suggestion)) {
        fixedCode = await this.applyFixes(code, issues);
      }

      return {
        issues,
        suggestions,
        metrics,
        fixedCode
      };

    } catch (error: any) {
      return {
        issues: [{
          type: 'parse',
          severity: 'error',
          message: `Failed to parse code: ${error.message}`,
          line: error.loc?.line,
          column: error.loc?.column
        }],
        suggestions: ['Fix syntax errors before analysis']
      };
    }
  }

  private calculateMetrics(ast: any): AnalysisResult['metrics'] {
    let complexity = 0;
    let functions = 0;
    let classes = 0;
    const lines = ast.loc?.end?.line || 0;

    traverse(ast, {
      FunctionDeclaration() { functions++; complexity++; },
      FunctionExpression() { functions++; complexity++; },
      ArrowFunctionExpression() { functions++; complexity++; },
      ClassDeclaration() { classes++; complexity += 2; },
      IfStatement() { complexity++; },
      ForStatement() { complexity++; },
      WhileStatement() { complexity++; },
      SwitchStatement() { complexity += 2; },
      TryStatement() { complexity++; }
    });

    return { complexity, lines, functions, classes };
  }

  private performStaticAnalysis(ast: any, issues: any[], suggestions: string[]) {
    // Check for common issues
    traverse(ast, {
      // Unused variables
      VariableDeclarator(path) {
        const name = (path.node.id as any).name;
        if (name && name.startsWith('_')) {
          issues.push({
            type: 'convention',
            severity: 'info',
            message: `Variable '${name}' starts with underscore`,
            line: path.node.loc?.start.line,
            suggestion: 'Consider removing underscore prefix'
          });
        }
      },

      // Console statements
      CallExpression(path) {
        if (t.isMemberExpression(path.node.callee) &&
            t.isIdentifier(path.node.callee.object, { name: 'console' })) {
          issues.push({
            type: 'debug',
            severity: 'warning',
            message: 'Console statement found',
            line: path.node.loc?.start.line,
            suggestion: 'Remove console statements in production'
          });
        }
      },

      // Long functions
      FunctionDeclaration(path) {
        const loc = path.node.loc;
        if (loc && (loc.end.line - loc.start.line) > 50) {
          suggestions.push(`Function at line ${loc.start.line} is too long. Consider breaking it down.`);
        }
      }
    });
  }

  private performSecurityAnalysis(code: string, issues: any[]) {
    // Check for common security issues
    const securityPatterns = [
      { pattern: /eval\s*\(/, message: 'Avoid using eval() - security risk' },
      { pattern: /innerHTML\s*=/, message: 'Use of innerHTML can lead to XSS' },
      { pattern: /document\.write/, message: 'document.write is dangerous' },
      { pattern: /password.*=.*['"].*['"]/, message: 'Hardcoded password detected' },
      { pattern: /api[_-]?key.*=.*['"].*['"]/, message: 'Hardcoded API key detected' }
    ];

    const lines = code.split('\n');
    lines.forEach((line, index) => {
      securityPatterns.forEach(({ pattern, message }) => {
        if (pattern.test(line)) {
          issues.push({
            type: 'security',
            severity: 'error',
            message,
            line: index + 1,
            context: line.trim()
          });
        }
      });
    });
  }

  private performPerformanceAnalysis(ast: any, issues: any[], suggestions: string[]) {
    traverse(ast, {
      // Nested loops
      ForStatement(path) {
        let nestedLoops = 0;
        path.traverse({
          ForStatement() { nestedLoops++; },
          WhileStatement() { nestedLoops++; }
        });
        
        if (nestedLoops > 1) {
          issues.push({
            type: 'performance',
            severity: 'warning',
            message: 'Nested loops detected - O(n²) or worse complexity',
            line: path.node.loc?.start.line,
            suggestion: 'Consider optimizing with hash maps or different algorithm'
          });
        }
      },

      // Array operations in loops
      CallExpression(path) {
        if (t.isMemberExpression(path.node.callee)) {
          const property = path.node.callee.property;
          if (t.isIdentifier(property) && 
              ['map', 'filter', 'reduce'].includes(property.name)) {
            // Check if inside a loop
            let inLoop = false;
            path.getFunctionParent()?.traverse({
              ForStatement() { inLoop = true; },
              WhileStatement() { inLoop = true; }
            });
            
            if (inLoop) {
              suggestions.push('Array operations inside loops can be inefficient');
            }
          }
        }
      }
    });
  }

  private async applyFixes(code: string, issues: any[]): Promise<string> {
    // Apply ESLint fixes
    const results = await this.eslint.lintText(code);
    if (results[0]?.output) {
      return results[0].output;
    }
    return code;
  }
}
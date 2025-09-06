export { CodexEngine } from './engine.js';
export { ConfigManager, type CodexConfig } from './config.js';
export { CodeAnalyzer } from './analyzer.js';
export { CodeGenerator } from './generator.js';
export { TemplateManager } from './templates.js';
export { AIProvider } from './providers/index.js';

// Re-export types
export type {
  CodexOptions,
  GenerateOptions,
  AnalyzeOptions,
  RefactorOptions,
  ExplainOptions,
  ConvertOptions,
  TestOptions,
  ChatOptions
} from './engine.js';

// Package metadata
export const version = '1.0.0';
export const name = '@crowecad/codex';
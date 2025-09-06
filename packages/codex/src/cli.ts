#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import inquirer from 'inquirer';
import ora from 'ora';
import boxen from 'boxen';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { CodexEngine } from './engine.js';
import { ConfigManager } from './config.js';
import { CodeAnalyzer } from './analyzer.js';
import { CodeGenerator } from './generator.js';
import { AIProvider } from './providers/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

// ASCII Art Banner
function showBanner() {
  console.log(
    gradient.rainbow(
      figlet.textSync('CODEX', {
        font: 'ANSI Shadow',
        horizontalLayout: 'fitted',
      })
    )
  );
  console.log(
    boxen(
      chalk.cyan('AI-Powered Coding Assistant\n') +
      chalk.dim('Generate, analyze, and optimize code with advanced AI'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan'
      }
    )
  );
}

// Initialize Codex
async function initCodex() {
  const config = await ConfigManager.load();
  const engine = new CodexEngine(config);
  return engine;
}

program
  .name('codex')
  .description('AI-powered coding assistant for CroweCAD')
  .version(packageJson.version)
  .option('-q, --quiet', 'Suppress banner and decorative output')
  .hook('preAction', (thisCommand) => {
    if (!thisCommand.opts().quiet) {
      showBanner();
    }
  });

// Generate code command
program
  .command('generate <type>')
  .alias('gen')
  .description('Generate code using AI')
  .option('-p, --prompt <prompt>', 'Description of what to generate')
  .option('-l, --language <language>', 'Programming language', 'typescript')
  .option('-o, --output <file>', 'Output file path')
  .option('-t, --template <template>', 'Use a specific template')
  .option('--model <model>', 'AI model to use (gpt-4, claude-3, etc.)', 'gpt-4')
  .action(async (type, options) => {
    const spinner = ora('Initializing Codex...').start();
    
    try {
      const engine = await initCodex();
      
      // Interactive prompt if not provided
      if (!options.prompt) {
        spinner.stop();
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'prompt',
            message: 'Describe what you want to generate:',
            validate: input => input.length > 0 || 'Please provide a description'
          }
        ]);
        options.prompt = answers.prompt;
        spinner.start();
      }
      
      spinner.text = 'Generating code with AI...';
      
      const generator = new CodeGenerator(engine);
      const result = await generator.generate({
        type,
        prompt: options.prompt,
        language: options.language,
        template: options.template,
        model: options.model
      });
      
      spinner.succeed('Code generated successfully!');
      
      // Display or save the result
      if (options.output) {
        await fs.writeFile(options.output, result.code, 'utf-8');
        console.log(chalk.green(`✓ Code saved to ${options.output}`));
      } else {
        console.log('\n' + boxen(result.code, {
          padding: 1,
          borderStyle: 'round',
          borderColor: 'green'
        }));
      }
      
      // Show metadata
      if (result.metadata) {
        console.log(chalk.dim('\nMetadata:'));
        console.log(chalk.dim(`- Model: ${result.metadata.model}`));
        console.log(chalk.dim(`- Tokens: ${result.metadata.tokens}`));
        console.log(chalk.dim(`- Time: ${result.metadata.time}ms`));
      }
      
    } catch (error: any) {
      spinner.fail('Generation failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Analyze code command
program
  .command('analyze <file>')
  .description('Analyze code for improvements and issues')
  .option('-t, --type <type>', 'Analysis type (quality, security, performance)', 'quality')
  .option('--fix', 'Automatically fix issues where possible')
  .option('--model <model>', 'AI model to use', 'gpt-4')
  .action(async (file, options) => {
    const spinner = ora('Analyzing code...').start();
    
    try {
      const engine = await initCodex();
      const analyzer = new CodeAnalyzer(engine);
      
      const code = await fs.readFile(file, 'utf-8');
      const analysis = await analyzer.analyze(code, {
        type: options.type,
        filePath: file,
        autoFix: options.fix,
        model: options.model
      });
      
      spinner.succeed('Analysis complete!');
      
      // Display results
      console.log('\n' + chalk.bold('Analysis Results:'));
      
      if (analysis.issues.length > 0) {
        console.log(chalk.yellow(`\nFound ${analysis.issues.length} issues:`));
        analysis.issues.forEach((issue, i) => {
          const icon = issue.severity === 'error' ? '❌' : 
                       issue.severity === 'warning' ? '⚠️' : 'ℹ️';
          console.log(`${icon}  ${chalk.bold(issue.type)}: ${issue.message}`);
          if (issue.line) {
            console.log(chalk.dim(`   Line ${issue.line}: ${issue.context}`));
          }
          if (issue.suggestion) {
            console.log(chalk.green(`   → ${issue.suggestion}`));
          }
        });
      } else {
        console.log(chalk.green('✓ No issues found!'));
      }
      
      // Show suggestions
      if (analysis.suggestions.length > 0) {
        console.log(chalk.cyan('\nSuggestions:'));
        analysis.suggestions.forEach(suggestion => {
          console.log(`  • ${suggestion}`);
        });
      }
      
      // Apply fixes if requested
      if (options.fix && analysis.fixedCode) {
        await fs.writeFile(file, analysis.fixedCode, 'utf-8');
        console.log(chalk.green(`\n✓ Fixes applied to ${file}`));
      }
      
    } catch (error: any) {
      spinner.fail('Analysis failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Refactor code command
program
  .command('refactor <file>')
  .description('Refactor code using AI suggestions')
  .option('-t, --target <target>', 'Refactoring target (clean, optimize, modernize)', 'clean')
  .option('-o, --output <file>', 'Output file (default: overwrites input)')
  .option('--dry-run', 'Show changes without applying them')
  .option('--model <model>', 'AI model to use', 'gpt-4')
  .action(async (file, options) => {
    const spinner = ora('Refactoring code...').start();
    
    try {
      const engine = await initCodex();
      const code = await fs.readFile(file, 'utf-8');
      
      const refactored = await engine.refactor(code, {
        target: options.target,
        filePath: file,
        model: options.model
      });
      
      spinner.succeed('Refactoring complete!');
      
      if (options.dryRun) {
        console.log('\n' + chalk.bold('Refactored code:'));
        console.log(boxen(refactored.code, {
          padding: 1,
          borderStyle: 'round',
          borderColor: 'blue'
        }));
        
        if (refactored.changes) {
          console.log(chalk.cyan('\nChanges made:'));
          refactored.changes.forEach(change => {
            console.log(`  • ${change}`);
          });
        }
      } else {
        const outputFile = options.output || file;
        await fs.writeFile(outputFile, refactored.code, 'utf-8');
        console.log(chalk.green(`✓ Refactored code saved to ${outputFile}`));
      }
      
    } catch (error: any) {
      spinner.fail('Refactoring failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Explain code command
program
  .command('explain <file>')
  .description('Get AI explanation of code')
  .option('-l, --line <line>', 'Explain specific line or range (e.g., 10 or 10-20)')
  .option('-d, --detail <level>', 'Detail level (brief, normal, detailed)', 'normal')
  .option('--model <model>', 'AI model to use', 'gpt-4')
  .action(async (file, options) => {
    const spinner = ora('Analyzing code...').start();
    
    try {
      const engine = await initCodex();
      const code = await fs.readFile(file, 'utf-8');
      
      let targetCode = code;
      if (options.line) {
        const lines = code.split('\n');
        if (options.line.includes('-')) {
          const [start, end] = options.line.split('-').map(Number);
          targetCode = lines.slice(start - 1, end).join('\n');
        } else {
          const lineNum = Number(options.line);
          targetCode = lines[lineNum - 1] || code;
        }
      }
      
      const explanation = await engine.explain(targetCode, {
        detail: options.detail,
        filePath: file,
        model: options.model
      });
      
      spinner.succeed('Explanation ready!');
      
      console.log('\n' + chalk.bold('Code Explanation:'));
      console.log(boxen(explanation.summary, {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'magenta'
      }));
      
      if (explanation.details) {
        console.log(chalk.cyan('\nDetailed breakdown:'));
        Object.entries(explanation.details).forEach(([key, value]) => {
          console.log(chalk.bold(`\n${key}:`));
          console.log(`  ${value}`);
        });
      }
      
    } catch (error: any) {
      spinner.fail('Explanation failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Convert code between languages
program
  .command('convert <file>')
  .description('Convert code to another language')
  .option('-t, --to <language>', 'Target language', 'typescript')
  .option('-o, --output <file>', 'Output file')
  .option('--model <model>', 'AI model to use', 'gpt-4')
  .action(async (file, options) => {
    const spinner = ora('Converting code...').start();
    
    try {
      const engine = await initCodex();
      const code = await fs.readFile(file, 'utf-8');
      
      const converted = await engine.convert(code, {
        from: path.extname(file).slice(1),
        to: options.to,
        filePath: file,
        model: options.model
      });
      
      spinner.succeed('Conversion complete!');
      
      if (options.output) {
        await fs.writeFile(options.output, converted.code, 'utf-8');
        console.log(chalk.green(`✓ Converted code saved to ${options.output}`));
      } else {
        console.log('\n' + chalk.bold('Converted code:'));
        console.log(boxen(converted.code, {
          padding: 1,
          borderStyle: 'round',
          borderColor: 'yellow'
        }));
      }
      
      if (converted.warnings) {
        console.log(chalk.yellow('\nConversion warnings:'));
        converted.warnings.forEach(warning => {
          console.log(`  ⚠️  ${warning}`);
        });
      }
      
    } catch (error: any) {
      spinner.fail('Conversion failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Test generation command
program
  .command('test <file>')
  .description('Generate tests for code')
  .option('-f, --framework <framework>', 'Test framework (jest, mocha, vitest)', 'vitest')
  .option('-o, --output <file>', 'Output test file')
  .option('--coverage <level>', 'Coverage level (basic, comprehensive)', 'comprehensive')
  .option('--model <model>', 'AI model to use', 'gpt-4')
  .action(async (file, options) => {
    const spinner = ora('Generating tests...').start();
    
    try {
      const engine = await initCodex();
      const code = await fs.readFile(file, 'utf-8');
      
      const tests = await engine.generateTests(code, {
        framework: options.framework,
        coverage: options.coverage,
        filePath: file,
        model: options.model
      });
      
      spinner.succeed('Tests generated!');
      
      const outputFile = options.output || file.replace(/\.(ts|js)$/, '.test.$1');
      await fs.writeFile(outputFile, tests.code, 'utf-8');
      console.log(chalk.green(`✓ Tests saved to ${outputFile}`));
      
      if (tests.coverage) {
        console.log(chalk.cyan('\nTest coverage:'));
        console.log(`  Functions: ${tests.coverage.functions}%`);
        console.log(`  Branches: ${tests.coverage.branches}%`);
        console.log(`  Lines: ${tests.coverage.lines}%`);
      }
      
    } catch (error: any) {
      spinner.fail('Test generation failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Configure command
program
  .command('config')
  .description('Configure Codex settings')
  .action(async () => {
    const config = await ConfigManager.load();
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select default AI provider:',
        choices: ['OpenAI', 'Anthropic', 'Both'],
        default: config.provider || 'OpenAI'
      },
      {
        type: 'password',
        name: 'openaiKey',
        message: 'OpenAI API Key:',
        when: (answers) => answers.provider !== 'Anthropic',
        default: config.openaiKey || ''
      },
      {
        type: 'password',
        name: 'anthropicKey',
        message: 'Anthropic API Key:',
        when: (answers) => answers.provider !== 'OpenAI',
        default: config.anthropicKey || ''
      },
      {
        type: 'list',
        name: 'defaultModel',
        message: 'Default model:',
        choices: (answers) => {
          if (answers.provider === 'OpenAI') {
            return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
          } else if (answers.provider === 'Anthropic') {
            return ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
          } else {
            return ['gpt-4', 'claude-3-opus'];
          }
        },
        default: config.defaultModel || 'gpt-4'
      },
      {
        type: 'confirm',
        name: 'telemetry',
        message: 'Enable anonymous usage telemetry?',
        default: config.telemetry !== false
      }
    ]);
    
    await ConfigManager.save(answers);
    console.log(chalk.green('✓ Configuration saved successfully!'));
  });

// Interactive mode
program
  .command('interactive')
  .alias('i')
  .description('Start interactive Codex session')
  .action(async () => {
    console.log(chalk.cyan('Starting interactive Codex session...'));
    console.log(chalk.dim('Type "exit" to quit\n'));
    
    const engine = await initCodex();
    
    while (true) {
      const { command } = await inquirer.prompt({
        type: 'input',
        name: 'command',
        message: 'codex>'
      });
      
      if (command.toLowerCase() === 'exit') {
        console.log(chalk.yellow('Goodbye!'));
        break;
      }
      
      try {
        const spinner = ora('Processing...').start();
        const result = await engine.processCommand(command);
        spinner.stop();
        console.log(result);
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
      }
    }
  });

// Chat with AI about code
program
  .command('chat')
  .description('Chat with AI about coding')
  .option('--context <file>', 'Load file as context')
  .option('--model <model>', 'AI model to use', 'gpt-4')
  .action(async (options) => {
    console.log(chalk.cyan('Starting Codex Chat...'));
    console.log(chalk.dim('Type "exit" to quit\n'));
    
    const engine = await initCodex();
    let context = '';
    
    if (options.context) {
      context = await fs.readFile(options.context, 'utf-8');
      console.log(chalk.green(`✓ Loaded context from ${options.context}\n`));
    }
    
    const chatHistory: Array<{role: string, content: string}> = [];
    
    while (true) {
      const { message } = await inquirer.prompt({
        type: 'input',
        name: 'message',
        message: chalk.cyan('You: ')
      });
      
      if (message.toLowerCase() === 'exit') {
        console.log(chalk.yellow('Goodbye!'));
        break;
      }
      
      const spinner = ora('Thinking...').start();
      
      try {
        const response = await engine.chat(message, {
          context,
          history: chatHistory,
          model: options.model
        });
        
        spinner.stop();
        console.log(chalk.green('AI: ') + response);
        
        chatHistory.push(
          { role: 'user', content: message },
          { role: 'assistant', content: response }
        );
        
      } catch (error: any) {
        spinner.fail('Chat error');
        console.error(chalk.red(error.message));
      }
    }
  });

// Parse and handle commands
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
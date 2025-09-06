# Codex - AI-Powered Coding Assistant

Codex is a powerful command-line tool that leverages AI (OpenAI GPT and Anthropic Claude) to help you generate, analyze, refactor, and optimize code.

## Installation

```bash
npm install -g @crowecad/codex
```

Or install locally in your project:
```bash
npm install --save-dev @crowecad/codex
```

## Configuration

First, configure Codex with your API keys:

```bash
codex config
```

Or set environment variables:
```bash
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
```

## Features

### 🚀 Code Generation
Generate any type of code with AI assistance:

```bash
# Generate a function
codex generate function -p "Calculate fibonacci sequence"

# Generate a React component
codex generate component -p "Todo list with add/remove functionality"

# Generate an API endpoint
codex generate api -p "User authentication endpoint with JWT"

# Generate with specific language
codex generate class -p "Binary search tree implementation" -l python
```

### 🔍 Code Analysis
Analyze code for quality, security, and performance issues:

```bash
# Analyze code quality
codex analyze src/index.ts

# Security analysis
codex analyze app.js -t security

# Performance analysis
codex analyze algorithm.ts -t performance

# Auto-fix issues
codex analyze src/components/Button.tsx --fix
```

### ♻️ Code Refactoring
Refactor code with AI suggestions:

```bash
# Clean code refactoring
codex refactor legacy.js -t clean

# Performance optimization
codex refactor slow-function.ts -t optimize

# Modernize old code
codex refactor old-syntax.js -t modernize

# Preview changes without applying
codex refactor utils.ts --dry-run
```

### 📖 Code Explanation
Get AI explanations of complex code:

```bash
# Explain entire file
codex explain complex-algorithm.ts

# Explain specific lines
codex explain src/utils.ts -l 50-75

# Get detailed explanation
codex explain cryptography.js -d detailed
```

### 🔄 Code Conversion
Convert code between programming languages:

```bash
# Convert JavaScript to TypeScript
codex convert script.js -t typescript -o script.ts

# Convert Python to JavaScript
codex convert algorithm.py -t javascript

# Convert React class to functional component
codex convert OldComponent.jsx -t functional-component
```

### 🧪 Test Generation
Generate comprehensive tests for your code:

```bash
# Generate tests with Vitest (default)
codex test src/utils.ts

# Generate Jest tests
codex test api/auth.js -f jest -o auth.test.js

# Generate comprehensive test coverage
codex test Calculator.ts --coverage comprehensive
```

### 💬 Interactive Chat
Chat with AI about coding questions:

```bash
# Start interactive chat
codex chat

# Chat with file context
codex chat --context src/app.ts

# Use specific model
codex chat --model claude-3-opus
```

### 🎯 Interactive Mode
Run Codex in interactive mode for continuous assistance:

```bash
codex interactive
# or
codex i
```

## Command Options

### Global Options
- `-q, --quiet` - Suppress banner and decorative output
- `-h, --help` - Show help
- `-V, --version` - Show version

### Generation Options
- `-p, --prompt <prompt>` - Description of what to generate
- `-l, --language <language>` - Programming language (default: typescript)
- `-o, --output <file>` - Output file path
- `-t, --template <template>` - Use a specific template
- `--model <model>` - AI model to use (gpt-4, claude-3, etc.)

### Analysis Options
- `-t, --type <type>` - Analysis type (quality, security, performance)
- `--fix` - Automatically fix issues where possible
- `--model <model>` - AI model to use

## Templates

Codex supports various built-in templates:
- `function` - Function template
- `class` - Class template
- `component` - React component
- `api-endpoint` - REST API endpoint
- `test` - Test suite
- `module` - Module structure
- `service` - Service class
- `hook` - React hook
- `reducer` - Redux reducer
- `schema` - Validation schema

## Models Supported

### OpenAI Models
- `gpt-4` - Most capable model
- `gpt-4-turbo` - Faster GPT-4 variant
- `gpt-3.5-turbo` - Fast and cost-effective

### Anthropic Models
- `claude-3-opus` - Most capable Claude model
- `claude-3-sonnet` - Balanced performance
- `claude-3-haiku` - Fast and efficient

## Configuration File

Create a `.codexrc.json` in your project or home directory:

```json
{
  "provider": "openai",
  "defaultModel": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 2000,
  "telemetry": true,
  "cache": true
}
```

## Examples

### Generate a REST API
```bash
codex gen api -p "CRUD operations for user management with authentication"
```

### Analyze and fix a React component
```bash
codex analyze UserProfile.tsx --fix
```

### Convert a Python script to TypeScript
```bash
codex convert ml_model.py -t typescript -o ml_model.ts
```

### Generate tests for a utility module
```bash
codex test utils/validation.ts -f vitest --coverage comprehensive
```

### Refactor legacy code
```bash
codex refactor legacy/old-module.js -t modernize -o src/new-module.ts
```

## Integration with CroweCAD

Codex is part of the CroweCAD ecosystem and integrates seamlessly with:
- CAD file generation
- 3D model code generation
- Engineering calculation scripts
- Technical documentation generation

## Contributing

Contributions are welcome! Please see our [contributing guidelines](https://github.com/MichaelCrowe11/Crowecad/blob/main/CONTRIBUTING.md).

## License

MIT License - see [LICENSE](https://github.com/MichaelCrowe11/Crowecad/blob/main/LICENSE) for details.

## Support

- GitHub Issues: https://github.com/MichaelCrowe11/Crowecad/issues
- Documentation: https://crowecad.com/docs/codex
- Discord: https://discord.gg/crowecad
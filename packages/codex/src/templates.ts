import fs from 'fs-extra';
import path from 'path';

export class TemplateManager {
  private templates: Map<string, string> = new Map();
  private templateDir: string;

  constructor(templateDir?: string) {
    this.templateDir = templateDir || path.join(__dirname, '../templates');
    this.loadBuiltInTemplates();
  }

  private loadBuiltInTemplates() {
    // Built-in templates
    this.templates.set('function', `
// Function: {{name}}
// Description: {{description}}
export function {{name}}({{params}}): {{returnType}} {
  {{body}}
}
`);

    this.templates.set('class', `
/**
 * {{description}}
 */
export class {{name}} {
  {{properties}}

  constructor({{constructorParams}}) {
    {{constructorBody}}
  }

  {{methods}}
}
`);

    this.templates.set('component', `
import React from 'react';
{{imports}}

interface {{name}}Props {
  {{props}}
}

/**
 * {{description}}
 */
export const {{name}}: React.FC<{{name}}Props> = ({
  {{propsDestructure}}
}) => {
  {{hooks}}

  {{handlers}}

  return (
    {{jsx}}
  );
};
`);

    this.templates.set('api-endpoint', `
/**
 * {{method}} {{path}}
 * {{description}}
 */
router.{{methodLower}}('{{path}}', async (req: Request, res: Response) => {
  try {
    {{validation}}
    
    {{businessLogic}}
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('{{path}} error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
`);

    this.templates.set('test', `
import { describe, it, expect, beforeEach, afterEach } from '{{framework}}';
import { {{targetName}} } from '{{targetPath}}';

describe('{{targetName}}', () => {
  {{setup}}

  {{testCases}}

  {{teardown}}
});
`);

    this.templates.set('module', `
/**
 * {{moduleName}} Module
 * {{description}}
 */

{{imports}}

{{constants}}

{{types}}

{{privateHelpers}}

{{publicFunctions}}

{{exports}}
`);

    this.templates.set('service', `
import { Injectable } from '@nestjs/common';
{{imports}}

/**
 * {{serviceName}} Service
 * {{description}}
 */
@Injectable()
export class {{serviceName}}Service {
  constructor(
    {{dependencies}}
  ) {}

  {{methods}}
}
`);

    this.templates.set('hook', `
import { useState, useEffect, useCallback, useMemo } from 'react';
{{imports}}

/**
 * {{hookName}} Hook
 * {{description}}
 */
export function {{hookName}}({{params}}) {
  {{state}}

  {{effects}}

  {{callbacks}}

  {{memoized}}

  return {{returnValue}};
}
`);

    this.templates.set('reducer', `
{{imports}}

// Action Types
{{actionTypes}}

// State Type
interface {{name}}State {
  {{stateProperties}}
}

// Initial State
const initialState: {{name}}State = {
  {{initialValues}}
};

// Action Creators
{{actionCreators}}

// Reducer
export function {{name}}Reducer(
  state = initialState,
  action: {{name}}Actions
): {{name}}State {
  switch (action.type) {
    {{cases}}
    default:
      return state;
  }
}
`);

    this.templates.set('schema', `
import { z } from 'zod';

/**
 * {{schemaName}} Schema
 * {{description}}
 */
export const {{schemaName}}Schema = z.object({
  {{fields}}
});

export type {{schemaName}} = z.infer<typeof {{schemaName}}Schema>;

// Validation helper
export function validate{{schemaName}}(data: unknown): {{schemaName}} {
  return {{schemaName}}Schema.parse(data);
}

// Type guard
export function is{{schemaName}}(data: unknown): data is {{schemaName}} {
  return {{schemaName}}Schema.safeParse(data).success;
}
`);
  }

  async getTemplate(name: string): Promise<string | undefined> {
    // Check built-in templates
    if (this.templates.has(name)) {
      return this.templates.get(name);
    }

    // Try to load from file
    const templatePath = path.join(this.templateDir, `${name}.template`);
    if (await fs.pathExists(templatePath)) {
      return await fs.readFile(templatePath, 'utf-8');
    }

    return undefined;
  }

  async getDefaultTemplate(type: string): Promise<string | undefined> {
    // Map common types to templates
    const typeMap: Record<string, string> = {
      'function': 'function',
      'func': 'function',
      'method': 'function',
      'class': 'class',
      'component': 'component',
      'react': 'component',
      'api': 'api-endpoint',
      'endpoint': 'api-endpoint',
      'route': 'api-endpoint',
      'test': 'test',
      'spec': 'test',
      'module': 'module',
      'service': 'service',
      'hook': 'hook',
      'reducer': 'reducer',
      'schema': 'schema',
      'validation': 'schema'
    };

    const templateName = typeMap[type.toLowerCase()] || type;
    return this.getTemplate(templateName);
  }

  async saveTemplate(name: string, content: string): Promise<void> {
    const templatePath = path.join(this.templateDir, `${name}.template`);
    await fs.ensureDir(this.templateDir);
    await fs.writeFile(templatePath, content, 'utf-8');
    this.templates.set(name, content);
  }

  async listTemplates(): Promise<string[]> {
    const builtIn = Array.from(this.templates.keys());
    
    if (await fs.pathExists(this.templateDir)) {
      const files = await fs.readdir(this.templateDir);
      const custom = files
        .filter((f: string) => f.endsWith('.template'))
        .map((f: string) => f.replace('.template', ''));
      
      return [...new Set([...builtIn, ...custom])];
    }
    
    return builtIn;
  }

  renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;
    
    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(regex, value);
    });
    
    // Remove unused placeholders
    rendered = rendered.replace(/{{.*?}}/g, '');
    
    return rendered.trim();
  }
}
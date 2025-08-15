#!/usr/bin/env node

/**
 * CroweCad Assistant Test Suite
 * Tests various CAD queries and operations
 */

import fetch from 'node-fetch';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';

// Test queries covering different CAD operations
const TEST_QUERIES = [
  {
    category: 'Geometric Operations',
    queries: [
      'Create a circle with radius 50mm at origin',
      'Draw a line from point (0,0) to point (100,100)',
      'Create a rectangle 80x60 with center at (50,50)',
      'Generate an arc with radius 30 from 0 to 90 degrees',
      'Create a polygon with 6 sides and radius 40'
    ]
  },
  {
    category: 'Modifications',
    queries: [
      'Offset a polyline by 10mm',
      'Mirror an object across the Y axis',
      'Rotate selected objects by 45 degrees',
      'Scale the drawing by factor of 2',
      'Fillet corners with radius 5mm'
    ]
  },
  {
    category: 'Calculations',
    queries: [
      'Calculate the intersection of two lines',
      'Find the tangent point between a line and circle',
      'Calculate the area of a closed polyline',
      'Measure the distance between two points',
      'Find the angle between two lines'
    ]
  },
  {
    category: 'Parametric Design',
    queries: [
      'Create a gear with 20 teeth, module 3',
      'Generate a spring with 10 coils, diameter 20mm',
      'Design a bracket with 4 mounting holes',
      'Create a parametric box with dimensions 100x50x30',
      'Generate a cam profile for 360 degree rotation'
    ]
  },
  {
    category: 'Complex Operations',
    queries: [
      'Convert a sketch to 3D extrusion with height 50mm',
      'Create a pattern of holes in a circular array',
      'Generate toolpath for CNC milling',
      'Design a sheet metal part with bends',
      'Create an assembly with mating constraints'
    ]
  }
];

class AssistantTester {
  constructor() {
    this.results = {
      total: 0,
      successful: 0,
      failed: 0,
      withCode: 0,
      avgResponseTime: 0
    };
    this.responseTimes = [];
  }

  async runTests() {
    console.log(chalk.cyan.bold('\n🧪 CroweCad Assistant Test Suite\n'));
    console.log(chalk.gray('═'.repeat(50)));

    // Check API health first
    const healthCheck = await this.checkHealth();
    if (!healthCheck) {
      console.log(chalk.red('❌ API is not healthy. Please start the server first.'));
      return;
    }

    // Run tests for each category
    for (const category of TEST_QUERIES) {
      console.log(chalk.yellow(`\n📁 ${category.category}`));
      console.log(chalk.gray('─'.repeat(40)));

      for (const query of category.queries) {
        await this.testQuery(query);
        await this.delay(1000); // Rate limiting
      }
    }

    // Print results
    this.printResults();
  }

  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE}/openai/health`);
      const data = await response.json();
      
      if (data.status === 'healthy') {
        console.log(chalk.green('✅ API is healthy'));
        console.log(chalk.gray(`Features: ${Object.entries(data.features)
          .filter(([_, v]) => v)
          .map(([k]) => k)
          .join(', ')}`));
        return true;
      } else {
        console.log(chalk.yellow(`⚠️  API status: ${data.status}`));
        return data.features.query; // At least query should work
      }
    } catch (error) {
      return false;
    }
  }

  async testQuery(query) {
    const spinner = ora({
      text: query,
      prefixText: '  '
    }).start();

    const startTime = Date.now();

    try {
      const response = await fetch(`${API_BASE}/crowecad/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          context: {
            testMode: true,
            timestamp: new Date().toISOString()
          }
        })
      });

      const responseTime = Date.now() - startTime;
      this.responseTimes.push(responseTime);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        this.results.successful++;
        
        // Check if code was generated
        if (data.code_blocks && data.code_blocks.length > 0) {
          this.results.withCode++;
          spinner.succeed(chalk.green(`✓ ${query} (${responseTime}ms, ${data.code_blocks.length} code blocks)`));
        } else {
          spinner.succeed(chalk.green(`✓ ${query} (${responseTime}ms)`));
        }

        // Show extracted code types
        if (data.code_blocks?.length > 0) {
          const codeTypes = [...new Set(data.code_blocks.map(b => b.type))];
          console.log(chalk.gray(`    Code: ${codeTypes.join(', ')}`));
        }

        // Show relevant skills
        if (data.relevant_skills?.length > 0) {
          const skills = data.relevant_skills.map(s => s.name).join(', ');
          console.log(chalk.gray(`    Skills: ${skills}`));
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      this.results.failed++;
      spinner.fail(chalk.red(`✗ ${query} - ${error.message}`));
    } finally {
      this.results.total++;
    }
  }

  async testFileUpload() {
    console.log(chalk.yellow('\n📁 File Upload Test'));
    console.log(chalk.gray('─'.repeat(40)));

    // Create a sample DXF file content
    const dxfContent = `0
SECTION
2
ENTITIES
0
LINE
8
0
10
0.0
20
0.0
30
0.0
11
100.0
21
100.0
31
0.0
0
CIRCLE
8
0
10
50.0
20
50.0
30
0.0
40
25.0
0
ENDSEC
0
EOF`;

    // Create FormData with file
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('file', Buffer.from(dxfContent), {
      filename: 'test.dxf',
      contentType: 'application/dxf'
    });

    const spinner = ora('Uploading test.dxf').start();

    try {
      const response = await fetch(`${API_BASE}/crowecad/upload-drawing`, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      });

      const data = await response.json();

      if (data.status === 'success') {
        spinner.succeed(chalk.green('✓ File upload successful'));
        console.log(chalk.gray(`    Entities: ${data.analysis.entities.join(', ')}`));
        if (data.analysis.suggestedOperations?.length > 0) {
          console.log(chalk.gray(`    Suggested: ${data.analysis.suggestedOperations[0].name}`));
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      spinner.fail(chalk.red(`✗ File upload failed: ${error.message}`));
    }
  }

  async testTraining() {
    console.log(chalk.yellow('\n📁 Training Test'));
    console.log(chalk.gray('─'.repeat(40)));

    const testPattern = `(defun c:test_circle ()
  (setq center (getpoint "\\nCenter point: "))
  (setq radius (getdist center "\\nRadius: "))
  (command "circle" center radius)
  (princ)
)`;

    const spinner = ora('Adding test pattern').start();

    try {
      const response = await fetch(`${API_BASE}/crowecad/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pattern: testPattern,
          category: 'autolisp_patterns',
          name: 'Test Circle Function',
          description: 'Test pattern for drawing circles'
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        spinner.succeed(chalk.green('✓ Pattern added successfully'));
        if (data.added_skills?.length > 0) {
          console.log(chalk.gray(`    Added skills: ${data.added_skills.map(s => s.name).join(', ')}`));
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      spinner.fail(chalk.red(`✗ Training failed: ${error.message}`));
    }
  }

  printResults() {
    const avgTime = this.responseTimes.length > 0
      ? Math.round(this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length)
      : 0;

    console.log(chalk.cyan.bold('\n📊 Test Results'));
    console.log(chalk.gray('═'.repeat(50)));
    console.log(`Total Tests:       ${this.results.total}`);
    console.log(chalk.green(`Successful:        ${this.results.successful} (${Math.round(this.results.successful / this.results.total * 100)}%)`));
    console.log(chalk.red(`Failed:            ${this.results.failed}`));
    console.log(`With Code:         ${this.results.withCode} (${Math.round(this.results.withCode / this.results.successful * 100)}%)`);
    console.log(`Avg Response Time: ${avgTime}ms`);
    console.log(chalk.gray('═'.repeat(50)));

    // Overall status
    if (this.results.failed === 0) {
      console.log(chalk.green.bold('\n✨ All tests passed!'));
    } else if (this.results.successful > this.results.failed) {
      console.log(chalk.yellow.bold('\n⚠️  Most tests passed with some failures'));
    } else {
      console.log(chalk.red.bold('\n❌ Tests failed - check configuration'));
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const tester = new AssistantTester();
  
  try {
    await tester.runTests();
    
    // Additional tests
    await tester.testFileUpload();
    await tester.testTraining();
    
  } catch (error) {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
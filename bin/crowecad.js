#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

const program = new Command();
program
  .name('crowecad')
  .description('CroweCad command line interface')
  .version(pkg.version);

program
  .command('start')
  .description('Start the CroweCad application')
  .action(() => {
    console.log('Starting CroweCad... (CLI stub)');
  });

program.parse(process.argv);

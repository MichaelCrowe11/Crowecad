#!/usr/bin/env node

/**
 * CroweCad Skill Mining Script
 * Scrapes CAD repositories and builds the knowledge base
 */

import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CroweCadSkillMiner } from '../client/src/lib/skill-miner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Priority repositories to mine
const PRIORITY_REPOS = [
  'FreeCAD/FreeCAD',
  'LibreCAD/LibreCAD',
  'openscad/openscad',
  'ezdxf/ezdxf',
  'CadQuery/cadquery',
  'CGAL/cgal',
  'KiCad/kicad-source-mirror',
  'Solvespace/solvespace',
  'BRL-CAD/brlcad',
  'pythonOCC/pythonocc-core',
  'miho/OpenSCAD-Font-Fonts',
  'jimy-byerley/pymadcad'
];

// Search queries for finding CAD repositories
const SEARCH_QUERIES = [
  'autocad autolisp stars:>10',
  'language:python cad geometry',
  'dxf dwg parser stars:>50',
  'computational geometry algorithms',
  'parametric design cad',
  'spatial recognition opencv cad',
  'constraint solver geometry',
  'nurbs bezier curve implementation',
  'mechanical engineering cad',
  'architectural design software',
  'cnc gcode generator',
  'finite element analysis'
];

class SkillMiningOrchestrator {
  constructor(githubToken) {
    this.octokit = new Octokit({
      auth: githubToken
    });
    this.skillMiner = new CroweCadSkillMiner();
    this.minedRepos = new Set();
    this.stats = {
      reposScanned: 0,
      filesProcessed: 0,
      skillsExtracted: 0,
      errors: 0
    };
  }

  async mineRepositories() {
    console.log('🚀 Starting CroweCad skill mining...\n');

    // Mine priority repositories
    console.log('📦 Mining priority repositories...');
    for (const repoName of PRIORITY_REPOS) {
      await this.mineRepository(repoName);
      await this.delay(2000); // Rate limiting
    }

    // Search for additional repositories
    console.log('\n🔍 Searching for additional CAD repositories...');
    const additionalRepos = await this.searchRepositories();
    
    for (const repo of additionalRepos) {
      if (!this.minedRepos.has(repo.full_name)) {
        await this.mineRepository(repo.full_name);
        await this.delay(2000);
      }
    }

    // Save the knowledge base
    await this.saveKnowledgeBase();
    
    // Print statistics
    this.printStatistics();
  }

  async mineRepository(repoName) {
    try {
      console.log(`\n⛏️  Mining ${repoName}...`);
      const [owner, name] = repoName.split('/');
      
      // Get repository info
      const { data: repo } = await this.octokit.repos.get({ owner, repo: name });
      console.log(`   Stars: ${repo.stargazers_count}, Language: ${repo.language}`);
      
      // Get repository contents
      const contents = await this.getRepositoryContents(owner, name);
      
      // Process files based on language
      const language = repo.language?.toLowerCase() || 'unknown';
      let extractedSkills = [];

      for (const file of contents) {
        if (this.isRelevantFile(file.path, language)) {
          const skills = await this.processFile(owner, name, file.path, language);
          extractedSkills.push(...skills);
          this.stats.filesProcessed++;
        }
      }

      // Add skills to knowledge base
      extractedSkills.forEach(skill => {
        skill.repository = repoName;
        this.skillMiner.addSkill(skill);
      });

      this.stats.skillsExtracted += extractedSkills.length;
      this.stats.reposScanned++;
      this.minedRepos.add(repoName);
      
      console.log(`   ✅ Extracted ${extractedSkills.length} skills`);
    } catch (error) {
      console.error(`   ❌ Error mining ${repoName}: ${error.message}`);
      this.stats.errors++;
    }
  }

  async getRepositoryContents(owner, repo, path = '') {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path
      });

      let files = [];
      
      for (const item of Array.isArray(data) ? data : [data]) {
        if (item.type === 'file') {
          files.push(item);
        } else if (item.type === 'dir' && this.isRelevantDirectory(item.name)) {
          // Recursively get contents of relevant directories
          const subFiles = await this.getRepositoryContents(owner, repo, item.path);
          files.push(...subFiles);
        }
      }

      return files;
    } catch (error) {
      return [];
    }
  }

  isRelevantDirectory(dirName) {
    const relevant = ['src', 'lib', 'lisp', 'scripts', 'cad', 'geometry', 'algorithms'];
    return relevant.some(r => dirName.toLowerCase().includes(r));
  }

  isRelevantFile(filePath, language) {
    const extensions = {
      'python': ['.py'],
      'c++': ['.cpp', '.cc', '.cxx', '.hpp', '.h'],
      'javascript': ['.js', '.ts'],
      'lisp': ['.lsp', '.lisp', '.el'],
      'c': ['.c', '.h'],
      'rust': ['.rs'],
      'julia': ['.jl']
    };

    const ext = path.extname(filePath).toLowerCase();
    const langExts = extensions[language.toLowerCase()] || [];
    
    // Check for AutoLISP files specifically
    if (ext === '.lsp' || ext === '.vlx' || ext === '.fas') return true;
    
    // Check language-specific extensions
    if (langExts.includes(ext)) return true;
    
    // Check for CAD-related files
    if (filePath.toLowerCase().includes('cad') || 
        filePath.toLowerCase().includes('geometry') ||
        filePath.toLowerCase().includes('draw')) {
      return ['.py', '.js', '.cpp', '.c'].includes(ext);
    }

    return false;
  }

  async processFile(owner, repo, filePath, language) {
    try {
      // Get file content
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: filePath
      });

      if (data.content) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        
        // Map GitHub language to our language categories
        const langMap = {
          'python': 'python',
          'javascript': 'javascript',
          'typescript': 'javascript',
          'c++': 'cpp',
          'c': 'cpp',
          'lisp': 'lisp',
          'common lisp': 'lisp'
        };

        const mappedLang = langMap[language.toLowerCase()] || 'javascript';
        
        // Extract skills from code
        const skills = await this.skillMiner.extractSkillsFromCode(content, mappedLang);
        
        return skills;
      }
    } catch (error) {
      // File too large or other error
      return [];
    }

    return [];
  }

  async searchRepositories() {
    const repos = [];
    
    for (const query of SEARCH_QUERIES) {
      try {
        console.log(`   Searching: "${query}"`);
        const { data } = await this.octokit.search.repos({
          q: query,
          sort: 'stars',
          order: 'desc',
          per_page: 5
        });

        repos.push(...data.items);
        await this.delay(1000); // Rate limiting
      } catch (error) {
        console.error(`   Error searching: ${error.message}`);
      }
    }

    return repos;
  }

  async saveKnowledgeBase() {
    const database = this.skillMiner.exportDatabase();
    
    // Save JSON version
    const jsonPath = path.join(__dirname, '..', 'crowecad_skills.json');
    await fs.writeFile(jsonPath, JSON.stringify(database, null, 2));
    console.log(`\n💾 Saved knowledge base to ${jsonPath}`);
    
    // Save statistics
    const statsPath = path.join(__dirname, '..', 'mining_stats.json');
    await fs.writeFile(statsPath, JSON.stringify({
      ...this.stats,
      timestamp: new Date().toISOString(),
      repos: Array.from(this.minedRepos)
    }, null, 2));
  }

  printStatistics() {
    console.log('\n📊 Mining Statistics:');
    console.log('═══════════════════════════════════');
    console.log(`Repositories scanned: ${this.stats.reposScanned}`);
    console.log(`Files processed:      ${this.stats.filesProcessed}`);
    console.log(`Skills extracted:     ${this.stats.skillsExtracted}`);
    console.log(`Errors encountered:   ${this.stats.errors}`);
    console.log('═══════════════════════════════════\n');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    console.error('❌ Error: GITHUB_TOKEN environment variable is required');
    console.log('Please set GITHUB_TOKEN in your .env file or environment');
    process.exit(1);
  }

  const orchestrator = new SkillMiningOrchestrator(githubToken);
  
  try {
    await orchestrator.mineRepositories();
    console.log('✨ Skill mining completed successfully!');
  } catch (error) {
    console.error('❌ Fatal error during mining:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { SkillMiningOrchestrator };
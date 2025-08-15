import 'dotenv-safe/config';
import { Router } from 'express';
import OpenAI from 'openai';
import { z } from 'zod';
import { skillMiner } from '../../client/src/lib/skill-miner';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.dxf', '.dwg', '.step', '.iges', '.stl'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: DXF, DWG, STEP, IGES, STL'));
    }
  }
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY must be set');
}

if (!process.env.OPENAI_ASSISTANT_ID) {
  throw new Error('OPENAI_ASSISTANT_ID must be set');
}

const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Schema for CAD generation request
const generateCADSchema = z.object({
  description: z.string().min(1),
  industry: z.string().optional(),
  format: z.enum(['dxf', 'step', 'stl', 'obj']).optional().default('dxf'),
  parameters: z.record(z.any()).optional(),
});

// Schema for assistant request
const assistantRequestSchema = z.object({
  message: z.string().min(1),
  threadId: z.string().optional(),
  category: z.string().optional(),
});

// Store for assistant threads (in production, use database)
const assistantThreads = new Map<string, string>();

/**
 * Generate CAD from natural language description
 */
router.post('/generate', async (req, res) => {
  try {
    const input = generateCADSchema.parse(req.body);
    
    // Search for relevant skills
    const relevantSkills = skillMiner.searchSkills(input.description);
    
    // Build context from skills
    const context = relevantSkills
      .slice(0, 3)
      .map(skill => skill.implementation)
      .join('\n\n');
    
    // Create prompt with context
    const prompt = `Generate CAD code for: ${input.description}
Industry: ${input.industry || 'general'}
Output format: ${input.format}

Reference implementations:
${context}

Generate complete, working code that can be executed.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are CroweCad, an expert CAD system. Generate precise CAD code based on descriptions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const generatedCode = response.choices[0].message.content;
    
    // Record skill usage for successful generation
    relevantSkills.forEach(skill => {
      skillMiner.recordUsage(skill.id, true);
    });

    res.json({
      success: true,
      data: {
        code: generatedCode,
        format: input.format,
        relevantSkills: relevantSkills.map(s => ({
          name: s.name,
          category: s.category,
          confidence: s.confidence
        }))
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request', details: error.errors });
    } else {
      console.error('CAD generation error:', error);
      res.status(500).json({ error: 'Failed to generate CAD' });
    }
  }
});

/**
 * Create or continue assistant conversation
 */
router.post('/assistant', async (req, res) => {
  try {
    const input = assistantRequestSchema.parse(req.body);
    
    // Get or create thread
    let threadId = input.threadId;
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      
      // Generate session ID
      const sessionId = `session_${Date.now()}`;
      assistantThreads.set(sessionId, threadId);
    }
    
    // Search for relevant skills
    const relevantSkills = skillMiner.searchSkills(input.message, input.category as any);
    
    // Enhance message with context
    const enhancedMessage = `${input.message}

Relevant patterns:
${relevantSkills.slice(0, 3).map(s => 
  `- ${s.name}: ${s.description}`
).join('\n')}`;

    // Add message to thread
    await openai.beta.threads.messages.create(
      threadId,
      {
        role: 'user',
        content: enhancedMessage
      }
    );

    // Run assistant
    const run = await openai.beta.threads.runs.create(
      threadId,
      {
        assistant_id: process.env.OPENAI_ASSISTANT_ID,
        instructions: buildDynamicInstructions(relevantSkills)
      }
    );

    // Wait for completion (with timeout)
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    const maxAttempts = 30;
    let attempts = 0;
    
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      if (attempts >= maxAttempts) {
        throw new Error('Assistant timeout');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      attempts++;
    }

    // Get response
    const messages = await openai.beta.threads.messages.list(threadId);
    const latestMessage = messages.data[0];

    res.json({
      success: true,
      data: {
        response: latestMessage.content[0].type === 'text' 
          ? latestMessage.content[0].text.value 
          : 'Response contains non-text content',
        threadId,
        relevantSkills: relevantSkills.slice(0, 3).map(s => ({
          name: s.name,
          category: s.category
        }))
      }
    });
  } catch (error) {
    console.error('Assistant error:', error);
    res.status(500).json({ error: 'Assistant failed to respond' });
  }
});

/**
 * Execute Code Interpreter for CAD calculations
 */
router.post('/code-interpreter', async (req, res) => {
  try {
    const { code, description } = req.body;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Execute the following Python code for CAD calculations and return the results.'
        },
        {
          role: 'user',
          content: `${description}\n\nCode:\n${code}`
        }
      ],
      tools: [
        {
          type: 'code_interpreter'
        }
      ],
      tool_choice: 'auto'
    });

    res.json({
      success: true,
      data: {
        result: response.choices[0].message.content,
        tool_calls: response.choices[0].message.tool_calls
      }
    });
  } catch (error) {
    console.error('Code interpreter error:', error);
    res.status(500).json({ error: 'Code execution failed' });
  }
});

/**
 * Analyze image for CAD generation
 */
router.post('/analyze-image', async (req, res) => {
  try {
    const { imageBase64, prompt } = req.body;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt || 'Analyze this technical drawing and describe the CAD elements needed to recreate it.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const analysis = response.choices[0].message.content;
    
    // Search for relevant skills based on analysis
    const relevantSkills = skillMiner.searchSkills(analysis || '');

    res.json({
      success: true,
      data: {
        analysis,
        suggestedOperations: relevantSkills.slice(0, 5).map(s => ({
          name: s.name,
          category: s.category,
          implementation: s.implementation.substring(0, 200) + '...'
        }))
      }
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: 'Image analysis failed' });
  }
});

/**
 * Get skill recommendations based on context
 */
router.post('/recommendations', async (req, res) => {
  try {
    const { context, category } = req.body;
    
    const recommendations = skillMiner.getRecommendations(context);
    
    res.json({
      success: true,
      data: {
        recommendations: recommendations.map(skill => ({
          id: skill.id,
          name: skill.name,
          category: skill.category,
          description: skill.description,
          confidence: skill.confidence,
          keywords: skill.keywords
        }))
      }
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

/**
 * Search skills database
 */
router.get('/skills/search', async (req, res) => {
  try {
    const { q, category } = req.query;
    
    const results = skillMiner.searchSkills(
      q as string || '', 
      category as any
    );
    
    res.json({
      success: true,
      data: {
        results: results.map(skill => ({
          id: skill.id,
          name: skill.name,
          category: skill.category,
          description: skill.description,
          language: skill.language,
          keywords: skill.keywords,
          confidence: skill.confidence
        }))
      }
    });
  } catch (error) {
    console.error('Skill search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * Build dynamic instructions based on relevant skills
 */
function buildDynamicInstructions(skills: any[]): string {
  const skillSummary = skills
    .slice(0, 5)
    .map(s => `- ${s.name}: ${s.description}`)
    .join('\n');

  return `You are CroweCad, an advanced CAD assistant with access to a comprehensive knowledge base.

Available relevant patterns for this request:
${skillSummary}

Use these patterns to provide accurate, working solutions. Always validate geometric constraints and provide complete, executable code.`;
}

/**
 * Process CAD query with full context
 */
router.post('/query', async (req, res) => {
  try {
    const { query, context } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Search for relevant skills
    const relevantSkills = skillMiner.searchSkills(query);
    
    // Build enhanced prompt with context
    const enhancedPrompt = `${query}
    
Context: ${JSON.stringify(context || {})}

Relevant CAD patterns:
${relevantSkills.slice(0, 5).map(s => 
  `- ${s.name}: ${s.description}\nImplementation: ${s.implementation.substring(0, 200)}...`
).join('\n\n')}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are CroweCad, an advanced CAD assistant with spatial recognition and geometric intelligence.
          
When responding:
1. Identify geometric primitives and relationships
2. Provide precise AutoLISP or Python code using learned patterns
3. Validate spatial constraints and dimensions
4. Include step-by-step CAD commands
5. Format code in markdown blocks with language specified`
        },
        {
          role: 'user',
          content: enhancedPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    const responseText = response.choices[0].message.content || '';
    const codeBlocks = extractCodeBlocks(responseText);
    
    res.json({
      status: 'success',
      response: responseText,
      code_blocks: codeBlocks,
      relevant_skills: relevantSkills.slice(0, 3).map(s => ({
        name: s.name,
        category: s.category
      }))
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

/**
 * Upload and analyze CAD drawing
 */
router.post('/upload-drawing', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    // Basic DXF parsing (simplified)
    const analysis = {
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname),
      entities: [],
      layers: [],
      dimensions: {}
    };
    
    // Parse DXF entities (basic example)
    if (req.file.originalname.toLowerCase().endsWith('.dxf')) {
      const lines = fileContent.split('\n');
      let currentSection = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line === 'ENTITIES') {
          currentSection = 'ENTITIES';
        } else if (line === 'LAYER') {
          analysis.layers.push(lines[i + 2]?.trim());
        } else if (currentSection === 'ENTITIES') {
          if (line === 'LINE' || line === 'CIRCLE' || line === 'ARC' || line === 'POLYLINE') {
            analysis.entities.push(line);
          }
        }
      }
    }
    
    // Get AI analysis of the drawing
    const aiAnalysis = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Analyze this CAD file data and provide insights about its structure, complexity, and suggested operations.'
        },
        {
          role: 'user',
          content: `Analyze this CAD file:
Filename: ${req.file.originalname}
File type: ${path.extname(req.file.originalname)}
Entities found: ${analysis.entities.join(', ')}
Layers: ${analysis.layers.join(', ')}

Provide:
1. Drawing complexity assessment
2. Main geometric features
3. Suggested modifications or improvements
4. Compatible operations from the skill database`
        }
      ],
      max_tokens: 1000
    });
    
    // Clean up uploaded file
    await fs.unlink(filePath);
    
    // Find relevant operations
    const suggestedOperations = skillMiner.searchSkills(
      analysis.entities.join(' ')
    ).slice(0, 5);
    
    res.json({
      status: 'success',
      analysis: {
        ...analysis,
        aiInsights: aiAnalysis.choices[0].message.content,
        suggestedOperations: suggestedOperations.map(s => ({
          name: s.name,
          category: s.category,
          description: s.description
        }))
      }
    });
  } catch (error) {
    console.error('Drawing analysis error:', error);
    
    // Clean up file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    res.status(500).json({ error: 'Failed to analyze drawing' });
  }
});

/**
 * Train CroweCad with new patterns
 */
router.post('/train', async (req, res) => {
  try {
    const { pattern, category, name, description } = req.body;
    
    if (!pattern || !category) {
      return res.status(400).json({ error: 'Pattern and category are required' });
    }
    
    // Extract skills from the pattern
    const extractedSkills = await skillMiner.extractSkillsFromCode(
      pattern,
      category === 'autolisp_patterns' ? 'lisp' : 'javascript'
    );
    
    // If no skills extracted, add manually
    if (extractedSkills.length === 0) {
      const newSkill = {
        id: `user-${Date.now()}`,
        name: name || 'User Pattern',
        category: category as any,
        description: description || 'User-contributed pattern',
        implementation: pattern,
        language: category === 'autolisp_patterns' ? 'lisp' : 'javascript',
        keywords: [],
        confidence: 0.8,
        usage_count: 0
      };
      
      skillMiner.addSkill(newSkill);
      extractedSkills.push(newSkill);
    } else {
      // Add all extracted skills
      extractedSkills.forEach(skill => {
        skillMiner.addSkill(skill);
      });
    }
    
    res.json({
      status: 'success',
      message: 'Pattern added to knowledge base',
      added_skills: extractedSkills.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category
      }))
    });
  } catch (error) {
    console.error('Training error:', error);
    res.status(500).json({ error: 'Failed to add pattern' });
  }
});

/**
 * Extract code blocks from text
 */
function extractCodeBlocks(text: string): Array<{ type: string; code: string }> {
  const blocks: Array<{ type: string; code: string }> = [];
  
  // Regular expressions for different code block types
  const patterns = [
    { type: 'autolisp', regex: /```(?:lisp|autolisp)\n([\s\S]*?)```/g },
    { type: 'python', regex: /```python\n([\s\S]*?)```/g },
    { type: 'javascript', regex: /```(?:javascript|js)\n([\s\S]*?)```/g },
    { type: 'typescript', regex: /```(?:typescript|ts)\n([\s\S]*?)```/g },
    { type: 'generic', regex: /```\n([\s\S]*?)```/g }
  ];
  
  for (const { type, regex } of patterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      blocks.push({
        type,
        code: match[1].trim()
      });
    }
  }
  
  return blocks;
}

// Health check
router.get('/health', (req, res) => {
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  res.json({
    status: hasApiKey ? 'healthy' : 'missing_api_key',
    features: {
      generation: hasApiKey,
      assistant: hasApiKey && !!process.env.OPENAI_ASSISTANT_ID,
      codeInterpreter: hasApiKey,
      imageAnalysis: hasApiKey,
      query: hasApiKey,
      drawingAnalysis: hasApiKey,
      training: true
    }
  });
});

export default router;

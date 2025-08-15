import { Router } from 'express';
import OpenAI from 'openai';
import { z } from 'zod';
import { skillMiner } from '../../client/src/lib/skill-miner';

const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
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
        assistant_id: process.env.OPENAI_ASSISTANT_ID || 'asst_crowecad',
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

// Health check
router.get('/health', (req, res) => {
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  res.json({
    status: hasApiKey ? 'healthy' : 'missing_api_key',
    features: {
      generation: hasApiKey,
      assistant: hasApiKey && !!process.env.OPENAI_ASSISTANT_ID,
      codeInterpreter: hasApiKey,
      imageAnalysis: hasApiKey
    }
  });
});

export default router;
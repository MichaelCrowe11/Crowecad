/**
 * OpenAI API Routes for CroweCad Server
 * Handles OpenAI-powered CAD operations
 */

import { Router, Request, Response } from 'express';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI client with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Note: The newest OpenAI model is "gpt-4o" which was released May 13, 2024
// Do not change this to "gpt-4" unless explicitly requested by the user
const DEFAULT_MODEL = 'gpt-4o';

/**
 * Generate CAD from natural language
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { description, industry, complexity } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const systemPrompt = industry 
      ? `You are a CAD expert specializing in ${industry}. Generate precise technical specifications.`
      : 'You are a CAD expert. Generate precise technical specifications for 3D models.';

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Generate a detailed CAD model specification for: ${description}
          Complexity level: ${complexity || 'standard'}
          
          Provide comprehensive output including:
          - Geometry primitives and operations
          - Precise dimensions
          - Material suggestions
          - Manufacturing considerations`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    res.json({ success: true, data: result });

  } catch (error: any) {
    console.error('OpenAI generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Analyze and optimize CAD design
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { modelData, optimizationGoals } = req.body;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a CAD optimization expert. Analyze designs for efficiency, manufacturability, and cost optimization.'
        },
        {
          role: 'user',
          content: `Analyze this CAD model with optimization goals: ${optimizationGoals?.join(', ') || 'general'}
          
          Model data: ${JSON.stringify(modelData)}
          
          Provide:
          1. Design analysis and score
          2. Specific optimization suggestions
          3. Material recommendations
          4. Manufacturing considerations
          5. Cost reduction opportunities`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    res.json({ success: true, analysis });

  } catch (error: any) {
    console.error('OpenAI analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Convert between CAD formats
 */
router.post('/convert', async (req: Request, res: Response) => {
  try {
    const { sourceFormat, targetFormat, modelData } = req.body;

    if (!sourceFormat || !targetFormat) {
      return res.status(400).json({ error: 'Source and target formats are required' });
    }

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a CAD format conversion expert. Accurately convert between different CAD file formats while preserving all geometric and metadata information.'
        },
        {
          role: 'user',
          content: `Convert from ${sourceFormat.toUpperCase()} to ${targetFormat.toUpperCase()} format.
          
          Source model data: ${JSON.stringify(modelData)}
          
          Ensure:
          - Geometry preservation
          - Dimension accuracy
          - Material properties transfer
          - Assembly constraints (if applicable)`
        }
      ]
    });

    const converted = response.choices[0].message.content;
    res.json({ success: true, converted, format: targetFormat });

  } catch (error: any) {
    console.error('OpenAI conversion error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Validate design against standards
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { modelData, industry, standards } = req.body;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a ${industry || 'general'} industry CAD validation expert. Validate designs against industry standards and best practices.`
        },
        {
          role: 'user',
          content: `Validate this CAD design against ${standards?.join(', ') || 'standard'} requirements.
          
          Model: ${JSON.stringify(modelData)}
          
          Check for:
          1. Dimensional tolerances
          2. Material specifications
          3. Manufacturing feasibility
          4. Safety requirements
          5. Industry compliance`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const validation = JSON.parse(response.choices[0].message.content || '{}');
    res.json({ success: true, validation });

  } catch (error: any) {
    console.error('OpenAI validation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate manufacturing instructions
 */
router.post('/manufacturing', async (req: Request, res: Response) => {
  try {
    const { modelData, method, material, quantity } = req.body;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a manufacturing expert. Generate detailed, practical manufacturing instructions from CAD models.'
        },
        {
          role: 'user',
          content: `Generate ${method || 'general'} manufacturing instructions.
          
          Model: ${JSON.stringify(modelData)}
          Material: ${material || 'standard'}
          Quantity: ${quantity || 1}
          
          Include:
          1. Step-by-step process
          2. Required tools and equipment
          3. Material preparation
          4. Quality control checkpoints
          5. Time and cost estimates`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const instructions = JSON.parse(response.choices[0].message.content || '{}');
    res.json({ success: true, instructions });

  } catch (error: any) {
    console.error('OpenAI manufacturing error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate parametric variations
 */
router.post('/variations', async (req: Request, res: Response) => {
  try {
    const { baseModel, parameters, count } = req.body;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a parametric CAD expert. Generate intelligent design variations based on specified parameters.'
        },
        {
          role: 'user',
          content: `Generate ${count || 3} variations of this design.
          
          Base model: ${JSON.stringify(baseModel)}
          Variable parameters: ${JSON.stringify(parameters)}
          
          Create meaningful variations that:
          1. Maintain functional requirements
          2. Explore design space
          3. Optimize for different criteria
          4. Preserve manufacturability`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const variations = JSON.parse(response.choices[0].message.content || '{}');
    res.json({ success: true, variations });

  } catch (error: any) {
    console.error('OpenAI variations error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Simulate and analyze with FEA
 */
router.post('/simulate', async (req: Request, res: Response) => {
  try {
    const { modelData, simulationType, conditions } = req.body;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a simulation and FEA expert. Provide detailed engineering analysis and simulation results.'
        },
        {
          role: 'user',
          content: `Perform ${simulationType || 'structural'} simulation analysis.
          
          Model: ${JSON.stringify(modelData)}
          Conditions: ${JSON.stringify(conditions)}
          
          Analyze:
          1. Stress distribution
          2. Deformation patterns
          3. Safety factors
          4. Critical failure points
          5. Optimization recommendations`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const simulation = JSON.parse(response.choices[0].message.content || '{}');
    res.json({ success: true, simulation });

  } catch (error: any) {
    console.error('OpenAI simulation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Chat with AI about CAD
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, context, history } = req.body;

    const messages: any[] = [
      {
        role: 'system',
        content: 'You are CroweCad AI assistant, an expert in CAD, engineering, and design. Help users with their CAD questions and provide technical guidance.'
      }
    ];

    // Add conversation history if provided
    if (history && Array.isArray(history)) {
      messages.push(...history);
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.8
    });

    const reply = response.choices[0].message.content;
    res.json({ success: true, reply });

  } catch (error: any) {
    console.error('OpenAI chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
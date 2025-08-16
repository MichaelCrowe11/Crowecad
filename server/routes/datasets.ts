import { Router } from "express";
import { db } from "../db";
import { cadDatasets, cadModels, cadCategories, cadPrompts, userModelLibrary } from "@shared/schema";
import { eq, and, like, inArray, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Get all datasets
router.get("/datasets", async (req, res) => {
  try {
    const datasets = await db.select().from(cadDatasets).where(eq(cadDatasets.isActive, true));
    res.json(datasets);
  } catch (error) {
    console.error("Error fetching datasets:", error);
    res.status(500).json({ error: "Failed to fetch datasets" });
  }
});

// Get dataset by ID
router.get("/datasets/:id", async (req, res) => {
  try {
    const [dataset] = await db
      .select()
      .from(cadDatasets)
      .where(eq(cadDatasets.id, req.params.id));
    
    if (!dataset) {
      return res.status(404).json({ error: "Dataset not found" });
    }
    
    res.json(dataset);
  } catch (error) {
    console.error("Error fetching dataset:", error);
    res.status(500).json({ error: "Failed to fetch dataset" });
  }
});

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const { industry } = req.query;
    
    let conditions = [];
    
    if (industry && typeof industry === 'string') {
      conditions.push(eq(cadCategories.industry, industry));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const categories = await db
      .select()
      .from(cadCategories)
      .where(whereClause)
      .orderBy(cadCategories.sortOrder);
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Search models
router.get("/models/search", async (req, res) => {
  try {
    const { 
      query: searchQuery,
      category,
      industry,
      format,
      datasetId,
      limit = "50",
      offset = "0"
    } = req.query;
    
    let conditions = [];
    
    if (searchQuery && typeof searchQuery === 'string') {
      conditions.push(
        sql`${cadModels.name} ILIKE ${`%${searchQuery}%`} OR ${cadModels.description} ILIKE ${`%${searchQuery}%`}`
      );
    }
    
    if (category && typeof category === 'string') {
      conditions.push(eq(cadModels.category, category));
    }
    
    if (industry && typeof industry === 'string') {
      conditions.push(eq(cadModels.industry, industry));
    }
    
    if (format && typeof format === 'string') {
      conditions.push(eq(cadModels.format, format));
    }
    
    if (datasetId && typeof datasetId === 'string') {
      conditions.push(eq(cadModels.datasetId, datasetId));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const models = await db
      .select()
      .from(cadModels)
      .where(whereClause)
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    res.json(models);
  } catch (error) {
    console.error("Error searching models:", error);
    res.status(500).json({ error: "Failed to search models" });
  }
});

// Get prompts
router.get("/prompts", async (req, res) => {
  try {
    const { complexity, industry, category } = req.query;
    
    let conditions = [];
    
    if (complexity && typeof complexity === 'string') {
      conditions.push(eq(cadPrompts.complexity, complexity));
    }
    
    if (industry && typeof industry === 'string') {
      conditions.push(eq(cadPrompts.industry, industry));
    }
    
    if (category && typeof category === 'string') {
      conditions.push(eq(cadPrompts.category, category));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const prompts = await db
      .select()
      .from(cadPrompts)
      .where(whereClause)
      .orderBy(sql`${cadPrompts.usageCount} DESC`);
    
    res.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    res.status(500).json({ error: "Failed to fetch prompts" });
  }
});

// Add model to user library
router.post("/library/add", async (req, res) => {
  try {
    const addSchema = z.object({
      userId: z.string(),
      modelId: z.string().uuid(),
      projectId: z.string().uuid().optional(),
      customName: z.string().optional(),
      customTags: z.array(z.string()).optional(),
      isFavorite: z.boolean().optional()
    });
    
    const data = addSchema.parse(req.body);
    
    const [existing] = await db
      .select()
      .from(userModelLibrary)
      .where(
        and(
          eq(userModelLibrary.userId, data.userId),
          eq(userModelLibrary.modelId, data.modelId)
        )
      );
    
    if (existing) {
      // Update existing entry
      const [updated] = await db
        .update(userModelLibrary)
        .set({
          customName: data.customName || existing.customName,
          customTags: data.customTags || existing.customTags,
          isFavorite: data.isFavorite !== undefined ? data.isFavorite : existing.isFavorite,
          lastUsed: new Date(),
          useCount: sql`${userModelLibrary.useCount} + 1`
        })
        .where(eq(userModelLibrary.id, existing.id))
        .returning();
      
      res.json(updated);
    } else {
      // Create new entry
      const [created] = await db
        .insert(userModelLibrary)
        .values({
          ...data,
          lastUsed: new Date(),
          useCount: 1
        })
        .returning();
      
      res.json(created);
    }
  } catch (error) {
    console.error("Error adding to library:", error);
    res.status(500).json({ error: "Failed to add to library" });
  }
});

// Get user's library
router.get("/library/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { projectId, isFavorite } = req.query;
    
    let conditions = [eq(userModelLibrary.userId, userId)];
    
    if (projectId && typeof projectId === 'string') {
      conditions.push(eq(userModelLibrary.projectId, projectId));
    }
    
    if (isFavorite === 'true') {
      conditions.push(eq(userModelLibrary.isFavorite, true));
    }
    
    const library = await db
      .select({
        library: userModelLibrary,
        model: cadModels
      })
      .from(userModelLibrary)
      .leftJoin(cadModels, eq(userModelLibrary.modelId, cadModels.id))
      .where(and(...conditions))
      .orderBy(sql`${userModelLibrary.lastUsed} DESC`);
    
    res.json(library);
  } catch (error) {
    console.error("Error fetching library:", error);
    res.status(500).json({ error: "Failed to fetch library" });
  }
});

// Track prompt usage
router.post("/prompts/:id/use", async (req, res) => {
  try {
    const { id } = req.params;
    
    await db
      .update(cadPrompts)
      .set({
        usageCount: sql`${cadPrompts.usageCount} + 1`
      })
      .where(eq(cadPrompts.id, id));
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error tracking prompt usage:", error);
    res.status(500).json({ error: "Failed to track usage" });
  }
});

// Get dataset statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await db
      .select({
        totalDatasets: sql<number>`COUNT(DISTINCT ${cadDatasets.id})`,
        totalModels: sql<number>`SUM(${cadDatasets.modelCount})`,
        totalCategories: sql<number>`COUNT(DISTINCT ${cadCategories.id})`,
        totalPrompts: sql<number>`COUNT(DISTINCT ${cadPrompts.id})`
      })
      .from(cadDatasets)
      .leftJoin(cadCategories, sql`true`)
      .leftJoin(cadPrompts, sql`true`);
    
    const industryStats = await db
      .select({
        industry: cadCategories.industry,
        count: sql<number>`COUNT(*)`
      })
      .from(cadCategories)
      .groupBy(cadCategories.industry);
    
    res.json({
      ...stats[0],
      byIndustry: industryStats
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export default router;
/*
Prompt Caching System from Anthropic Cookbook
Cache common queries and responses for faster performance
*/

interface CacheEntry {
  key: string;
  prompt: string;
  response: string;
  timestamp: Date;
  hits: number;
  ttl: number; // Time to live in milliseconds
}

export class PromptCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxCacheSize = 500; // Increased cache size for better performance
  private defaultTTL = 7200000; // 2 hours - longer TTL for better efficiency

  /**
   * Generate cache key from prompt
   */
  private generateKey(prompt: string, context?: any): string {
    const baseKey = prompt.toLowerCase().trim();
    const contextKey = context ? JSON.stringify(context) : '';
    return `${baseKey}-${contextKey}`.substring(0, 100);
  }

  /**
   * Get cached response if available
   */
  get(prompt: string, context?: any): string | null {
    const key = this.generateKey(prompt, context);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if entry is expired
    const now = new Date();
    const age = now.getTime() - entry.timestamp.getTime();
    
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    entry.hits++;
    return entry.response;
  }

  /**
   * Store response in cache
   */
  set(prompt: string, response: string, context?: any, ttl?: number): void {
    const key = this.generateKey(prompt, context);

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      key,
      prompt,
      response,
      timestamp: new Date(),
      hits: 0,
      ttl: ttl || this.defaultTTL
    });
  }

  /**
   * Evict least recently used entry
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let minHits = Infinity;
    let oldestTime = new Date();

    this.cache.forEach((entry, key) => {
      const score = entry.hits + (new Date().getTime() - entry.timestamp.getTime()) / 1000000;
      if (score < minHits) {
        minHits = score;
        leastUsedKey = key;
      }
    });

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hitRate: number;
    topQueries: Array<{ prompt: string; hits: number }>;
  } {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, e) => sum + e.hits, 0);
    const totalQueries = entries.length;

    const topQueries = entries
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 5)
      .map(e => ({ prompt: e.prompt.substring(0, 50), hits: e.hits }));

    return {
      size: this.cache.size,
      hitRate: totalQueries > 0 ? totalHits / totalQueries : 0,
      topQueries
    };
  }

  /**
   * Preload enhanced common facility queries
   */
  preloadCommonQueries(): void {
    const commonQueries = [
      {
        prompt: 'What is a bioreactor?',
        response: 'A bioreactor is a controlled vessel for growing microorganisms, cells, or tissues under optimal conditions. Key components include temperature control, pH monitoring, dissolved oxygen control, and sterile design for contamination prevention.'
      },
      {
        prompt: 'Optimal temperature for mushroom cultivation',
        response: 'Temperature varies by species: Oyster mushrooms (18-24°C), Shiitake (18-22°C), Button mushrooms (15-18°C). Maintain ±1°C precision with HVAC systems and thermal monitoring.'
      },
      {
        prompt: 'Clean room requirements',
        response: 'Mycology facilities require ISO 7 (Class 10,000) or ISO 8 (Class 100,000) cleanrooms with HEPA filtration (99.97% at 0.3μm), positive pressure (+5-15 Pa), and air change rates of 15-20 ACH minimum.'
      },
      {
        prompt: 'Equipment capacity calculation',
        response: 'Capacity = (Daily Production Goal × Growth Cycle Days) / (Yield per Unit Volume × Working Volume Efficiency). Include 20-30% buffer for maintenance and contamination events.'
      },
      {
        prompt: 'Contamination prevention strategies',
        response: 'Implement: 1) Positive air pressure gradients, 2) HEPA filtration, 3) Personnel hygiene protocols, 4) Equipment sterilization cycles, 5) Environmental monitoring, 6) Cleanroom garments and procedures.'
      },
      {
        prompt: 'Zone separation principles',
        response: 'Critical zones: Raw materials → Preparation → Inoculation → Incubation → Harvesting → Packaging. Each zone should have increasing cleanliness levels with airlocks and pressure differentials.'
      },
      {
        prompt: 'HVAC system requirements',
        response: 'Requirements: 100% outside air systems preferred, 15-20 ACH, HEPA terminal filters, humidity control (45-65% RH), temperature control (±1°C), redundant systems for critical areas.'
      },
      {
        prompt: 'Production scaling factors',
        response: 'Key factors: 1) Square-cube law affects mixing and heat transfer, 2) Contamination risk increases with scale, 3) Labor efficiency may decrease, 4) Utility costs scale non-linearly, 5) Automation requirements increase.'
      }
    ];

    commonQueries.forEach(({ prompt, response }) => {
      this.set(prompt, response, null, this.defaultTTL * 48); // Cache for 48 hours
    });
  }
}

/**
 * Cached AI wrapper for common queries
 */
export class CachedAI {
  private cache: PromptCache;
  private apiCallCount = 0;
  private cacheHitCount = 0;

  constructor() {
    this.cache = new PromptCache();
    this.cache.preloadCommonQueries();
  }

  /**
   * Query with caching
   */
  async query(prompt: string, context?: any, forceRefresh = false): Promise<{
    response: string;
    fromCache: boolean;
  }> {
    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = this.cache.get(prompt, context);
      if (cached) {
        this.cacheHitCount++;
        return { response: cached, fromCache: true };
      }
    }

    // Make API call (would normally call AI service)
    this.apiCallCount++;
    const response = await this.makeAPICall(prompt, context);
    
    // Cache the response
    this.cache.set(prompt, response, context);
    
    return { response, fromCache: false };
  }

  /**
   * Enhanced API call with actual AI service integration
   */
  private async makeAPICall(prompt: string, context?: any): Promise<string> {
    try {
      // Use sub-agents for cost optimization
      const { subAgents } = await import('./sub-agents');
      
      // Determine complexity based on prompt characteristics
      let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
      
      if (prompt.includes('analyze') || prompt.includes('optimize') || prompt.includes('design')) {
        complexity = 'complex';
      } else if (prompt.includes('compare') || prompt.includes('calculate') || prompt.includes('evaluate')) {
        complexity = 'moderate';
      }
      
      const response = await subAgents.routeTask(prompt, complexity);
      return response || `Processing: ${prompt.substring(0, 50)}...`;
    } catch (error) {
      console.error('API call failed:', error);
      return `Unable to process query: ${prompt.substring(0, 50)}...`;
    }
  }

  /**
   * Get enhanced cache performance metrics
   */
  getMetrics(): {
    apiCalls: number;
    cacheHits: number;
    hitRate: number;
    savings: number;
    efficiency: number;
    totalQueries: number;
  } {
    const total = this.apiCallCount + this.cacheHitCount;
    const hitRate = total > 0 ? this.cacheHitCount / total : 0;
    const efficiency = total > 0 ? 1 - (this.apiCallCount / total) : 0;
    
    // Enhanced cost savings calculation
    // Assume: Haiku $0.25/M tokens, Sonnet $3/M tokens, avg 500 tokens per query
    const avgTokensPerQuery = 500;
    const avgCostPerQuery = 0.0015; // Mixed model average
    const savings = (this.cacheHitCount * avgTokensPerQuery / 1000000) * avgCostPerQuery * 1000;

    return {
      apiCalls: this.apiCallCount,
      cacheHits: this.cacheHitCount,
      hitRate,
      savings,
      efficiency,
      totalQueries: total
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

export const cachedAI = new CachedAI();
export const promptCache = new PromptCache();
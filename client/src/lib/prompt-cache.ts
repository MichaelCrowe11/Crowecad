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
  private maxCacheSize = 100;
  private defaultTTL = 3600000; // 1 hour

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
   * Preload common facility queries
   */
  preloadCommonQueries(): void {
    const commonQueries = [
      {
        prompt: 'What is a bioreactor?',
        response: 'A bioreactor is a vessel designed for growing organisms under controlled conditions for biotechnology applications.'
      },
      {
        prompt: 'Optimal temperature for mushroom cultivation',
        response: 'Most mushroom species thrive at 20-25°C (68-77°F) during fruiting, with specific requirements varying by species.'
      },
      {
        prompt: 'Clean room requirements',
        response: 'Mycology facilities typically require ISO 7 or ISO 8 clean rooms with HEPA filtration and positive pressure.'
      },
      {
        prompt: 'Equipment capacity calculation',
        response: 'Calculate based on: production goals, growth cycle duration, and yield per unit volume.'
      }
    ];

    commonQueries.forEach(({ prompt, response }) => {
      this.set(prompt, response, null, this.defaultTTL * 24); // Cache for 24 hours
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
   * Simulate API call (replace with actual AI service call)
   */
  private async makeAPICall(prompt: string, context?: any): Promise<string> {
    // This would normally call the AI service
    // For now, return a placeholder
    return `Response to: ${prompt}`;
  }

  /**
   * Get cache performance metrics
   */
  getMetrics(): {
    apiCalls: number;
    cacheHits: number;
    hitRate: number;
    savings: number; // Estimated cost savings
  } {
    const total = this.apiCallCount + this.cacheHitCount;
    const hitRate = total > 0 ? this.cacheHitCount / total : 0;
    const savings = this.cacheHitCount * 0.003; // Assuming $0.003 per cached query saved

    return {
      apiCalls: this.apiCallCount,
      cacheHits: this.cacheHitCount,
      hitRate,
      savings
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
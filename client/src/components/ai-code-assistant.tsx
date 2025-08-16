/**
 * AI Code Assistant Component
 * Provides intelligent code suggestions powered by dataset knowledge base
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Code,
  Lightbulb,
  Search,
  Copy,
  ExternalLink,
  Zap,
  Brain,
  GitBranch,
  Database,
  Package,
  Globe,
  Palette,
  Shield,
  TrendingUp,
  ChevronRight,
  Info
} from 'lucide-react';
import { datasetKnowledgeBase } from '@/lib/dataset-knowledge-base';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Suggestion {
  type: 'pattern' | 'api' | 'component' | 'design';
  name: string;
  description: string;
  category: string;
  relevance: number;
  preview?: string;
  usage?: string;
}

export function AICodeAssistant() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contextualTips, setContextualTips] = useState<string[]>([]);
  const { toast } = useToast();

  // Real-time suggestion engine
  useEffect(() => {
    if (query.length > 2) {
      const timer = setTimeout(() => {
        analyzingQuery();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const analyzingQuery = async () => {
    setIsAnalyzing(true);
    
    // Search for patterns in knowledge base
    const patterns = datasetKnowledgeBase.searchCodePatterns(query);
    const categories = datasetKnowledgeBase.getAllCategories();
    
    // Get contextual suggestions
    const contextSuggestions = datasetKnowledgeBase.getSuggestions({
      requirements: query.toLowerCase().split(' ')
    });
    
    // Convert to unified suggestion format
    const allSuggestions: Suggestion[] = [];
    
    // Add code patterns
    patterns.forEach(pattern => {
      allSuggestions.push({
        type: 'pattern',
        name: pattern.name,
        description: pattern.description,
        category: pattern.category,
        relevance: calculateRelevance(query, pattern.description),
        preview: pattern.pattern.substring(0, 200) + '...',
        usage: pattern.usage
      });
    });
    
    // Add API suggestions
    contextSuggestions.apis.forEach(api => {
      allSuggestions.push({
        type: 'api',
        name: api.name,
        description: api.description,
        category: api.category,
        relevance: calculateRelevance(query, api.description),
        preview: `${api.method} ${api.url}`,
        usage: `Authentication: ${api.authentication}`
      });
    });
    
    // Add component suggestions
    contextSuggestions.components.forEach(component => {
      allSuggestions.push({
        type: 'component',
        name: component.name,
        description: component.description,
        category: component.category,
        relevance: calculateRelevance(query, component.description),
        preview: component.code?.substring(0, 200) + '...',
        usage: `Library: ${component.library}`
      });
    });
    
    // Add design patterns
    contextSuggestions.designs.forEach(design => {
      allSuggestions.push({
        type: 'design',
        name: design.name,
        description: design.description,
        category: design.type,
        relevance: calculateRelevance(query, design.description),
        usage: design.useCases.join(', ')
      });
    });
    
    // Sort by relevance
    allSuggestions.sort((a, b) => b.relevance - a.relevance);
    setSuggestions(allSuggestions.slice(0, 10));
    
    // Generate contextual tips
    generateContextualTips(query);
    
    setIsAnalyzing(false);
  };
  
  const calculateRelevance = (query: string, text: string): number => {
    const queryWords = query.toLowerCase().split(' ');
    const textWords = text.toLowerCase().split(' ');
    let score = 0;
    
    queryWords.forEach(qWord => {
      if (textWords.includes(qWord)) score += 10;
      textWords.forEach(tWord => {
        if (tWord.includes(qWord) || qWord.includes(tWord)) score += 5;
      });
    });
    
    return score;
  };
  
  const generateContextualTips = (query: string) => {
    const tips: string[] = [];
    const lower = query.toLowerCase();
    
    if (lower.includes('auth') || lower.includes('login')) {
      tips.push('💡 Consider using JWT with refresh tokens for secure authentication');
      tips.push('🔐 Implement rate limiting to prevent brute force attacks');
    }
    
    if (lower.includes('database') || lower.includes('query')) {
      tips.push('⚡ Use connection pooling for better performance');
      tips.push('🔍 Add indexes to frequently queried columns');
    }
    
    if (lower.includes('api') || lower.includes('endpoint')) {
      tips.push('📡 Implement proper error handling and status codes');
      tips.push('📊 Add request validation using Zod or similar');
    }
    
    if (lower.includes('component') || lower.includes('ui')) {
      tips.push('🎨 Keep components small and focused on a single responsibility');
      tips.push('♿ Ensure accessibility with proper ARIA labels');
    }
    
    if (lower.includes('performance') || lower.includes('optimize')) {
      tips.push('🚀 Use React.memo for expensive components');
      tips.push('📦 Implement code splitting for large bundles');
    }
    
    setContextualTips(tips);
  };
  
  const copySuggestion = async (suggestion: Suggestion) => {
    const content = suggestion.preview || suggestion.description;
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard!",
      description: `${suggestion.name} code has been copied`,
    });
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <Code className="w-4 h-4" />;
      case 'api': return <Globe className="w-4 h-4" />;
      case 'component': return <Palette className="w-4 h-4" />;
      case 'design': return <Brain className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'bg-blue-100 text-blue-800';
      case 'api': return 'bg-purple-100 text-purple-800';
      case 'component': return 'bg-green-100 text-green-800';
      case 'design': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full h-full flex flex-col bg-gradient-to-br from-purple-900/5 to-blue-900/5 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          AI Code Assistant
        </CardTitle>
        <CardDescription>
          Powered by 6M+ functions from CodeSearchNet, 2.8M GitHub repos, and 40K+ APIs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Describe what you want to build... (e.g., 'user authentication with JWT')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4"
          />
          {isAnalyzing && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Sparkles className="w-4 h-4 animate-pulse text-purple-400" />
            </div>
          )}
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={activeCategory === 'pattern' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('pattern')}
          >
            <Code className="w-4 h-4 mr-1" />
            Patterns
          </Button>
          <Button
            size="sm"
            variant={activeCategory === 'api' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('api')}
          >
            <Globe className="w-4 h-4 mr-1" />
            APIs
          </Button>
          <Button
            size="sm"
            variant={activeCategory === 'component' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('component')}
          >
            <Palette className="w-4 h-4 mr-1" />
            Components
          </Button>
          <Button
            size="sm"
            variant={activeCategory === 'design' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('design')}
          >
            <Brain className="w-4 h-4 mr-1" />
            Design
          </Button>
        </div>
        
        {/* Contextual Tips */}
        {contextualTips.length > 0 && (
          <div className="space-y-2">
            {contextualTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm"
              >
                <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5" />
                <span>{tip}</span>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Suggestions List */}
        <ScrollArea className="flex-1">
          <AnimatePresence>
            {suggestions
              .filter(s => activeCategory === 'all' || s.type === activeCategory)
              .map((suggestion, index) => (
                <motion.div
                  key={`${suggestion.type}-${suggestion.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="mb-3"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(suggestion.type)}
                          <span className="font-medium">{suggestion.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(suggestion.type)}>
                            {suggestion.type}
                          </Badge>
                          <Badge variant="outline">
                            {suggestion.category}
                          </Badge>
                          {suggestion.relevance > 50 && (
                            <Badge className="bg-green-100 text-green-800">
                              High Match
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {suggestion.description}
                      </p>
                      
                      {suggestion.usage && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <Info className="w-3 h-3" />
                          {suggestion.usage}
                        </div>
                      )}
                      
                      {suggestion.preview && (
                        <div className="bg-muted/50 rounded p-2 mb-2">
                          <pre className="text-xs overflow-hidden">
                            <code>{suggestion.preview}</code>
                          </pre>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copySuggestion(suggestion)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <ChevronRight className="w-3 h-3 mr-1" />
                          Use in Editor
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </AnimatePresence>
          
          {suggestions.length === 0 && query.length > 2 && !isAnalyzing && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No suggestions found for "{query}"</p>
              <p className="text-sm mt-2">Try describing your requirement differently</p>
            </div>
          )}
        </ScrollArea>
        
        {/* Stats Footer */}
        <div className="border-t pt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              6M+ Functions
            </span>
            <span className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              2.8M Repos
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              40K+ APIs
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            Real-time AI Analysis
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
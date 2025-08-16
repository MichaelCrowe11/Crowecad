/**
 * CAD Datasets Browser Component
 * Browse and search through millions of CAD models from multiple sources
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Star,
  Database,
  Filter,
  Grid3x3,
  List,
  Package,
  Layers,
  Globe,
  FileDown,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Info,
  Clock,
  TrendingUp,
  Factory,
  Building,
  Cpu,
  Car,
  Plane,
  Heart,
  Gem,
  Anchor,
  Zap,
  BookOpen
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CadDataset {
  id: string;
  name: string;
  source: string;
  description: string;
  url: string;
  modelCount: number;
  license: string;
  formats: string[];
  industries: string[];
  metadata: any;
  isActive: boolean;
  lastSynced: string | null;
}

interface CadCategory {
  id: string;
  name: string;
  industry: string;
  icon: string;
  modelCount: number;
  description: string;
}

interface CadPrompt {
  id: string;
  prompt: string;
  category: string;
  industry: string;
  complexity: string;
  parameters: any;
  tags: string[];
  usageCount: number;
}

const industryIcons: Record<string, any> = {
  mechanical: Factory,
  architecture: Building,
  electronics: Cpu,
  automotive: Car,
  aerospace: Plane,
  medical: Heart,
  consumer: Package,
  jewelry: Gem,
  marine: Anchor,
  energy: Zap,
  general: Globe
};

const formatBadgeColors: Record<string, string> = {
  STEP: "bg-blue-100 text-blue-800",
  STL: "bg-green-100 text-green-800",
  OBJ: "bg-purple-100 text-purple-800",
  IGES: "bg-orange-100 text-orange-800",
  DXF: "bg-red-100 text-red-800",
  SCAD: "bg-yellow-100 text-yellow-800",
  FCStd: "bg-indigo-100 text-indigo-800",
};

export function CadDatasetsBrowser() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedDataset, setSelectedDataset] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("datasets");

  // Fetch datasets
  const { data: datasets = [], isLoading: loadingDatasets } = useQuery({
    queryKey: ["/api/cad/datasets"],
  });

  // Fetch categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["/api/cad/categories", selectedIndustry],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedIndustry !== "all") {
        params.append("industry", selectedIndustry);
      }
      const response = await fetch(`/api/cad/categories?${params}`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    }
  });

  // Fetch prompts
  const { data: prompts = [], isLoading: loadingPrompts } = useQuery({
    queryKey: ["/api/cad/prompts", selectedIndustry],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedIndustry !== "all") {
        params.append("industry", selectedIndustry);
      }
      const response = await fetch(`/api/cad/prompts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch prompts");
      return response.json();
    }
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/cad/stats"],
  });

  const handleDatasetClick = (dataset: CadDataset) => {
    if (dataset.url) {
      window.open(dataset.url, "_blank");
    }
  };

  const handlePromptUse = async (prompt: CadPrompt) => {
    try {
      await fetch(`/api/cad/prompts/${prompt.id}/use`, { method: "POST" });
      
      // Copy prompt to clipboard
      await navigator.clipboard.writeText(prompt.prompt);
      
      toast({
        title: "Prompt Copied!",
        description: "The prompt has been copied to your clipboard and can be used in the CAD IDE.",
      });
      
      // Refresh prompts to update usage count
      queryClient.invalidateQueries({ queryKey: ["/api/cad/prompts"] });
    } catch (error) {
      console.error("Error using prompt:", error);
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      });
    }
  };

  const filteredDatasets = datasets.filter((dataset: CadDataset) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        dataset.name.toLowerCase().includes(query) ||
        dataset.description.toLowerCase().includes(query) ||
        dataset.source.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Database className="h-8 w-8" />
                CAD Model Library
              </h1>
              <p className="text-slate-300 mt-2">
                Access over 104 million CAD models from 9 major sources
              </p>
            </div>
            
            {stats && (
              <div className="flex gap-6 text-sm">
                <div>
                  <div className="text-2xl font-bold">{stats.totalDatasets}</div>
                  <div className="text-slate-300">Datasets</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {(stats.totalModels / 1000000).toFixed(1)}M+
                  </div>
                  <div className="text-slate-300">Models</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalCategories}</div>
                  <div className="text-slate-300">Categories</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="border-b p-4 bg-card">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets, models, or prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              <SelectItem value="mechanical">Mechanical</SelectItem>
              <SelectItem value="architecture">Architecture</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="automotive">Automotive</SelectItem>
              <SelectItem value="aerospace">Aerospace</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="consumer">Consumer</SelectItem>
              <SelectItem value="jewelry">Jewelry</SelectItem>
              <SelectItem value="marine">Marine</SelectItem>
              <SelectItem value="energy">Energy</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="ml-6 mt-4">
            <TabsTrigger value="datasets">Datasets</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
          </TabsList>
          
          {/* Datasets Tab */}
          <TabsContent value="datasets" className="h-full p-6">
            <ScrollArea className="h-full">
              <div className={viewMode === "grid" ? 
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : 
                "space-y-4"
              }>
                {filteredDatasets.map((dataset: CadDataset) => (
                  <motion.div
                    key={dataset.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDatasetClick(dataset)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Database className="h-5 w-5" />
                              {dataset.name}
                            </CardTitle>
                            <Badge variant="outline" className="mt-2">
                              {dataset.source.toUpperCase()}
                            </Badge>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {dataset.description}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Models:</span>
                            <span className="font-bold">
                              {dataset.modelCount?.toLocaleString() || "N/A"}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">License:</span>
                            <span className="text-xs">{dataset.license}</span>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Formats:</div>
                            <div className="flex flex-wrap gap-1">
                              {dataset.formats.map((format: string) => (
                                <Badge 
                                  key={format}
                                  variant="secondary"
                                  className={formatBadgeColors[format] || ""}
                                >
                                  {format}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Industries:</div>
                            <div className="flex flex-wrap gap-1">
                              {dataset.industries.map((industry: string) => {
                                const Icon = industryIcons[industry] || Globe;
                                return (
                                  <Badge key={industry} variant="outline">
                                    <Icon className="h-3 w-3 mr-1" />
                                    {industry}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {/* Categories Tab */}
          <TabsContent value="categories" className="h-full p-6">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categories.map((category: CadCategory) => {
                  const Icon = industryIcons[category.industry] || Package;
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Card className="cursor-pointer hover:shadow-md transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-2xl">{category.icon}</div>
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.industry}
                          </p>
                          {category.modelCount > 0 && (
                            <Badge variant="secondary" className="mt-2">
                              {category.modelCount} models
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {/* Prompts Tab */}
          <TabsContent value="prompts" className="h-full p-6">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {prompts.map((prompt: CadPrompt) => (
                  <motion.div
                    key={prompt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={
                                prompt.complexity === "beginner" ? "secondary" :
                                prompt.complexity === "intermediate" ? "default" :
                                "destructive"
                              }>
                                {prompt.complexity}
                              </Badge>
                              <Badge variant="outline">{prompt.category}</Badge>
                              <Badge variant="outline">{prompt.industry}</Badge>
                            </div>
                            
                            <p className="text-lg font-medium mb-3">{prompt.prompt}</p>
                            
                            {prompt.parameters && Object.keys(prompt.parameters).length > 0 && (
                              <div className="bg-muted/50 rounded-lg p-3 mb-3">
                                <div className="text-sm font-medium mb-1">Parameters:</div>
                                <div className="text-sm text-muted-foreground font-mono">
                                  {JSON.stringify(prompt.parameters, null, 2)}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Used {prompt.usageCount} times
                              </span>
                              <div className="flex gap-1">
                                {prompt.tags.map((tag: string) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handlePromptUse(prompt)}
                            className="ml-4"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Use Prompt
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
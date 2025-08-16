/**
 * Development Resources Browser Component
 * Browse code snippets, UI components, APIs, and development tools
 */

import { useState } from "react";
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
  Code,
  Copy,
  ExternalLink,
  BookOpen,
  Sparkles,
  Terminal,
  Globe,
  Palette,
  Package,
  Cpu,
  GitBranch,
  Zap,
  Database,
  Cloud,
  Shield,
  TrendingUp,
  Users,
  FileCode,
  Layout,
  Layers
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ResourceDataset {
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
}

const industryIcons: Record<string, any> = {
  software: Code,
  frontend: Layout,
  api: Globe,
  ai: Cpu,
  design: Palette,
  ecommerce: Package,
  enterprise: Shield,
  development: Terminal,
  research: BookOpen
};

const formatColors: Record<string, string> = {
  Python: "bg-blue-100 text-blue-800",
  JavaScript: "bg-yellow-100 text-yellow-800",
  TypeScript: "bg-blue-100 text-blue-800",
  React: "bg-cyan-100 text-cyan-800",
  Vue: "bg-green-100 text-green-800",
  API: "bg-purple-100 text-purple-800",
  GraphQL: "bg-pink-100 text-pink-800",
  REST: "bg-orange-100 text-orange-800"
};

// Code snippet examples
const codeExamples = {
  "REST API": `// Express.js REST API endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email } });
});`,
  
  "React Component": `// Responsive Navigation Bar Component
export function NavigationBar({ items }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Logo />
            <div className="hidden md:flex space-x-4">
              {items.map(item => (
                <NavLink key={item.id} {...item} />
              ))}
            </div>
          </div>
          <MobileMenu isOpen={isOpen} toggle={setIsOpen} />
        </div>
      </div>
    </nav>
  );
}`,
  
  "GraphQL": `# GraphQL Schema & Resolver
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

const resolvers = {
  Query: {
    user: async (_, { id }) => {
      return await User.findById(id).populate('posts');
    }
  }
};`,
  
  "Machine Learning": `# TensorFlow Image Classifier
import tensorflow as tf

model = tf.keras.Sequential([
    tf.keras.layers.Conv2D(32, (3,3), activation='relu', input_shape=(224, 224, 3)),
    tf.keras.layers.MaxPooling2D(2, 2),
    tf.keras.layers.Conv2D(64, (3,3), activation='relu'),
    tf.keras.layers.MaxPooling2D(2, 2),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax')
])

model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])`
};

export function DevResourcesBrowser() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("code");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch software development datasets
  const { data: datasets = [], isLoading: loadingDatasets } = useQuery({
    queryKey: ["/api/cad/datasets"],
    queryFn: async () => {
      const response = await fetch("/api/cad/datasets");
      const data = await response.json();
      // Filter for software development related datasets
      return data.filter((d: ResourceDataset) => 
        d.industries.some((i: string) => 
          ["software", "frontend", "api", "ai", "design", "ecommerce", "enterprise", "development"].includes(i)
        )
      );
    }
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/cad/categories", "software"],
    queryFn: async () => {
      const response = await fetch("/api/cad/categories");
      const data = await response.json();
      return data.filter((c: any) => 
        ["software", "frontend", "api", "ai", "design", "ecommerce"].includes(c.industry)
      );
    }
  });

  // Fetch prompts
  const { data: prompts = [] } = useQuery({
    queryKey: ["/api/cad/prompts", "software"],
    queryFn: async () => {
      const response = await fetch("/api/cad/prompts");
      const data = await response.json();
      return data.filter((p: any) => 
        ["software", "frontend", "api", "ai", "ecommerce"].includes(p.industry)
      );
    }
  });

  const handleCopyCode = async (code: string, name: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(name);
    toast({
      title: "Code Copied!",
      description: `${name} example has been copied to your clipboard.`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleUsePrompt = async (prompt: any) => {
    await navigator.clipboard.writeText(prompt.prompt);
    toast({
      title: "Prompt Copied!",
      description: "You can now use this in the CroweCad IDE for code generation.",
    });
  };

  const handleOpenResource = (url: string) => {
    window.open(url, "_blank");
  };

  const filteredDatasets = datasets.filter((dataset: ResourceDataset) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        dataset.name.toLowerCase().includes(query) ||
        dataset.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-indigo-900 to-purple-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Code className="h-8 w-8" />
                Development Resources Hub
              </h1>
              <p className="text-indigo-200 mt-2">
                Code snippets, UI components, APIs, and development tools
              </p>
            </div>
            
            <div className="flex gap-6 text-sm">
              <div>
                <div className="text-2xl font-bold">{datasets.length}</div>
                <div className="text-indigo-200">Resources</div>
              </div>
              <div>
                <div className="text-2xl font-bold">8.9M+</div>
                <div className="text-indigo-200">Code Samples</div>
              </div>
              <div>
                <div className="text-2xl font-bold">40K+</div>
                <div className="text-indigo-200">APIs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b p-4 bg-card">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search code, components, APIs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="code">Code & Functions</SelectItem>
              <SelectItem value="ui">UI Components</SelectItem>
              <SelectItem value="api">APIs & Services</SelectItem>
              <SelectItem value="ml">Machine Learning</SelectItem>
              <SelectItem value="design">Design Systems</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="ml-6 mt-4">
            <TabsTrigger value="code">Code Examples</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="components">UI Components</TabsTrigger>
            <TabsTrigger value="prompts">AI Prompts</TabsTrigger>
          </TabsList>
          
          {/* Code Examples Tab */}
          <TabsContent value="code" className="h-full p-6">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(codeExamples).map(([name, code]) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileCode className="h-5 w-5" />
                            {name}
                          </CardTitle>
                          <Button
                            size="sm"
                            variant={copiedCode === name ? "secondary" : "outline"}
                            onClick={() => handleCopyCode(code, name)}
                          >
                            {copiedCode === name ? (
                              <>✓ Copied</>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                          <code className="text-sm">{code}</code>
                        </pre>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {/* Resources Tab */}
          <TabsContent value="resources" className="h-full p-6">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDatasets.map((dataset: ResourceDataset) => {
                  const Icon = industryIcons[dataset.industries[0]] || Code;
                  return (
                    <motion.div
                      key={dataset.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleOpenResource(dataset.url)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <Icon className="h-5 w-5" />
                                {dataset.name}
                              </CardTitle>
                              <Badge variant="outline" className="mt-2">
                                {dataset.source}
                              </Badge>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {dataset.description}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Items:</span>
                              <span className="font-bold">
                                {dataset.modelCount?.toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {dataset.formats.slice(0, 3).map((format: string) => (
                                <Badge 
                                  key={format}
                                  variant="secondary"
                                  className={formatColors[format] || ""}
                                >
                                  {format}
                                </Badge>
                              ))}
                              {dataset.formats.length > 3 && (
                                <Badge variant="secondary">
                                  +{dataset.formats.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {/* UI Components Tab */}
          <TabsContent value="components" className="h-full p-6">
            <ScrollArea className="h-full">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Popular Component Libraries</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {datasets
                      .filter((d: ResourceDataset) => d.industries.includes("frontend"))
                      .map((library: ResourceDataset) => (
                        <Card key={library.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <h4 className="font-semibold mb-2">{library.name}</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              {library.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge>{library.formats[0]}</Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenResource(library.url)}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Component Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categories
                      .filter((c: any) => c.industry === "frontend")
                      .map((category: any) => (
                        <Card key={category.id} className="hover:bg-muted/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="text-2xl mb-2">{category.icon}</div>
                            <div className="font-medium">{category.name}</div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          {/* AI Prompts Tab */}
          <TabsContent value="prompts" className="h-full p-6">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {prompts.map((prompt: any) => (
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
                            
                            {prompt.parameters && (
                              <div className="bg-muted/50 rounded-lg p-3">
                                <div className="text-sm font-medium mb-1">Parameters:</div>
                                <pre className="text-sm text-muted-foreground">
                                  {JSON.stringify(prompt.parameters, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            onClick={() => handleUsePrompt(prompt)}
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
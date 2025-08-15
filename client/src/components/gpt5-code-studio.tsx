/**
 * GPT-5 Code Studio - Autonomous Code Generation for CroweCad Platform
 * Generate React components, TypeScript modules, APIs, and full features from natural language
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Code2,
  FileCode2,
  GitBranch,
  Database,
  Package,
  Cpu,
  TestTube,
  Wrench,
  Sparkles,
  Loader2,
  Copy,
  Download,
  Check,
  Zap,
  RefreshCw
} from 'lucide-react';
import { gpt5CodeGenerator } from '@/lib/gpt5-code-generator';
import { gpt5AppArchitect } from '@/lib/gpt5-app-architect';
import { useToast } from '@/hooks/use-toast';

export function GPT5CodeStudio() {
  const [codePrompt, setCodePrompt] = useState('');
  const [codeType, setCodeType] = useState<'component' | 'module' | 'feature' | 'api' | 'schema' | 'refactor'>('component');
  const [existingCode, setExistingCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [codeHistory, setCodeHistory] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [appRequirements, setAppRequirements] = useState({
    name: '',
    description: '',
    type: 'fullstack' as 'web' | 'mobile' | 'desktop' | 'api' | 'fullstack',
    features: [] as string[],
    users: 1000,
    performance: {
      responseTime: 200,
      concurrent: 100,
      availability: 99.9
    },
    security: ['JWT', 'HTTPS', 'Rate Limiting'],
    integrations: [] as string[]
  });
  const [generatedApp, setGeneratedApp] = useState<any>(null);
  const { toast } = useToast();

  // Code generation handler
  const handleCodeGeneration = async () => {
    if (!codePrompt) return;
    
    setIsGenerating(true);
    setCurrentProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setCurrentProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const result = await gpt5CodeGenerator.generateFromDescription({
        type: codeType,
        description: codePrompt,
        context: {
          framework: 'react',
          styling: 'tailwind',
          dependencies: []
        }
      });
      
      clearInterval(progressInterval);
      setCurrentProgress(100);
      setGeneratedCode(result);
      setCodeHistory(prev => [...prev, { ...result, timestamp: new Date() }]);
      
      toast({
        title: "Code Generated!",
        description: `Successfully generated ${result.files?.length || 0} files`,
      });
    } catch (error) {
      console.error('Code generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setCurrentProgress(0);
    }
  };
  
  // Feature generation handler
  const handleFeatureGeneration = async () => {
    if (!codePrompt) return;
    
    setIsGenerating(true);
    setCurrentProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setCurrentProgress(prev => Math.min(prev + 5, 95));
      }, 500);
      
      const result = await gpt5CodeGenerator.generateFeature(codePrompt);
      
      clearInterval(progressInterval);
      setCurrentProgress(100);
      setGeneratedCode(result);
      setCodeHistory(prev => [...prev, { ...result, timestamp: new Date() }]);
      
      toast({
        title: "Feature Generated!",
        description: `Created complete feature with ${result.files?.length || 0} files`,
      });
    } catch (error) {
      console.error('Feature generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate feature. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setCurrentProgress(0);
    }
  };
  
  // Refactoring handler
  const handleRefactoring = async () => {
    if (!existingCode || !codePrompt) return;
    
    setIsGenerating(true);
    setCurrentProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setCurrentProgress(prev => Math.min(prev + 15, 85));
      }, 300);
      
      const result = await gpt5CodeGenerator.refactorCode(existingCode, codePrompt);
      
      clearInterval(progressInterval);
      setCurrentProgress(100);
      setGeneratedCode(result);
      
      toast({
        title: "Code Refactored!",
        description: "Your code has been successfully refactored",
      });
    } catch (error) {
      console.error('Refactoring error:', error);
      toast({
        title: "Refactoring Failed",
        description: "Failed to refactor code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setCurrentProgress(0);
    }
  };
  
  // Optimization handler
  const handleOptimization = async () => {
    if (!existingCode) return;
    
    setIsGenerating(true);
    
    try {
      const result = await gpt5CodeGenerator.optimizeCode(existingCode);
      setGeneratedCode(result);
      
      toast({
        title: "Code Optimized!",
        description: "Performance optimizations applied",
      });
    } catch (error) {
      console.error('Optimization error:', error);
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize code.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Test generation handler
  const handleTestGeneration = async () => {
    if (!existingCode) return;
    
    setIsGenerating(true);
    
    try {
      const result = await gpt5CodeGenerator.generateTests(existingCode);
      setGeneratedCode(result);
      
      toast({
        title: "Tests Generated!",
        description: "Unit tests created for your code",
      });
    } catch (error) {
      console.error('Test generation error:', error);
      toast({
        title: "Test Generation Failed",
        description: "Failed to generate tests.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Copy all generated code
  const copyGeneratedCode = () => {
    if (!generatedCode) return;
    
    const allCode = generatedCode.files?.map((f: any) => 
      `// ${f.path}\n${f.content}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(allCode);
    toast({
      title: "Copied!",
      description: "All generated code copied to clipboard",
    });
  };
  
  // Download generated code
  // Architecture generation handler
  const handleArchitectGeneration = async () => {
    if (!appRequirements.name || !appRequirements.description) return;
    
    setIsGenerating(true);
    setCurrentProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setCurrentProgress(prev => Math.min(prev + 3, 97));
      }, 1000);
      
      const result = await gpt5AppArchitect.generateApp(appRequirements);
      
      clearInterval(progressInterval);
      setCurrentProgress(100);
      setGeneratedApp(result);
      
      toast({
        title: "App Architecture Generated!",
        description: `Complete architecture for ${appRequirements.name} has been generated with ${result.timeline?.totalWeeks} week timeline.`,
      });
    } catch (error) {
      console.error('Architecture generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate app architecture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setCurrentProgress(0);
    }
  };

  const downloadGeneratedCode = () => {
    if (!generatedCode) return;
    
    generatedCode.files?.forEach((file: any) => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.path.split('/').pop() || 'generated.tsx';
      a.click();
      URL.revokeObjectURL(url);
    });
    
    toast({
      title: "Downloaded!",
      description: `Downloaded ${generatedCode.files?.length || 0} files`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-purple-400" />
            GPT-5 Code Studio
          </CardTitle>
          <CardDescription>
            Autonomous code generation for the CroweCad platform. Generate complete features, components, and APIs from natural language.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="architect" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="architect">App Architect</TabsTrigger>
          <TabsTrigger value="component">Components</TabsTrigger>
          <TabsTrigger value="feature">Features</TabsTrigger>
          <TabsTrigger value="refactor">Refactor</TabsTrigger>
        </TabsList>

        {/* App Architect Tab - Superior App Development */}
        <TabsContent value="architect" className="space-y-4">
          <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/5 to-blue-900/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Superior App Architect
              </CardTitle>
              <CardDescription>
                Generate production-ready full stack applications with advanced architecture patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>App Name</Label>
                  <Input
                    placeholder="E.g., TaskMaster Pro"
                    value={appRequirements.name}
                    onChange={(e) => setAppRequirements({...appRequirements, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>App Type</Label>
                  <Select 
                    value={appRequirements.type} 
                    onValueChange={(v: any) => setAppRequirements({...appRequirements, type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fullstack">Full Stack Web App</SelectItem>
                      <SelectItem value="mobile">Mobile App (React Native)</SelectItem>
                      <SelectItem value="web">Web App (SPA)</SelectItem>
                      <SelectItem value="api">API/Backend Only</SelectItem>
                      <SelectItem value="desktop">Desktop App (Electron)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>App Description & Requirements</Label>
                <Textarea
                  placeholder="Describe your app in detail. E.g., A project management platform with real-time collaboration, Kanban boards, time tracking, team chat, file sharing, and advanced analytics dashboard. Should support 10,000+ concurrent users with sub-200ms response times."
                  value={appRequirements.description}
                  onChange={(e) => setAppRequirements({...appRequirements, description: e.target.value})}
                  className="h-32 font-mono text-sm"
                />
              </div>

              <div>
                <Label>Core Features (comma separated)</Label>
                <Textarea
                  placeholder="E.g., user authentication, real-time collaboration, payment processing, analytics dashboard, file upload, notifications, search, admin panel"
                  onChange={(e) => setAppRequirements({...appRequirements, features: e.target.value.split(',').map(f => f.trim())})}
                  className="h-20"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Expected Users</Label>
                  <Select 
                    value={appRequirements.users.toString()} 
                    onValueChange={(v) => setAppRequirements({...appRequirements, users: parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">Under 100 users</SelectItem>
                      <SelectItem value="1000">1,000 users</SelectItem>
                      <SelectItem value="10000">10,000 users</SelectItem>
                      <SelectItem value="100000">100,000 users</SelectItem>
                      <SelectItem value="1000000">1M+ users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Architecture</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-Select (Recommended)</SelectItem>
                      <SelectItem value="monolithic">Monolithic</SelectItem>
                      <SelectItem value="microservices">Microservices</SelectItem>
                      <SelectItem value="serverless">Serverless</SelectItem>
                      <SelectItem value="jamstack">JAMstack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Deployment</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-Select</SelectItem>
                      <SelectItem value="vercel">Vercel</SelectItem>
                      <SelectItem value="aws">AWS</SelectItem>
                      <SelectItem value="kubernetes">Kubernetes</SelectItem>
                      <SelectItem value="docker">Docker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Quick App Templates</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAppRequirements({
                        name: 'E-Commerce Platform',
                        description: 'Complete e-commerce platform with product catalog, shopping cart, checkout, payment processing, order management, inventory tracking, and admin dashboard',
                        type: 'fullstack',
                        features: ['product catalog', 'shopping cart', 'payment processing', 'order management', 'admin dashboard', 'user reviews', 'search', 'recommendations'],
                        users: 10000,
                        performance: { responseTime: 200, concurrent: 1000, availability: 99.9 },
                        security: ['PCI compliance', 'JWT', 'HTTPS', 'Rate limiting'],
                        integrations: ['Stripe', 'PayPal', 'SendGrid', 'Cloudinary']
                      });
                    }}
                  >
                    E-Commerce Platform
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAppRequirements({
                        name: 'SaaS Dashboard',
                        description: 'Multi-tenant SaaS application with team management, subscription billing, analytics dashboard, API access, and white-labeling',
                        type: 'fullstack',
                        features: ['multi-tenancy', 'subscription billing', 'team management', 'analytics', 'API', 'webhooks', 'white-label'],
                        users: 100000,
                        performance: { responseTime: 150, concurrent: 5000, availability: 99.99 },
                        security: ['SSO', 'RBAC', '2FA', 'API keys'],
                        integrations: ['Stripe', 'Auth0', 'Segment', 'Intercom']
                      });
                    }}
                  >
                    SaaS Platform
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAppRequirements({
                        name: 'Social Network',
                        description: 'Social networking app with profiles, posts, real-time chat, notifications, feed algorithm, and content moderation',
                        type: 'fullstack',
                        features: ['user profiles', 'posts', 'real-time chat', 'notifications', 'feed', 'groups', 'events', 'stories'],
                        users: 1000000,
                        performance: { responseTime: 100, concurrent: 10000, availability: 99.99 },
                        security: ['OAuth', 'Content moderation', 'Privacy controls'],
                        integrations: ['WebRTC', 'CloudFlare', 'AWS S3', 'ElasticSearch']
                      });
                    }}
                  >
                    Social Network
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAppRequirements({
                        name: 'Learning Platform',
                        description: 'Online learning platform with courses, video streaming, quizzes, progress tracking, certificates, and instructor tools',
                        type: 'fullstack',
                        features: ['course management', 'video streaming', 'quizzes', 'progress tracking', 'certificates', 'forums', 'live classes'],
                        users: 50000,
                        performance: { responseTime: 250, concurrent: 2000, availability: 99.9 },
                        security: ['DRM', 'Payment security', 'Content protection'],
                        integrations: ['Vimeo', 'Zoom', 'Stripe', 'Mailchimp']
                      });
                    }}
                  >
                    Learning Platform
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleArchitectGeneration}
                disabled={!appRequirements.name || !appRequirements.description || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Architecting Superior App...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Complete App Architecture
                  </>
                )}
              </Button>

              {generatedApp && (
                <div className="mt-6 space-y-4">
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <Check className="h-4 w-4 text-green-500" />
                    <AlertTitle>App Architecture Generated!</AlertTitle>
                    <AlertDescription>
                      Your {appRequirements.name} app has been architected with {generatedApp.structure?.frontend?.files?.length || 0} frontend files, 
                      {generatedApp.structure?.backend?.files?.length || 0} backend files, and complete deployment configuration.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Architecture</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge>{generatedApp.architecture?.type}</Badge>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {generatedApp.architecture?.patterns?.join(', ')}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Timeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{generatedApp.timeline?.totalWeeks} weeks</div>
                        <div className="text-xs text-muted-foreground">Development time</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Cost Estimate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold">${generatedApp.estimatedCost?.monthly}/mo</div>
                        <div className="text-xs text-muted-foreground">Infrastructure cost</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Test Coverage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{generatedApp.testing?.coverage}%</div>
                        <div className="text-xs text-muted-foreground">Code coverage target</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Tabs defaultValue="structure" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="structure">Structure</TabsTrigger>
                      <TabsTrigger value="code">Code</TabsTrigger>
                      <TabsTrigger value="deployment">Deploy</TabsTrigger>
                      <TabsTrigger value="testing">Testing</TabsTrigger>
                      <TabsTrigger value="docs">Docs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="structure">
                      <ScrollArea className="h-96 border rounded-lg p-4">
                        <div className="space-y-4">
                          {generatedApp.structure?.frontend && (
                            <div>
                              <h4 className="font-semibold mb-2">Frontend</h4>
                              <div className="text-sm text-muted-foreground">
                                {generatedApp.structure.frontend.technology?.join(', ')}
                              </div>
                              <div className="mt-2">
                                {generatedApp.structure.frontend.bestPractices?.map((practice: string, i: number) => (
                                  <Badge key={i} variant="outline" className="mr-2 mb-1">{practice}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {generatedApp.structure?.backend && (
                            <div>
                              <h4 className="font-semibold mb-2">Backend</h4>
                              <div className="text-sm text-muted-foreground">
                                {generatedApp.structure.backend.technology?.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="code">
                      <ScrollArea className="h-96 border rounded-lg bg-slate-950 p-4">
                        {generatedApp.structure?.frontend?.files?.slice(0, 5).map((file: any, i: number) => (
                          <div key={i} className="mb-4">
                            <div className="text-sm font-mono text-green-400">{file.path}</div>
                            <div className="text-xs text-gray-400">{file.purpose}</div>
                          </div>
                        ))}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Component Generation Tab */}
        <TabsContent value="component" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5" />
                Component & Module Generation
              </CardTitle>
              <CardDescription>
                Generate React components, TypeScript modules, APIs, and database schemas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Code Type</Label>
                <Select value={codeType} onValueChange={(v: any) => setCodeType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="component">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="w-4 h-4" />
                        React Component
                      </div>
                    </SelectItem>
                    <SelectItem value="module">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        TypeScript Module
                      </div>
                    </SelectItem>
                    <SelectItem value="api">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        API Endpoint
                      </div>
                    </SelectItem>
                    <SelectItem value="schema">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Database Schema
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Describe what you want to build</Label>
                <Textarea
                  placeholder="E.g., Create a dashboard component with real-time data visualization and user analytics..."
                  value={codePrompt}
                  onChange={(e) => setCodePrompt(e.target.value)}
                  className="h-32 font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Quick Templates</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCodePrompt('Create a user profile component with avatar upload and edit functionality')}
                  >
                    User Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCodePrompt('Build an API endpoint for user authentication with JWT tokens')}
                  >
                    Auth API
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCodePrompt('Generate a database schema for a project management system')}
                  >
                    Project Schema
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCodePrompt('Create a real-time chat component with WebSocket support')}
                  >
                    Chat Component
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCodeGeneration}
                disabled={!codePrompt || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Code...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Generation Tab */}
        <TabsContent value="feature" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                One-Shot Feature Generation
              </CardTitle>
              <CardDescription>
                Generate complete features with all necessary components, APIs, and schemas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Feature Description</Label>
                <Textarea
                  placeholder="E.g., Build a complete user management system with registration, login, profile editing, role-based access control, and admin dashboard..."
                  value={codePrompt}
                  onChange={(e) => setCodePrompt(e.target.value)}
                  className="h-40 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label>Feature Templates</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCodePrompt('Complete e-commerce shopping cart with product catalog, cart management, checkout flow, and order history')}
                  >
                    E-commerce Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCodePrompt('Real-time collaboration system with live cursors, shared editing, presence indicators, and conflict resolution')}
                  >
                    Collaboration
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCodePrompt('Analytics dashboard with charts, filters, date ranges, export functionality, and real-time updates')}
                  >
                    Analytics
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCodePrompt('File management system with upload, download, folders, sharing, and permission controls')}
                  >
                    File Manager
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleFeatureGeneration}
                disabled={!codePrompt || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Building Feature...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Complete Feature
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refactor Tab */}
        <TabsContent value="refactor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Code Refactoring & Optimization
              </CardTitle>
              <CardDescription>
                Improve existing code with AI-powered refactoring and optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Paste your code to refactor</Label>
                <Textarea
                  placeholder="Paste your existing code here..."
                  value={existingCode}
                  onChange={(e) => setExistingCode(e.target.value)}
                  className="h-48 font-mono text-xs"
                />
              </div>

              <div>
                <Label>Refactoring Instructions</Label>
                <Textarea
                  placeholder="E.g., Convert to TypeScript, add error handling, improve performance, use React hooks..."
                  value={codePrompt}
                  onChange={(e) => setCodePrompt(e.target.value)}
                  className="h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleOptimization}
                  disabled={!existingCode || isGenerating}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Optimize Performance
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestGeneration}
                  disabled={!existingCode || isGenerating}
                >
                  <TestTube className="w-4 h-4 mr-1" />
                  Generate Tests
                </Button>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleRefactoring}
                disabled={!existingCode || !codePrompt || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refactoring...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refactor Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Code Display */}
      {generatedCode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Generated Code ({generatedCode.files?.length || 0} files)</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyGeneratedCode}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadGeneratedCode}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 border rounded-lg bg-slate-950 p-4">
              {generatedCode.files?.map((file: any, index: number) => (
                <div key={index} className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-mono text-green-400">{file.path}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {file.language}
                    </Badge>
                  </div>
                  <pre className="text-xs font-mono text-gray-300 overflow-x-auto">
                    <code>{file.content}</code>
                  </pre>
                </div>
              ))}
            </ScrollArea>

            {generatedCode.instructions?.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold">Next Steps</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {generatedCode.instructions.map((instruction: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {generatedCode.metadata && (
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Complexity:</span>
                  <Badge className="ml-2" variant="outline">
                    {generatedCode.metadata.complexity}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Lines:</span>
                  <span className="ml-2 font-mono">{generatedCode.metadata.estimatedLines}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
/**
 * GPT-5 Code Studio - Autonomous Code Generation for CroweCad Platform
 * Generate React components, TypeScript modules, APIs, and full features from natural language
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useToast } from '@/hooks/use-toast';

export function GPT5CodeStudio() {
  const [codePrompt, setCodePrompt] = useState('');
  const [codeType, setCodeType] = useState<'component' | 'module' | 'feature' | 'api' | 'schema' | 'refactor'>('component');
  const [existingCode, setExistingCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [codeHistory, setCodeHistory] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
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

      <Tabs defaultValue="component" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="component">Component Gen</TabsTrigger>
          <TabsTrigger value="feature">Feature Builder</TabsTrigger>
          <TabsTrigger value="refactor">Refactor & Fix</TabsTrigger>
        </TabsList>

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
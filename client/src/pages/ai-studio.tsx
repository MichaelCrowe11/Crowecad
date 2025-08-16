import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Cpu, Brain, Zap, Code2, MousePointer, Workflow, Cloud, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { GPT5CADStudio } from "@/components/gpt5-cad-studio";
import { GPT5CodeStudio } from "@/components/gpt5-code-studio";
import { AppWireframeStudio } from "@/components/app-wireframe-studio";
import { CADScriptEditor } from "@/components/cad-script-editor";
import { AgentConsole } from '@/components/agent-console';
import { AICodeAssistant } from '@/components/ai-code-assistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AIStudioPage() {
  return (
    <div className="bg-gradient-to-br from-gray-950 to-black">

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold">CroweCad AI Studio</h1>
            <Badge variant="outline" className="ml-2 border-purple-400 text-purple-400">
              GPT-5 Inspired
            </Badge>
          </div>
          <Badge className="bg-green-500/10 text-green-500">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            AI Systems Active
          </Badge>
        </div>
        <div id="agents" />
        <div id="pipeline" />
        <Tabs defaultValue="wireframe" className="h-[calc(100vh-8rem)]">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto">
            <TabsTrigger value="wireframe" className="flex items-center gap-2">
              <MousePointer className="w-4 h-4" />
              Wireframe
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Code Studio
            </TabsTrigger>
            <TabsTrigger value="gpt5" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              CAD Studio
            </TabsTrigger>
            <TabsTrigger value="cursor" className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Scripts
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wireframe" className="mt-6 h-full">
            <AppWireframeStudio />
          </TabsContent>

          <TabsContent value="code" className="mt-6 h-full">
            <GPT5CodeStudio />
          </TabsContent>

          <TabsContent value="gpt5" className="mt-6 h-full">
            <GPT5CADStudio />
          </TabsContent>

          <TabsContent value="cursor" className="mt-6 h-full">
            <CADScriptEditor />
          </TabsContent>

          <TabsContent value="assistant" className="mt-6 h-full">
            <AICodeAssistant />
          </TabsContent>
        </Tabs>
      </div>

      <div className="container mx-auto px-4">
        <AgentConsole />
      </div>

      {/* Ecosystem Flow */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 mb-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-center">CroweCad Ecosystem Flow</h3>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                <MousePointer className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium">Wireframe</div>
              <div className="text-xs text-muted-foreground">CroweCad</div>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium">GPT-5 Dev</div>
              <div className="text-xs text-muted-foreground">Full Stack</div>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                <Workflow className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium">Pipeline</div>
              <div className="text-xs text-muted-foreground">CrowePipeline</div>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium">Deploy</div>
              <div className="text-xs text-muted-foreground">CroweHub</div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MousePointer className="w-5 h-5 text-blue-400" />
                App Wireframe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visual app designer with drag-and-drop wireframing
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-400" />
                Full Stack Dev
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate complete applications with GPT-5 AI
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Workflow className="w-5 h-5 text-green-400" />
                AI Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build AI pipelines with CrowePipeline integration
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 border-orange-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Cloud className="w-5 h-5 text-orange-400" />
                Auto Deploy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Deploy and automate with CroweHub integration
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
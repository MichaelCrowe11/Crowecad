import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Cpu, Brain, Zap, Code2 } from "lucide-react";
import { Link } from "wouter";
import { GPT5CADStudio } from "@/components/gpt5-cad-studio";
import { GPT5CodeStudio } from "@/components/gpt5-code-studio";
import { CADScriptEditor } from "@/components/cad-script-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AIStudioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-500" />
                <h1 className="text-xl font-bold">CroweCad AI Studio</h1>
                <Badge variant="outline" className="ml-2 border-purple-400 text-purple-400">
                  GPT-5 Inspired
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/10 text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                AI Systems Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="gpt5" className="h-[calc(100vh-8rem)]">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="gpt5" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              CAD Studio
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Code Studio
            </TabsTrigger>
            <TabsTrigger value="cursor" className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Script Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gpt5" className="mt-6 h-full">
            <GPT5CADStudio />
          </TabsContent>

          <TabsContent value="code" className="mt-6 h-full">
            <GPT5CodeStudio />
          </TabsContent>

          <TabsContent value="cursor" className="mt-6 h-full">
            <CADScriptEditor />
          </TabsContent>
        </Tabs>
      </div>

      {/* Feature Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                One-Shot Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create complete CAD models from single natural language descriptions
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-400" />
                Image to CAD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Convert photos and sketches directly into editable CAD models
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-400" />
                Style Transfer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Apply different design aesthetics to existing models instantly
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
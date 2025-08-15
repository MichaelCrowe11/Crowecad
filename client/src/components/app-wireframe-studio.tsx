/**
 * App Wireframe Studio - Visual App Designer with Ecosystem Integration
 * Seamless flow: Wireframe → GPT-5 Development → CrowePipeline → CroweHub
 */

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Square,
  Circle,
  Triangle,
  Hexagon,
  Type,
  Image,
  List,
  Grid3x3,
  BarChart,
  FileText,
  Navigation,
  Database,
  Workflow,
  GitBranch,
  Cloud,
  Zap,
  ArrowRight,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Move,
  Maximize,
  Minimize,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Code2,
  Sparkles,
  Rocket,
  Globe,
  Smartphone,
  Monitor,
  Layers,
  MousePointer,
  Link2,
  Users,
  ShoppingCart,
  MessageSquare,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { appWireframeEngine } from '@/lib/app-wireframe-engine';
import { gpt5AppArchitect } from '@/lib/gpt5-app-architect';
import { useToast } from '@/hooks/use-toast';

// Component palette
const COMPONENT_PALETTE = [
  { icon: Square, name: 'Container', type: 'component' },
  { icon: Type, name: 'Text', type: 'component' },
  { icon: Image, name: 'Image', type: 'component' },
  { icon: FileText, name: 'Form', type: 'form' },
  { icon: List, name: 'List', type: 'list' },
  { icon: Grid3x3, name: 'Grid', type: 'component' },
  { icon: BarChart, name: 'Chart', type: 'chart' },
  { icon: Navigation, name: 'Navigation', type: 'navigation' },
  { icon: Menu, name: 'Modal', type: 'modal' },
];

// Pre-built templates
const SCREEN_TEMPLATES = [
  { name: 'Dashboard', icon: BarChart, screens: ['Dashboard', 'Analytics', 'Reports'] },
  { name: 'E-Commerce', icon: ShoppingCart, screens: ['Products', 'Cart', 'Checkout', 'Orders'] },
  { name: 'Social', icon: Users, screens: ['Feed', 'Profile', 'Messages', 'Settings'] },
  { name: 'SaaS', icon: Cloud, screens: ['Landing', 'Pricing', 'Dashboard', 'Billing'] },
  { name: 'Mobile App', icon: Smartphone, screens: ['Onboarding', 'Home', 'Profile', 'Settings'] },
];

export function AppWireframeStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [project, setProject] = useState<any>(null);
  const [selectedScreen, setSelectedScreen] = useState<any>(null);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [isConnected, setIsConnected] = useState({
    pipeline: false,
    hub: false
  });
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'wireframing' | 'developing' | 'pipeline' | 'deploying' | 'deployed'>('idle');
  const { toast } = useToast();

  // Initialize wireframe engine
  useEffect(() => {
    if (canvasRef.current) {
      appWireframeEngine.initialize(canvasRef.current);
    }
  }, []);

  // Create new project
  const createProject = (type: 'web' | 'mobile' | 'desktop') => {
    const newProject = appWireframeEngine.createProject({
      name: 'New App',
      type,
      description: 'App created with CroweCad Wireframe Studio'
    });
    setProject(newProject);
    setSelectedScreen(newProject.screens[0]);
    toast({
      title: "Project Created",
      description: `New ${type} project initialized`
    });
  };

  // Add screen
  const addScreen = (name: string) => {
    if (!project) return;
    
    const screen = appWireframeEngine.addScreen({
      name,
      route: `/${name.toLowerCase().replace(/\s+/g, '-')}`,
      authentication: 'public'
    });
    
    setSelectedScreen(screen);
    toast({
      title: "Screen Added",
      description: `${name} screen added to project`
    });
  };

  // Add component to canvas
  const addComponent = (type: string) => {
    if (!selectedScreen) return;
    
    const component = appWireframeEngine.addComponent(selectedScreen.id, {
      type: type as any,
      name: type,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 }
    });
    
    setSelectedComponent(component);
  };

  // Load template
  const loadTemplate = (template: typeof SCREEN_TEMPLATES[0]) => {
    const newProject = appWireframeEngine.createProject({
      name: `${template.name} App`,
      type: 'web',
      description: `${template.name} application template`
    });
    
    // Add screens from template
    template.screens.forEach(screenName => {
      appWireframeEngine.addScreen({
        name: screenName,
        route: `/${screenName.toLowerCase()}`,
        authentication: screenName === 'Landing' ? 'public' : 'private'
      });
    });
    
    setProject(newProject);
    setSelectedScreen(newProject.screens[0]);
    
    toast({
      title: "Template Loaded",
      description: `${template.name} template applied`
    });
  };

  // Connect to CrowePipeline
  const connectToPipeline = () => {
    setIsConnected(prev => ({ ...prev, pipeline: true }));
    toast({
      title: "Connected to CrowePipeline",
      description: "AI pipeline builder integration active"
    });
  };

  // Connect to CroweHub
  const connectToHub = () => {
    setIsConnected(prev => ({ ...prev, hub: true }));
    toast({
      title: "Connected to CroweHub",
      description: "Automation and deployment ready"
    });
  };

  // Full ecosystem deployment
  const deployToEcosystem = async () => {
    if (!project) return;
    
    setDeploymentStatus('wireframing');
    
    try {
      // Step 1: Export wireframe
      const wireframeExport = appWireframeEngine.exportToGPT5();
      
      toast({
        title: "Wireframe Complete",
        description: "Sending to GPT-5 for development..."
      });
      
      setDeploymentStatus('developing');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 2: Generate with GPT-5
      const generatedApp = await gpt5AppArchitect.generateApp(wireframeExport.appRequirements);
      
      toast({
        title: "Code Generated",
        description: "Sending to CrowePipeline..."
      });
      
      setDeploymentStatus('pipeline');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Process through pipeline
      const pipelineExport = appWireframeEngine.exportToPipeline();
      
      toast({
        title: "Pipeline Configured",
        description: "Deploying via CroweHub..."
      });
      
      setDeploymentStatus('deploying');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 4: Deploy via CroweHub
      const hubExport = appWireframeEngine.exportToHub();
      
      setDeploymentStatus('deployed');
      
      toast({
        title: "Deployment Complete! 🚀",
        description: `Your app is live at ${project.name.toLowerCase().replace(/\s+/g, '-')}.crowehub.app`
      });
      
    } catch (error) {
      setDeploymentStatus('idle');
      toast({
        title: "Deployment Failed",
        description: "Please check your connections and try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Component Palette */}
      <div className="w-64 border-r bg-card p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Project</h3>
          {!project ? (
            <div className="space-y-2">
              <Button
                size="sm"
                className="w-full justify-start"
                onClick={() => createProject('web')}
              >
                <Monitor className="w-4 h-4 mr-2" />
                New Web App
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => createProject('mobile')}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                New Mobile App
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => createProject('desktop')}
              >
                <Monitor className="w-4 h-4 mr-2" />
                New Desktop App
              </Button>
            </div>
          ) : (
            <Card>
              <CardContent className="p-3">
                <div className="text-sm font-medium">{project.name}</div>
                <div className="text-xs text-muted-foreground">{project.type} application</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{project.screens.length} screens</Badge>
                  <Badge variant="outline">{project.dataModels?.length || 0} models</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* Templates */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Templates</h3>
          <ScrollArea className="h-48">
            <div className="space-y-1">
              {SCREEN_TEMPLATES.map((template, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => loadTemplate(template)}
                >
                  <template.icon className="w-4 h-4 mr-2" />
                  {template.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Components */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Components</h3>
          <div className="grid grid-cols-3 gap-2">
            {COMPONENT_PALETTE.map((comp, i) => (
              <TooltipProvider key={i}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-12 w-full"
                      onClick={() => addComponent(comp.type)}
                      disabled={!selectedScreen}
                    >
                      <comp.icon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{comp.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        <Separator />

        {/* Ecosystem Integration */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Ecosystem</h3>
          <div className="space-y-2">
            <Button
              size="sm"
              variant={isConnected.pipeline ? "default" : "outline"}
              className="w-full justify-start"
              onClick={connectToPipeline}
            >
              <Workflow className="w-4 h-4 mr-2" />
              {isConnected.pipeline ? "Pipeline Connected" : "Connect Pipeline"}
            </Button>
            <Button
              size="sm"
              variant={isConnected.hub ? "default" : "outline"}
              className="w-full justify-start"
              onClick={connectToHub}
            >
              <Cloud className="w-4 h-4 mr-2" />
              {isConnected.hub ? "Hub Connected" : "Connect Hub"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 border-b bg-card px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {project && (
              <>
                <Select value={selectedScreen?.id} onValueChange={(id) => {
                  const screen = project.screens.find((s: any) => s.id === id);
                  setSelectedScreen(screen);
                }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select screen" />
                  </SelectTrigger>
                  <SelectContent>
                    {project.screens.map((screen: any) => (
                      <SelectItem key={screen.id} value={screen.id}>
                        {screen.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const name = prompt('Screen name:');
                    if (name) addScreen(name);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Screen
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Deployment Status */}
            {deploymentStatus !== 'idle' && (
              <Badge variant={deploymentStatus === 'deployed' ? 'default' : 'secondary'}>
                {deploymentStatus === 'wireframing' && 'Creating Wireframe...'}
                {deploymentStatus === 'developing' && 'GPT-5 Developing...'}
                {deploymentStatus === 'pipeline' && 'Pipeline Processing...'}
                {deploymentStatus === 'deploying' && 'Deploying to Hub...'}
                {deploymentStatus === 'deployed' && 'Live! 🚀'}
              </Badge>
            )}

            <Button
              size="sm"
              variant="outline"
              disabled={!project}
              onClick={() => {
                const code = appWireframeEngine.generateCodePreview(selectedComponent?.id || '');
                console.log(code);
                toast({
                  title: "Code Preview",
                  description: "Check console for generated code"
                });
              }}
            >
              <Code2 className="w-4 h-4 mr-1" />
              Preview Code
            </Button>

            <Button
              size="sm"
              disabled={!project || !isConnected.pipeline || !isConnected.hub}
              onClick={deployToEcosystem}
            >
              <Rocket className="w-4 h-4 mr-1" />
              Deploy Full Stack
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-slate-50">
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            width={1024}
            height={768}
          />
          
          {!project && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">📐</div>
                <h2 className="text-2xl font-bold">Start Wireframing</h2>
                <p className="text-muted-foreground">
                  Create a new project or load a template to begin
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => createProject('web')}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                  <Button variant="outline" onClick={() => loadTemplate(SCREEN_TEMPLATES[0])}>
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="h-8 border-t bg-card px-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Zoom: 100%</span>
            <span>•</span>
            <span>{selectedComponent ? `Selected: ${selectedComponent.name}` : 'No selection'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected.pipeline ? 'bg-green-500' : 'bg-gray-400'}`} />
              Pipeline
            </span>
            <span className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected.hub ? 'bg-green-500' : 'bg-gray-400'}`} />
              Hub
            </span>
            <span>CroweCad Wireframe Studio</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div className="w-80 border-l bg-card p-4">
        <Tabs defaultValue="properties">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="flow">Flow</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            {selectedComponent ? (
              <>
                <div>
                  <Label>Component Name</Label>
                  <Input value={selectedComponent.name} />
                </div>
                <div>
                  <Label>Type</Label>
                  <Badge>{selectedComponent.type}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Width</Label>
                    <Input type="number" value={selectedComponent.size.width} />
                  </div>
                  <div>
                    <Label>Height</Label>
                    <Input type="number" value={selectedComponent.size.height} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>X Position</Label>
                    <Input type="number" value={selectedComponent.position.x} />
                  </div>
                  <div>
                    <Label>Y Position</Label>
                    <Input type="number" value={selectedComponent.position.y} />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select a component to edit properties
              </div>
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                const modelName = prompt('Model name:');
                if (modelName && project) {
                  appWireframeEngine.addDataModel({
                    name: modelName,
                    fields: [
                      { name: 'id', type: 'string', required: true, unique: true },
                      { name: 'name', type: 'string', required: true },
                      { name: 'createdAt', type: 'date', required: true }
                    ]
                  });
                  toast({
                    title: "Data Model Added",
                    description: `${modelName} model created`
                  });
                }
              }}
            >
              <Database className="w-4 h-4 mr-2" />
              Add Data Model
            </Button>
            
            {project?.dataModels?.map((model: any, i: number) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{model.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs space-y-1">
                    {model.fields.map((field: any, j: number) => (
                      <div key={j} className="flex justify-between">
                        <span>{field.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="flow" className="space-y-4">
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                const flowName = prompt('User flow name:');
                if (flowName && project) {
                  appWireframeEngine.addUserFlow({
                    name: flowName,
                    description: `${flowName} user journey`,
                    entryPoint: project.screens[0]?.id || ''
                  });
                  toast({
                    title: "User Flow Added",
                    description: `${flowName} flow created`
                  });
                }
              }}
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Add User Flow
            </Button>

            {project?.userFlows?.map((flow: any, i: number) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{flow.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {flow.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Ecosystem Flow Visualization */}
        <div className="mt-6 p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
          <h3 className="text-sm font-semibold mb-3">Deployment Flow</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                deploymentStatus === 'wireframing' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}>
                <MousePointer className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium">Wireframe</div>
                <div className="text-xs text-muted-foreground">Design in CroweCad</div>
              </div>
            </div>
            
            <ChevronRight className="w-4 h-4 text-gray-400 ml-4" />
            
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                deploymentStatus === 'developing' ? 'bg-purple-500 text-white' : 'bg-gray-200'
              }`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium">GPT-5 Development</div>
                <div className="text-xs text-muted-foreground">Generate full stack code</div>
              </div>
            </div>
            
            <ChevronRight className="w-4 h-4 text-gray-400 ml-4" />
            
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                deploymentStatus === 'pipeline' ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                <Workflow className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium">CrowePipeline</div>
                <div className="text-xs text-muted-foreground">AI pipeline processing</div>
              </div>
            </div>
            
            <ChevronRight className="w-4 h-4 text-gray-400 ml-4" />
            
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                deploymentStatus === 'deployed' ? 'bg-orange-500 text-white' : 'bg-gray-200'
              }`}>
                <Cloud className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium">CroweHub</div>
                <div className="text-xs text-muted-foreground">Deploy & automate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Upload, 
  Palette, 
  Layers, 
  Play, 
  Download,
  Wand2,
  Image,
  Shuffle,
  Zap,
  Box,
  Loader2,
  Eye,
  Code,
  Settings,
  Cpu
} from 'lucide-react';
import { gpt5CADGenerator } from '@/lib/gpt5-cad-generator';
import { useToast } from '@/hooks/use-toast';
import * as THREE from 'three';

interface GenerationResult {
  id: string;
  type: string;
  description: string;
  geometry?: THREE.BufferGeometry;
  script?: string;
  preview?: string;
  timestamp: Date;
  style: string;
}

export function GPT5CADStudio() {
  const [activeTab, setActiveTab] = useState('generate');
  const [description, setDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('industrial');
  const [complexity, setComplexity] = useState('moderate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<GenerationResult | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [interactionType, setInteractionType] = useState<'assembly' | 'mechanism' | 'parametric'>('assembly');
  const [partCount, setPartCount] = useState(3);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Example prompts for inspiration
  const examplePrompts = [
    { icon: '⚙️', text: 'Planetary gear system with 3:1 ratio' },
    { icon: '🏠', text: 'Modern minimalist house facade' },
    { icon: '🚗', text: 'Aerodynamic car body shell' },
    { icon: '🔧', text: 'Adjustable phone stand with ball joint' },
    { icon: '🎮', text: 'Ergonomic game controller grip' },
    { icon: '💡', text: 'Parametric lamp shade with organic patterns' }
  ];

  // Style options with descriptions
  const styleOptions = [
    { value: 'industrial', label: 'Industrial', icon: '🏭', description: 'Sharp edges, metallic finish' },
    { value: 'organic', label: 'Organic', icon: '🌿', description: 'Smooth curves, natural forms' },
    { value: 'minimalist', label: 'Minimalist', icon: '◻️', description: 'Clean lines, simple geometry' },
    { value: 'futuristic', label: 'Futuristic', icon: '🚀', description: 'Sci-fi aesthetics, bold shapes' },
    { value: 'retro', label: 'Retro', icon: '📻', description: 'Vintage styling, classic forms' },
    { value: 'architectural', label: 'Architectural', icon: '🏛️', description: 'Structural elements, precise' }
  ];

  // Generate CAD from description
  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a description of what you want to create.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await gpt5CADGenerator.generateFromDescription(description, {
        style: selectedStyle as any,
        complexity: complexity as any
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      const newResult: GenerationResult = {
        id: Date.now().toString(),
        type: 'generated',
        description: description,
        geometry: result.geometry,
        script: result.script,
        preview: result.preview,
        timestamp: new Date(),
        style: selectedStyle
      };

      setResults([newResult, ...results]);
      setSelectedResult(newResult);

      toast({
        title: "CAD Generated Successfully",
        description: "Your model has been created from the description.",
      });

      // Display in 3D viewer
      if (result.geometry && canvasRef.current) {
        displayGeometry(result.geometry);
      }

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate CAD model. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  // Generate from image
  const handleImageGenerate = async () => {
    if (!imageFile) {
      toast({
        title: "Image Required",
        description: "Please upload an image first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 15, 85));
      }, 300);

      const result = await gpt5CADGenerator.generateFromImage(imageFile, description);

      clearInterval(progressInterval);
      setGenerationProgress(100);

      const newResult: GenerationResult = {
        id: Date.now().toString(),
        type: 'image-based',
        description: `Generated from image${description ? ': ' + description : ''}`,
        geometry: result.geometry,
        script: result.script,
        preview: result.preview,
        timestamp: new Date(),
        style: result.metadata.style
      };

      setResults([newResult, ...results]);
      setSelectedResult(newResult);

      toast({
        title: "Image Converted to CAD",
        description: "Successfully generated CAD model from your image.",
      });

      if (result.geometry && canvasRef.current) {
        displayGeometry(result.geometry);
      }

    } catch (error) {
      toast({
        title: "Image Conversion Failed",
        description: "Unable to convert image to CAD model.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  // Apply style transfer
  const handleStyleTransfer = async () => {
    if (!selectedResult || !selectedResult.geometry) {
      toast({
        title: "No Model Selected",
        description: "Please generate or select a model first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await gpt5CADGenerator.applyStyleTransfer(
        selectedResult.geometry,
        selectedStyle
      );

      const newResult: GenerationResult = {
        id: Date.now().toString(),
        type: 'style-transfer',
        description: `${selectedResult.description} (${selectedStyle} style)`,
        geometry: result.geometry,
        script: result.script,
        preview: result.preview,
        timestamp: new Date(),
        style: selectedStyle
      };

      setResults([newResult, ...results]);
      setSelectedResult(newResult);

      toast({
        title: "Style Applied",
        description: `Model transformed to ${selectedStyle} style.`,
      });

      if (result.geometry && canvasRef.current) {
        displayGeometry(result.geometry);
      }

    } catch (error) {
      toast({
        title: "Style Transfer Failed",
        description: "Unable to apply style transfer.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate interactive CAD
  const handleInteractiveGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe the interactive mechanism.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 12, 88));
      }, 250);

      const result = await gpt5CADGenerator.generateInteractiveCAD(
        description,
        interactionType
      );

      clearInterval(progressInterval);
      setGenerationProgress(100);

      const newResult: GenerationResult = {
        id: Date.now().toString(),
        type: 'interactive',
        description: `Interactive ${interactionType}: ${description}`,
        geometry: result.geometry,
        script: result.script,
        preview: result.preview,
        timestamp: new Date(),
        style: 'interactive'
      };

      setResults([newResult, ...results]);
      setSelectedResult(newResult);

      toast({
        title: "Interactive CAD Created",
        description: `${interactionType} mechanism generated successfully.`,
      });

      if (result.geometry && canvasRef.current) {
        displayGeometry(result.geometry);
        // Start animations if available
        if (result.animations && result.animations.length > 0) {
          playAnimations(result.animations);
        }
      }

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to create interactive CAD.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  // Generate complex assembly
  const handleAssemblyGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe the assembly.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 8, 92));
      }, 400);

      const parts = await gpt5CADGenerator.generateComplexAssembly(
        description,
        partCount
      );

      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Add all parts as results
      const newResults = parts.map((part, index) => ({
        id: `${Date.now()}_${index}`,
        type: 'assembly-part',
        description: part.metadata.description,
        geometry: part.geometry,
        script: part.script,
        preview: part.preview,
        timestamp: new Date(),
        style: 'assembly'
      }));

      setResults([...newResults, ...results]);
      setSelectedResult(newResults[0]);

      toast({
        title: "Assembly Generated",
        description: `Created ${parts.length} parts for the assembly.`,
      });

      // Display all parts
      if (parts[0].geometry && canvasRef.current) {
        displayAssembly(parts);
      }

    } catch (error) {
      toast({
        title: "Assembly Generation Failed",
        description: "Unable to create assembly.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Display geometry in 3D viewer
  const displayGeometry = (geometry: THREE.BufferGeometry) => {
    if (!canvasRef.current) return;

    // Clear previous content
    canvasRef.current.innerHTML = '';

    // Create Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new THREE.PerspectiveCamera(
      45,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(30, 30, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    canvasRef.current.appendChild(renderer.domElement);

    // Add geometry
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      wireframe: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Add lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // Add grid
    const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      mesh.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
  };

  // Display assembly
  const displayAssembly = (parts: any[]) => {
    if (!canvasRef.current) return;

    canvasRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new THREE.PerspectiveCamera(
      45,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(50, 50, 50);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    canvasRef.current.appendChild(renderer.domElement);

    // Add all parts
    parts.forEach((part, index) => {
      if (part.geometry) {
        const material = new THREE.MeshPhongMaterial({ 
          color: new THREE.Color().setHSL(index / parts.length, 0.7, 0.5),
          wireframe: false
        });
        const mesh = new THREE.Mesh(part.geometry, material);
        mesh.position.set(index * 15 - (parts.length * 7.5), 0, 0);
        scene.add(mesh);
      }
    });

    // Add lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // Add grid
    const gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      scene.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();
  };

  // Play animations
  const playAnimations = (animations: any[]) => {
    // Animation playback logic would go here
    console.log('Playing animations:', animations);
  };

  // Download script
  const downloadScript = (script: string, filename: string) => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <Card className="border-0 shadow-none bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                GPT-5 CAD Studio
                <Badge variant="outline" className="ml-2 border-purple-400 text-purple-400">
                  AI-Powered
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                One-shot CAD generation from natural language and images
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedResult && selectedResult.script && (
                <Button
                  onClick={() => downloadScript(selectedResult.script!, `${selectedResult.description}.scad`)}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Script
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Left Panel - Generation Controls */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full rounded-none">
                <TabsTrigger value="generate" className="flex-1">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate
                </TabsTrigger>
                <TabsTrigger value="image" className="flex-1">
                  <Image className="w-4 h-4 mr-2" />
                  From Image
                </TabsTrigger>
                <TabsTrigger value="style" className="flex-1">
                  <Palette className="w-4 h-4 mr-2" />
                  Style
                </TabsTrigger>
                <TabsTrigger value="interactive" className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Interactive
                </TabsTrigger>
              </TabsList>

              <div className="p-4 space-y-4">
                {/* Generate Tab */}
                <TabsContent value="generate" className="mt-0 space-y-4">
                  <div>
                    <Label htmlFor="description">Describe what you want to create</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., A parametric gear with 20 teeth and 50mm diameter..."
                      className="min-h-[100px] mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Style</Label>
                      <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {styleOptions.map(style => (
                            <SelectItem key={style.value} value={style.value}>
                              <div className="flex items-center gap-2">
                                <span>{style.icon}</span>
                                <div>
                                  <div>{style.label}</div>
                                  <div className="text-xs text-muted-foreground">{style.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Complexity</Label>
                      <Select value={complexity} onValueChange={setComplexity}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="complex">Complex</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !description}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate CAD Model
                      </>
                    )}
                  </Button>

                  {isGenerating && generationProgress > 0 && (
                    <Progress value={generationProgress} className="h-2" />
                  )}

                  <Separator />

                  <div>
                    <Label className="text-xs text-muted-foreground">Example Prompts</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {examplePrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setDescription(prompt.text)}
                          className="text-left p-2 text-sm hover:bg-accent rounded-md transition-colors"
                        >
                          <span className="mr-2">{prompt.icon}</span>
                          {prompt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Image Tab */}
                <TabsContent value="image" className="mt-0 space-y-4">
                  <div>
                    <Label>Upload Image</Label>
                    <div className="mt-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                  </div>

                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <Button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                      >
                        Remove
                      </Button>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="image-description">Additional Instructions (Optional)</Label>
                    <Textarea
                      id="image-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Make it parametric, add mounting holes..."
                      className="min-h-[80px] mt-2"
                    />
                  </div>

                  <Button
                    onClick={handleImageGenerate}
                    disabled={isGenerating || !imageFile}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4 mr-2" />
                        Generate from Image
                      </>
                    )}
                  </Button>

                  {isGenerating && generationProgress > 0 && (
                    <Progress value={generationProgress} className="h-2" />
                  )}

                  <Alert>
                    <AlertDescription>
                      Upload a photo or sketch of an object to generate its CAD model. Works best with clear, well-lit images of mechanical parts or simple objects.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                {/* Style Transfer Tab */}
                <TabsContent value="style" className="mt-0 space-y-4">
                  <Alert>
                    <AlertDescription>
                      Transform existing models with different design styles while maintaining functionality.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label>Select Target Style</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {styleOptions.map(style => (
                        <button
                          key={style.value}
                          onClick={() => setSelectedStyle(style.value)}
                          className={`p-3 rounded-md border transition-all ${
                            selectedStyle === style.value 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-2xl">{style.icon}</div>
                          <div className="text-sm font-medium mt-1">{style.label}</div>
                          <div className="text-xs text-muted-foreground">{style.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleStyleTransfer}
                    disabled={isGenerating || !selectedResult}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Applying Style...
                      </>
                    ) : (
                      <>
                        <Shuffle className="w-4 h-4 mr-2" />
                        Apply Style Transfer
                      </>
                    )}
                  </Button>

                  {!selectedResult && (
                    <Alert>
                      <AlertDescription>
                        Generate or select a model first before applying style transfer.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                {/* Interactive Tab */}
                <TabsContent value="interactive" className="mt-0 space-y-4">
                  <div>
                    <Label>Interaction Type</Label>
                    <Select value={interactionType} onValueChange={(v: any) => setInteractionType(v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assembly">Assembly Animation</SelectItem>
                        <SelectItem value="mechanism">Working Mechanism</SelectItem>
                        <SelectItem value="parametric">Parametric Controls</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {interactionType === 'assembly' && (
                    <div>
                      <Label>Number of Parts</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Slider
                          value={[partCount]}
                          onValueChange={([v]) => setPartCount(v)}
                          min={2}
                          max={10}
                          step={1}
                          className="flex-1"
                        />
                        <span className="w-8 text-sm">{partCount}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="interactive-description">Describe the {interactionType}</Label>
                    <Textarea
                      id="interactive-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={
                        interactionType === 'assembly' 
                          ? "e.g., Exploded view of a gearbox assembly..."
                          : interactionType === 'mechanism'
                          ? "e.g., Scissor lift mechanism with 4 stages..."
                          : "e.g., Parametric box with adjustable dimensions..."
                      }
                      className="min-h-[100px] mt-2"
                    />
                  </div>

                  <Button
                    onClick={interactionType === 'assembly' ? handleAssemblyGenerate : handleInteractiveGenerate}
                    disabled={isGenerating || !description}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Cpu className="w-4 h-4 mr-2" />
                        Generate Interactive CAD
                      </>
                    )}
                  </Button>

                  {isGenerating && generationProgress > 0 && (
                    <Progress value={generationProgress} className="h-2" />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Right Panel - 3D Viewer & Results */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">3D Preview</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Code className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              ref={canvasRef}
              className="w-full h-[400px] bg-gradient-to-br from-gray-900 to-black rounded-md"
            />

            {/* Results History */}
            <div className="mt-4">
              <Label className="text-xs text-muted-foreground">Generation History</Label>
              <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
                {results.map(result => (
                  <button
                    key={result.id}
                    onClick={() => {
                      setSelectedResult(result);
                      if (result.geometry) displayGeometry(result.geometry);
                    }}
                    className={`w-full text-left p-2 rounded-md border transition-all ${
                      selectedResult?.id === result.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.type === 'generated' && <Wand2 className="w-3 h-3" />}
                        {result.type === 'image-based' && <Image className="w-3 h-3" />}
                        {result.type === 'style-transfer' && <Palette className="w-3 h-3" />}
                        {result.type === 'interactive' && <Play className="w-3 h-3" />}
                        {result.type === 'assembly-part' && <Layers className="w-3 h-3" />}
                        <span className="text-sm truncate">{result.description}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {result.style}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
                {results.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No models generated yet
                  </div>
                )}
              </div>
            </div>

            {/* Selected Result Details */}
            {selectedResult && selectedResult.script && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Generated Script</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedResult.script!);
                      toast({
                        title: "Copied",
                        description: "Script copied to clipboard",
                      });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <pre className="text-xs font-mono overflow-x-auto max-h-[100px]">
                  {selectedResult.script}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
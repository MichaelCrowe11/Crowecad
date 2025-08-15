import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Upload,
  Camera,
  Wand2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Building,
  Package,
  FileImage,
  Sparkles,
  ArrowRight,
  Settings
} from "lucide-react";
import { visionAnalyzer } from "@/lib/vision-analyzer";
import { useToast } from "@/hooks/use-toast";
import type { SVGEquipment, SVGZone } from "@/lib/svg-utils";

interface VisionAnalysisProps {
  facilityId: string;
  onEquipmentDetected?: (equipment: SVGEquipment[]) => void;
  onZonesDetected?: (zones: SVGZone[]) => void;
}

export function VisionAnalysis({ 
  facilityId,
  onEquipmentDetected,
  onZonesDetected
}: VisionAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<'facility' | 'equipment' | 'sketch'>('facility');
  const [imagePreview, setImagePreview] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [confidence, setConfidence] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Analyze image
  const handleAnalyze = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Extract base64 data
      const base64Data = imagePreview.split(',')[1];

      if (analysisType === 'sketch') {
        // Convert sketch to layout
        const { equipment, zones } = await visionAnalyzer.sketchToLayout(base64Data);
        
        setAnalysisResult({
          type: 'sketch',
          equipment,
          zones,
          summary: `Detected ${equipment.length} equipment items and ${zones.length} zones`
        });

        toast({
          title: "Sketch Analysis Complete",
          description: `Found ${equipment.length} equipment items and ${zones.length} zones`,
        });
      } else if (analysisType === 'equipment') {
        // Identify equipment
        const equipmentInfo = await visionAnalyzer.identifyMycologyEquipment(base64Data);
        const condition = await visionAnalyzer.analyzeEquipmentCondition(base64Data, equipmentInfo.equipmentType);
        
        setAnalysisResult({
          type: 'equipment',
          ...equipmentInfo,
          condition,
          summary: `Identified: ${equipmentInfo.equipmentType} (${condition.condition} condition)`
        });
        
        setConfidence(equipmentInfo.confidence * 100);

        toast({
          title: "Equipment Analysis Complete",
          description: equipmentInfo.equipmentType,
        });
      } else {
        // Analyze facility
        const analysis = await visionAnalyzer.analyzeImage(base64Data, 'facility');
        const optimization = await visionAnalyzer.generateOptimizationSuggestions(base64Data);
        
        setAnalysisResult({
          type: 'facility',
          ...analysis,
          optimization,
          summary: analysis.description
        });
        
        setConfidence(analysis.confidence * 100);

        toast({
          title: "Facility Analysis Complete",
          description: `Detected ${analysis.equipment.length} equipment items`,
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply detected items to canvas
  const handleApplyToCanvas = () => {
    if (!analysisResult) return;

    if (analysisResult.type === 'sketch' || analysisResult.type === 'facility') {
      if (analysisResult.equipment && onEquipmentDetected) {
        // Convert detected equipment to SVG format
        const svgEquipment: SVGEquipment[] = analysisResult.equipment.map((eq: any, index: number) => ({
          id: `vision-eq-${Date.now()}-${index}`,
          type: eq.type || 'processing',
          position: eq.position || { x: 100 + index * 50, y: 100 },
          rotation: 0,
          scale: 1,
          properties: eq.properties || { name: eq.name || `Detected ${index + 1}` }
        }));
        
        onEquipmentDetected(svgEquipment);
      }

      if (analysisResult.zones && onZonesDetected) {
        // Convert detected zones to SVG format
        const svgZones: SVGZone[] = analysisResult.zones.map((zone: any, index: number) => ({
          id: `vision-zone-${Date.now()}-${index}`,
          name: zone.name || `Zone ${index + 1}`,
          type: zone.type || 'processing',
          x: zone.bounds?.x || zone.x || 0,
          y: zone.bounds?.y || zone.y || 0,
          width: zone.bounds?.width || zone.width || 200,
          height: zone.bounds?.height || zone.height || 200,
          color: '#4CAF50'
        }));
        
        onZonesDetected(svgZones);
      }

      toast({
        title: "Applied to Canvas",
        description: "Detected items have been added to your facility design",
      });
      
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="w-4 h-4" />
          Vision Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Vision Analysis</DialogTitle>
          <DialogDescription>
            Upload an image to analyze facilities, equipment, or convert sketches to digital layouts
          </DialogDescription>
        </DialogHeader>

        <Tabs value={analysisType} onValueChange={(v) => setAnalysisType(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="facility" className="gap-2">
              <Building className="w-4 h-4" />
              Facility
            </TabsTrigger>
            <TabsTrigger value="equipment" className="gap-2">
              <Package className="w-4 h-4" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="sketch" className="gap-2">
              <FileImage className="w-4 h-4" />
              Sketch
            </TabsTrigger>
          </TabsList>

          <TabsContent value="facility" className="space-y-4">
            <Alert>
              <Building className="h-4 w-4" />
              <AlertDescription>
                Upload a photo of a mycology facility to identify equipment, zones, and get optimization suggestions.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <Alert>
              <Package className="h-4 w-4" />
              <AlertDescription>
                Upload a photo of equipment to identify type, specifications, and condition assessment.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="sketch" className="space-y-4">
            <Alert>
              <FileImage className="h-4 w-4" />
              <AlertDescription>
                Upload a hand-drawn sketch or diagram to convert it into a digital facility layout.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          {/* File input */}
          <div className="space-y-2">
            <Label htmlFor="image-file">Select Image</Label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-2"
                disabled={isAnalyzing}
              >
                <Upload className="w-4 h-4" />
                Choose Image
              </Button>
              {fileInputRef.current?.files?.[0] && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Camera className="w-4 h-4" />
                  {fileInputRef.current.files[0].name}
                </div>
              )}
            </div>
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg overflow-hidden bg-muted/50">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full max-h-64 object-contain"
                />
              </div>
            </div>
          )}

          {/* Analyze button */}
          {imagePreview && !analysisResult && (
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Analyze Image
                </>
              )}
            </Button>
          )}

          {/* Analysis results */}
          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Analysis Results
                  {confidence > 0 && (
                    <Badge variant={confidence > 70 ? "default" : "secondary"}>
                      {confidence.toFixed(0)}% Confidence
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{analysisResult.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sketch/Facility results */}
                {(analysisResult.type === 'sketch' || analysisResult.type === 'facility') && (
                  <>
                    {analysisResult.equipment?.length > 0 && (
                      <div>
                        <Label>Detected Equipment ({analysisResult.equipment.length})</Label>
                        <div className="mt-2 space-y-1">
                          {analysisResult.equipment.slice(0, 5).map((eq: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              <span>{eq.name || eq.type}</span>
                              {eq.confidence && (
                                <Badge variant="outline" className="text-xs">
                                  {(eq.confidence * 100).toFixed(0)}%
                                </Badge>
                              )}
                            </div>
                          ))}
                          {analysisResult.equipment.length > 5 && (
                            <div className="text-sm text-muted-foreground">
                              ...and {analysisResult.equipment.length - 5} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {analysisResult.zones?.length > 0 && (
                      <div>
                        <Label>Detected Zones ({analysisResult.zones.length})</Label>
                        <div className="mt-2 space-y-1">
                          {analysisResult.zones.map((zone: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-3 h-3 text-blue-500" />
                              <span>{zone.name} - {zone.purpose || zone.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysisResult.optimization && (
                      <div>
                        <Label>Optimization Metrics</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Layout Efficiency</span>
                            <Progress value={analysisResult.optimization.layoutEfficiency} className="w-32" />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Space Utilization</span>
                            <Progress value={analysisResult.optimization.spaceUtilization} className="w-32" />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Workflow Rating</span>
                            <Progress value={analysisResult.optimization.workflowRating} className="w-32" />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Equipment results */}
                {analysisResult.type === 'equipment' && (
                  <>
                    <div>
                      <Label>Equipment Type</Label>
                      <div className="mt-1 text-lg font-medium">{analysisResult.equipmentType}</div>
                    </div>

                    {analysisResult.specifications && (
                      <div>
                        <Label>Specifications</Label>
                        <div className="mt-2 space-y-1 text-sm">
                          {Object.entries(analysisResult.specifications).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground">{key}:</span>
                              <span>{Array.isArray(value) ? value.join(', ') : value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysisResult.condition && (
                      <div>
                        <Label>Condition Assessment</Label>
                        <div className="mt-2 space-y-2">
                          <Badge 
                            variant={
                              analysisResult.condition.condition === 'excellent' ? 'default' :
                              analysisResult.condition.condition === 'good' ? 'secondary' :
                              analysisResult.condition.condition === 'fair' ? 'outline' :
                              'destructive'
                            }
                          >
                            {analysisResult.condition.condition.toUpperCase()}
                          </Badge>
                          {analysisResult.condition.issues?.length > 0 && (
                            <div className="text-sm">
                              <span className="font-medium">Issues:</span>
                              <ul className="list-disc list-inside mt-1">
                                {analysisResult.condition.issues.map((issue: string, i: number) => (
                                  <li key={i}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Suggestions */}
                {analysisResult.suggestions?.length > 0 && (
                  <div>
                    <Label>Suggestions</Label>
                    <div className="mt-2 space-y-1">
                      {analysisResult.suggestions.map((suggestion: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Sparkles className="w-3 h-3 text-yellow-500 mt-0.5" />
                          <span>{typeof suggestion === 'string' ? suggestion : suggestion.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          {analysisResult && (analysisResult.type === 'sketch' || analysisResult.type === 'facility') && (
            <Button 
              onClick={handleApplyToCanvas}
              className="gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Apply to Canvas
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
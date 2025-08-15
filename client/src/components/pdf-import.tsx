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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  MapPin,
  FileSearch,
  Download
} from "lucide-react";
import { pdfProcessor } from "@/lib/pdf-processor";
import { useToast } from "@/hooks/use-toast";
import type { SVGEquipment, SVGZone } from "@/lib/svg-utils";

interface PDFImportProps {
  facilityId: string;
  onEquipmentImported?: (equipment: SVGEquipment[]) => void;
  onZonesImported?: (zones: SVGZone[]) => void;
}

export function PDFImport({ 
  facilityId,
  onEquipmentImported,
  onZonesImported
}: PDFImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [pdfResult, setPdfResult] = useState<any>(null);
  const [extractedData, setExtractedData] = useState<{
    equipment: any[];
    zones: any[];
    metadata: any;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast({
        title: "Invalid File",
        description: "Please select a PDF file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Reading PDF file...");
    setPdfResult(null);
    setExtractedData(null);

    try {
      // Process PDF
      setProcessingStep("Extracting text and images...");
      const result = await pdfProcessor.processPDF(file);
      setPdfResult(result);

      // Convert to facility design
      setProcessingStep("Analyzing facility data...");
      const facilityDesign = pdfProcessor.convertToFacilityDesign(result);
      setExtractedData(facilityDesign);

      toast({
        title: "PDF Processed Successfully",
        description: `Found ${facilityDesign.equipment.length} equipment items and ${facilityDesign.zones.length} zones`,
      });
    } catch (error) {
      console.error('PDF processing error:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process PDF file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  // Import extracted data to canvas
  const handleImport = () => {
    if (!extractedData) return;

    // Convert to SVG format and import
    if (extractedData.equipment.length > 0 && onEquipmentImported) {
      const svgEquipment: SVGEquipment[] = extractedData.equipment.map(eq => ({
        id: eq.id,
        type: eq.type,
        position: eq.position,
        rotation: 0,
        scale: 1,
        properties: eq.properties || {}
      }));
      onEquipmentImported(svgEquipment);
    }

    if (extractedData.zones.length > 0 && onZonesImported) {
      const svgZones: SVGZone[] = extractedData.zones.map(zone => ({
        id: zone.id,
        name: zone.name,
        type: zone.type,
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        color: '#4CAF50'
      }));
      onZonesImported(svgZones);
    }

    toast({
      title: "Import Complete",
      description: "PDF data has been added to your facility design",
    });

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          Import PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import PDF Blueprint</DialogTitle>
          <DialogDescription>
            Upload facility blueprints, specifications, or equipment lists in PDF format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File input */}
          <div className="space-y-2">
            <Label htmlFor="pdf-file">Select PDF File</Label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                id="pdf-file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-2"
                disabled={isProcessing}
              >
                <Upload className="w-4 h-4" />
                Choose PDF
              </Button>
              {fileInputRef.current?.files?.[0] && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  {fileInputRef.current.files[0].name}
                </div>
              )}
            </div>
          </div>

          {/* Processing indicator */}
          {isProcessing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{processingStep}</span>
                  </div>
                  <Progress value={33} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* PDF content preview */}
          {pdfResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="w-5 h-5" />
                  PDF Content Analysis
                </CardTitle>
                <CardDescription>
                  {pdfResult.pages} page(s) • {pdfResult.text.length} characters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48 w-full rounded border p-4">
                  <pre className="text-xs whitespace-pre-wrap">
                    {pdfResult.text.substring(0, 500)}...
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Extracted data preview */}
          {extractedData && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Successfully extracted facility data from PDF
                </AlertDescription>
              </Alert>

              {/* Equipment found */}
              {extractedData.equipment.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Equipment ({extractedData.equipment.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {extractedData.equipment.slice(0, 5).map((eq, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>{eq.name || eq.type}</span>
                          {eq.properties?.capacity && (
                            <span className="text-muted-foreground">
                              {eq.properties.capacity}
                            </span>
                          )}
                        </div>
                      ))}
                      {extractedData.equipment.length > 5 && (
                        <div className="text-sm text-muted-foreground">
                          ...and {extractedData.equipment.length - 5} more
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Zones found */}
              {extractedData.zones.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Zones ({extractedData.zones.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {extractedData.zones.map((zone, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>{zone.name}</span>
                          {zone.properties?.size && (
                            <span className="text-muted-foreground">
                              {zone.properties.size}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Specifications */}
              {extractedData.metadata?.specifications && (
                <Card>
                  <CardHeader>
                    <CardTitle>Facility Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(extractedData.metadata.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          {extractedData && (
            <Button 
              onClick={handleImport}
              className="gap-2"
              disabled={!extractedData.equipment.length && !extractedData.zones.length}
            >
              <Download className="w-4 h-4" />
              Import to Canvas
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
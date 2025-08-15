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
import { 
  FileUp, 
  FileDown, 
  Upload, 
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { dxfRenderer } from "@/lib/dxf-renderer";
import { useToast } from "@/hooks/use-toast";
import { useFacilityEquipment, useFacilityZones } from "@/hooks/use-facility";
import type { SVGEquipment, SVGZone } from "@/lib/svg-utils";

interface DxfImportExportProps {
  facilityId: string;
  facilityName?: string;
  onImport?: (equipment: SVGEquipment[], zones: SVGZone[]) => void;
}

export function DxfImportExport({ 
  facilityId, 
  facilityName = "Mycology Facility",
  onImport 
}: DxfImportExportProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importPreview, setImportPreview] = useState<string>("");
  const [importError, setImportError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch current facility data
  const { data: equipment = [] } = useFacilityEquipment(facilityId);
  const { data: zones = [] } = useFacilityZones(facilityId);

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.dxf')) {
      setImportError('Please select a valid DXF file');
      return;
    }

    setIsProcessing(true);
    setImportError("");

    try {
      const content = await file.text();
      
      // Parse DXF file
      const dxfData = dxfRenderer.parseDxf(content);
      
      // Convert to SVG for preview
      const svgPreview = dxfRenderer.dxfToSvg(dxfData);
      setImportPreview(svgPreview);

      toast({
        title: "DXF File Loaded",
        description: `Successfully parsed ${file.name}`,
      });
    } catch (error) {
      console.error('Error processing DXF file:', error);
      setImportError('Failed to parse DXF file. Please ensure it is a valid DXF format.');
      toast({
        title: "Import Error",
        description: "Failed to parse DXF file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle DXF import
  const handleImport = async () => {
    if (!importPreview) return;

    setIsProcessing(true);
    try {
      // Get the file content again for import
      const file = fileInputRef.current?.files?.[0];
      if (!file) return;

      const content = await file.text();
      const { equipment: importedEquipment, zones: importedZones } = dxfRenderer.importFromDxf(content);

      // Call the onImport callback if provided
      if (onImport) {
        onImport(importedEquipment, importedZones);
      }

      toast({
        title: "Import Successful",
        description: `Imported ${importedEquipment.length} equipment items and ${importedZones.length} zones`,
      });

      setIsImportOpen(false);
      setImportPreview("");
    } catch (error) {
      console.error('Error importing DXF:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import DXF data",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle DXF export
  const handleExport = () => {
    setIsProcessing(true);
    try {
      // Convert equipment to SVG format
      const svgEquipment: SVGEquipment[] = equipment.map((eq: any) => ({
        id: eq.id,
        type: eq.typeId,
        position: eq.position || { x: 100, y: 100 },
        rotation: eq.rotation || 0,
        scale: eq.scale || 1,
        properties: eq.properties || {}
      }));

      // Convert zones to SVG format
      const svgZones: SVGZone[] = zones.map((zone: any) => ({
        id: zone.id,
        name: zone.name,
        type: zone.type,
        x: zone.x || 0,
        y: zone.y || 0,
        width: zone.width || 200,
        height: zone.height || 200,
        color: zone.color || '#4CAF50'
      }));

      // Generate DXF content
      const dxfContent = dxfRenderer.exportToDxf(svgEquipment, svgZones, facilityName);

      // Create download link
      const blob = new Blob([dxfContent], { type: 'application/dxf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${facilityName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.dxf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `DXF file has been downloaded`,
      });

      setIsExportOpen(false);
    } catch (error) {
      console.error('Error exporting DXF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate DXF file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Import DXF Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FileUp className="w-4 h-4" />
            Import DXF
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import DXF File</DialogTitle>
            <DialogDescription>
              Import facility layouts from AutoCAD DXF files. Supported entities: lines, circles, arcs, polylines, and text.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File input */}
            <div className="space-y-2">
              <Label htmlFor="dxf-file">Select DXF File</Label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  id="dxf-file"
                  type="file"
                  accept=".dxf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="gap-2"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Choose File
                </Button>
                {fileInputRef.current?.files?.[0] && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    {fileInputRef.current.files[0].name}
                  </div>
                )}
              </div>
            </div>

            {/* Error message */}
            {importError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}

            {/* Preview */}
            {importPreview && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-4 bg-muted/50 max-h-96 overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: importPreview }} />
                </div>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    DXF file parsed successfully. Click Import to add the entities to your facility.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!importPreview || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export DXF Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FileDown className="w-4 h-4" />
            Export DXF
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export to DXF</DialogTitle>
            <DialogDescription>
              Export your facility design to AutoCAD DXF format for use in professional CAD software.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                The export will include:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>All equipment positions and properties</li>
                  <li>Zone boundaries and labels</li>
                  <li>Grid lines for reference</li>
                  <li>Title block with facility information</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Export Summary</Label>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equipment Items:</span>
                  <span className="font-medium">{equipment.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zones:</span>
                  <span className="font-medium">{zones.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium">AutoCAD DXF R2018</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Units:</span>
                  <span className="font-medium">Meters</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export DXF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
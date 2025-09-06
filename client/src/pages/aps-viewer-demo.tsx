import { useState } from "react";
import { ApsViewer } from "@/components/aps-viewer";
import { ApsUpload } from "@/components/aps-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ApsViewerDemo() {
  const [urn, setUrn] = useState<string | null>(null);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Autodesk Platform Services Integration</h1>
        <p className="text-muted-foreground">
          Upload and view CAD files directly in your browser using Autodesk's cloud services
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="viewer" disabled={!urn}>Viewer</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <ApsUpload
            onUploadComplete={(uploadedUrn) => {
              setUrn(uploadedUrn);
              // Auto-switch to viewer tab
              const viewerTab = document.querySelector('[value="viewer"]') as HTMLButtonElement;
              if (viewerTab) viewerTab.click();
            }}
          />
        </TabsContent>

        <TabsContent value="viewer" className="space-y-4">
          {urn ? (
            <Card>
              <CardHeader>
                <CardTitle>CAD Model Viewer</CardTitle>
                <CardDescription>
                  Interactive 3D view of your uploaded CAD file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApsViewer urn={urn} className="h-[600px]" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Please upload a CAD file first to view it here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Sample URNs for testing (if you have pre-uploaded models) */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Test Models</CardTitle>
          <CardDescription>
            Sample model URNs for testing (requires pre-uploaded models in your APS account)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => {
                // Replace with actual URN from your APS account
                const sampleUrn = "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Y3Jvd2VjYWQtbW9kZWxzL3NhbXBsZS5kd2c=";
                setUrn(sampleUrn);
                const viewerTab = document.querySelector('[value="viewer"]') as HTMLButtonElement;
                if (viewerTab) viewerTab.click();
              }}
            >
              Load Sample DWG Model
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ApsViewerDemo;
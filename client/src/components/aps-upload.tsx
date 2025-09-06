import { useState } from "react";
import { Upload, FileUp, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface ApsUploadProps {
  onUploadComplete: (urn: string) => void;
}

export function ApsUpload({ onUploadComplete }: ApsUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setProgress(20);

      // Upload file to APS
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch(`/api/aps/upload?objectName=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const uploadData = await uploadResponse.json();
      console.log("Upload successful:", uploadData);
      setProgress(50);

      // Request translation to SVF2
      setTranslating(true);
      const translateResponse = await fetch("/api/aps/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urn: uploadData.urn,
        }),
      });

      if (!translateResponse.ok) {
        const errorData = await translateResponse.json();
        throw new Error(errorData.error || "Translation failed");
      }

      const translateData = await translateResponse.json();
      console.log("Translation started:", translateData);
      setProgress(70);

      // Poll for translation completion
      await pollTranslationStatus(uploadData.urn);
      
      setProgress(100);
      setSuccess(true);
      onUploadComplete(uploadData.urn);
    } catch (err: any) {
      console.error("Upload/Translation error:", err);
      setError(err.message || "Failed to process file");
    } finally {
      setUploading(false);
      setTranslating(false);
    }
  };

  const pollTranslationStatus = async (urn: string, maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`/api/aps/manifest/${urn}`);
        if (!response.ok) {
          throw new Error("Failed to check translation status");
        }

        const manifest = await response.json();
        
        // Check if translation is complete
        if (manifest.status === "success") {
          console.log("Translation complete");
          return;
        } else if (manifest.status === "failed") {
          throw new Error("Translation failed");
        } else if (manifest.status === "timeout") {
          throw new Error("Translation timed out");
        }

        // Update progress
        setProgress(70 + (i / maxAttempts) * 25);

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        console.error("Polling error:", err);
        if (i === maxAttempts - 1) {
          throw new Error("Translation timeout - please try again");
        }
      }
    }
  };

  const supportedFormats = [
    ".dwg", ".dxf", ".rvt", ".rfa", ".ipt", ".iam", 
    ".step", ".stp", ".iges", ".igs", ".sat", 
    ".3ds", ".obj", ".stl", ".fbx", ".dae"
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Upload CAD File</CardTitle>
        <CardDescription>
          Upload your CAD file to view it in the browser. Supported formats: {supportedFormats.join(", ")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                CAD files up to 50MB
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept={supportedFormats.join(",")}
            />
          </label>
        </div>

        {/* Selected File */}
        {file && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileUp className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{file.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        )}

        {/* Progress */}
        {(uploading || translating) && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              {uploading && !translating ? "Uploading file..." : "Translating model for viewing..."}
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              File processed successfully! Loading viewer...
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || uploading || translating}
          className="w-full"
        >
          {uploading || translating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload and View
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default ApsUpload;
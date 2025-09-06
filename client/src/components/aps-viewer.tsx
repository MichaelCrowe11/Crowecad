import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

declare global {
  interface Window {
    Autodesk: any;
  }
}

interface ApsViewerProps {
  urn: string;
  className?: string;
}

export function ApsViewer({ urn, className = "" }: ApsViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const viewerInstance = useRef<any>(null);

  useEffect(() => {
    let viewer: any;
    let initialized = false;

    async function initializeViewer() {
      try {
        setLoading(true);
        setError(null);

        // Get access token from backend
        const tokenResponse = await fetch("/api/aps/token");
        if (!tokenResponse.ok) {
          throw new Error("Failed to get access token");
        }
        const tokenData = await tokenResponse.json();

        // Check if Autodesk Viewer script is loaded
        if (!window.Autodesk) {
          throw new Error("Autodesk Viewer library not loaded. Please add the script to your HTML.");
        }

        // Configure viewer options
        const options = {
          env: "AutodeskProduction",
          getAccessToken: (onTokenReady: any) => {
            onTokenReady(tokenData.access_token, tokenData.expires_in);
          },
        };

        // Initialize the viewer
        await new Promise<void>((resolve, reject) => {
          window.Autodesk.Viewing.Initializer(options, () => {
            initialized = true;
            resolve();
          }, (error: any) => {
            reject(error);
          });
        });

        // Create viewer instance
        if (viewerRef.current && initialized) {
          viewer = new window.Autodesk.Viewing.GuiViewer3D(viewerRef.current, {
            extensions: [
              'Autodesk.DocumentBrowser',
              'Autodesk.Viewing.MarkupsCore',
              'Autodesk.Viewing.MarkupsGui'
            ]
          });
          
          const startResult = viewer.start();
          if (startResult > 0) {
            console.error("Failed to start viewer");
            throw new Error("Failed to initialize viewer");
          }

          viewerInstance.current = viewer;

          // Load the document
          const documentId = `urn:${urn}`;
          window.Autodesk.Viewing.Document.load(
            documentId,
            (doc: any) => {
              // Get the default viewable (3D model)
              const viewables = doc.getRoot().getDefaultGeometry();
              if (viewables) {
                viewer.loadDocumentNode(doc, viewables).then(() => {
                  setLoading(false);
                  console.log("Model loaded successfully");
                });
              } else {
                setError("No viewable content found in the model");
                setLoading(false);
              }
            },
            (errorCode: any, errorMsg: any) => {
              console.error("Document load error:", errorCode, errorMsg);
              setError(`Failed to load document: ${errorMsg}`);
              setLoading(false);
            }
          );
        }
      } catch (err: any) {
        console.error("Viewer initialization error:", err);
        setError(err.message || "Failed to initialize viewer");
        setLoading(false);
      }
    }

    // Load Autodesk Viewer script if not already loaded
    if (!window.Autodesk) {
      const script = document.createElement("script");
      script.src = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js";
      script.async = true;
      script.onload = () => {
        initializeViewer();
      };
      script.onerror = () => {
        setError("Failed to load Autodesk Viewer library");
        setLoading(false);
      };
      document.head.appendChild(script);

      // Also load the CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css";
      document.head.appendChild(link);
    } else {
      initializeViewer();
    }

    // Cleanup
    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.finish();
        viewerInstance.current = null;
      }
      if (viewer) {
        viewer.finish();
      }
    };
  }, [urn]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (viewerInstance.current) {
        viewerInstance.current.resize();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading CAD model...</p>
          </div>
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="absolute top-4 left-4 right-4 z-20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div
        ref={viewerRef}
        className="w-full h-full min-h-[600px] bg-slate-900"
        style={{ position: 'relative' }}
      />
    </div>
  );
}

export default ApsViewer;
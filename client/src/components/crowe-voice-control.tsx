import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Camera, Upload, Brain, Zap } from "lucide-react";
import { CroweAIAgent } from "@/lib/crowe-ai-agent";
import { useToast } from "@/hooks/use-toast";

interface CroweVoiceControlProps {
  onCommandGenerated: (command: string) => void;
  onVisualAnalysis: (analysis: string) => void;
}

export function CroweVoiceControl({ onCommandGenerated, onVisualAnalysis }: CroweVoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [genetics, setGenetics] = useState({
    creativity: 0.75,
    precision: 0.8,
    adaptability: 0.7,
    efficiency: 0.85,
    curiosity: 0.9
  });
  const [memoryStats, setMemoryStats] = useState({
    shortTermSize: 0,
    longTermSize: 0,
    workingMemorySize: 0,
    episodicMemorySize: 0
  });

  const croweAgent = useRef<CroweAIAgent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Crowe AI Agent
    const initializeAgent = async () => {
      try {
        // Initialize Crowe AI Agent (API key will be handled server-side)
        croweAgent.current = new CroweAIAgent();
        updateStats();
        toast({
          title: "Crowe AI Ready",
          description: "AI Assistant initialized successfully",
        });
      } catch (error) {
        console.error('Failed to initialize Crowe Agent:', error);
        toast({
          title: "Initialization Warning",
          description: "Crowe AI Agent initialized with limited functionality. Some features may be restricted.",
          variant: "destructive"
        });
      }
    };
    
    initializeAgent();
  }, []);

  const updateStats = () => {
    if (croweAgent.current) {
      setGenetics(croweAgent.current.getGeneticProfile());
      setMemoryStats(croweAgent.current.getMemoryStats());
    }
  };

  const handleStartListening = () => {
    if (croweAgent.current) {
      try {
        croweAgent.current.startListening();
        setIsListening(true);
        toast({
          title: "Crowe is Listening",
          description: "Speak your facility design commands naturally"
        });
      } catch (error) {
        toast({
          title: "Speech Recognition Error",
          description: "Unable to start voice recognition. Please check browser permissions.",
          variant: "destructive"
        });
      }
    }
  };

  const handleStopListening = () => {
    if (croweAgent.current) {
      croweAgent.current.stopListening();
      setIsListening(false);
    }
  };

  const processVoiceCommand = async (transcript: string) => {
    if (!croweAgent.current) return;

    setIsProcessing(true);
    try {
      const command = await croweAgent.current.generateCADCommand(transcript);
      onCommandGenerated(command);
      updateStats();
      
      toast({
        title: "Command Generated",
        description: `Crowe interpreted: "${transcript.slice(0, 50)}..."`
      });
    } catch (error) {
      console.error('Command processing error:', error);
      toast({
        title: "Processing Error", 
        description: "Crowe couldn't process that command. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !croweAgent.current) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const imageData = base64Data.split(',')[1]; // Remove data:image/jpeg;base64, prefix

        const visualInput = await croweAgent.current!.processVisualInput(imageData, 'uploaded');
        
        if (visualInput.analysis) {
          onVisualAnalysis(visualInput.analysis);
          
          // Generate CAD command from visual analysis
          const command = await croweAgent.current!.generateCADCommand(visualInput);
          onCommandGenerated(command);
        }

        updateStats();
        
        toast({
          title: "Visual Analysis Complete",
          description: "Crowe has analyzed the image and generated facility commands"
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image processing error:', error);
      toast({
        title: "Image Analysis Error",
        description: "Crowe couldn't analyze the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.addEventListener('loadedmetadata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
        
        // Process the captured image
        if (croweAgent.current) {
          setIsProcessing(true);
          croweAgent.current.processVisualInput(imageData, 'camera').then(visualInput => {
            if (visualInput.analysis) {
              onVisualAnalysis(visualInput.analysis);
              return croweAgent.current!.generateCADCommand(visualInput);
            }
            return null;
          }).then(command => {
            if (command) {
              onCommandGenerated(command);
            }
            updateStats();
            setIsProcessing(false);
          });
        }
      });
    } catch (error) {
      toast({
        title: "Camera Access Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Crowe AI Status */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-white text-sm">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span>Crowe Logic AI Agent</span>
            <Badge variant={isListening ? "default" : "secondary"} className="ml-auto">
              {isListening ? "LISTENING" : "READY"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Genetic Traits */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-gray-300">
                <span>Creativity</span>
                <span>{(genetics.creativity * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-purple-500 h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${genetics.creativity * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-gray-300">
                <span>Precision</span>
                <span>{(genetics.precision * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${genetics.precision * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-gray-300">
                <span>Adaptability</span>
                <span>{(genetics.adaptability * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${genetics.adaptability * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-gray-300">
                <span>Efficiency</span>
                <span>{(genetics.efficiency * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-yellow-500 h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${genetics.efficiency * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Memory Stats */}
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Working Memory:</span>
              <span>{memoryStats.workingMemorySize} items</span>
            </div>
            <div className="flex justify-between">
              <span>Visual Memory:</span>
              <span>{memoryStats.episodicMemorySize} experiences</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Control */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm">Voice Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex space-x-2">
            <Button
              onClick={isListening ? handleStopListening : handleStartListening}
              disabled={isProcessing}
              className={`flex-1 ${isListening 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
              data-testid="button-voice-toggle"
            >
              {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
              {isListening ? 'Stop' : 'Listen'}
            </Button>
          </div>
          
          {transcript && (
            <div className="p-2 bg-gray-700 rounded text-xs text-gray-300">
              <strong>Last heard:</strong> {transcript}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visual Input */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm">Visual Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex space-x-2">
            <Button
              onClick={handleCameraCapture}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid="button-camera-capture"
            >
              <Camera className="w-4 h-4 mr-2" />
              Capture
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              data-testid="button-upload-image"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {isProcessing && (
            <div className="flex items-center justify-center p-4 text-gray-400">
              <Zap className="w-4 h-4 mr-2 animate-pulse" />
              <span className="text-xs">Crowe is analyzing...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CroweVoiceControl;
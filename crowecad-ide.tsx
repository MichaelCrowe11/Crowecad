/**
 * CroweCad IDE Interface
 * Revolutionary CAD IDE with integrated chat, natural language design, and multi-industry support
 * Inspired by Replit's interface and the best CAD tools
 */

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Code,
  FileText,
  Box,
  Settings,
  Download,
  Upload,
  Play,
  Pause,
  RotateCw,
  Layers,
  Grid3x3,
  Cpu,
  Sparkles,
  Globe,
  Building,
  Car,
  Plane,
  Heart,
  Package,
  Gem,
  Anchor,
  Zap,
  ChevronRight,
  Terminal,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  X,
  Search,
  Filter,
  Share2,
  Users,
  Bot,
  Mic,
  Paperclip,
  Image,
  File,
  Hash,
  AtSign,
  HelpCircle
} from "lucide-react";
import { croweCadCore, INDUSTRIES, type ChatMessage, type IndustryProfile } from "@/lib/crowecad-core";
import { CroweCADInterface } from "./crowe-cad-interface";
import { CollaborationPanel } from "./collaboration-panel";
import { CommandPalette } from "./command-palette";
import { ProfessionalToolbar } from "./professional-toolbar";
import { useToast } from "@/hooks/use-toast";

interface CroweCadIDEProps {
  projectId?: string;
  onClose?: () => void;
}

// Industry icons mapping
const INDUSTRY_ICONS: Record<string, any> = {
  mechanical: Cpu,
  architecture: Building,
  electronics: Cpu,
  automotive: Car,
  aerospace: Plane,
  medical: Heart,
  consumer: Package,
  jewelry: Gem,
  marine: Anchor,
  energy: Zap
};

export function CroweCadIDE({ projectId, onClose }: CroweCadIDEProps) {
  const userName = "User";
  const userAvatar = "";
  const [selectedIndustry, setSelectedIndustry] = useState<string>('mechanical');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to CroweCad! I\'m your AI CAD assistant. Describe what you want to design in natural language, or upload a sketch.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCADView, setShowCADView] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [activeWorkbench, setActiveWorkbench] = useState('design');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeTool, setActiveTool] = useState('select');
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleAction('save');
      }
      // Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleAction('undo');
      }
      // Redo
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleAction('redo');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle actions from toolbar and command palette
  const handleAction = (action: string, data?: any) => {
    console.log('Action:', action, data);
    // Implement action handlers
    switch (action) {
      case 'save':
        toast({ title: "Saved", description: "Project saved successfully" });
        break;
      case 'undo':
        toast({ title: "Undo", description: "Action undone" });
        break;
      case 'redo':
        toast({ title: "Redo", description: "Action redone" });
        break;
      case 'ai-generate':
        setInputMessage("Generate a ");
        break;
      default:
        console.log('Unhandled action:', action);
    }
  };

  // Handle industry change
  const handleIndustryChange = (industry: string) => {
    setSelectedIndustry(industry);
    croweCadCore.switchIndustry(industry);
    
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'system',
      content: `Switched to ${INDUSTRIES[industry].name} industry. Available templates: ${INDUSTRIES[industry].templates.join(', ')}`,
      timestamp: new Date()
    }]);
  };

  // Handle chat message send
  const handleSendMessage = async () => {
    if (!inputMessage.trim() && attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      attachments: attachments.map(file => ({
        type: (file.type.startsWith('image/') ? 'image' : 'file') as 'model' | 'image' | 'sketch' | 'code' | 'file',
        data: file
      })),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setAttachments([]);
    setIsProcessing(true);

    try {
      // Process with natural language CAD
      if (inputMessage.toLowerCase().includes('create') || 
          inputMessage.toLowerCase().includes('design') ||
          inputMessage.toLowerCase().includes('make')) {
        
        const model = await croweCadCore.generateFromText({
          prompt: inputMessage,
          industry: selectedIndustry,
          outputFormat: 'STEP'
        });

        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'assistant',
          content: `I've created a ${model.type} model based on your description. The model has been added to your workspace.`,
          attachments: [{
            type: 'model',
            data: model
          }],
          timestamp: new Date()
        }]);

        toast({
          title: "Model Generated",
          description: `Successfully created ${model.name}`,
        });
      } else {
        // Regular chat response
        const response = await croweCadCore.handleChatMessage(userMessage);
        setChatMessages(prev => [...prev, response]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'I encountered an error processing your request. Please try rephrasing or provide more details.',
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle voice input
  const toggleVoiceInput = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      // Start voice recognition
      toast({
        title: "Voice Input Active",
        description: "Start speaking your design requirements",
      });
    }
  };

  // Handle file attachment
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  // Example prompts for quick start
  const examplePrompts = [
    "Create a gear with 20 teeth, 50mm diameter",
    "Design a phone stand that can hold at 45 degrees",
    "Make a bracket with 4 mounting holes, 100x50mm",
    "Generate a enclosure box 200x150x80mm with ventilation slots",
    "Build a turbine blade with NACA 4412 airfoil profile"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Command Palette */}
      <CommandPalette 
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        onCommand={handleAction}
      />

      {/* Header Bar */}
      <div className="h-14 border-b bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">
            CroweCad IDE
          </h1>
          
          {/* Industry Selector */}
          <Select value={selectedIndustry} onValueChange={handleIndustryChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(INDUSTRIES).map(([key, industry]) => {
                const Icon = INDUSTRY_ICONS[key];
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{industry.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Workbench Tabs */}
          <Tabs value={activeWorkbench} onValueChange={setActiveWorkbench}>
            <TabsList>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="assembly">Assembly</TabsTrigger>
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
              <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowChat(!showChat)}>
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowCollaboration(!showCollaboration)}>
            <Users className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowCADView(!showCADView)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Professional Toolbar */}
      <ProfessionalToolbar 
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onAction={handleAction}
      />

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Collaboration Panel */}
        {showCollaboration && (
          <>
            <ResizablePanel defaultSize={20} minSize={15}>
              <CollaborationPanel
                projectId={projectId || 'default'}
                userName={userName}
                userAvatar={userAvatar}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}
        
        {/* CAD View Panel */}
        {showCADView && (
          <>
            <ResizablePanel defaultSize={showChat ? (showCollaboration ? 50 : 70) : (showCollaboration ? 80 : 100)} minSize={30}>
              <div className="h-full bg-[#1a1a1a]">
                <CroweCADInterface
                  facilityId={projectId || 'default'}
                  onDesignComplete={(design) => {
                    toast({
                      title: "Design Saved",
                      description: "Your CAD design has been saved",
                    });
                  }}
                />
              </div>
            </ResizablePanel>
            {showChat && <ResizableHandle withHandle />}
          </>
        )}

        {/* Chat Panel */}
        {showChat && (
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full flex flex-col bg-card">
              {/* Chat Header */}
              <div className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Crowe AI Assistant</span>
                    <Badge variant="outline" className="text-xs">
                      Claude 4.0
                    </Badge>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500">
                    Online
                  </Badge>
                </div>
              </div>

              {/* Example Prompts (shown when chat is empty) */}
              {chatMessages.length <= 1 && (
                <div className="p-4 border-b">
                  <p className="text-sm text-muted-foreground mb-2">Try these examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((prompt, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setInputMessage(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {chatMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex gap-3 ${
                          msg.type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.type !== 'user' && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : msg.type === 'system'
                              ? 'bg-muted'
                              : 'bg-secondary'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msg.attachments.map((att, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs opacity-80">
                                  {att.type === 'model' && <Box className="w-3 h-3" />}
                                  {att.type === 'image' && <Image className="w-3 h-3" />}
                                  {att.type === 'file' && <File className="w-3 h-3" />}
                                  <span>Attachment</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <span className="text-xs opacity-60 mt-1 block">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {msg.type === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            U
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div className="bg-secondary rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="p-2 border-t border-b bg-muted/50">
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, i) => (
                      <div key={i} className="flex items-center gap-1 bg-background rounded px-2 py-1">
                        <Paperclip className="w-3 h-3" />
                        <span className="text-xs truncate max-w-[100px]">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-4 h-4 p-0"
                          onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileAttach}
                    accept="image/*,.pdf,.dxf,.dwg,.step,.stp,.iges,.igs"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={isVoiceActive ? "default" : "ghost"}
                    size="icon"
                    onClick={toggleVoiceInput}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Input
                    placeholder="Describe what you want to design..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isProcessing || (!inputMessage.trim() && attachments.length === 0)}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <button className="hover:text-foreground flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Commands
                  </button>
                  <button className="hover:text-foreground flex items-center gap-1">
                    <AtSign className="w-3 h-3" />
                    Mention
                  </button>
                  <button className="hover:text-foreground flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Help
                  </button>
                </div>
              </div>
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>

      {/* Status Bar */}
      <div className="h-6 border-t bg-card px-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Industry: {INDUSTRIES[selectedIndustry].name}</span>
          <span>•</span>
          <span>Workbench: {activeWorkbench}</span>
          <span>•</span>
          <span>Units: {INDUSTRIES[selectedIndustry].constraints.units || 'mm'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            AI Ready
          </span>
          <span>GPU Accelerated</span>
          <span>v2.0.0</span>
        </div>
      </div>
    </div>
  );
}
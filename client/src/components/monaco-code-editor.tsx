import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Code2, 
  Play, 
  Sparkles,
  FileCode,
  Zap,
  Languages,
  Bot,
  Terminal,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cursorAssistant } from '@/lib/cursor-cad-assistant';

interface CodeGenerationStream {
  id: string;
  language: string;
  code: string;
  isStreaming: boolean;
  timestamp: Date;
}

export function MonacoCodeEditor() {
  const [code, setCode] = useState('// Welcome to CroweCad AI Code Studio\n// Start typing or use AI to generate code...\n\n');
  const [language, setLanguage] = useState('javascript');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [streamedCode, setStreamedCode] = useState('');
  const [generationHistory, setGenerationHistory] = useState<CodeGenerationStream[]>([]);
  const [copied, setCopied] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const { toast } = useToast();

  // Monaco editor themes
  const defineThemes = (monaco: Monaco) => {
    monaco.editor.defineTheme('crowecad-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'function', foreground: 'DCDCAA' },
      ],
      colors: {
        'editor.background': '#020817',
        'editor.foreground': '#E0E0E0',
        'editor.lineHighlightBackground': '#1E293B',
        'editor.selectionBackground': '#334155',
        'editorCursor.foreground': '#3B82F6',
        'editorLineNumber.foreground': '#64748B',
        'editorLineNumber.activeForeground': '#CBD5E1',
        'editor.inactiveSelectionBackground': '#1E293B',
      }
    });
  };

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    defineThemes(monaco);
    monaco.editor.setTheme('crowecad-dark');
    
    // Register completion provider for all languages
    monaco.languages.registerCompletionItemProvider('*', {
      provideCompletionItems: async (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        // Get AI-powered suggestions
        const suggestions = await cursorAssistant.getCodeSuggestions(
          model.getValue(),
          language,
          { line: position.lineNumber, column: position.column }
        );

        return {
          suggestions: suggestions.map((suggestion, index) => ({
            label: suggestion,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: suggestion,
            range: range,
            detail: 'AI suggestion',
            sortText: String(index).padStart(2, '0')
          }))
        };
      }
    });
  };

  // Simulate streaming code generation
  const streamCodeGeneration = async (prompt: string) => {
    setIsGenerating(true);
    setStreamedCode('');
    
    const generationId = Date.now().toString();
    const stream: CodeGenerationStream = {
      id: generationId,
      language: language,
      code: '',
      isStreaming: true,
      timestamp: new Date()
    };
    
    setGenerationHistory(prev => [stream, ...prev]);

    try {
      // Generate code using the assistant
      const generatedCode = await cursorAssistant.generateFromDescription(prompt, language);
      
      // Simulate streaming effect
      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < generatedCode.length) {
          const chunk = generatedCode.slice(currentIndex, currentIndex + 50);
          setStreamedCode(prev => prev + chunk);
          
          // Update history
          setGenerationHistory(prev => 
            prev.map(h => h.id === generationId 
              ? { ...h, code: streamedCode + chunk }
              : h
            )
          );
          
          currentIndex += 50;
        } else {
          clearInterval(streamInterval);
          setIsGenerating(false);
          
          // Mark streaming as complete
          setGenerationHistory(prev => 
            prev.map(h => h.id === generationId 
              ? { ...h, isStreaming: false, code: generatedCode }
              : h
            )
          );
          
          toast({
            title: "Code Generated",
            description: "AI has generated your code successfully.",
          });
        }
      }, 50);
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Unable to generate code. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Apply generated code to editor
  const applyGeneratedCode = () => {
    if (editorRef.current && streamedCode) {
      const currentCode = editorRef.current.getValue();
      const position = editorRef.current.getPosition();
      
      if (position) {
        const model = editorRef.current.getModel();
        if (model) {
          const lineContent = model.getLineContent(position.lineNumber);
          const newCode = currentCode.substring(0, model.getOffsetAt(position)) + 
                         '\n' + streamedCode + '\n' + 
                         currentCode.substring(model.getOffsetAt(position));
          
          editorRef.current.setValue(newCode);
          setCode(newCode);
          setStreamedCode('');
          
          toast({
            title: "Code Applied",
            description: "Generated code has been inserted into the editor.",
          });
        }
      }
    }
  };

  // Copy code to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Code copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy code to clipboard.",
        variant: "destructive"
      });
    }
  };

  // Optimize code
  const optimizeCode = async () => {
    try {
      const optimized = await cursorAssistant.optimizeScript(code, language);
      setCode(optimized);
      if (editorRef.current) {
        editorRef.current.setValue(optimized);
      }
      toast({
        title: "Code Optimized",
        description: "Your code has been optimized for better performance.",
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Unable to optimize the code.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Code2 className="w-5 h-5 text-blue-400" />
              AI Code Studio
              <Badge variant="outline" className="ml-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 text-blue-400">
                <Bot className="w-3 h-3 mr-1" />
                Powered by {selectedModel}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-100"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="rust">Rust</option>
                <option value="go">Go</option>
                <option value="csharp">C#</option>
              </select>
              
              <Button
                onClick={copyToClipboard}
                size="sm"
                variant="outline"
                className="bg-slate-800 border-slate-700 hover:bg-slate-700"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={optimizeCode}
                size="sm"
                variant="outline"
                className="bg-slate-800 border-slate-700 hover:bg-slate-700"
              >
                <Zap className="w-4 h-4 mr-1" />
                Optimize
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-3 gap-4">
        {/* Monaco Editor */}
        <div className="col-span-2">
          <Card className="h-full overflow-hidden border-slate-800 bg-slate-950">
            <CardContent className="p-0 h-full">
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                  fontLigatures: true,
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  renderWhitespace: 'selection',
                  bracketPairColorization: { enabled: true },
                  formatOnPaste: true,
                  formatOnType: true,
                  automaticLayout: true,
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: {
                    other: true,
                    comments: false,
                    strings: true
                  },
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  glyphMargin: true,
                  folding: true,
                  lineDecorationsWidth: 0,
                  lineNumbersMinChars: 4,
                  renderLineHighlight: 'all',
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* AI Panel */}
        <Card className="overflow-hidden border-slate-800 bg-slate-900/50">
          <CardContent className="p-0">
            <Tabs defaultValue="generate" className="h-full">
              <TabsList className="w-full rounded-none bg-slate-800">
                <TabsTrigger value="generate" className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  <Terminal className="w-4 h-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>
              
              <div className="p-4">
                <TabsContent value="generate" className="mt-0 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-slate-100">
                      Describe what you want to build
                    </label>
                    <textarea
                      id="ai-prompt"
                      className="w-full h-[120px] p-3 text-sm bg-slate-950 border border-slate-800 rounded-md resize-none text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="E.g., Create a REST API endpoint that handles user authentication with JWT tokens..."
                    />
                  </div>
                  
                  <Button
                    onClick={() => {
                      const prompt = (document.getElementById('ai-prompt') as HTMLTextAreaElement)?.value;
                      if (prompt) {
                        streamCodeGeneration(prompt);
                      }
                    }}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Code
                      </>
                    )}
                  </Button>
                  
                  {streamedCode && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-100">Generated Code</h4>
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                          Live Stream
                        </Badge>
                      </div>
                      <div className="relative">
                        <pre className="p-3 bg-slate-950 border border-slate-800 rounded-md overflow-auto max-h-[300px] text-xs">
                          <code className="text-slate-100">{streamedCode}</code>
                        </pre>
                        {!isGenerating && (
                          <Button
                            onClick={applyGeneratedCode}
                            size="sm"
                            className="mt-2 w-full"
                          >
                            Apply to Editor
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="history" className="mt-0">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {generationHistory.map((item) => (
                        <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {item.language}
                            </Badge>
                            {item.isStreaming ? (
                              <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                                Streaming...
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-500">
                                {item.timestamp.toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                          <pre className="text-xs overflow-auto max-h-[100px]">
                            <code className="text-slate-400">
                              {item.code.substring(0, 200)}...
                            </code>
                          </pre>
                        </div>
                      ))}
                      {generationHistory.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No generation history yet</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
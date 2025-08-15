import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Code2, 
  Play, 
  AlertCircle, 
  CheckCircle, 
  Zap, 
  Languages, 
  Sparkles,
  FileCode,
  Bug,
  Gauge
} from 'lucide-react';
import { cursorAssistant } from '@/lib/cursor-cad-assistant';
import { useToast } from '@/hooks/use-toast';

interface ScriptError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface Suggestion {
  line: number;
  suggestion: string;
  code: string;
}

export function CADScriptEditor() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('openscad');
  const [errors, setErrors] = useState<ScriptError[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('python-freecad');
  const [translatedCode, setTranslatedCode] = useState('');
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 0 });
  const [performance, setPerformance] = useState<any>(null);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Supported CAD languages
  const languages = [
    { value: 'openscad', label: 'OpenSCAD', icon: '🔷' },
    { value: 'autolisp', label: 'AutoLISP', icon: '🔵' },
    { value: 'python-freecad', label: 'Python (FreeCAD)', icon: '🐍' },
    { value: 'jscad', label: 'JavaScript CAD', icon: '📦' },
    { value: 'gcode', label: 'G-Code', icon: '⚙️' }
  ];

  // Get autocomplete suggestions as user types
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (code.length > 2) {
        const suggestions = await cursorAssistant.getCodeSuggestions(
          code,
          language,
          cursorPosition
        );
        setAutocompleteSuggestions(suggestions);
        setShowAutocomplete(suggestions.length > 0);
      } else {
        setShowAutocomplete(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [code, language, cursorPosition]);

  // Analyze script for errors and suggestions
  const analyzeScript = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await cursorAssistant.analyzeScript(code, language);
      setErrors(analysis.errors);
      setSuggestions(analysis.suggestions);
      setPerformance(analysis.performance);
      
      if (analysis.errors.length === 0) {
        toast({
          title: "Analysis Complete",
          description: "No errors found! Your script looks good.",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Found ${analysis.errors.length} issue(s) in your script.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the script. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-fix errors
  const autoFixErrors = async () => {
    try {
      const fixedCode = await cursorAssistant.autoFixErrors(code, language);
      setCode(fixedCode);
      toast({
        title: "Errors Fixed",
        description: "Automatic fixes have been applied to your script.",
      });
      // Re-analyze after fixing
      analyzeScript();
    } catch (error) {
      toast({
        title: "Auto-fix Failed",
        description: "Unable to automatically fix errors.",
        variant: "destructive"
      });
    }
  };

  // Optimize script
  const optimizeScript = async () => {
    try {
      const optimizedCode = await cursorAssistant.optimizeScript(code, language);
      setCode(optimizedCode);
      toast({
        title: "Script Optimized",
        description: "Performance optimizations have been applied.",
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Unable to optimize the script.",
        variant: "destructive"
      });
    }
  };

  // Translate script between languages
  const translateScript = async () => {
    if (language === targetLanguage) {
      toast({
        title: "Invalid Translation",
        description: "Source and target languages must be different.",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    try {
      const result = await cursorAssistant.translateScript(code, language, targetLanguage);
      if (result.success) {
        setTranslatedCode(result.targetCode);
        toast({
          title: "Translation Complete",
          description: `Successfully translated from ${language} to ${targetLanguage}.`,
        });
      } else {
        toast({
          title: "Translation Failed",
          description: result.warnings.join(', '),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Translation Error",
        description: "Unable to translate the script.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // Generate script from description
  const generateFromDescription = async (description: string) => {
    try {
      const generatedCode = await cursorAssistant.generateFromDescription(description, language);
      setCode(generatedCode);
      toast({
        title: "Script Generated",
        description: "CAD script has been generated from your description.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate script from description.",
        variant: "destructive"
      });
    }
  };

  // Handle cursor position changes
  const handleCursorChange = useCallback(() => {
    if (editorRef.current) {
      const textarea = editorRef.current;
      const text = textarea.value;
      const selectionStart = textarea.selectionStart;
      
      // Calculate line and column
      const lines = text.substring(0, selectionStart).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length;
      
      setCursorPosition({ line, column });
    }
  }, []);

  // Apply autocomplete suggestion
  const applySuggestion = (suggestion: string) => {
    const lines = code.split('\n');
    const currentLine = lines[cursorPosition.line - 1] || '';
    const beforeCursor = currentLine.substring(0, cursorPosition.column);
    const afterCursor = currentLine.substring(cursorPosition.column);
    
    lines[cursorPosition.line - 1] = beforeCursor + suggestion + afterCursor;
    setCode(lines.join('\n'));
    setShowAutocomplete(false);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header Controls */}
      <Card className="border-0 shadow-none bg-background/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              CAD Script Assistant
              <Badge variant="outline" className="ml-2">
                Powered by Cursor AI
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <span className="flex items-center gap-2">
                        <span>{lang.icon}</span>
                        {lang.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                onClick={analyzeScript}
                disabled={!code || isAnalyzing}
                size="sm"
                variant="outline"
              >
                <Bug className="w-4 h-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
              
              <Button
                onClick={optimizeScript}
                disabled={!code}
                size="sm"
                variant="outline"
              >
                <Zap className="w-4 h-4 mr-2" />
                Optimize
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Code Editor */}
        <Card className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Script Editor</h3>
              {errors.length > 0 && (
                <Button
                  onClick={autoFixErrors}
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Auto-fix
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="relative">
              <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyUp={handleCursorChange}
                onClick={handleCursorChange}
                className="w-full h-[400px] p-3 font-mono text-sm bg-background border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={`// Enter your ${language} code here...\n// Press Tab for autocomplete suggestions`}
                spellCheck={false}
              />
              
              {/* Autocomplete dropdown */}
              {showAutocomplete && (
                <div className="absolute z-10 bg-popover border rounded-md shadow-lg p-1 min-w-[200px]"
                     style={{
                       top: `${(cursorPosition.line * 20) + 20}px`,
                       left: `${Math.min(cursorPosition.column * 8, 400)}px`
                     }}>
                  {autocompleteSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => applySuggestion(suggestion)}
                      className="block w-full text-left px-2 py-1 text-sm hover:bg-accent rounded"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Error indicators */}
            {errors.length > 0 && (
              <div className="mt-2 space-y-1">
                {errors.slice(0, 3).map((error, idx) => (
                  <Alert key={idx} variant={error.severity === 'error' ? 'destructive' : 'default'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Line {error.line}: {error.message}
                    </AlertDescription>
                  </Alert>
                ))}
                {errors.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{errors.length - 3} more issues...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis & Translation Panel */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="analysis" className="h-full">
              <TabsList className="w-full rounded-none">
                <TabsTrigger value="analysis" className="flex-1">
                  <Gauge className="w-4 h-4 mr-2" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="translate" className="flex-1">
                  <Languages className="w-4 h-4 mr-2" />
                  Translate
                </TabsTrigger>
                <TabsTrigger value="generate" className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </TabsTrigger>
              </TabsList>
              
              <div className="p-4">
                <TabsContent value="analysis" className="mt-0 space-y-4">
                  {performance && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Performance Metrics</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-muted rounded">
                            <p className="text-xs text-muted-foreground">Complexity</p>
                            <p className="font-medium capitalize">{performance.complexity}</p>
                          </div>
                          <div className="p-2 bg-muted rounded">
                            <p className="text-xs text-muted-foreground">Est. Time</p>
                            <p className="font-medium">{performance.estimatedTime}ms</p>
                          </div>
                        </div>
                      </div>
                      
                      {performance.optimizations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Optimization Suggestions</h4>
                          <ScrollArea className="h-[200px]">
                            <ul className="space-y-1">
                              {performance.optimizations.map((opt: string, idx: number) => (
                                <li key={idx} className="text-sm flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                  <span>{opt}</span>
                                </li>
                              ))}
                            </ul>
                          </ScrollArea>
                        </div>
                      )}
                    </>
                  )}
                  
                  {suggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Suggestions</h4>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {suggestions.map((sugg, idx) => (
                            <div key={idx} className="p-2 bg-muted rounded">
                              <p className="text-xs text-muted-foreground">Line {sugg.line}</p>
                              <p className="text-sm">{sugg.suggestion}</p>
                              {sugg.code && (
                                <code className="text-xs bg-background px-1 py-0.5 rounded">
                                  {sugg.code}
                                </code>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                  
                  {!performance && !suggestions.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Click "Analyze" to check your script</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="translate" className="mt-0 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Language</label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages
                          .filter(lang => lang.value !== language)
                          .map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>
                              <span className="flex items-center gap-2">
                                <span>{lang.icon}</span>
                                {lang.label}
                              </span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    onClick={translateScript}
                    disabled={!code || isTranslating}
                    className="w-full"
                  >
                    {isTranslating ? 'Translating...' : 'Translate Script'}
                  </Button>
                  
                  {translatedCode && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Translated Code</h4>
                      <textarea
                        value={translatedCode}
                        readOnly
                        className="w-full h-[300px] p-3 font-mono text-sm bg-background border rounded-md resize-none"
                      />
                      <Button
                        onClick={() => {
                          setCode(translatedCode);
                          setLanguage(targetLanguage);
                          setTranslatedCode('');
                          toast({
                            title: "Code Replaced",
                            description: "Translated code is now in the editor.",
                          });
                        }}
                        size="sm"
                        className="mt-2"
                      >
                        Use This Code
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="generate" className="mt-0 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Describe what you want to create
                    </label>
                    <textarea
                      id="description"
                      className="w-full h-[100px] p-3 text-sm bg-background border rounded-md resize-none"
                      placeholder="e.g., Create a parametric gear with 20 teeth, 50mm diameter..."
                    />
                  </div>
                  
                  <Button
                    onClick={() => {
                      const description = (document.getElementById('description') as HTMLTextAreaElement)?.value;
                      if (description) {
                        generateFromDescription(description);
                      }
                    }}
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Script
                  </Button>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Example prompts:</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => generateFromDescription('Create a parametric box with rounded corners')}
                        className="text-xs text-left hover:text-primary"
                      >
                        • Parametric box with rounded corners
                      </button>
                      <button
                        onClick={() => generateFromDescription('Generate a helical spring with 10 coils')}
                        className="text-xs text-left hover:text-primary"
                      >
                        • Helical spring with 10 coils
                      </button>
                      <button
                        onClick={() => generateFromDescription('Create interlocking gears')}
                        className="text-xs text-left hover:text-primary"
                      >
                        • Interlocking gear system
                      </button>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, HelpCircle, Terminal } from "lucide-react";
import { parseCommand, getCommandSuggestions, type CommandSuggestion } from "@/lib/command-parser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CommandInterfaceProps {
  projectId: string;
  onCommandExecuted?: (command: string, result: any) => void;
}

export function CommandInterface({ projectId, onCommandExecuted }: CommandInterfaceProps) {
  const [command, setCommand] = useState("");
  const [suggestions, setSuggestions] = useState<CommandSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const executeCommand = useMutation({
    mutationFn: async (commandText: string) => {
      const response = await apiRequest('POST', '/api/commands', {
        projectId,
        command: commandText,
      });
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Command Executed",
        description: "Command processed successfully",
      });
      setCommand("");
      onCommandExecuted?.(command, result);
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
    },
    onError: (error: any) => {
      toast({
        title: "Command Failed",
        description: error.message || "Failed to execute command",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const newSuggestions = getCommandSuggestions(command);
    setSuggestions(newSuggestions);
    setSelectedSuggestion(0);
  }, [command]);

  const handleInputChange = (value: string) => {
    setCommand(value);
    setShowSuggestions(value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showSuggestions && suggestions.length > 0) {
        setCommand(suggestions[selectedSuggestion].example);
        setShowSuggestions(false);
      } else {
        handleExecuteCommand();
      }
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestion((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestion((prev) => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleExecuteCommand = () => {
    if (!command.trim()) return;

    const parsed = parseCommand(command);
    if (!parsed.isValid) {
      toast({
        title: "Invalid Command",
        description: parsed.error,
        variant: "destructive",
      });
      return;
    }

    executeCommand.mutate(command);
  };

  const selectSuggestion = (suggestion: CommandSuggestion) => {
    setCommand(suggestion.example);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const parsedCommand = parseCommand(command);

  return (
    <div className="sidebar-section command-interface p-4 border-b border-gray-600">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
          <Play className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">Command Console</h3>
          <p className="text-xs text-gray-400">Natural language facility control</p>
        </div>
      </div>
      
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(command.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full px-4 py-2 bg-gray-900 text-green-400 font-mono text-sm rounded-lg border-2 border-gray-700 focus:border-green-500 transition-colors"
            placeholder="$ create bioreactor --type=stirred --capacity=500L"
            data-testid="command-input"
          />
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleExecuteCommand}
            disabled={executeCommand.isPending || !command.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-300 p-1 h-auto hover:bg-green-400/10 rounded"
            data-testid="button-execute-command"
          >
            <Play className="w-3 h-3" />
          </Button>
        </div>

        {/* Command Validation */}
        {command && (
          <div className="mt-2 flex items-center gap-2">
            <Badge 
              variant={parsedCommand.isValid ? "default" : "destructive"}
              className="text-xs"
            >
              {parsedCommand.isValid ? "Valid" : "Invalid"}
            </Badge>
            {parsedCommand.error && (
              <span className="text-xs text-red-500">{parsedCommand.error}</span>
            )}
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <ScrollArea className="max-h-60">
              <div className="p-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      index === selectedSuggestion 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-gray-100'
                    }`}
                    data-testid={`suggestion-${index}`}
                  >
                    <div className="font-mono text-sm font-medium">
                      {suggestion.command}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {suggestion.description}
                    </div>
                    <div className="text-xs font-mono text-green-600 mt-1">
                      {suggestion.example}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Type commands to generate facility components.{" "}
        <button className="text-primary hover:underline inline-flex items-center gap-1">
          <HelpCircle className="w-3 h-3" />
          View syntax guide
        </button>
      </div>
    </div>
  );
}

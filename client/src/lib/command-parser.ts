export interface ParsedCommand {
  action: string;
  target: string;
  parameters: Record<string, any>;
  isValid: boolean;
  error?: string;
}

export interface CommandSuggestion {
  command: string;
  description: string;
  example: string;
}

export const COMMAND_SUGGESTIONS: CommandSuggestion[] = [
  {
    command: "create bioreactor",
    description: "Create a new bioreactor",
    example: "create bioreactor --type=stirred --capacity=500L"
  },
  {
    command: "create zone",
    description: "Create a new facility zone",
    example: "create zone --name=cultivation --width=300 --height=200"
  },
  {
    command: "place equipment",
    description: "Place equipment at specific coordinates",
    example: "place equipment --id=bio-001 --x=100 --y=150"
  },
  {
    command: "connect",
    description: "Connect two pieces of equipment",
    example: "connect --from=bio-001 --to=proc-001"
  },
  {
    command: "set property",
    description: "Set equipment property",
    example: "set property --id=bio-001 --capacity=750L"
  }
];

export function parseCommand(command: string): ParsedCommand {
  const trimmed = command.trim();
  if (!trimmed) {
    return { action: '', target: '', parameters: {}, isValid: false, error: 'Empty command' };
  }

  try {
    // Split command into parts
    const parts = trimmed.split(' ');
    if (parts.length < 2) {
      return { 
        action: parts[0] || '', 
        target: '', 
        parameters: {}, 
        isValid: false, 
        error: 'Command must have at least action and target' 
      };
    }

    const action = parts[0].toLowerCase();
    const target = parts[1].toLowerCase();
    
    // Parse parameters (--key=value format)
    const parameters: Record<string, any> = {};
    for (let i = 2; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('--')) {
        const [key, ...valueParts] = part.substring(2).split('=');
        const value = valueParts.join('=');
        
        if (key && value) {
          // Try to parse as number if it looks like one
          if (/^\d+(\.\d+)?[A-Za-z]*$/.test(value)) {
            const numMatch = value.match(/^(\d+(?:\.\d+)?)([A-Za-z]*)$/);
            if (numMatch) {
              const [, numPart, unit] = numMatch;
              parameters[key] = unit ? { value: parseFloat(numPart), unit } : parseFloat(numPart);
            } else {
              parameters[key] = value;
            }
          } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
            parameters[key] = value.toLowerCase() === 'true';
          } else {
            parameters[key] = value;
          }
        }
      }
    }

    // Validate common command patterns
    let isValid = true;
    let error: string | undefined;

    switch (action) {
      case 'create':
        if (!['bioreactor', 'zone', 'equipment'].includes(target)) {
          isValid = false;
          error = `Unknown target for create: ${target}`;
        }
        break;
      case 'place':
        if (target !== 'equipment') {
          isValid = false;
          error = `Can only place equipment, not ${target}`;
        }
        if (!parameters.x || !parameters.y) {
          isValid = false;
          error = 'Place command requires --x and --y coordinates';
        }
        break;
      case 'connect':
        if (!parameters.from || !parameters.to) {
          isValid = false;
          error = 'Connect command requires --from and --to parameters';
        }
        break;
      case 'set':
        if (target !== 'property') {
          isValid = false;
          error = `Unknown target for set: ${target}`;
        }
        if (!parameters.id) {
          isValid = false;
          error = 'Set property command requires --id parameter';
        }
        break;
      default:
        isValid = false;
        error = `Unknown command action: ${action}`;
    }

    return { action, target, parameters, isValid, error };
  } catch (err) {
    return { 
      action: '', 
      target: '', 
      parameters: {}, 
      isValid: false, 
      error: 'Failed to parse command' 
    };
  }
}

export function getCommandSuggestions(input: string): CommandSuggestion[] {
  if (!input.trim()) {
    return COMMAND_SUGGESTIONS;
  }
  
  const lowerInput = input.toLowerCase();
  return COMMAND_SUGGESTIONS.filter(suggestion => 
    suggestion.command.toLowerCase().includes(lowerInput) ||
    suggestion.description.toLowerCase().includes(lowerInput)
  );
}

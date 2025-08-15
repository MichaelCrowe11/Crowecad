/**
 * CroweCad Command Palette
 * Professional command interface like VS Code and Figma
 */

import { useState, useEffect, useRef } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Box,
  FileText,
  Download,
  Upload,
  Settings,
  Users,
  Grid,
  Layers,
  Package,
  Zap,
  Save,
  Share2,
  Copy,
  Scissors,
  ClipboardPaste,
  Undo2,
  Redo2,
  Search,
  Terminal,
  Palette,
  Keyboard,
  HelpCircle,
  GitBranch,
  Cloud,
  Archive,
  Printer,
  Mail,
  MessageSquare,
  Video,
  Mic,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
  Trash2,
  FolderOpen,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Move,
  Rotate3D,
  Ruler,
  Crosshair,
  Circle,
  Square,
  Triangle,
  Pentagon,
  Hexagon,
  Star,
  Heart,
  Cpu,
  Database,
  Wifi,
  Bluetooth,
  Battery,
  Sun,
  Moon,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Play,
  Pause,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Compass,
  Map,
  Navigation,
  Target,
  Flag,
  Bookmark,
  Award,
  TrendingUp,
  BarChart,
  PieChart,
  LineChart,
  Calculator,
  Calendar,
  Clock,
  Gauge,
  Wrench,
  Hammer,
  Cog,
  Filter,
  Link,
  Unlink,
  Anchor,
  Globe,
  Home,
  Building,
  Factory,
  Warehouse,
  ShoppingCart,
  Package2,
  Truck,
  Plane,
  Car,
  Train,
  Ship,
  Rocket,
  Lightbulb,
  Sparkles,
  Flame,
  Droplet,
  Wind,
  Snowflake
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommand?: (command: string, data?: any) => void;
}

interface Command {
  id: string;
  label: string;
  icon: any;
  shortcut?: string;
  action: () => void;
  category: string;
}

export function CommandPalette({ open, onOpenChange, onCommand }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  
  const runCommand = (commandId: string, data?: any) => {
    onCommand?.(commandId, data);
    onOpenChange(false);
  };

  const commands: Command[] = [
    // File Operations
    { id: 'new-project', label: 'New Project', icon: Plus, shortcut: '⌘N', category: 'File', action: () => runCommand('new-project') },
    { id: 'open-project', label: 'Open Project', icon: FolderOpen, shortcut: '⌘O', category: 'File', action: () => runCommand('open-project') },
    { id: 'save', label: 'Save', icon: Save, shortcut: '⌘S', category: 'File', action: () => runCommand('save') },
    { id: 'save-as', label: 'Save As...', icon: Save, shortcut: '⌘⇧S', category: 'File', action: () => runCommand('save-as') },
    { id: 'export', label: 'Export', icon: Download, shortcut: '⌘E', category: 'File', action: () => runCommand('export') },
    { id: 'import', label: 'Import', icon: Upload, shortcut: '⌘I', category: 'File', action: () => runCommand('import') },
    { id: 'print', label: 'Print', icon: Printer, shortcut: '⌘P', category: 'File', action: () => runCommand('print') },
    
    // Edit Operations
    { id: 'undo', label: 'Undo', icon: Undo2, shortcut: '⌘Z', category: 'Edit', action: () => runCommand('undo') },
    { id: 'redo', label: 'Redo', icon: Redo2, shortcut: '⌘⇧Z', category: 'Edit', action: () => runCommand('redo') },
    { id: 'cut', label: 'Cut', icon: Scissors, shortcut: '⌘X', category: 'Edit', action: () => runCommand('cut') },
    { id: 'copy', label: 'Copy', icon: Copy, shortcut: '⌘C', category: 'Edit', action: () => runCommand('copy') },
    { id: 'paste', label: 'Paste', icon: ClipboardPaste, shortcut: '⌘V', category: 'Edit', action: () => runCommand('paste') },
    { id: 'delete', label: 'Delete', icon: Trash2, shortcut: 'Delete', category: 'Edit', action: () => runCommand('delete') },
    { id: 'select-all', label: 'Select All', icon: Square, shortcut: '⌘A', category: 'Edit', action: () => runCommand('select-all') },
    
    // View Operations
    { id: 'zoom-in', label: 'Zoom In', icon: ZoomIn, shortcut: '⌘+', category: 'View', action: () => runCommand('zoom-in') },
    { id: 'zoom-out', label: 'Zoom Out', icon: ZoomOut, shortcut: '⌘-', category: 'View', action: () => runCommand('zoom-out') },
    { id: 'zoom-fit', label: 'Zoom to Fit', icon: Maximize, shortcut: '⌘0', category: 'View', action: () => runCommand('zoom-fit') },
    { id: 'fullscreen', label: 'Fullscreen', icon: Maximize, shortcut: 'F11', category: 'View', action: () => runCommand('fullscreen') },
    { id: 'grid', label: 'Toggle Grid', icon: Grid, shortcut: '⌘G', category: 'View', action: () => runCommand('toggle-grid') },
    { id: 'rulers', label: 'Toggle Rulers', icon: Ruler, shortcut: '⌘R', category: 'View', action: () => runCommand('toggle-rulers') },
    { id: 'layers', label: 'Show Layers', icon: Layers, shortcut: '⌘L', category: 'View', action: () => runCommand('show-layers') },
    
    // CAD Tools
    { id: 'line', label: 'Line Tool', icon: Minus, shortcut: 'L', category: 'Tools', action: () => runCommand('tool-line') },
    { id: 'rectangle', label: 'Rectangle Tool', icon: Square, shortcut: 'R', category: 'Tools', action: () => runCommand('tool-rectangle') },
    { id: 'circle', label: 'Circle Tool', icon: Circle, shortcut: 'C', category: 'Tools', action: () => runCommand('tool-circle') },
    { id: 'polygon', label: 'Polygon Tool', icon: Pentagon, shortcut: 'P', category: 'Tools', action: () => runCommand('tool-polygon') },
    { id: 'text', label: 'Text Tool', icon: FileText, shortcut: 'T', category: 'Tools', action: () => runCommand('tool-text') },
    { id: 'dimension', label: 'Dimension Tool', icon: Ruler, shortcut: 'D', category: 'Tools', action: () => runCommand('tool-dimension') },
    { id: 'measure', label: 'Measure Tool', icon: Ruler, shortcut: 'M', category: 'Tools', action: () => runCommand('tool-measure') },
    { id: 'move', label: 'Move Tool', icon: Move, shortcut: 'V', category: 'Tools', action: () => runCommand('tool-move') },
    { id: 'rotate', label: 'Rotate Tool', icon: Rotate3D, shortcut: 'R', category: 'Tools', action: () => runCommand('tool-rotate') },
    { id: 'scale', label: 'Scale Tool', icon: Maximize, shortcut: 'S', category: 'Tools', action: () => runCommand('tool-scale') },
    
    // 3D Operations
    { id: '3d-extrude', label: 'Extrude', icon: Box, shortcut: '⌘E', category: '3D', action: () => runCommand('3d-extrude') },
    { id: '3d-revolve', label: 'Revolve', icon: Rotate3D, shortcut: '⌘R', category: '3D', action: () => runCommand('3d-revolve') },
    { id: '3d-sweep', label: 'Sweep', icon: Wind, shortcut: '⌘W', category: '3D', action: () => runCommand('3d-sweep') },
    { id: '3d-loft', label: 'Loft', icon: Layers, shortcut: '⌘L', category: '3D', action: () => runCommand('3d-loft') },
    { id: '3d-boolean', label: 'Boolean Operations', icon: Package2, shortcut: '⌘B', category: '3D', action: () => runCommand('3d-boolean') },
    
    // Collaboration
    { id: 'share', label: 'Share Project', icon: Share2, shortcut: '⌘⇧S', category: 'Collaboration', action: () => runCommand('share') },
    { id: 'invite', label: 'Invite Collaborators', icon: Users, shortcut: '⌘⇧I', category: 'Collaboration', action: () => runCommand('invite') },
    { id: 'chat', label: 'Open Chat', icon: MessageSquare, shortcut: '⌘/', category: 'Collaboration', action: () => runCommand('chat') },
    { id: 'video-call', label: 'Start Video Call', icon: Video, shortcut: '⌘⇧V', category: 'Collaboration', action: () => runCommand('video-call') },
    { id: 'voice-call', label: 'Start Voice Call', icon: Mic, shortcut: '⌘⇧A', category: 'Collaboration', action: () => runCommand('voice-call') },
    
    // AI Features
    { id: 'ai-generate', label: 'AI Generate', icon: Sparkles, shortcut: '⌘⇧G', category: 'AI', action: () => runCommand('ai-generate') },
    { id: 'ai-optimize', label: 'AI Optimize', icon: Zap, shortcut: '⌘⇧O', category: 'AI', action: () => runCommand('ai-optimize') },
    { id: 'ai-analyze', label: 'AI Analyze', icon: Activity, shortcut: '⌘⇧A', category: 'AI', action: () => runCommand('ai-analyze') },
    { id: 'ai-suggest', label: 'AI Suggestions', icon: Lightbulb, shortcut: '⌘⇧S', category: 'AI', action: () => runCommand('ai-suggest') },
    
    // Settings & Help
    { id: 'settings', label: 'Settings', icon: Settings, shortcut: '⌘,', category: 'Settings', action: () => runCommand('settings') },
    { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard, shortcut: '⌘K', category: 'Settings', action: () => runCommand('keyboard-shortcuts') },
    { id: 'help', label: 'Help', icon: HelpCircle, shortcut: 'F1', category: 'Settings', action: () => runCommand('help') },
    { id: 'about', label: 'About CroweCad', icon: Info, category: 'Settings', action: () => runCommand('about') },
  ];

  const groupedCommands = commands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
          <CommandGroup key={category} heading={category}>
            {categoryCommands.map((command) => (
              <CommandItem
                key={command.id}
                value={command.label}
                onSelect={() => command.action()}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <command.icon className="w-4 h-4" />
                  <span>{command.label}</span>
                </div>
                {command.shortcut && (
                  <CommandShortcut>{command.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
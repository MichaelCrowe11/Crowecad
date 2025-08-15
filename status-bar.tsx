import { useState, useEffect } from "react";
import { 
  Grid3x3,
  MousePointer2,
  Lock,
  Unlock,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Circle,
  Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  coordinates?: { x: number; y: number };
  zoom?: number;
  gridEnabled?: boolean;
  snapEnabled?: boolean;
  orthoEnabled?: boolean;
  connectionStatus?: "online" | "offline";
  cpuUsage?: number;
  memoryUsage?: number;
  selectedCount?: number;
  totalEntities?: number;
  currentTool?: string;
  units?: "mm" | "cm" | "m" | "ft" | "in";
}

export function StatusBar({
  coordinates = { x: 0, y: 0 },
  zoom = 100,
  gridEnabled = true,
  snapEnabled = true,
  orthoEnabled = false,
  connectionStatus = "online",
  cpuUsage = 0,
  memoryUsage = 0,
  selectedCount = 0,
  totalEntities = 0,
  currentTool = "Select",
  units = "m"
}: StatusBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCoordinate = (value: number) => {
    return value.toFixed(2);
  };

  const StatusButton = ({ 
    icon: Icon, 
    label, 
    active,
    onClick 
  }: { 
    icon: any; 
    label: string; 
    active: boolean;
    onClick?: () => void;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 px-2 text-xs gap-1",
              active && "bg-primary/10 text-primary"
            )}
            onClick={onClick}
          >
            <Icon className="h-3 w-3" />
            <span>{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{label} - Click to toggle</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="status-bar">
      {/* Left Section - Coordinates and Tool */}
      <div className="status-bar-section">
        <div className="status-item">
          <MousePointer2 className="h-3 w-3" />
          <span className="status-label">X:</span>
          <span className="status-value">{formatCoordinate(coordinates.x)}</span>
          <span className="status-label">Y:</span>
          <span className="status-value">{formatCoordinate(coordinates.y)}</span>
          <span className="text-xs text-muted-foreground">({units})</span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        <div className="status-item">
          <span className="status-label">Tool:</span>
          <span className="status-value">{currentTool}</span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        <div className="status-item">
          <span className="status-label">Zoom:</span>
          <span className="status-value">{zoom}%</span>
        </div>
      </div>

      {/* Center Section - Mode Toggles */}
      <div className="status-bar-section">
        <StatusButton
          icon={Grid3x3}
          label="GRID"
          active={gridEnabled}
        />
        <StatusButton
          icon={Circle}
          label="SNAP"
          active={snapEnabled}
        />
        <StatusButton
          icon={Square}
          label="ORTHO"
          active={orthoEnabled}
        />
      </div>

      {/* Right Section - System Status */}
      <div className="status-bar-section">
        {/* Selection Info */}
        <div className="status-item">
          <span className="status-label">Selected:</span>
          <span className="status-value">{selectedCount}</span>
          <span className="text-xs text-muted-foreground">/ {totalEntities}</span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        {/* Performance */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="status-item">
                <Cpu className="h-3 w-3" />
                <span className="status-value">{cpuUsage}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>CPU Usage</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="status-item">
                <HardDrive className="h-3 w-3" />
                <span className="status-value">{memoryUsage}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Memory Usage</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator orientation="vertical" className="h-4" />

        {/* Connection Status */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="status-item">
                {connectionStatus === "online" ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
                <span className={cn(
                  "status-value text-xs",
                  connectionStatus === "online" ? "text-green-500" : "text-red-500"
                )}>
                  {connectionStatus}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Connection Status</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator orientation="vertical" className="h-4" />

        {/* Time */}
        <div className="status-item text-xs text-muted-foreground">
          {time.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
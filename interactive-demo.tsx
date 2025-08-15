import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Boxes,
  Package,
  Thermometer,
  Droplets,
  Wind
} from "lucide-react";

interface SimulationData {
  temperature: number;
  humidity: number;
  co2: number;
  production: number;
  efficiency: number;
  contamination: number;
  equipment: Array<{
    id: string;
    name: string;
    status: 'operational' | 'warning' | 'error';
    efficiency: number;
  }>;
}

export function InteractiveDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationData, setSimulationData] = useState<SimulationData>({
    temperature: 22,
    humidity: 65,
    co2: 800,
    production: 0,
    efficiency: 85,
    contamination: 0.1,
    equipment: [
      { id: '1', name: 'Bioreactor A', status: 'operational', efficiency: 92 },
      { id: '2', name: 'Bioreactor B', status: 'operational', efficiency: 88 },
      { id: '3', name: 'Autoclave 1', status: 'operational', efficiency: 95 },
      { id: '4', name: 'Laminar Flow', status: 'operational', efficiency: 99 }
    ]
  });

  // Simulate real-time data updates
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSimulationData(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        humidity: Math.max(60, Math.min(70, prev.humidity + (Math.random() - 0.5) * 2)),
        co2: Math.max(600, Math.min(1000, prev.co2 + (Math.random() - 0.5) * 20)),
        production: Math.min(100, prev.production + Math.random() * 2),
        efficiency: Math.max(70, Math.min(100, prev.efficiency + (Math.random() - 0.5) * 3)),
        contamination: Math.max(0, Math.min(5, prev.contamination + (Math.random() - 0.5) * 0.2)),
        equipment: prev.equipment.map(eq => ({
          ...eq,
          efficiency: Math.max(70, Math.min(100, eq.efficiency + (Math.random() - 0.5) * 5)),
          status: eq.efficiency < 75 ? 'warning' : eq.efficiency < 60 ? 'error' : 'operational'
        }))
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const getStatusColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return 'text-red-500';
    if (value < thresholds[1]) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Operational</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Live Facility Simulation
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isRunning ? "destructive" : "default"}
                onClick={() => setIsRunning(!isRunning)}
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsRunning(false);
                  setSimulationData({
                    temperature: 22,
                    humidity: 65,
                    co2: 800,
                    production: 0,
                    efficiency: 85,
                    contamination: 0.1,
                    equipment: [
                      { id: '1', name: 'Bioreactor A', status: 'operational', efficiency: 92 },
                      { id: '2', name: 'Bioreactor B', status: 'operational', efficiency: 88 },
                      { id: '3', name: 'Autoclave 1', status: 'operational', efficiency: 95 },
                      { id: '4', name: 'Laminar Flow', status: 'operational', efficiency: 99 }
                    ]
                  });
                }}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Watch your facility operate in real-time with live environmental monitoring
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Environmental Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(simulationData.temperature, [20, 24])}`}>
                {simulationData.temperature.toFixed(1)}°C
              </div>
              <div className="text-xs text-muted-foreground">
                Optimal: 20-24°C
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Humidity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(simulationData.humidity, [60, 70])}`}>
                {simulationData.humidity.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Optimal: 60-70%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wind className="w-4 h-4" />
                CO₂ Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(simulationData.co2, [600, 900])}`}>
                {simulationData.co2.toFixed(0)} ppm
              </div>
              <div className="text-xs text-muted-foreground">
                Optimal: 600-900 ppm
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Production Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent"
            style={{ width: `${simulationData.production}%` }}
          />
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Production Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {simulationData.production.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Daily target completion
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent"
            style={{ width: `${simulationData.efficiency}%` }}
          />
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Overall Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {simulationData.efficiency.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              System performance
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Boxes className="w-5 h-5" />
            Equipment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {simulationData.equipment.map((eq, index) => (
                <motion.div
                  key={eq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4" />
                    <span className="font-medium">{eq.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Efficiency: </span>
                      <span className={`font-bold ${getStatusColor(eq.efficiency, [75, 90])}`}>
                        {eq.efficiency.toFixed(0)}%
                      </span>
                    </div>
                    {getStatusBadge(eq.status)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Contamination Alert */}
      {simulationData.contamination > 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-red-500/10 border border-red-500/20"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <div className="font-semibold text-red-500">Contamination Alert</div>
              <div className="text-sm text-muted-foreground">
                Risk level: {simulationData.contamination.toFixed(1)}% - Immediate action required
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success State */}
      {simulationData.production >= 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-green-500/10 border border-green-500/20"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <div className="font-semibold text-green-500">Production Complete!</div>
              <div className="text-sm text-muted-foreground">
                Daily target achieved with {simulationData.efficiency.toFixed(1)}% efficiency
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}